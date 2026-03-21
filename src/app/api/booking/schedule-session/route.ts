import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/auth/server';
import { createClient } from '@supabase/supabase-js';
import { getUserProgram } from '@/lib/programs';
import { incrementUsedSessions } from '@/lib/supabase/programs';
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

    // Get user's program
    const programData = await getUserProgram(user.id);

    if (!programData) {
      return NextResponse.json({ error: 'No active program found. Please purchase a program first.' }, { status: 403 });
    }

    const { program, remainingSessions } = programData;

    if (remainingSessions <= 0) {
      return NextResponse.json({ error: 'No sessions remaining in your program.' }, { status: 403 });
    }

    // Check for duplicate slot
    const { data: existingSlot } = await supabase
      .from('bookings')
      .select('id')
      .eq('program_id', program.id)
      .eq('date', date)
      .eq('time', time)
      .maybeSingle();

    if (existingSlot) {
      return NextResponse.json({ error: 'This time slot is already booked. Please choose another.' }, { status: 409 });
    }

    // Determine session number (used_sessions + 1)
    const sessionNumber = program.used_sessions + 1;

    // Build user display name
    const firstName = (user.user_metadata?.first_name as string | undefined) || '';
    const lastName = (user.user_metadata?.last_name as string | undefined) || '';
    const fullName = `${firstName} ${lastName}`.trim() || user.email || '';

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        name: fullName,
        email: user.email!,
        phone: (user.user_metadata?.phone as string | undefined) || '',
        country: '',
        therapist_id: 'program-session',
        therapist_name: 'Program Session',
        date,
        time,
        type: 'program',
        program_id: program.id,
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
      session_number: sessionNumber,
      date,
      time,
      status: 'scheduled',
    }).then(({ error }) => {
      if (error) console.error('[ScheduleSession] sessions insert error (non-fatal):', error);
    });

    return NextResponse.json({
      success: true,
      sessionNumber,
      remainingSessions: remainingSessions - 1,
      bookingId: booking.id,
    });
  } catch (err) {
    console.error('[ScheduleSession] Unexpected error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
