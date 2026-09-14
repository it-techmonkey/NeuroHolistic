'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';
import { normalizeUserRole } from './role-routing';

export type UserRole = 'client' | 'therapist' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
}

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Silently fail in Server Components (expected read-only)
          }
        },
      },
    }
  );

  // middleware.ts skips /api/* entirely, so an expired-but-refreshable
  // access token that a page load would have silently renewed is never
  // renewed before an API route reads it — the caller's own auth.getUser()
  // then sees an expired JWT and reports someone with a perfectly valid
  // session as logged out. Mirror middleware's own recovery here so every
  // caller of createClient() gets it for free.
  //
  // getSession() reads the cookie locally rather than calling Supabase, so
  // this costs nothing when the token is still valid — only an
  // already-expired token pays for the refreshSession() network call. In a
  // Route Handler the refreshed cookies are written back via setAll above;
  // in a Server Component that write is a no-op (same as it always was),
  // but the in-memory client returned here still carries the refreshed
  // session for this request.
  const { data: { session } } = await client.auth.getSession();
  if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
    await client.auth.refreshSession();
  }

  return client;
}

export async function createServiceClient(
  supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: string = process.env.SUPABASE_SERVICE_ROLE_KEY!
) {
  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll(_) {
        // No-op for service client (server-only)
      },
    },
  });
}

/**
 * Get the current authenticated user with their role in a single call.
 * Uses getUser() for server-validated JWT — never stale.
 */
export async function getCurrentUserWithRole(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) return null;

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = normalizeUserRole(profile?.role as string | null | undefined);
    const firstName = (user.user_metadata?.first_name as string | undefined) ?? '';
    const lastName = (user.user_metadata?.last_name as string | undefined) ?? '';

    return {
      id: user.id,
      email: user.email ?? '',
      role,
      firstName,
      lastName,
      fullName: (`${firstName} ${lastName}`.trim()) || (user.email ?? ''),
    };
  } catch {
    return null;
  }
}

/**
 * Convenience: get just the user ID.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  return user?.id ?? null;
}
