import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/auth/server';
import { createClient } from '@supabase/supabase-js';
import { getUserProgram } from '@/lib/programs';
import { incrementUsedSessions } from '@/lib/supabase/programs';
import { isValidSlot } from '@/lib/booking/slots';
import { getNextConfirmedSession, toDubaiDateTime } from '@/lib/booking/session-flow';
import { createGoogleMeetEvent } from '@/lib/meeting/google-meet';
import { sendBookingNotifications } from '@/lib/notifications/booking';
import type { Database } from '@/lib/supabase/database.types';

// Service-role client for writes
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Authenticate
    const serverSupabase = await createServerClient();
    const { data: { user } } = await serverSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { date, time } = body;

    if (!date || !time) {
      return NextResponse.json({ error: 'Date and time are required' }, { status: 400 });
    }

    if (!isValidSlot(time)) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 });
    }

    // Get user's program
    const programData = await getUserProgram(user.id);

    if (!programData) {
      return NextResponse.json({ error: 'No active program found. Please purchase a program first.' }, { status: 403 });
    }

    const { program, remainingSessions } = programData;

    if (remainingSessions <= 0) {
      return NextResponse.json({ error: 'No sessions remaining in your program.' }, { status: 403 });
    }

    const { data: confirmedBookings, error: confirmedBookingsError } = await supabase
      .from('bookings')
      .select('id,date,time,status')
      .eq('user_id', user.id)
      .eq('program_id', program.id)
      .eq('type', 'program')
      .eq('status', 'confirmed');

    if (confirmedBookingsError) {
      console.error('[ScheduleSession] Failed to load existing program bookings:', confirmedBookingsError);
      return NextResponse.json({ error: 'Failed to validate your current session flow.' }, { status: 500 });
    }

    const nextUpcomingBooking = getNextConfirmedSession(confirmedBookings ?? []);

    if (nextUpcomingBooking) {
      return NextResponse.json(
        {
          error: 'Your next session is already scheduled. You can reschedule that session, but you cannot book the session after it yet.',
          nextBookingId: nextUpcomingBooking.id,
        },
        { status: 409 }
      );
    }

    let duplicateQuery = supabase
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'confirmed');

    if (program.therapist_user_id) {
      duplicateQuery = duplicateQuery.eq('therapist_user_id', program.therapist_user_id);
    } else {
      duplicateQuery = duplicateQuery.eq('therapist_id', program.therapist_name || 'program-session');
    }

    const { data: existingSlot } = await duplicateQuery.maybeSingle();

    if (existingSlot) {
      return NextResponse.json({ error: 'This time slot is already booked. Please choose another.' }, { status: 409 });
    }

    // Determine session number (used_sessions + 1)
    const sessionNumber = program.used_sessions + 1;

    // Build user display name
    const firstName = (user.user_metadata?.first_name as string | undefined) || '';
    const lastName = (user.user_metadata?.last_name as string | undefined) || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.email || '';

    const meetingEvent = await createGoogleMeetEvent({
      summary: `NeuroHolistic Session ${sessionNumber} - ${fullName}`,
      description: 'Program session booking via NeuroHolistic platform',
      date,
      time,
      durationMinutes: 60,
      attendeeEmails: [user.email!],
    });
    const meetingLink = meetingEvent.meetLink;

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        name: fullName,
        email: user.email!,
        phone: (user.user_metadata?.phone as string | undefined) || '',
        country: '',
        therapist_id: program.therapist_name || 'program-session',
        therapist_name: program.therapist_name || 'Program Session',
        therapist_user_id: program.therapist_user_id || null,
        date,
        time,
        type: 'program',
        program_id: program.id,
        meeting_link: meetingLink,
        google_calendar_event_id: meetingEvent.eventId,
        status: 'confirmed',
      })
      .select('id')
      .single();

    if (bookingError) {
      console.error('[ScheduleSession] Booking insert error:', bookingError);
      return NextResponse.json({ error: 'Failed to schedule session. Please try again.' }, { status: 500 });
    }

    // Deduct session (increment used_sessions)
    await incrementUsedSessions(program.id).catch((err) => {
      console.error('[ScheduleSession] Failed to increment used_sessions (non-fatal):', err);
    });

    // Also insert to sessions table for tracking
    await supabase.from('sessions').insert({
      program_id: program.id,
      booking_id: booking.id,
      client_id: user.id,
      therapist_id: program.therapist_user_id || null,
      session_number: sessionNumber,
      date_time: toDubaiDateTime(date, time),
      date,
      time,
      meet_link: meetingLink,
      status: 'scheduled',
    }).then(({ error }) => {
      if (error) console.error('[ScheduleSession] sessions insert error (non-fatal):', error);
    });

    await sendBookingNotifications({
      name: fullName,
      email: user.email!,
      phone: (user.user_metadata?.phone as string | undefined) || null,
      therapistName: program.therapist_name || 'Program Session',
      date,
      time,
      meetingLink,
      context: 'program_session',
    });

    return NextResponse.json({
      success: true,
      sessionNumber,
      remainingSessions: remainingSessions - 1,
      bookingId: booking.id,
      meetingLink,
    });
  } catch (err) {
    console.error('[ScheduleSession] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
