import { createClient } from '@/lib/auth/server';

export type UserRole = 'client' | 'therapist';

/**
 * Fetch the role for a given user ID from the users table.
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data.role as UserRole;
}

/**
 * Assert that a role matches the required role.
 * Throws a Forbidden error if the role does not match.
 */
export function requireRole(role: UserRole | null, required: UserRole): void {
  if (role !== required) {
    throw new Error(`Forbidden: requires '${required}' role`);
  }
}
