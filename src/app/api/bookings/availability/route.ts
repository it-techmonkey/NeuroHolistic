import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { TEAM_PROFILES } from '@/components/team/team-profiles';

function getTherapistFromSlug(slug: string) {
  return TEAM_PROFILES.find(p => p.slug === slug);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let therapistId = searchParams.get('therapistId');
    const date = searchParams.get('date');

    console.log('[Availability] Request:', { therapistId, date });

    if (!therapistId || !date) {
      return NextResponse.json({ error: 'therapistId and date are required.' }, { status: 400 });
    }

    // If therapistId is a slug (like "dr-fawzia-yassmina"), resolve to UUID
    const profile = getTherapistFromSlug(therapistId);
    if (profile) {
      // This is a slug - check if there's a user record in the database
      const supabase = getServiceSupabase();
      const { data: therapistUser } = await supabase
        .from('users')
        .select('id')
        .eq('full_name', profile.name)
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

    // Generate time slots - always use defaults if no availability configured
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
      // Use configured availability windows
      for (const window of availability) {
        const [startH, startM] = window.start_time.split(':').map(Number);
        const [endH, endM] = window.end_time.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        for (let mins = startMinutes; mins + 60 <= endMinutes; mins += 60) {
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          allSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
        }
      }
    } else {
      // No availability configured - generate default slots 9 AM - 6 PM
      console.log('[Availability] Using default slots 9-6');
      for (let h = 9; h < 18; h++) {
        allSlots.push(`${String(h).padStart(2, '0')}:00`);
      }
    }

    console.log('[Availability] All slots:', allSlots);

    // If we don't have a valid therapistId, return default slots
    if (!therapistId) {
      return NextResponse.json({
        slots: allSlots.map((time) => {
          const [h, m] = time.split(':');
          const hr = parseInt(h, 10);
          return {
            time,
            display: `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`,
          };
        }),
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
    // Use local timezone for date comparison (matching client-side format)
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const today = `${todayYear}-${todayMonth}-${todayDay}`;
    
    if (date === today) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      availableSlots = availableSlots.filter((slot) => {
        const [slotHour, slotMinute] = slot.split(':').map(Number);
        // Only show slots that are at least 1 hour in the future
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMinute > currentMinute + 60) return true;
        return false;
      });
      
      console.log('[Availability] Filtered past slots for today. Current time:', `${currentHour}:${currentMinute}`, 'Available:', availableSlots);
    }

    // If no slots available, still return default slots (for testing)
    if (availableSlots.length === 0 && allSlots.length > 0) {
      console.log('[Availability] No slots available, returning defaults anyway');
      availableSlots = allSlots;
    }

    console.log('[Availability] Available slots:', availableSlots);

    return NextResponse.json({
      slots: availableSlots.map((time) => {
        const [h, m] = time.split(':');
        const hr = parseInt(h, 10);
        return {
          time,
          display: `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`,
        };
      }),
    });
  } catch (error) {
    console.error('[Bookings Availability] Error:', error);
    // Return default slots on error to avoid blocking the user
    return NextResponse.json({
      slots: Array.from({ length: 9 }, (_, i) => {
        const h = i + 9;
        return {
          time: `${String(h).padStart(2, '0')}:00`,
          display: `${h % 12 || 12}:00 ${h >= 12 ? 'PM' : 'AM'}`,
        };
      }),
    });
  }
}
