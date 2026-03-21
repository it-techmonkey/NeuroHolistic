'use server';

import { createClient } from './server';
import { normalizeEmail } from './email';

/**
 * Create a user WITHOUT password (passwordless/unverified)
 * Used for consultation auto-signup
 *
 * @param email - User email (will be lowercased)
 * @returns User ID if successful
 * @throws Error if creation fails
 */
export async function createPasswordlessUser(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    console.log('[Auth] Creating passwordless user:', normalizedEmail);

    const supabase = await createClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      console.log('[Auth] User already exists:', existingUser.id);
      return existingUser.id;
    }

    // Create passwordless auth user (no password required)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: false, // User must verify email later to set password
      user_metadata: {
        signup_type: 'consultation', // Track that this is a consultation signup
      },
    });

    if (authError) {
      console.error('[Auth] Failed to create auth user:', authError.message);

      // If user already exists in auth but not in users table, create user record
      if (authError.message.includes('already registered')) {
        console.log('[Auth] User exists in auth, creating user record...');

        // Get the user ID from auth
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

        if (listError) {
          throw new Error('Failed to find existing user: ' + listError.message);
        }

        const existingAuthUser = users?.find((u) => u.email?.toLowerCase() === normalizedEmail);
        if (!existingAuthUser) {
          throw new Error('User not found in auth system');
        }

        // Create user record
        const { error: userRecordError } = await supabase.from('users').insert({
          id: existingAuthUser.id,
          email: normalizedEmail,
          role: 'client',
        });

        if (userRecordError) {
          throw new Error('Failed to create user record: ' + userRecordError.message);
        }

        return existingAuthUser.id;
      }

      throw new Error('Failed to create user: ' + authError.message);
    }

    // Create corresponding user record
    const { error: userRecordError } = await supabase.from('users').insert({
      id: authData.user!.id,
      email: normalizedEmail,
      role: 'client',
    });

    if (userRecordError) {
      console.error('[Auth] Failed to create user record:', userRecordError.message);
      throw new Error('Failed to create user profile: ' + userRecordError.message);
    }

    console.log('[Auth] Passwordless user created:', authData.user!.id);
    return authData.user!.id;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Auth] Error in createPasswordlessUser:', message);
    throw error;
  }
}

/**
 * Find or create a user by email
 * Used for consultation booking - auto-signup if not exists
 *
 * @param email - User email (will be lowercased)
 * @returns User ID
 */
export async function findOrCreateUserByEmail(email: string): Promise<string> {
  const normalizedEmail = normalizeEmail(email);

  try {
    console.log('[Auth] Finding or creating user:', normalizedEmail);

    const supabase = await createClient();

    // Try to find existing user
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser?.id) {
      console.log('[Auth] Found existing user:', existingUser.id);
      return existingUser.id;
    }

    // Create passwordless user if doesn't exist
    return await createPasswordlessUser(normalizedEmail);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Auth] Error in findOrCreateUserByEmail:', message);
    throw error;
  }
}
