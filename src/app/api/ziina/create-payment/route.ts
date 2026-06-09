import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { resolveTherapistUserRow } from '@/lib/bookings/resolve-therapist-user';
import { createZiinaPaymentIntent } from '@/lib/payments/ziina';
import {
  ACADEMY_PRICING,
  type PaymentOption,
  type ProgramType,
  getPrice,
} from '@/lib/payments/pricing';
import { getActiveDiscount, applyDiscount } from '@/lib/payments/discount';

type RequestedProgramType = ProgramType | 'academy';

function isPaymentOption(value: unknown): value is PaymentOption {
  return value === 'full' || value === 'per_session';
}

function isProgramType(value: unknown): value is RequestedProgramType {
  return value === 'private' || value === 'group' || value === 'academy';
}

function cleanAppUrl(request: NextRequest) {
  // Always prefer request origin (correct for local/dev/prod) over env variable
  return request.nextUrl.origin.replace(/\/$/, '');
}

export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const programType = body?.programType;
  const paymentOption = body?.paymentOption;
  const preferredDate = body?.preferredDate || null;
  const preferredTime = body?.preferredTime || null;

  if (!isProgramType(programType) || !isPaymentOption(paymentOption)) {
    return NextResponse.json(
      { error: 'Invalid payment request. Choose a program type and payment option.' },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();

  const { data: existingProgram, error: existingError } = await supabase
    .from('programs')
    .select('id, status, payment_status')
    .eq('user_id', user.id)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error('[Ziina Create Payment] Existing program check failed:', existingError);
    return NextResponse.json({ error: 'Unable to check your current program status' }, { status: 500 });
  }

  if (existingProgram) {
    const message =
      existingProgram.status === 'pending'
        ? 'You already have a program pending payment confirmation.'
        : 'You already have an active program.';

    return NextResponse.json(
      {
        error: message,
        programId: existingProgram.id,
        status: existingProgram.status,
        paymentStatus: existingProgram.payment_status,
      },
      { status: 409 }
    );
  }

  let therapistId: string | null = null;
  let therapistName: string | null = null;
  const isAcademy = programType === 'academy';

  if (!isAcademy) {
    const { data: completedConsultation, error: consultationError } = await supabase
      .from('bookings')
      .select('id, therapist_user_id, therapist_name')
      .eq('user_id', user.id)
      .eq('type', 'free_consultation')
      .eq('status', 'completed')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (consultationError) {
      console.error('[Ziina Create Payment] Consultation check failed:', consultationError);
      return NextResponse.json({ error: 'Unable to confirm consultation eligibility' }, { status: 500 });
    }

    if (completedConsultation) {
      therapistId = completedConsultation.therapist_user_id;
      therapistName = completedConsultation.therapist_name || body?.therapistName || 'Assigned Therapist';
    } else if (typeof body?.therapistSlug === 'string' && body.therapistSlug.trim()) {
      const resolvedTherapist = await resolveTherapistUserRow(supabase, body.therapistSlug.trim());
      therapistId = resolvedTherapist?.id ?? null;
      therapistName = resolvedTherapist?.full_name || body?.therapistName || null;
    } else if (typeof body?.therapistName === 'string' && body.therapistName.trim()) {
      therapistName = body.therapistName.trim();
    }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const clientName = userData?.full_name || user.user_metadata?.full_name || user.email || 'Client';
  const clientEmail = userData?.email || user.email;

  if (!clientEmail) {
    return NextResponse.json({ error: 'Your account is missing an email address.' }, { status: 400 });
  }

  const baseAmountAed = isAcademy
    ? paymentOption === 'full'
      ? ACADEMY_PRICING.fullProgram
      : ACADEMY_PRICING.installment
    : getPrice(programType, paymentOption, therapistName);

  // Server-side discount: fetch from DB, ignore client-sent value
  const activeDiscount = await getActiveDiscount(user.id);
  const discount = activeDiscount
    ? applyDiscount(baseAmountAed, activeDiscount.discountPercent)
    : null;

  const amountAed = discount ? discount.discountedPrice : baseAmountAed;
  const amountFils = Math.round(amountAed * 100);
  const totalSessions = isAcademy ? ACADEMY_PRICING.installmentCount : 10;
  const storedProgramType: RequestedProgramType = isAcademy ? 'academy' : programType;
  const appUrl = cleanAppUrl(request);

  const metadata = {
    gateway: 'ziina',
    userId: user.id,
    programType,
    storedProgramType,
    paymentOption,
    originalAmountAed: baseAmountAed,
    amountAed,
    amountFils,
    currency: 'AED',
    totalSessions,
    therapistId,
    therapistName: isAcademy ? 'NeuroHolistic Academy' : therapistName,
    clientName,
    clientEmail,
    preferredDate,
    preferredTime,
    ...(discount
      ? {
          discountPercent: discount.discountPercent,
          discountedAmountAed: discount.discountedPrice,
          savingsAed: discount.savings,
        }
      : {}),
  };

  const { data: paymentRow, error: paymentError } = await supabase
    .from('payments')
    .insert({
      user_id: user.id,
      amount: amountAed,
      currency: 'AED',
      type: paymentOption === 'full' ? 'full_program' : 'single_session',
      status: 'pending',
      metadata,
    })
    .select('id')
    .single();

  if (paymentError || !paymentRow) {
    console.error('[Ziina Create Payment] Failed to create local payment:', paymentError);
    return NextResponse.json({ error: 'Unable to initialize payment' }, { status: 500 });
  }

  const successUrl = `${appUrl}/payment/ziina/success?payment_intent_id={PAYMENT_INTENT_ID}`;
  const cancelUrl = `${appUrl}/booking/paid-program-booking?payment=cancelled`;
  const failureUrl = `${appUrl}/payment/ziina/failure?payment_intent_id={PAYMENT_INTENT_ID}`;
  const message = `NeuroHolistic ${isAcademy ? 'Academy' : programType} - ${
    paymentOption === 'full' ? 'Full payment' : 'Per-session payment'
  }${discount ? ` (${discount.discountPercent}% discount applied)` : ''}`;

  const result = await createZiinaPaymentIntent({
    amount: amountFils,
    currency: 'AED',
    message,
    successUrl,
    cancelUrl,
    failureUrl,
  });

  if (!result.success || !result.paymentIntentId || !result.paymentLink) {
    await supabase
      .from('payments')
      .update({
        status: 'failed',
        metadata: {
          ...metadata,
          ziinaError: result.error || 'Ziina payment intent creation failed',
        },
      })
      .eq('id', paymentRow.id);

    return NextResponse.json(
      { error: result.error || 'Failed to create Ziina payment session' },
      { status: 502 }
    );
  }

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      payment_reference: result.paymentIntentId,
      metadata: {
        ...metadata,
        paymentIntentId: result.paymentIntentId,
      },
    })
    .eq('id', paymentRow.id);

  if (updateError) {
    console.error('[Ziina Create Payment] Failed to save Ziina payment reference:', updateError);
    return NextResponse.json({ error: 'Payment was created but could not be saved locally' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    paymentLink: result.paymentLink,
    paymentIntentId: result.paymentIntentId,
  });
}
