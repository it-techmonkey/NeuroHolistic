import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureEventMeetings, findEvent, firstSessionMeetLink } from './event-meetings';
import { sessionScheduleHtml, sendEventEmail, eventEmailLayout, EVENT_EMAIL_FROM, escapeHtml } from './event-emails';
import { registrationConfirmedEmail } from './quantum-leap-emails';

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@neuroholistic.com';

export interface PaidEventConfirmationParams {
  supabase: SupabaseClient<any, any, any>;
  /** The `payments` row id, used to record that we have already sent. */
  paymentId: string;
  paymentMetadata: Record<string, any>;
  eventId: string;
  eventTitle: string;
  name: string;
  email: string;
  phone: string | null;
  amountAed: number;
  selectedDateLabel: string | null;
  /** Where the call came from, for log lines. */
  source: 'webhook' | 'fallback';
}

/**
 * Provision the Meet links for a paid event registration and send both the
 * registrant confirmation and the admin notification.
 *
 * This lives in one place because it has two callers that must not disagree:
 * the Ziina webhook, and the return-page fallback used when the webhook is
 * late or never lands. Previously only the webhook did any of this, and it
 * did so in a promise nobody awaited — so a registrant could be charged,
 * marked paid, and never receive a joining link.
 *
 * Safe to call twice: the first successful run stamps
 * `metadata.confirmationSentAt`, and later calls return early. Callers should
 * await it — the work must finish before the serverless function returns or
 * the platform is free to freeze it mid-send.
 */
export async function sendPaidEventConfirmation(params: PaidEventConfirmationParams): Promise<void> {
  const { supabase, paymentId, paymentMetadata, eventId, eventTitle, name, email, source } = params;

  if (paymentMetadata.confirmationSentAt) {
    console.log(`[PaidConfirmation:${source}] Already sent for payment ${paymentId}, skipping.`);
    return;
  }

  // Claim the send before doing it. A Ziina retry landing while the first
  // attempt is still running would otherwise produce a duplicate email.
  const claimedAt = new Date().toISOString();
  const { error: claimError } = await supabase
    .from('payments')
    .update({ metadata: { ...paymentMetadata, confirmationSentAt: claimedAt } })
    .eq('id', paymentId)
    .is('metadata->>confirmationSentAt', null);

  if (claimError) {
    console.error(`[PaidConfirmation:${source}] Could not claim the send:`, claimError);
    // Fall through and send anyway — a duplicate confirmation is a far better
    // outcome than a paying registrant receiving nothing at all.
  }

  // Meet provisioning must never stop the confirmation going out; the
  // reminder emails carry the links later if this fails.
  let meetings: Awaited<ReturnType<typeof ensureEventMeetings>>['meetings'] = [];
  try {
    ({ meetings } = await ensureEventMeetings(supabase, eventId));
  } catch (error) {
    console.error(`[PaidConfirmation:${source}] Meet provisioning failed:`, error);
  }

  const eventDef = findEvent(eventId);

  try {
    // Events with a client-approved onboarding sequence (currently the
    // Quantum Leap cohort) get their exact literal copy; everything else
    // gets the generic payment-confirmation email.
    if (eventDef?.journeyTable) {
      const { subject, html } = registrationConfirmedEmail({
        event: eventDef,
        registrantName: name,
        locale: 'en',
        firstSessionMeetLink: firstSessionMeetLink(eventDef, meetings),
      });
      await sendEventEmail({ to: email, subject, html, replyTo: eventDef.replyToEmail });
    } else {
      await sendGenericPaidConfirmation({
        eventTitle,
        name,
        email,
        selectedDateLabel: params.selectedDateLabel,
        scheduleHtml: sessionScheduleHtml(meetings),
      });
    }
  } catch (error) {
    console.error(`[PaidConfirmation:${source}] Registrant confirmation failed:`, error);
  }

  try {
    await notifyAdminOfPaidRegistration({
      eventTitle,
      name,
      email,
      phone: params.phone,
      amountAed: params.amountAed,
      selectedDateLabel: params.selectedDateLabel,
    });
  } catch (error) {
    console.error(`[PaidConfirmation:${source}] Admin notification failed:`, error);
  }
}

async function notifyAdminOfPaidRegistration(params: {
  eventTitle: string;
  name: string;
  email: string;
  phone: string | null;
  amountAed: number;
  selectedDateLabel: string | null;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const dateRow = params.selectedDateLabel
    ? `<tr><td style="padding:6px 12px;color:#64748b;">Session date</td><td style="padding:6px 12px;font-weight:500;">${escapeHtml(params.selectedDateLabel)}</td></tr>`
    : '';

  const detailsTable = `<table style="width:100%;border-collapse:collapse;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;margin:16px 0;">
  <tr><td style="padding:6px 12px;color:#64748b;">Name</td><td style="padding:6px 12px;font-weight:500;">${escapeHtml(params.name)}</td></tr>
  <tr><td style="padding:6px 12px;color:#64748b;">Email</td><td style="padding:6px 12px;">${escapeHtml(params.email)}</td></tr>
  ${params.phone ? `<tr><td style="padding:6px 12px;color:#64748b;">Phone</td><td style="padding:6px 12px;">${escapeHtml(params.phone)}</td></tr>` : ''}
  ${dateRow}
  <tr><td style="padding:6px 12px;color:#64748b;">Amount paid</td><td style="padding:6px 12px;">AED ${escapeHtml(params.amountAed)}</td></tr>
</table>`;

  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EVENT_EMAIL_FROM,
    to: ADMIN_EMAIL,
    subject: `[Admin] Paid event registration: ${params.eventTitle}`,
    html: eventEmailLayout('New Paid Event Registration', `
      <p style="margin:0 0 16px;color:#334155;">A registrant has paid for <strong>${escapeHtml(params.eventTitle)}</strong>.</p>
      ${detailsTable}`),
  });
}

/** Generic client confirmation, for paid events without a client-approved onboarding sequence. */
async function sendGenericPaidConfirmation(params: {
  eventTitle: string;
  name: string;
  email: string;
  selectedDateLabel: string | null;
  scheduleHtml: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const firstName = params.name.trim().split(' ')[0] || 'there';
  const dateSentence = params.selectedDateLabel
    ? ` Your selected session date is <strong>${escapeHtml(params.selectedDateLabel)}</strong>.`
    : '';

  await new Resend(process.env.RESEND_API_KEY).emails.send({
    from: EVENT_EMAIL_FROM,
    to: params.email,
    subject: `Payment confirmed: ${params.eventTitle}`,
    html: eventEmailLayout('Registration & Payment Confirmed', `
      <p style="margin:0 0 12px;color:#334155;">Hi ${escapeHtml(firstName)},</p>
      <p style="margin:0 0 16px;color:#334155;">Your payment has been received and your spot for <strong>${escapeHtml(params.eventTitle)}</strong> is confirmed.${dateSentence}</p>
      ${params.scheduleHtml || `<p style="margin:0 0 16px;color:#334155;">We&rsquo;ll send the joining details to this email closer to the event date.</p>`}
      <p style="margin:16px 0 0;color:#64748b;font-size:13px;">We&rsquo;ll also email you a reminder before each session.</p>`),
  });
}
