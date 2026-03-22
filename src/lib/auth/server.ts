'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/supabase/database.types';
import { normalizeUserRole } from './role-routing';

export type UserRole = 'client' | 'therapist' | 'founder';

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

  return createServerClient<Database>(
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
}

/**
 * Get the current authenticated user with their role in a single call.
 * Uses getUser() for server-validated JWT — never stale.
 * 
 * @returns AuthUser or null if unauthenticated
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
 * Convenience: get just the user ID. For API routes and server actions.
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUserWithRole();
  return user?.id ?? null;
}
