import { getServiceSupabase } from '@/lib/supabase/service';
import { isValidSlot, BOOKING_TIME_SLOTS } from '@/lib/booking/slots';
import { getNextConfirmedSession, toDubaiDateTime } from '@/lib/booking/session-flow';
import { createMeetEvent, updateMeetEvent } from '@/lib/meeting/google-meet';
import { checkEligibility } from '@/lib/services/eligibility.service';

export type CreateBookingInput = {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  type: 'consultation' | 'program';
  therapistSlug: string;
  therapistName: string;
  therapistUserId?: string | null;
  date: string;
  time: string;
  userId?: string | null;
  programId?: string | null;
};

export type BookingResult = {
  success: boolean;
  bookingId?: string;
  meetingLink?: string;
  sessionNumber?: number;
  remainingSessions?: number;
  error?: string;
};

const MAX_RESCHEDULES = 2;
const MIN_ADVANCE_HOURS = 24;

type TherapistAssignment = {
  therapistSlug: string;
  therapistName: string;
  therapistUserId: string | null;
};

function isDubaiWithin24Hours(date: string, time: string): boolean {
  const sessionDate = new Date(toDubaiDateTime(date, time));
  const now = new Date();
  const hoursUntil = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntil < MIN_ADVANCE_HOURS;
}

export async function createBooking(input: CreateBookingInput): Promise<BookingResult> {
  const supabase = getServiceSupabase();

  if (!isValidSlot(input.time)) {
    return { success: false, error: `Invalid time slot: ${input.time}` };
  }

  if (input.type === 'consultation') {
    const eligibility = await checkEligibility(input.email);
    if (!eligibility.canBookConsultation) {
      return { success: false, error: 'A consultation has already been booked for this email' };
    }
  }

  let sessionNumber: number | undefined;
  let remainingSessions: number | undefined;
  let programId = input.programId;
  let effectiveTherapist: TherapistAssignment = {
    therapistSlug: input.therapistSlug,
    therapistName: input.therapistName,
    therapistUserId: input.therapistUserId ?? null,
  };

  if (input.type === 'program') {
    if (!programId) {
      const eligibility = await checkEligibility(input.email);
      if (!eligibility.hasActiveProgram || !eligibility.programId || !eligibility.canBookProgramSessions) {
        return { success: false, error: 'No active program found' };
      }
      programId = eligibility.programId;
    }

    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id, total_sessions, used_sessions, user_id, therapist_user_id, therapist_name')
      .eq('id', programId)
      .eq('status', 'active')
      .maybeSingle();

    if (programError || !program) {
      return { success: false, error: 'Program not found or inactive' };
    }

    if (program.used_sessions >= program.total_sessions) {
      return { success: false, error: 'All program sessions have been used' };
    }

    let assignedTherapist: TherapistAssignment | null = program.therapist_name
      ? {
          therapistSlug:
            input.therapistSlug ||
            program.therapist_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          therapistName: program.therapist_name,
          therapistUserId: program.therapist_user_id,
        }
      : null;

    if (!assignedTherapist && program.user_id) {
      const { data: firstBooking } = await supabase
        .from('bookings')
        .select('therapist_id, therapist_name, therapist_user_id')
        .eq('user_id', program.user_id)
        .in('status', ['confirmed', 'completed', 'scheduled'])
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstBooking?.therapist_name) {
        assignedTherapist = {
          therapistSlug: firstBooking.therapist_id,
          therapistName: firstBooking.therapist_name,
          therapistUserId: firstBooking.therapist_user_id,
        };
      }
    }

    if (assignedTherapist) {
      const therapistMismatch =
        (effectiveTherapist.therapistUserId &&
          assignedTherapist.therapistUserId &&
          effectiveTherapist.therapistUserId !== assignedTherapist.therapistUserId) ||
        (effectiveTherapist.therapistSlug &&
          effectiveTherapist.therapistSlug !== assignedTherapist.therapistSlug);

      if (therapistMismatch) {
        return { success: false, error: 'Program sessions must stay with your assigned therapist' };
      }

      effectiveTherapist = assignedTherapist;
    }

    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id, date, time, status')
      .eq('program_id', programId)
      .eq('status', 'confirmed');

    if (existingBookings && existingBookings.length > 0) {
      const nextConfirmed = getNextConfirmedSession(existingBookings);
      if (nextConfirmed) {
        return { success: false, error: 'You already have an upcoming confirmed session. Please complete or cancel it before booking another.' };
      }
    }

    sessionNumber = program.used_sessions + 1;
    remainingSessions = program.total_sessions - program.used_sessions - 1;

    if (!program.therapist_name && effectiveTherapist.therapistName) {
      const { error: therapistUpdateError } = await supabase
        .from('programs')
        .update({
          therapist_name: effectiveTherapist.therapistName,
          therapist_user_id: effectiveTherapist.therapistUserId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', program.id);

      if (therapistUpdateError) {
        console.error('[BookingService] Failed to persist assigned therapist:', therapistUpdateError);
      }
    }
  }

  const { data: duplicateSlot } = await supabase
    .from('bookings')
    .select('id')
    .eq('therapist_id', effectiveTherapist.therapistSlug)
    .eq('date', input.date)
    .eq('time', input.time)
    .eq('status', 'confirmed')
    .maybeSingle();

  if (duplicateSlot) {
    return { success: false, error: 'This time slot is already booked' };
  }

  const meetResult = await createMeetEvent({
    summary: `${input.type === 'consultation' ? 'Consultation' : `Session ${sessionNumber ?? ''}`} — ${input.name} × ${effectiveTherapist.therapistName}`,
    description: `Booking for ${input.name} (${input.email}) with ${effectiveTherapist.therapistName}`,
    startDateTime: `${input.date}T${input.time}:00`,
    endDateTime: `${input.date}T${input.time.split(':')[0] + 1}:00:00`,
    attendeeEmails: [input.email],
    therapistId: effectiveTherapist.therapistUserId ?? undefined,
  });

  const bookingType = input.type === 'consultation' ? 'free_consultation' : 'program';

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      user_id: input.userId ?? null,
      name: input.name,
      email: input.email,
      phone: input.phone ?? '',
      country: input.country ?? '',
      therapist_id: effectiveTherapist.therapistSlug,
      therapist_name: effectiveTherapist.therapistName,
      therapist_user_id: effectiveTherapist.therapistUserId,
      date: input.date,
      time: input.time,
      type: bookingType,
      program_id: programId ?? null,
      meeting_link: meetResult.meetLink,
      status: 'confirmed',
      session_number: sessionNumber ?? null,
      google_calendar_event_id: meetResult.calendarEventId,
    })
    .select('id')
    .single();

  if (insertError || !booking) {
    console.error('[BookingService] Insert failed:', insertError);
    return { success: false, error: 'Failed to create booking' };
  }

  if (input.type === 'program' && programId) {
    const { error: updateErr } = await supabase
      .from('programs')
      .update({
        used_sessions: sessionNumber!,
        updated_at: new Date().toISOString(),
      })
      .eq('id', programId);

    if (updateErr) {
      console.error('[BookingService] Failed to update program used_sessions:', updateErr);
    }

    const { error: sessionErr } = await supabase
      .from('sessions')
      .insert({
        program_id: programId,
        booking_id: booking.id,
        client_id: input.userId ?? null,
        therapist_id: effectiveTherapist.therapistUserId,
        session_number: sessionNumber!,
        date: input.date,
        time: input.time,
        date_time: toDubaiDateTime(input.date, input.time),
        meet_link: meetResult.meetLink,
        status: 'scheduled',
      });

    if (sessionErr) {
      console.error('[BookingService] Failed to insert session record:', sessionErr);
    }
  }

  if (input.type === 'consultation') {
    const { error: leadErr } = await supabase
      .from('leads')
      .insert({
        name: input.name,
        email: input.email,
        mobile: input.phone ?? '',
        country: input.country ?? '',
        source: 'consultation_booking',
      });

    if (leadErr) {
      console.error('[BookingService] Failed to create lead:', leadErr);
    }
  }

  return {
    success: true,
    bookingId: booking.id,
    meetingLink: meetResult.meetLink,
    sessionNumber,
    remainingSessions,
  };
}

export async function rescheduleBooking(
  bookingId: string,
  userId: string,
  newDate: string,
  newTime: string
): Promise<BookingResult> {
  const supabase = getServiceSupabase();

  if (!isValidSlot(newTime)) {
    return { success: false, error: `Invalid time slot: ${newTime}` };
  }

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  if (booking.user_id !== userId) {
    return { success: false, error: 'You are not authorized to reschedule this booking' };
  }

  if (booking.status !== 'confirmed') {
    return { success: false, error: `Cannot reschedule a booking with status "${booking.status}"` };
  }

  if (booking.reschedule_count >= MAX_RESCHEDULES) {
    return { success: false, error: `Maximum reschedule limit (${MAX_RESCHEDULES}) reached` };
  }

  if (isDubaiWithin24Hours(booking.date, booking.time)) {
    return { success: false, error: 'Cannot reschedule within 24 hours of the session' };
  }

  const { data: duplicateSlot } = await supabase
    .from('bookings')
    .select('id')
    .eq('therapist_id', booking.therapist_id)
    .eq('date', newDate)
    .eq('time', newTime)
    .eq('status', 'confirmed')
    .neq('id', bookingId)
    .maybeSingle();

  if (duplicateSlot) {
    return { success: false, error: 'This time slot is already booked' };
  }

  if (booking.google_calendar_event_id) {
    await updateMeetEvent(booking.google_calendar_event_id, {
      startDateTime: `${newDate}T${newTime}:00`,
      endDateTime: `${newDate}T${newTime.split(':')[0] + 1}:00:00`,
    });
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({
      date: newDate,
      time: newTime,
      rescheduled_from_date: booking.date,
      rescheduled_from_time: booking.time,
      reschedule_count: booking.reschedule_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateErr) {
    console.error('[BookingService] Reschedule update failed:', updateErr);
    return { success: false, error: 'Failed to update booking' };
  }

  if (booking.program_id) {
    await supabase
      .from('sessions')
      .update({
        date: newDate,
        time: newTime,
        date_time: toDubaiDateTime(newDate, newTime),
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId);
  }

  return {
    success: true,
    bookingId,
    meetingLink: booking.meeting_link ?? undefined,
  };
}

export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<BookingResult> {
  const supabase = getServiceSupabase();

  const { data: booking, error: fetchErr } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .maybeSingle();

  if (fetchErr || !booking) {
    return { success: false, error: 'Booking not found' };
  }

  if (booking.user_id !== userId) {
    return { success: false, error: 'You are not authorized to cancel this booking' };
  }

  if (booking.status !== 'confirmed') {
    return { success: false, error: `Cannot cancel a booking with status "${booking.status}"` };
  }

  if (isDubaiWithin24Hours(booking.date, booking.time)) {
    return { success: false, error: 'Cannot cancel within 24 hours of the session' };
  }

  const { error: updateErr } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateErr) {
    console.error('[BookingService] Cancel failed:', updateErr);
    return { success: false, error: 'Failed to cancel booking' };
  }

  if (booking.program_id) {
    await supabase
      .from('sessions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', bookingId);

    const { data: program } = await supabase
      .from('programs')
      .select('used_sessions')
      .eq('id', booking.program_id)
      .maybeSingle();

    if (program && program.used_sessions > 0) {
      await supabase
        .from('programs')
        .update({
          used_sessions: program.used_sessions - 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.program_id);
    }
  }

  return { success: true, bookingId };
}

export async function getAvailableSlots(
  therapistId: string | null,
  therapistUserId: string | null,
  date: string,
  excludeBookingId?: string
): Promise<string[]> {
  const supabase = getServiceSupabase();

  let query = supabase
    .from('bookings')
    .select('time')
    .eq('date', date)
    .eq('status', 'confirmed');

  if (therapistId) {
    query = query.eq('therapist_id', therapistId);
  } else if (therapistUserId) {
    query = query.eq('therapist_user_id', therapistUserId);
  }

  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { data: bookedSlots } = await query;
  const takenTimes = new Set((bookedSlots ?? []).map((b) => b.time));

  return BOOKING_TIME_SLOTS.filter((slot) => !takenTimes.has(slot));
}
