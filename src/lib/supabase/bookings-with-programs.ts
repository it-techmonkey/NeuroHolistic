import { supabase } from './client';
import type { Database } from './database.types';
import { getUserProgram } from '../programs';
import { incrementUsedSessions } from './programs';
import { findOrCreateUserByEmail } from '../auth/passwordless';
import { normalizeEmail } from '../auth/email';

type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingType = 'consultation' | 'program';

/**
 * Custom error types for booking flow
 */
export class BookingError extends Error {
  constructor(
    public userMessage: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(userMessage);
    this.name = 'BookingError';
  }
}

export class NoActiveProgram extends BookingError {
  constructor(details?: Record<string, any>) {
    super(
      'No active program found. Please purchase a program first.',
      'NO_ACTIVE_PROGRAM',
      details
    );
  }
}

export class NoSessionsRemaining extends BookingError {
  constructor(details?: Record<string, any>) {
    super(
      'You have no sessions remaining in your program.',
      'NO_SESSIONS_REMAINING',
      details
    );
  }
}

export class BookingCreationFailed extends BookingError {
  constructor(message: string = 'Something went wrong while creating your booking.', details?: Record<string, any>) {
    super(
      message,
      'BOOKING_CREATION_FAILED',
      details
    );
  }
}

/**
 * Create a consultation booking (free, no session deduction)
 * Auto-creates passwordless user if doesn't exist
 * 
 * @param booking - Booking data with type = "consultation"
 * @returns Created booking record with user_id
 * @throws BookingCreationFailed if database error occurs
 */
async function createConsultationBooking(booking: BookingInsert) {
  // LOG: Consultation booking started
  console.log('[Booking] TYPE: CONSULTATION');
  console.log('[Booking] DETAILS:', {
    email: booking.email,
    therapist: booking.therapist_id,
    date: booking.date,
    time: booking.time,
  });

  try {
    // STEP 1: Normalize and find or create user
    console.log('[Booking] STEP 1: Normalizing email and creating/finding user...');
    const normalizedEmail = normalizeEmail(booking.email!);
    let userId: string;

    try {
      userId = await findOrCreateUserByEmail(normalizedEmail);
      console.log('[Booking] STEP 1 COMPLETE - User ID obtained:', userId);
    } catch (userError: any) {
      console.error('[Booking] ERROR STEP 1 - Failed to create/find user:', {
        email: normalizedEmail,
        error: userError instanceof Error ? userError.message : String(userError),
      });
      throw new BookingCreationFailed(
        'Failed to register your email. Please try again.',
        {
          reason: 'user_creation_failed',
          email: normalizedEmail,
        }
      );
    }

    // STEP 2: Create consultation booking with user_id
    console.log('[Booking] STEP 2: Inserting consultation booking into database...');
    
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...booking,
        user_id: userId,
        type: 'consultation',
        program_id: null,
      }])
      .select()
      .single();

    if (error) {
      console.error('[Booking] ERROR STEP 2 - Database insertion failed:', {
        code: error.code,
        message: error.message,
        therapist: booking.therapist_id,
        date: booking.date,
      });

      // Check for specific database errors
      if (error.code === '23505') {
        // Unique violation - likely duplicate booking
        throw new BookingCreationFailed(
          'This time slot is no longer available. Please choose another.',
          {
            dbError: error.code,
            therapist: booking.therapist_id,
            date: booking.date,
            time: booking.time,
          }
        );
      }

      throw new BookingCreationFailed(
        'Something went wrong while creating your booking. Please try again.',
        {
          dbError: error.code,
          dbMessage: error.message,
        }
      );
    }

    // LOG: Booking created successfully
    console.log('[Booking] CREATED:', {
      bookingId: data.id,
      userId: data.user_id,
      email: data.email,
      therapist: data.therapist_id,
      date: data.date,
      time: data.time,
      type: 'consultation',
      timestamp: data.created_at,
    });

    return data;
  } catch (error) {
    if (error instanceof BookingError) {
      throw error;
    }

    console.error('[Booking] UNEXPECTED ERROR - Consultation booking:', {
      error: error instanceof Error ? error.message : String(error),
    });

    throw new BookingCreationFailed(
      'Something went wrong while creating your booking. Please try again.'
    );
  }
}

/**
 * Create a program session booking (paid, requires session deduction)
 * 
 * Flow:
 * 1. Fetch user program
 * 2. Check session availability
 * 3. Create booking (commit intent) with user_id
 * 4. Deduct session (increment used_sessions)
 * 
 * @param booking - Booking data with type = "program"
 * @param userId - User ID for program lookup
 * @returns Created booking record
 * @throws NoActiveProgram if user has no program
 * @throws NoSessionsRemaining if program is exhausted
 * @throws BookingCreationFailed for database errors
 */
async function createProgramBooking(booking: BookingInsert, userId: string) {
  console.log('[Booking] TYPE: PROGRAM');
  console.log('[Booking] DETAILS:', {
    userId,
    email: booking.email,
    therapist: booking.therapist_id,
    date: booking.date,
    time: booking.time,
  });

  try {
    // STEP 1: Fetch program
    console.log('[Booking] STEP 1: Fetching user program...');
    const programData = await getUserProgram(userId);

    if (!programData) {
      console.error('[Booking] ERROR STEP 1 - No program found:', { userId });
      throw new NoActiveProgram({ userId });
    }

    const { program, remainingSessions } = programData;

    console.log('[Booking] PROGRAM FETCHED:', {
      programId: program.id,
      totalSessions: program.total_sessions,
      usedSessions: program.used_sessions,
      remainingSessions,
    });

    // STEP 2: Check session availability
    console.log('[Booking] STEP 2: Checking session availability...');
    if (remainingSessions <= 0) {
      console.error('[Booking] ERROR STEP 2 - Sessions exhausted:', {
        programId: program.id,
        totalSessions: program.total_sessions,
        usedSessions: program.used_sessions,
      });
      throw new NoSessionsRemaining({
        programId: program.id,
        totalSessions: program.total_sessions,
        usedSessions: program.used_sessions,
      });
    }

    console.log('[Booking] STEP 2 PASSED - Sessions available:', {
      remaining: remainingSessions,
    });

    // STEP 3: Create booking (commit user intent) with user_id
    console.log('[Booking] STEP 3: Creating booking in database...');
    let createdBooking;
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          ...booking,
          user_id: userId,
          type: 'program',
          program_id: program.id,
        }])
        .select()
        .single();

      if (error) {
        console.error('[Booking] ERROR STEP 3 - Database insertion failed:', {
          code: error.code,
          message: error.message,
          userId,
          therapist: booking.therapist_id,
          date: booking.date,
        });

        if (error.code === '23505') {
          throw new BookingCreationFailed(
            'This time slot is no longer available. Please choose another.',
            {
              dbError: error.code,
              therapist: booking.therapist_id,
              date: booking.date,
              time: booking.time,
            }
          );
        }

        throw new BookingCreationFailed(
          'Something went wrong while creating your booking. Please try again.',
          {
            dbError: error.code,
            dbMessage: error.message,
          }
        );
      }

      createdBooking = data;
      console.log('[Booking] CREATED:', {
        bookingId: createdBooking.id,
        userId: createdBooking.user_id,
        email: createdBooking.email,
        therapist: createdBooking.therapist_id,
        date: createdBooking.date,
        time: createdBooking.time,
        program_id: program.id,
        timestamp: createdBooking.created_at,
      });
    } catch (error) {
      if (error instanceof BookingError) throw error;

      console.error('[Booking] UNEXPECTED ERROR STEP 3 - Booking creation:', {
        error: error instanceof Error ? error.message : String(error),
      });

      throw new BookingCreationFailed(
        'Something went wrong while creating your booking. Please try again.'
      );
    }

    // STEP 4: Deduct session (after booking committed)
    console.log('[Booking] STEP 4: Deducting session from program...');
    try {
      await incrementUsedSessions(program.id);
      console.log('[Booking] COMPLETE - Session deducted and booking finalized');
      return createdBooking;
    } catch (sessionError: any) {
      // Log but don't fail - booking is already created
      console.error('[Booking] WARNING STEP 4 - Session deduction failed (booking still created):', {
        bookingId: createdBooking.id,
        programId: program.id,
        error: sessionError instanceof Error ? sessionError.message : String(sessionError),
      });

      // Return booking anyway - it was successfully created
      // Session count mismatch should be investigated separately
      return createdBooking;
    }
  } catch (error) {
    // Re-throw known booking errors
    if (error instanceof BookingError) {
      throw error;
    }

    // Catch any unexpected errors
    console.error('[Booking] UNEXPECTED ERROR - Program booking:', {
      error: error instanceof Error ? error.message : String(error),
      userId,
    });

    throw new BookingCreationFailed(
      'Something went wrong while creating your booking. Please try again.'
    );
  }
}

/**
 * Create a booking based on type
 * 
 * CONSULTATION BOOKING:
 * - Auto-creates passwordless user if doesn't exist
 * - Links booking to user_id (not email-based)
 * - Can be created without requiring password
 * - No session logic
 * 
 * PROGRAM BOOKING:
 * - Requires userId (from Supabase auth session)
 * - Requires active program linked to user_id
 * - Validates session availability
 * - Creates booking THEN deducts session (safe order)
 * - Links booking to user_id
 * 
 * UNIFIED FLOW:
 * 1. Consultation → Auto-creates user account (no password)
 * 2. User receives "Set Password" email
 * 3. User logs in with email + password
 * 4. User can now book sessions with their active program
 * 5. Bookings are always linked to user_id (never email-based)
 * 
 * AUTHENTICATION FLOW:
 * - On login, user gets access token with session
 * - Webhook stores user_id with program when payment completes
 * - Billing flow: payment → webhook → program.user_id = authenticated user
 * 
 * ERROR HANDLING:
 * - Throws BookingError subclasses with userMessage for frontend
 * - userMessage: Clear error for display to user
 * - code: Error type identifier
 * - details: Debug information logged server-side
 * 
 * USAGE IN COMPONENTS:
 * ```
 * // Consultation booking (auto-creates user)
 * const booking = await createBooking(bookingData);
 * 
 * // Program booking (requires authenticated userId)
 * import { getCurrentUserId } from '@/lib/auth';
 * const userId = await getCurrentUserId();
 * const booking = await createBooking(bookingData, userId);
 * ```
 * 
 * @param booking - Booking data (must include type field)
 * @param userId - User ID from Supabase auth (required for program bookings, optional for consultations)
 * @returns Created booking record with user_id
 * @throws NoActiveProgram, NoSessionsRemaining, or BookingCreationFailed
 */
export async function createBooking(
  booking: Omit<BookingInsert, 'type'> & { type?: BookingType },
  userId?: string
) {
  // LOG: Request received
  console.log('[Booking] REQUEST RECEIVED:', {
    name: booking.name,
    email: booking.email,
    therapist: booking.therapist_id,
    date: booking.date,
    time: booking.time,
    userId: userId || 'guest',
    timestamp: new Date().toISOString(),
  });

  const bookingType: BookingType = booking.type ?? 'consultation';

  // LOG: Booking type detected
  console.log('[Booking] BOOKING TYPE:', {
    type: bookingType,
    requiresProgram: bookingType === 'program',
  });

  try {
    if (bookingType === 'consultation') {
      console.log('[Booking] → Processing CONSULTATION booking');
      return await createConsultationBooking(booking as BookingInsert);
    }

    if (bookingType === 'program') {
      console.log('[Booking] → Processing PROGRAM booking');
      if (!userId) {
        console.error('[Booking] ERROR - userId required for program booking');
        throw new BookingCreationFailed(
          'Program booking requires user identification.',
          { reason: 'missing_user_id' }
        );
      }
      return await createProgramBooking(booking as BookingInsert, userId);
    }

    console.error('[Booking] ERROR - Unknown booking type:', bookingType);
    throw new BookingCreationFailed(
      'Invalid booking type. Please try again.',
      { unknownType: bookingType }
    );
  } catch (error) {
    // Re-throw known booking errors - frontend can handle these
    if (error instanceof BookingError) {
      console.log('[Booking] HANDLED ERROR:', {
        code: error.code,
        userMessage: error.userMessage,
      });
      throw error;
    }

    // Catch any unexpected errors
    console.error('[Booking] UNEXPECTED ERROR - Main createBooking:', {
      error: error instanceof Error ? error.message : String(error),
      bookingType,
    });

    throw new BookingCreationFailed(
      'Something went wrong while creating your booking. Please try again.'
    );
  }
}

/**
 * Get all bookings for a specific therapist on a given date
 * Useful for checking availability
 */
export async function getTherapistBookings(therapistId: string, date: string) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('time')
      .eq('therapist_id', therapistId)
      .eq('date', date);

    if (error) {
      console.error('[Booking] ERROR - Failed to fetch therapist bookings:', {
        therapistId,
        date,
        error: error.message,
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Booking] Unexpected error fetching therapist bookings:', error);
    throw error;
  }
}

/**
 * Get all bookings for a customer by user ID (primary method)
 * Falls back to email lookup for backward compatibility
 */
export async function getCustomerBookings(userIdOrEmail: string) {
  try {
    // Determine if input is email or user ID format
    const isEmail = userIdOrEmail.includes('@');

    let query = supabase.from('bookings').select('*');

    if (isEmail) {
      // Email lookup (backward compatibility)
      console.log('[Booking] Fetching bookings by email:', userIdOrEmail);
      const normalizedEmail = normalizeEmail(userIdOrEmail);
      query = query.eq('email', normalizedEmail);
    } else {
      // User ID lookup (preferred)
      console.log('[Booking] Fetching bookings by user_id:', userIdOrEmail);
      query = query.eq('user_id', userIdOrEmail);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('[Booking] ERROR - Failed to fetch customer bookings:', {
        identifier: userIdOrEmail,
        isEmail,
        error: error.message,
      });
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('[Booking] Unexpected error fetching customer bookings:', error);
    throw error;
  }
}

/**
 * Get bookings for a user using their program
 */
export async function getProgramBookings(programId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('program_id', programId)
    .eq('type', 'program')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching program bookings:', error);
    throw error;
  }

  return data;
}
