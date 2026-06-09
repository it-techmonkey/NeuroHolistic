import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { createClient } from '@/lib/auth/server';
import { getZiinaPaymentIntent } from '@/lib/payments/ziina';
import { BookingService } from '@/lib/services/booking.service';
import { createMeetEvent } from '@/lib/meeting/google-meet';

async function createBookingForSession1(
  supabase: ReturnType<typeof getServiceSupabase>,
  programId: string,
  userId: string,
  metadata: Record<string, any>,
  preferredDate: string,
  preferredTime: string,
) {
  const { data: clientUser } = await supabase
    .from('users')
    .select('full_name, email')
    .eq('id', userId)
    .maybeSingle();

  const { data: program } = await supabase
    .from('programs')
    .select('therapist_user_id, therapist_name')
    .eq('id', programId)
    .maybeSingle();

  let meetLink = '';
  let calendarEventId = '';

  if (program?.therapist_user_id) {
    try {
      const startDateTime = `${preferredDate}T${preferredTime}:00`;
      const [hours, minutes] = preferredTime.split(':').map(Number);
      const endHours = Math.min(hours + 1, 23);
      const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      const endDateTime = `${preferredDate}T${endTime}:00`;

      const result = await createMeetEvent({
        summary: `NeuroHolistic Session #1 - ${clientUser?.full_name || metadata.clientName || 'Client'}`,
        description: 'Program session via NeuroHolistic platform',
        startDateTime,
        endDateTime,
        attendeeEmails: [clientUser?.email || metadata.clientEmail || ''],
        therapistId: program.therapist_user_id,
      });
      meetLink = result.meetLink;
      calendarEventId = result.calendarEventId ?? '';
    } catch (err) {
      console.error('[Verify Payment] Meet creation failed:', err);
    }
  }

  const { error: bookingError } = await supabase.from('bookings').insert({
    user_id: userId,
    name: clientUser?.full_name || metadata.clientName || 'Client',
    email: clientUser?.email || metadata.clientEmail || '',
    phone: '',
    country: '',
    therapist_id: program?.therapist_user_id || 'unknown',
    therapist_user_id: program?.therapist_user_id,
    therapist_name: program?.therapist_name || 'Assigned Therapist',
    date: preferredDate,
    time: preferredTime,
    type: 'program',
    status: 'scheduled',
    program_id: programId,
    session_number: 1,
    meeting_link: meetLink || null,
    google_calendar_event_id: calendarEventId || null,
  });

  if (bookingError) {
    console.error('[Verify Payment] Failed to create booking:', bookingError);
    return;
  }
  console.log('[Verify Payment] Created booking for session 1 with meet link:', meetLink || '(none)');

  // Link the existing session record to the new booking and update its date/time
  const { data: newBooking } = await supabase
    .from('bookings')
    .select('id')
    .eq('program_id', programId)
    .eq('session_number', 1)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (newBooking) {
    await supabase
      .from('sessions')
      .update({
        booking_id: newBooking.id,
        date: preferredDate,
        time: preferredTime,
        date_time: `${preferredDate}T${preferredTime}:00+04:00`,
        status: 'scheduled',
        meet_link: meetLink || null,
      })
      .eq('program_id', programId)
      .eq('session_number', 1);
  }
}

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
      await createBookingForSession1(
        supabase,
        existingProgram.id,
        existingProgram.user_id || payment.user_id,
        metadata,
        preferredDate,
        preferredTime,
      );
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
    .select('id, therapist_user_id, therapist_name, total_sessions, used_sessions')
    .eq('user_id', userId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (activeProgram) {
    const remainingSessions = (activeProgram.total_sessions || 0) - (activeProgram.used_sessions || 0);
    const isPerSession = metadata.paymentOption === 'per_session';

    // For per-session: only reuse existing program if it has remaining sessions
    if (isPerSession && remainingSessions <= 0) {
      console.log('[Verify Payment] Per-session payment but existing program depleted, creating new program');
      // Fall through to create new program via BookingService
    } else if (!isPerSession || remainingSessions > 0) {
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
          await createBookingForSession1(
            supabase,
            activeProgram.id,
            userId,
            metadata,
            preferredDate,
            preferredTime,
          );
        }
      }

      await supabase
        .from('payments')
        .update({ status: 'paid', program_id: activeProgram.id, metadata: { ...metadata, ziinaStatus: 'completed', fallbackProcessed: true } })
        .eq('id', payment.id);
      return NextResponse.json({ success: true, programId: activeProgram.id, message: 'Linked to existing program' });
    }
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
    paymentOption: metadata.paymentOption || 'full',
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
