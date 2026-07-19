import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createZiinaPaymentIntent } from '@/lib/payments/ziina';
import { getEventPrice } from '@/lib/events/event-pricing';

function cleanAppUrl(request: NextRequest) {
  return request.nextUrl.origin.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const eventId = body?.eventId;
  const eventTitle = body?.eventTitle;
  const name = body?.name;
  const email = body?.email;
  const phone = body?.phone || null;

  if (!eventId || !eventTitle || !name || !email) {
    return NextResponse.json(
      { error: 'Missing required fields: eventId, eventTitle, name, email' },
      { status: 400 }
    );
  }

  const price = getEventPrice(eventId);
  if (!price) {
    return NextResponse.json({ error: 'This event is not configured for payment.' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  const { data: existingRegistration } = await supabase
    .from('event_registrations')
    .select('id, payment_status')
    .eq('event_id', eventId)
    .ilike('email', email)
    .maybeSingle();

  if (existingRegistration && existingRegistration.payment_status === 'paid') {
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
    });
  }

  return NextResponse.json({
    success: true,
    paymentLink: result.paymentLink,
    paymentIntentId: result.paymentIntentId,
  });
}
