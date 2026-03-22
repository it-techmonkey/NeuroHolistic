import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/auth/server';
import { isValidSlot } from '@/lib/booking/slots';
import { sendBookingNotifications } from '@/lib/notifications/booking';

function getServiceSupabase() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, date, time } = body as {
      bookingId?: string;
      date?: string;
      time?: string;
    };

    if (!bookingId || !date || !time) {
      return NextResponse.json({ error: 'bookingId, date and time are required' }, { status: 400 });
    }

    if (!isValidSlot(time)) {
      return NextResponse.json({ error: 'Invalid time slot' }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'Only confirmed bookings can be rescheduled' }, { status: 400 });
    }

    let conflictQuery = supabase
      .from('bookings')
      .select('id')
      .eq('date', date)
      .eq('time', time)
      .eq('status', 'confirmed')
      .neq('id', booking.id);

    if (booking.therapist_user_id) {
      conflictQuery = conflictQuery.eq('therapist_user_id', booking.therapist_user_id);
    } else {
      conflictQuery = conflictQuery.eq('therapist_id', booking.therapist_id);
    }

    const { data: conflict } = await conflictQuery.maybeSingle();
    if (conflict) {
      return NextResponse.json({ error: 'Selected slot is not available' }, { status: 409 });
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        date,
        time,
        rescheduled_from_date: booking.date,
        rescheduled_from_time: booking.time,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase
      .from('sessions')
      .update({
        date,
        time,
        updated_at: new Date().toISOString(),
      })
      .eq('booking_id', booking.id);

    await sendBookingNotifications({
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      therapistName: booking.therapist_name,
      date,
      time,
      meetingLink: booking.meeting_link,
      context: 'reschedule',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}