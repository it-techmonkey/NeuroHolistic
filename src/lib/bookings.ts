import { supabase } from './supabase/client';
import type { Database } from './supabase/database.types';

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
  const today = now.toISOString().split('T')[0];

  const upcoming = bookings.filter((b) => {
    // If date is in future, it's upcoming
    if (b.date > today) return true;
    // If date is today and time is in future, it's upcoming
    if (b.date === today) {
      const bookingTime = b.time; // Format: HH:MM
      const currentTime = now.toISOString().split('T')[1].substring(0, 5); // HH:MM
      return bookingTime > currentTime;
    }
    return false;
  });

  const past = bookings.filter((b) => {
    // If date is in past, it's past
    if (b.date < today) return true;
    // If date is today and time is in past, it's past
    if (b.date === today) {
      const bookingTime = b.time;
      const currentTime = now.toISOString().split('T')[1].substring(0, 5);
      return bookingTime <= currentTime;
    }
    return false;
  });

  return { upcoming, past };
}
