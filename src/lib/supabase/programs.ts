import { supabase } from './client';
import type { Database } from './database.types';

type Program = Database['public']['Tables']['programs']['Row'];

/**
 * Get the user's most recent active program by user_id.
 */
export async function getUserProgram(userId: string | null): Promise<Program | null> {
  if (!userId) {
    console.log('[Program] LOOKUP SKIPPED: No userId provided');
    return null;
  }

  console.log('[Program] LOOKUP STARTED:', { userId, timestamp: new Date().toISOString() });

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('[Program] ERROR - Fetch failed:', { userId, error: error.message });
    return null;
  }

  if (!data) {
    console.log('[Program] NOT FOUND for user:', userId);
    return null;
  }

  console.log('[Program] FETCHED:', {
    programId: data.id,
    totalSessions: data.total_sessions,
    usedSessions: data.used_sessions,
    timestamp: new Date().toISOString(),
  });

  return data;
}

/**
 * Check if user has available sessions in their program
 */
export function hasAvailableSessions(program: Program | null): boolean {
  if (!program) return false;
  const remaining = program.total_sessions - program.used_sessions;
  return remaining > 0;
}

/**
 * Get remaining sessions count
 */
export function getRemainingSessionsCount(program: Program | null): number {
  if (!program) return 0;
  return Math.max(0, program.total_sessions - program.used_sessions);
}

/**
 * Increment used_sessions in a program
 * Returns updated program or throws error
 * 
 * ATOMIC FLOW:
 * 1. Fetch current state
 * 2. Validate sessions available
 * 3. Update used_sessions
 * 4. Return updated state
 */
export async function incrementUsedSessions(programId: string): Promise<Program> {
  // LOG: Session increment requested
  console.log('[Session] INCREMENT REQUESTED:', {
    programId,
    timestamp: new Date().toISOString(),
  });

  // STEP 1: Fetch current state
  console.log('[Session] STEP 1: Fetching current program state...');
  const { data: program, error: fetchError } = await supabase
    .from('programs')
    .select('*')
    .eq('id', programId)
    .single();

  if (fetchError || !program) {
    const msg = 'Program not found';
    console.error('[Session] ERROR - STEP 1 FAILED:', {
      programId,
      fetchError: fetchError?.message,
      errorCode: fetchError?.code,
    });
    throw new Error(msg);
  }

  // LOG: Current state fetched
  console.log('[Session] STATE FETCHED:', {
    programId,
    totalSessions: program.total_sessions,
    currentlyUsed: program.used_sessions,
    remaining: program.total_sessions - program.used_sessions,
  });

  // STEP 2: Validate sessions are available
  console.log('[Session] STEP 2: Validating session availability...');
  if (program.used_sessions >= program.total_sessions) {
    const msg = 'No sessions remaining in your program';
    console.error('[Session] ERROR - STEP 2 FAILED:', {
      programId,
      totalSessions: program.total_sessions,
      usedSessions: program.used_sessions,
      remaining: 0,
      message: 'Sessions exhausted',
    });
    throw new Error(msg);
  }

  // LOG: Validation passed
  console.log('[Session] VALIDATION PASSED:', {
    remaining: program.total_sessions - program.used_sessions,
  });

  // STEP 3: Increment used_sessions
  const newUsed = program.used_sessions + 1;
  console.log('[Session] STEP 3: Incrementing session count:', {
    programId,
    from: program.used_sessions,
    to: newUsed,
    totalSessions: program.total_sessions,
  });

  const { data: updated, error: updateError } = await supabase
    .from('programs')
    .update({
      used_sessions: newUsed,
    })
    .eq('id', programId)
    .select()
    .single();

  if (updateError || !updated) {
    const msg = 'Failed to update program sessions';
    console.error('[Session] ERROR - STEP 3 FAILED:', {
      programId,
      previousUsed: program.used_sessions,
      updateError: updateError?.message,
      errorCode: updateError?.code,
    });
    throw new Error(msg);
  }

  // STEP 4: Verify update and log success
  const remaining = updated.total_sessions - updated.used_sessions;
  console.log('[Session] INCREMENT SUCCESS:', {
    programId,
    sessionNow: newUsed,
    remaining,
    timestamp: new Date().toISOString(),
  });

  return updated;
}
