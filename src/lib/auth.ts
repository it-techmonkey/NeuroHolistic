import { createClient } from './auth/server';

/**
 * Get the current authenticated user's ID.
 * Uses getUser() via the server client (cookie-based) — verifies the JWT server-side.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.log('[Auth] No active session - user not authenticated');
      return null;
    }

    console.log('[Auth] User authenticated:', {
      userId: user.id,
      email: user.email,
    });

    return user.id;
  } catch (error) {
    console.error('[Auth] Error getting current user:', {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user.email || null;
  } catch {
    return null;
  }
}

export async function getCurrentSession() {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
