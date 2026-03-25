import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { updateMeetEvent, createMeetEvent } from '@/lib/meeting/google-meet';
import { sendAllNotifications } from '@/lib/notifications/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, newDate, newTime } = body;

    if (!bookingId || !newDate || !newTime) {
      return NextResponse.json(
        { error: 'bookingId, newDate, and newTime are required.' },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Fetch existing booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'Cannot reschedule a cancelled booking' }, { status: 409 });
    }

    // 2. Check therapist availability for new slot
    const { data: conflict } = await supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', booking.therapist_id)
      .eq('date', newDate)
      .eq('time', newTime)
      .neq('status', 'cancelled')
      .neq('id', bookingId)
      .maybeSingle();

    if (conflict) {
      return NextResponse.json(
        { error: 'This time slot is no longer available. Please select another.' },
        { status: 409 }
      );
    }

    // 3. Update Google Calendar event if it exists
    let meetLink = booking.meeting_link;
    let calendarEventId = booking.google_calendar_event_id;

    if (calendarEventId) {
      try {
        const startDateTime = `${newDate}T${newTime}:00`;
        const [hours, minutes] = newTime.split(':').map(Number);
        const endHours = hours + 1;
        const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        const endDateTime = `${newDate}T${endTime}:00`;

        const result = await updateMeetEvent(calendarEventId, {
          startDateTime,
          endDateTime,
        });
        meetLink = result.meetLink;
      } catch (meetError) {
        console.error('[Reschedule] Google Calendar update failed:', meetError);
        // Create new event if update fails
        try {
          const startDateTime = `${newDate}T${newTime}:00`;
          const [hours, minutes] = newTime.split(':').map(Number);
          const endHours = hours + 1;
          const endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
          const endDateTime = `${newDate}T${endTime}:00`;

          const result = await createMeetEvent({
            summary: `NeuroHolistic — ${booking.type === 'free_consultation' ? 'Free Consultation' : 'Therapy Session'} (Rescheduled)`,
            description: `Session with ${booking.therapist_name}`,
            startDateTime,
            endDateTime,
            attendeeEmails: [booking.email],
          });
          meetLink = result.meetLink;
          calendarEventId = result.calendarEventId;
        } catch (createError) {
          console.error('[Reschedule] Failed to create new Meet event:', createError);
        }
      }
    }

    // 4. Update booking record
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        date: newDate,
        time: newTime,
        meeting_link: meetLink,
        google_calendar_event_id: calendarEventId,
        reschedule_count: (booking.reschedule_count ?? 0) + 1,
        rescheduled_from_date: booking.date,
        rescheduled_from_time: booking.time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 5. Update linked session if exists
    if (booking.session_number && booking.program_id) {
      await supabase
        .from('sessions')
        .update({
          date: newDate,
          time: newTime,
          date_time: `${newDate}T${newTime}:00`,
          meet_link: meetLink,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);
    }

    // 6. Send reschedule notification
    const formattedDate = new Date(`${newDate}T00:00:00`).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    const [h, m] = newTime.split(':');
    const hr = parseInt(h, 10);
    const formattedTime = `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;

    await sendAllNotifications({
      bookingId: booking.id,
      userId: booking.user_id ?? undefined,
      recipientEmail: booking.email,
      recipientPhone: booking.phone,
      recipientName: booking.name,
      therapistName: booking.therapist_name,
      sessionDate: formattedDate,
      sessionTime: formattedTime,
      meetLink: meetLink || 'Link will be provided shortly',
      triggerType: 'booking_rescheduled',
    });

    return NextResponse.json({
      success: true,
      booking: {
        id: bookingId,
        date: newDate,
        time: newTime,
        meetLink,
        status: 'confirmed',
      },
    });
  } catch (error) {
    console.error('[Reschedule]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
