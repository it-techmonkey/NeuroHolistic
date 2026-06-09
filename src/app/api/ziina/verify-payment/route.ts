import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';

/**
 * Fallback endpoint: verify a payment intent was completed and ensure
 * the program + booking exist. Called by the success page when the
 * webhook may have been missed.
 */
export async function POST(request: NextRequest) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { paymentIntentId } = await request.json().catch(() => ({}));
  if (!paymentIntentId || typeof paymentIntentId !== 'string') {
    return NextResponse.json({ error: 'payment_intent_id required' }, { status: 400 });
  }

  const supabase = getServiceSupabase();

  // 1. Check if program already exists for this payment
  const paymentId = `ziina:${paymentIntentId}`;
  const { data: existingProgram } = await supabase
    .from('programs')
    .select('id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingProgram) {
    return NextResponse.json({ success: true, programId: existingProgram.id, message: 'Program already exists' });
  }

  // 2. Fetch intent from Ziina to verify status
  let intent;
  try {
    intent = await getZiinaPaymentIntent(paymentIntentId);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to verify payment: ${err.message}` }, { status: 502 });
  }

  if (intent.status !== 'completed') {
    return NextResponse.json({
      success: false,
      status: intent.status,
      message: 'Payment not yet completed',
    });
  }

  // 3. Look up local payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  if (payment.status === 'paid' && payment.program_id) {
    return NextResponse.json({ success: true, programId: payment.program_id, message: 'Already processed' });
  }

  const metadata = (payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata))
    ? payment.metadata as Record<string, any>
    : {};

  const userId = metadata.userId || payment.user_id;
  if (!userId) {
    return NextResponse.json({ error: 'Payment missing user id' }, { status: 400 });
  }

  // 4. Check for existing active program
  const { data: activeProgram } = await supabase
    .from('programs')
    .select('id')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgram) {
    await supabase
      .from('payments')
      .update({ status: 'paid', program_id: activeProgram.id, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
      .eq('id', payment.id);
    return NextResponse.json({ success: true, programId: activeProgram.id, message: 'Linked to existing program' });
  }

  // 5. Create program
  const totalSessions = Number(metadata.totalSessions) || 10;
  const programType = metadata.storedProgramType || metadata.programType || 'private';
  const therapistId = metadata.therapistId || null;
  const therapistName = metadata.therapistName || 'Assigned Therapist';
  const clientEmail = metadata.clientEmail || '';

  const { data: program, error: programError } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      therapist_user_id: therapistId,
      therapist_name: therapistName,
      total_sessions: totalSessions,
      used_sessions: 0,
      sessions_completed: 0,
      status: 'active',
      payment_id: paymentId,
      program_type: programType,
      price_paid: metadata.amountAed || payment.amount,
      client_name: metadata.clientName || 'Client',
      client_email: clientEmail,
      payment_status: 'verified',
      payment_submitted_at: new Date().toISOString(),
      payment_verified_at: new Date().toISOString(),
      admin_notes: `Fallback processing for intent ${paymentIntentId}`,
    })
    .select('id')
    .single();

  if (programError || !program) {
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
  }

  // 6. Create sessions
  const sessions = Array.from({ length: totalSessions }, (_, i) => ({
    program_id: program.id,
    session_number: i + 1,
    status: 'pending',
    client_id: userId,
  }));

  await supabase.from('sessions').insert(sessions);

  // 7. Create booking
  const { data: clientUser } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  let bookingDate: string;
  let bookingTime: string;
  if (metadata.preferredDate && metadata.preferredTime) {
    bookingDate = metadata.preferredDate;
    bookingTime = metadata.preferredTime;
  } else {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    bookingDate = d.toISOString().split('T')[0];
    bookingTime = '10:00';
  }

  if (clientUser) {
    await supabase.from('bookings').insert({
      user_id: userId,
      name: clientUser.full_name || clientUser.email || 'Client',
      email: clientUser.email || clientEmail,
      phone: '',
      country: '',
      therapist_id: therapistId || 'unknown',
      therapist_name: therapistName,
      therapist_user_id: therapistId || null,
      date: bookingDate,
      time: bookingTime,
      type: 'program',
      status: 'confirmed',
      program_id: program.id,
    });
  }

  // 8. Update payment record
  await supabase
    .from('payments')
    .update({ status: 'paid', program_id: program.id, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
    .eq('id', payment.id);

  return NextResponse.json({ success: true, programId: program.id, message: 'Program created via fallback' });
}
