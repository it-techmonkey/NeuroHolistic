import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';
import { BookingService } from '@/lib/services/booking.service';

/**
 * Fallback endpoint: verify a payment intent was completed and ensure
 * the program + booking exist. Called by the success page when the
 * webhook may have been missed or ran on old code.
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
  const paymentId = `ziina:${paymentIntentId}`;

  // Always fetch payment record first — we need its metadata for booking creation
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('payment_reference', paymentIntentId)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  const metadata = (payment.metadata && typeof payment.metadata === 'object' && !Array.isArray(payment.metadata))
    ? payment.metadata as Record<string, any>
    : {};

  const preferredDate = metadata.preferredDate || null;
  const preferredTime = metadata.preferredTime || null;

  // Check if program exists from this payment
  const { data: existingProgram } = await supabase
    .from('programs')
    .select('id, therapist_user_id, therapist_name, user_id')
    .eq('payment_id', paymentId)
    .maybeSingle();

  if (existingProgram && preferredDate && preferredTime) {
    // Ensure first session booking exists even if webhook used old code
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id')
      .eq('program_id', existingProgram.id)
      .eq('session_number', 1)
      .eq('user_id', existingProgram.user_id || payment.user_id)
      .maybeSingle();

    if (!existingBooking) {
      console.log('[Verify Payment] Program exists but no booking for session 1, creating...');
      const { data: clientUser } = await supabase
        .from('users')
        .select('full_name, email')
        .eq('id', existingProgram.user_id || payment.user_id)
        .maybeSingle();

      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: existingProgram.user_id || payment.user_id,
        name: clientUser?.full_name || metadata.clientName || 'Client',
        email: clientUser?.email || metadata.clientEmail || '',
        phone: '',
        country: '',
        therapist_id: existingProgram.therapist_user_id || 'unknown',
        therapist_user_id: existingProgram.therapist_user_id,
        therapist_name: existingProgram.therapist_name || 'Assigned Therapist',
        date: preferredDate,
        time: preferredTime,
        type: 'program',
        status: 'scheduled',
        program_id: existingProgram.id,
        session_number: 1,
        meeting_link: null,
        google_calendar_event_id: null,
      });

      if (bookingError) {
        console.error('[Verify Payment] Failed to create missing booking:', bookingError);
      } else {
        console.log('[Verify Payment] Created missing booking for session 1');
        // Also update the session record
        await supabase
          .from('sessions')
          .update({ date: preferredDate, time: preferredTime, status: 'scheduled' })
          .eq('program_id', existingProgram.id)
          .eq('session_number', 1);
      }
    }

    return NextResponse.json({ success: true, programId: existingProgram.id, message: 'Program already exists' });
  }

  if (existingProgram) {
    return NextResponse.json({ success: true, programId: existingProgram.id, message: 'Program already exists' });
  }

  // Verify payment completed with Ziina
  let intent;
  try {
    intent = await getZiinaPaymentIntent(paymentIntentId);
  } catch (err: any) {
    return NextResponse.json({ error: `Failed to verify payment: ${err.message}` }, { status: 502 });
  }

  if (intent.status !== 'completed') {
    return NextResponse.json({ success: false, status: intent.status, message: 'Payment not yet completed' });
  }

  if (payment.status === 'paid' && payment.program_id) {
    return NextResponse.json({ success: true, programId: payment.program_id, message: 'Already processed' });
  }

  const userId = metadata.userId || payment.user_id;
  if (!userId) {
    return NextResponse.json({ error: 'Payment missing user id' }, { status: 400 });
  }

  // Check if user has an active program (created by another webhook call)
  const { data: activeProgram } = await supabase
    .from('programs')
    .select('id, therapist_user_id, therapist_name')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgram) {
    // Ensure first session booking exists
    if (preferredDate && preferredTime) {
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('program_id', activeProgram.id)
        .eq('session_number', 1)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingBooking) {
        console.log('[Verify Payment] Active program exists but no booking for session 1, creating...');
        const { data: clientUser } = await supabase
          .from('users')
          .select('full_name, email')
          .eq('id', userId)
          .maybeSingle();

        await supabase.from('bookings').insert({
          user_id: userId,
          name: clientUser?.full_name || metadata.clientName || 'Client',
          email: clientUser?.email || metadata.clientEmail || '',
          phone: '',
          country: '',
          therapist_id: activeProgram.therapist_user_id || 'unknown',
          therapist_user_id: activeProgram.therapist_user_id,
          therapist_name: activeProgram.therapist_name || 'Assigned Therapist',
          date: preferredDate,
          time: preferredTime,
          type: 'program',
          status: 'scheduled',
          program_id: activeProgram.id,
          session_number: 1,
          meeting_link: null,
          google_calendar_event_id: null,
        });

        await supabase
          .from('sessions')
          .update({ date: preferredDate, time: preferredTime, status: 'scheduled' })
          .eq('program_id', activeProgram.id)
          .eq('session_number', 1);
      }
    }

    await supabase
      .from('payments')
      .update({ status: 'paid', program_id: activeProgram.id, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
      .eq('id', payment.id);
    return NextResponse.json({ success: true, programId: activeProgram.id, message: 'Linked to existing program' });
  }

  const totalSessions = Number(metadata.totalSessions) || 10;
  const programType = metadata.storedProgramType || metadata.programType || 'private';
  const clientEmail = metadata.clientEmail || '';

  // Get user details
  const { data: finalClient } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  const clientFullName = finalClient?.full_name || metadata.clientName || 'Client';
  const clientEmailAddress = finalClient?.email || clientEmail;

  // Use BookingService to create program
  const service = new BookingService();
  const result = await service.purchaseProgram({
    userId,
    programType,
    therapistId: metadata.therapistId || null,
    therapistName: metadata.therapistName || null,
    totalSessions,
    amountAed: metadata.amountAed || payment.amount,
    paymentId,
    clientName: clientFullName,
    clientEmail: clientEmailAddress,
    preferredDate: metadata.preferredDate || null,
    preferredTime: metadata.preferredTime || null,
    paymentStatus: 'verified',
  });

  if (!result.success || !result.programId) {
    return NextResponse.json({ error: result.error || 'Failed to create program' }, { status: 500 });
  }

  // Update payment record
  await supabase
    .from('payments')
    .update({ status: 'paid', program_id: result.programId, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
    .eq('id', payment.id);

  return NextResponse.json({ success: true, programId: result.programId, message: 'Program created via fallback' });
}
