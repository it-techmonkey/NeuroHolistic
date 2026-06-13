import { supabase } from './supabase/client';
import type { Database } from './supabase/database.types';
import { getDubaiToday } from '@/lib/booking/session-flow';

type Booking = Database['public']['Tables']['bookings']['Row'];

/**
 * Fetch all bookings for user's program(s)
 * 
 * @param programId - Program ID to fetch bookings for
 * @returns Array of bookings ordered by date (newest first)
 */
export async function getBookingsByProgramId(programId: string): Promise<Booking[]> {
  try {
    console.log('[Bookings] FETCH STARTED:', {
      programId,
      timestamp: new Date().toISOString(),
    });

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('program_id', programId)
      .order('date', { ascending: false })
      .order('time', { ascending: false });

    if (error) {
      console.error('[Bookings] ERROR - Fetch failed:', {
        programId,
        error: error.message,
        code: error.code,
      });
      return [];
    }

    console.log('[Bookings] FETCHED:', {
      count: data?.length || 0,
      programId,
    });

    return data || [];
  } catch (error) {
    console.error('[Bookings] UNEXPECTED ERROR:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}

/**
 * Separate bookings into upcoming and past
 * 
 * @param bookings - Array of bookings
 * @returns Object with upcoming and past arrays
 */
export function separateBookings(bookings: Booking[]) {
  const now = new Date();
  const today = getDubaiToday(now);

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dubai',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const currentTime = formatter.format(now);

  const upcoming = bookings.filter((b) => {
    if (b.date > today) return true;
    if (b.date === today) {
      return b.time > currentTime;
    }
    return false;
  });

  const past = bookings.filter((b) => {
    if (b.date < today) return true;
    if (b.date === today) {
      return b.time <= currentTime;
    }
    return false;
  });

  return { upcoming, past };
}
