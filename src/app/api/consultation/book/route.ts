import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { createMeetEvent } from '@/lib/meeting/google-meet';
import { sendBookingNotifications } from '@/lib/notifications/booking';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, country, therapist_id, therapist_name, therapist_user_id, date, time } = body;

    if (!name || !email || !therapist_id || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate time slot
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('therapist_id', therapist_id)
      .eq('date', date)
      .eq('time', time)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot is already booked. Please choose another.' },
        { status: 409 }
      );
    }

    const meetingEvent = await createMeetEvent({
      summary: `NeuroHolistic Consultation - ${name}`,
      description: 'Free consultation booked via NeuroHolistic platform',
      startDateTime: `${date}T${time}:00`,
      endDateTime: `${date}T${time.split(':')[0] + 1}:00:00`,
      attendeeEmails: [email],
    });
    const meetingLink = meetingEvent.meetLink;

    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        country: country || '',
        therapist_id,
        therapist_name: therapist_name || therapist_id,
        therapist_user_id: therapist_user_id || null,
        date,
        time,
        type: 'free_consultation',
        status: 'confirmed',
        meeting_link: meetingLink,
        google_calendar_event_id: meetingEvent.calendarEventId,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[ConsultationBook] DB error:', insertError);
      return NextResponse.json({ error: 'Failed to create booking. Please try again.' }, { status: 500 });
    }

    await sendBookingNotifications({
      name,
      email,
      phone,
      therapistName: therapist_name,
      date,
      time,
      meetingLink,
      context: 'consultation',
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      meetingLink,
    });
  } catch (err) {
    console.error('[ConsultationBook] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
