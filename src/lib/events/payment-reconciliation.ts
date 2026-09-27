import type { SupabaseClient } from '@supabase/supabase-js';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';
import { sendPaidEventConfirmation } from './paid-confirmation';

/**
 * Reconcile event payments that Ziina has completed but this system never
 * finished processing.
 *
 * Why this exists: confirming a paid registration depended on two things that
 * can both silently fail — Ziina's webhook reaching us, and the customer
 * making it back to the return page. When both missed, the registrant was
 * charged and then received nothing at all: no confirmation, no Meet link,
 * and no record of having paid. That is exactly what happened in production,
 * for every single event payment, for over two months.
 *
 * This sweep is the backstop that does not depend on either. It asks Ziina
 * directly what the truth is and finishes the job. Everything it calls is
 * idempotent, so running it repeatedly is safe and never double-sends.
 */

/**
 * Only look back this far. A payment intent older than this that never
 * completed is abandoned, not pending, and re-checking it forever would cost
 * an API call per run for no reason.
 */
const LOOKBACK_MS = 45 * 24 * 60 * 60 * 1000;

/**
 * Ignore payments created in the last minute — the customer is most likely
 * still on Ziina's checkout page, and there is nothing to reconcile yet.
 */
const SETTLE_GRACE_MS = 60 * 1000;

export interface ReconciliationResult {
  checked: number;
  confirmed: number;
  markedFailed: number;
  stillPending: number;
  errors: number;
  details: string[];
}

export async function reconcileEventPayments(
  supabase: SupabaseClient<any, any, any>,
  now: number = Date.now()
): Promise<ReconciliationResult> {
  const result: ReconciliationResult = {
    checked: 0,
    confirmed: 0,
    markedFailed: 0,
    stillPending: 0,
    errors: 0,
    details: [],
  };

  const { data: pending, error } = await supabase
    .from('payments')
    .select('id, amount, status, payment_reference, metadata, created_at')
    .eq('status', 'pending')
    .eq('metadata->>kind', 'event')
    .not('payment_reference', 'is', null)
    .gte('created_at', new Date(now - LOOKBACK_MS).toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[EventPaymentReconciliation] Failed to load pending payments:', error);
    result.errors += 1;
    result.details.push(`query failed: ${error.message}`);
    return result;
  }

  for (const payment of pending ?? []) {
    if (now - new Date(payment.created_at).getTime() < SETTLE_GRACE_MS) continue;

    const metadata =
      payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata)
        ? (payment.metadata as Record<string, any>)
        : {};

    result.checked += 1;

    let intent;
    try {
      intent = await getZiinaPaymentIntent(payment.payment_reference as string);
    } catch (err) {
      result.errors += 1;
      result.details.push(
        `${payment.payment_reference}: lookup failed — ${err instanceof Error ? err.message : 'unknown'}`
      );
      continue;
    }

    const status = intent.status?.toLowerCase();

    if (status === 'failed' || status === 'canceled' || status === 'cancelled') {
      await supabase
        .from('payments')
        .update({ status: 'failed', metadata: { ...metadata, ziinaStatus: status } })
        .eq('id', payment.id);
      result.markedFailed += 1;
      continue;
    }

    if (status !== 'completed') {
      result.stillPending += 1;
      continue;
    }

    // Same guard the webhook applies: never confirm a registration against an
    // amount that does not match what we asked Ziina to charge.
    if (metadata.amountFils && intent.amount && metadata.amountFils !== intent.amount) {
      result.errors += 1;
      result.details.push(
        `${payment.payment_reference}: amount mismatch (expected ${metadata.amountFils}, got ${intent.amount})`
      );
      continue;
    }

    const eventId = metadata.eventId;
    const email = metadata.email;
    if (!eventId || !email) {
      result.errors += 1;
      result.details.push(`${payment.payment_reference}: missing eventId or email in metadata`);
      continue;
    }

    try {
      await supabase
        .from('event_registrations')
        .update({ payment_status: 'paid' })
        .eq('event_id', eventId)
        .ilike('email', email);

      const updatedMetadata = { ...metadata, ziinaStatus: status, reconciledAt: new Date().toISOString() };

      await supabase
        .from('payments')
        .update({ status: 'paid', metadata: updatedMetadata })
        .eq('id', payment.id);

      await sendPaidEventConfirmation({
        supabase,
        paymentId: payment.id,
        paymentMetadata: updatedMetadata,
        eventId,
        eventTitle: metadata.eventTitle || 'NeuroHolistic Event',
        name: metadata.name || 'Guest',
        email,
        phone: metadata.phone || null,
        amountAed: metadata.amountAed || payment.amount,
        selectedDateLabel: metadata.selectedDateLabelEn || null,
        source: 'fallback',
      });

      result.confirmed += 1;
      result.details.push(`${email}: confirmed`);
    } catch (err) {
      result.errors += 1;
      result.details.push(
        `${payment.payment_reference}: confirmation failed — ${err instanceof Error ? err.message : 'unknown'}`
      );
    }
  }

  return result;
}
