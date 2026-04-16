import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

function getTherapistFromSlug(slug: string) {
  return TEAM_PROFILES.find(p => p.slug === slug);
}

// Default time slots matching BOOKING_TIME_SLOTS + extended evening slots
const DEFAULT_TIME_SLOTS = ['09:00', '11:00', '14:00', '16:00', '18:00', '20:00'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let therapistId = searchParams.get('therapistId');
    const date = searchParams.get('date');

    console.log('[Availability] Request:', { therapistId, date });

    if (!therapistId || !date) {
      return NextResponse.json({ error: 'therapistId and date are required.' }, { status: 400 });
    }

    // If therapistId is a slug (like "fawzia-yassmina"), resolve to UUID
    const profile = getTherapistFromSlug(therapistId);
    if (profile) {
      // This is a slug - check if there's a user record in the database
      const supabase = getServiceSupabase();
      const { data: therapistUser } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', profile.name.en)
        .eq('role', 'therapist')
        .maybeSingle();

      if (therapistUser) {
        therapistId = therapistUser.id;
      } else {
        // No user record yet - use default slots anyway
        therapistId = null;
      }
    }

    const supabase = getServiceSupabase();

    // Check for blocked dates first (only if we have a valid UUID)
    let blocked = [];
    if (therapistId) {
      const { data: blockedData } = await supabase
        .from('therapist_availability')
        .select('id')
        .eq('therapist_id', therapistId)
        .eq('exception_date', date)
        .eq('is_blocked', true);
      blocked = blockedData || [];
    }

    if (blocked.length > 0) {
      console.log('[Availability] Date is blocked');
      return NextResponse.json({ slots: [], message: 'Therapist is not available on this date.' });
    }

    // Get day of week
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    console.log('[Availability] Day of week:', dayOfWeek);

    // Generate time slots - use defaults if no availability configured
    const allSlots: string[] = [];

    // Try to get availability if we have a valid UUID
    let availability = [];
    if (therapistId) {
      const { data: availData } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', therapistId)
        .or(`day_of_week.eq.${dayOfWeek},exception_date.eq.${date}`)
        .eq('is_blocked', false);
      availability = availData || [];
    }

    if (availability.length > 0) {
      // Use configured availability windows - generate 2-hour interval slots
      for (const window of availability) {
        const [startH, startM] = window.start_time.split(':').map(Number);
        const [endH, endM] = window.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        // Generate slots at 2-hour intervals (matching BOOKING_TIME_SLOTS pattern)
        for (let mins = startMinutes; mins + 120 <= endMinutes; mins += 120) {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
      }
    } else {
      // No availability configured - use default time slots
      console.log('[Availability] Using default slots');
      allSlots.push(...DEFAULT_TIME_SLOTS);
    }

    console.log('[Availability] All slots:', allSlots);

    // If we don't have a valid therapistId, return default slots
    if (!therapistId) {
      return NextResponse.json({
        slots: allSlots.map((time) => ({
          time,
          display: formatTimeDisplay(time),
        })),
      });
    }

    // Get existing bookings for this therapist on this date
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('time')
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .neq('status', 'cancelled');

    // Also check by therapist_user_id
    const { data: existingBookingsByUserId } = await supabase
      .from('bookings')
      .select('time')
      .eq('therapist_user_id', therapistId)
      .eq('date', date)
      .neq('status', 'cancelled');

    const bookedTimes = new Set<string>();

    for (const b of existingBookings ?? []) {
      if (b.time) bookedTimes.add(b.time);
    }
    for (const b of existingBookingsByUserId ?? []) {
      if (b.time) bookedTimes.add(b.time);
    }

    // Also check sessions table
    const { data: existingSessions } = await supabase
      .from('sessions')
      .select('time')
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .neq('status', 'cancelled');

    // Also check by therapist_user_id
    const { data: existingSessionsByUserId } = await supabase
      .from('sessions')
      .select('time')
      .eq('therapist_id', therapistId)
      .eq('date', date)
      .neq('status', 'cancelled');

    for (const s of existingSessions ?? []) {
      if (s.time) bookedTimes.add(s.time);
    }
    for (const s of existingSessionsByUserId ?? []) {
      if (s.time) bookedTimes.add(s.time);
    }

    console.log('[Availability] Booked times:', bookedTimes);

    // Filter out booked slots
    let availableSlots = allSlots.filter((slot) => !bookedTimes.has(slot));

    // Filter out past time slots if booking for today
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const today = `${todayYear}-${todayMonth}-${todayDay}`;

    if (date === today) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      availableSlots = availableSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        const slotMinutes = slotHour * 60 + slotMinute;
        // Only show slots that are at least 1 hour (60 minutes) in the future
        return slotMinutes >= currentMinutes + 60;
      });

      console.log('[Availability] Filtered past slots for today. Current time:', `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`, 'Available:', availableSlots);
    }

    console.log('[Availability] Available slots:', availableSlots);

    return NextResponse.json({
      slots: availableSlots.map((time) => ({
        time,
        display: formatTimeDisplay(time),
      })),
    });
  } catch (error) {
    console.error('[Bookings Availability] Error:', error);
    // Return default slots on error to avoid blocking the user
    return NextResponse.json({
      slots: DEFAULT_TIME_SLOTS.map((time) => ({
        time,
        display: formatTimeDisplay(time),
      })),
    });
  }
}

function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(':');
  const hr = parseInt(h, 10);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}
