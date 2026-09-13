import type { SupabaseClient } from '@supabase/supabase-js';

/** Page size for the admin user listing. One request covers most installs. */
const PER_PAGE = 1000;

/** Stop after this many pages so a bad response can never loop forever. */
const MAX_PAGES = 50;

/**
 * Find an auth user by email address.
 *
 * `admin.listUsers()` with no arguments returns only the FIRST PAGE — 50 users
 * by default. Every caller that used it to answer "does this account already
 * exist?" silently started saying "no" once the client list outgrew that page,
 * which broke sign-up and consultation booking for long-standing clients while
 * looking like an unrelated database error. This pages through properly.
 *
 * Returns null when no user has that address.
 */
export async function findAuthUserByEmail(
  admin: SupabaseClient<any, any, any>,
  email: string
): Promise<{ id: string; email?: string } | null> {
  const target = email.trim().toLowerCase();
  if (!target) return null;

  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });

    if (error) {
      console.error('[findAuthUserByEmail] listUsers failed:', error);
      return null;
    }

    const users = data?.users ?? [];
    const match = users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match;

    // A short page means we have reached the end of the list.
    if (users.length < PER_PAGE) return null;
  }

  console.error(`[findAuthUserByEmail] Gave up after ${MAX_PAGES} pages looking for an account.`);
  return null;
}
