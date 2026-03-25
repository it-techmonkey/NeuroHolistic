import { createClient as createSupabaseServiceClient } from '@supabase/supabase-js';

/**
 * Creates a service-level Supabase client (bypasses RLS).
 * Use only in server-side API routes.
 */
export function getServiceSupabase() {
  return createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
