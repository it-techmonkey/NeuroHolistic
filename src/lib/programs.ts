import { getCurrentUserId } from './auth';
import { getUserProgram as fetchUserProgram } from './supabase/programs';
import type { Database } from './supabase/database.types';

type Program = Database['public']['Tables']['programs']['Row'];

export interface ActiveProgram {
  program: Program;
  remainingSessions: number;
}

/**
 * Fetch the active program for the currently authenticated user.
 * user_id is always resolved from the server-side session — never from the client.
 */
export async function getAuthenticatedUserProgram(): Promise<ActiveProgram | null> {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      console.log('[Program] NOT AUTHENTICATED - User not logged in');
      return null;
    }

    return getUserProgram(userId);
  } catch (error) {
    console.error('[Program] Error fetching authenticated user program:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Fetch the active program for a given user ID.
 * Returns the program with a calculated remainingSessions count.
 */
export async function getUserProgram(userId?: string | null): Promise<ActiveProgram | null> {
  if (!userId) {
    console.log('[Program] LOOKUP SKIPPED: No userId provided');
    return null;
  }

  const program = await fetchUserProgram(userId);
  if (!program) return null;

  const remainingSessions = Math.max(0, program.total_sessions - program.used_sessions);

  console.log('[Program] FETCHED:', {
    programId: program.id,
    totalSessions: program.total_sessions,
    usedSessions: program.used_sessions,
    remainingSessions,
    timestamp: new Date().toISOString(),
  });

  return { program, remainingSessions };
}
