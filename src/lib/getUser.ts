import { createClient } from '@/lib/auth/server';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the currently authenticated user using the server-side Supabase client.
 * Uses getUser() which verifies the JWT with Supabase Auth servers — safe against
 * tampered or replayed tokens, unlike getSession() which trusts the local cookie.
 *
 * @param supabase - Optional pre-created server Supabase client (avoids double cookie read)
 * @returns Authenticated User object or null
 */
export async function getCurrentUser(supabase?: SupabaseClient) {
  const client = supabase ?? (await createClient());
  const { data, error } = await client.auth.getUser();
  if (error || !data?.user) return null;
  return data.user;
}
