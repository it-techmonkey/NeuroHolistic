import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createZiinaPaymentIntent } from '@/lib/payments/ziina';
import { getEventPrice } from '@/lib/events/event-pricing';
import { MOCK_EVENTS } from '@/components/events/events-data';
import { normalizePhone } from '@/lib/phone';

function cleanAppUrl(request: NextRequest) {
  return request.nextUrl.origin.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = body?.eventId;
  const eventTitle = body?.eventTitle;
  const name = body?.name;
  const email = body?.email;
  const phone = normalizePhone(body?.phone);
  const selectedDateValue = body?.selectedDate || null;

  if (!eventId || !eventTitle || !name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: eventId, eventTitle, name, email' },
      { status: 400 }
    );
  }

  // A mobile number with a country code is mandatory for every registration.
  if (!phone) {
    return NextResponse.json(
      { error: 'A valid mobile number including the country code is required.' },
      { status: 400 }
    );
  }

  const price = getEventPrice(eventId);
  if (!price) {
    return NextResponse.json({ error: 'This event is not configured for payment.' }, { status: 400 });
  }

  // Server-side source of truth for session dates — never trust a label from the client.
  const eventConfig = MOCK_EVENTS.find((e) => (e.slug ?? e.id) === eventId);
  const sessionDates = eventConfig?.sessionDates ?? [];

  if (sessionDates.length > 1) {
    if (!selectedDateValue) {
      return NextResponse.json({ error: 'Please select a session date.' }, { status: 400 });
    }
    if (!sessionDates.some((d) => d.value === selectedDateValue)) {
      return NextResponse.json({ error: 'Invalid session date selected.' }, { status: 400 });
    }
  }

  const selectedDateLabel = sessionDates.find((d) => d.value === selectedDateValue)?.label ?? null;

  const supabase = getServiceSupabase();

  const { data: existingRegistration } = await supabase
    .from('event_registrations')
    .select('id, payment_status, status')
    .eq('event_id', eventId)
    .ilike('email', email)
    .maybeSingle();

  // A cancelled registration may be re-purchased; only an active paid one blocks.
  if (
    existingRegistration &&
    existingRegistration.payment_status === 'paid' &&
    existingRegistration.status !== 'cancelled'
  ) {
    return NextResponse.json(
      { error: 'You are already registered and paid for this event.' },
      { status: 409 }
    );
  }

  const amountFils = Math.round(price.amountAed * 100);
  const appUrl = cleanAppUrl(request);
  const eventSlugOrId: string = eventId;

  const metadata = {
    gateway: 'ziina',
    kind: 'event',
    eventId,
    eventTitle,
    amountAed: price.amountAed,
    amountFils,
    currency: 'AED',
    name,
    email,
    phone,
    selectedDate: selectedDateValue,
    selectedDateLabelEn: selectedDateLabel?.en ?? null,
    selectedDateLabelAr: selectedDateLabel?.ar ?? null,
  };

  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: null,
      amount: price.amountAed,
      currency: 'AED',
      type: 'single_session',
      status: 'pending',
      metadata,
    })
    .select('id')
    .single();

  if (paymentError || !paymentRow) {
    console.error('[Event Create Payment] Failed to create local payment:', paymentError);
    return NextResponse.json({ error: 'Unable to initialize payment' }, { status: 500 });
  }

  const successUrl = `${appUrl}/events/${eventSlugOrId}?payment=success`;
  const cancelUrl = `${appUrl}/events/${eventSlugOrId}?payment=cancelled`;
  const failureUrl = `${appUrl}/events/${eventSlugOrId}?payment=failed`;

  const result = await createZiinaPaymentIntent({
    amount: amountFils,
    currency: 'AED',
    message: `NeuroHolistic Event — ${eventTitle}`,
    successUrl,
    cancelUrl,
    failureUrl,
  });

  if (!result.success || !result.paymentIntentId || !result.paymentLink) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: { ...metadata, ziinaError: result.error || 'Ziina payment intent creation failed' },
      })
      .eq('id', paymentRow.id);

    return NextResponse.json(
      { error: result.error || 'Failed to create Ziina payment session' },
      { status: 502 }
    );
  }

  await supabase
    .from('payments')
    .update({
      payment_reference: result.paymentIntentId,
      metadata: { ...metadata, paymentIntentId: result.paymentIntentId },
    })
    .eq('id', paymentRow.id);

  // Record (or update) the registration as pending payment so it's tracked
  // even if the customer never returns from Ziina's checkout.
  if (existingRegistration) {
    await supabase
      .from('event_registrations')
      .update({
        name,
        phone,
        payment_status: 'pending',
        amount_paid: price.amountAed,
        currency: 'AED',
        payment_reference: result.paymentIntentId,
        selected_date: selectedDateValue,
        status: 'active',
        cancelled_at: null,
        cancelled_by: null,
        cancellation_reason: null,
      })
      .eq('id', existingRegistration.id);
  } else {
    await supabase.from('event_registrations').insert({
      event_id: eventId,
      event_title: eventTitle,
      name,
      email,
      phone,
      payment_status: 'pending',
      amount_paid: price.amountAed,
      currency: 'AED',
      payment_reference: result.paymentIntentId,
      selected_date: selectedDateValue,
    });
  }

  return NextResponse.json({
    success: true,
    paymentLink: result.paymentLink,
    paymentIntentId: result.paymentIntentId,
  });
}
