import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';

/**
 * Fallback endpoint: verify an event payment intent was completed and
 * ensure the registration is marked paid. Called by the event page when
 * the customer returns from Ziina checkout, in case the webhook hasn't
 * landed yet.
 */
export async function POST(request: NextRequest) {
  const { paymentIntentId } = await request.json().catch(() => ({}));
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return NextResponse.json({ error: 'payment_intent_id required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  const metadata = (payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata))
    ? (payment.metadata as Record<string, any>)
    : {};

  if (metadata.kind !== 'event') {
    return NextResponse.json({ error: 'Not an event payment' }, { status: 400 });
  }

  if (payment.status === 'paid') {
    return NextResponse.json({ success: true, message: 'Already processed' });
  }

  let intent;
  try {
    intent = await getZiinaPaymentIntent(paymentIntentId);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to verify payment: ${err.message}` }, { status: 502 });
  }

  if (intent.status !== 'completed') {
    return NextResponse.json({ success: false, status: intent.status, message: 'Payment not yet completed' });
  }

  const eventId = metadata.eventId;
  const email = metadata.email;
  if (!eventId || !email) {
    return NextResponse.json({ error: 'Event payment is missing eventId or email' }, { status: 400 });
  }

  await supabase
    .from('event_registrations')
    .update({ payment_status: 'paid' })
    .eq('event_id', eventId)
    .ilike('email', email);

  await supabase
    .from('payments')
    .update({ status: 'paid', metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
    .eq('id', payment.id);

  return NextResponse.json({ success: true, message: 'Event payment verified' });
}
