'use server';

import { createClient } from '@/lib/auth/server';
import { getHomeRouteForRole, resolveUserRole } from '@/lib/auth/role-routing';
import { getServiceSupabase } from '@/lib/supabase/service';
import { normalizePhone } from '@/lib/phone';
import { headers } from 'next/headers';

/** Supabase reports a duplicate address differently across versions. */
function isDuplicateEmail(error: { code?: string; message?: string }): boolean {
  if (error.code === 'email_exists' || error.code === 'user_already_exists') return true;
  const message = (error.message || '').toLowerCase();
  return message.includes('already been registered') || message.includes('already registered');
}

export async function signUp(formData: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  country?: string;
  redirectTo?: string;
}) {
  if (formData.password !== formData.passwordConfirm) {
    return { error: 'Passwords do not match' };
  }

  if (formData.password.length < 8) {
    return { error: 'Password must be at least 8 characters' };
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(formData.email)) {
    return { error: 'Invalid email format' };
  }

  // Reject a number we could not store in E.164 rather than saving junk that
  // every later reminder and follow-up would silently fail to reach.
  const normalizedPhone = normalizePhone(formData.phone);
  if (formData.phone.trim() && !normalizedPhone) {
    return { error: 'Please enter a valid mobile number including the country code' };
  }

  const serviceSupabase = getServiceSupabase();

  const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

  // Create first and react to the duplicate error: atomic, and free of the
  // unpaginated listUsers() scan that stopped seeing accounts past the first
  // page of 50.
  const { data: authData, error: authError } = await serviceSupabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      first_name: formData.firstName.trim(),
      last_name: formData.lastName.trim(),
      full_name: fullName,
      phone: normalizedPhone,
      country: formData.country?.trim() ?? '',
    },
  });

  let userId: string;

  if (authError) {
    if (!isDuplicateEmail(authError)) {
      console.error('[SignUp] Failed to create user:', authError);
      return { error: authError.message };
    }

    // The address is taken. Never reset the password of an account someone
    // has not proved they own — that turned sign-up into account takeover,
    // and privileged roles are preserved, so it reached admins too.
    return {
      error: 'An account with this email already exists. Please log in, or use "Forgot password" to regain access.',
    };
  }

  if (!authData.user) {
    return { error: 'Failed to create account.' };
  }

  userId = authData.user.id;

  // Preserve privileged roles when account already exists.
  const { data: existingProfile } = await serviceSupabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .maybeSingle();
  const preservedRole =
    existingProfile?.role === 'admin' || existingProfile?.role === 'therapist'
      ? existingProfile.role
      : 'client';

  // Create or update user record in public.users table
  const { error: insertError } = await serviceSupabase.from('users').upsert({
    id: userId,
    email: formData.email,
    role: preservedRole,
    full_name: fullName,
    phone: normalizedPhone,
    country: formData.country?.trim() ?? null,
  }, {
    onConflict: 'id',
  });

  if (insertError) {
    console.error('[SignUp] Error creating user record:', insertError);
  }

  return {
    success: true,
    message: 'Account created successfully.',
  };
}

/**
 * Login server action.
 * Returns { error } on failure, or { redirectTo } on success.
 * The CLIENT is responsible for navigating to redirectTo.
 * This avoids the NEXT_REDIRECT error swallowed by try/catch in client components.
 */
/**
 * Login handler with role-based redirect
 * Uses admin client to ensure we read the correct role from database
 */
export async function login(formData: {
  email: string;
  password: string;
  next?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  // Get user and fetch role
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'User not found after login' };
  }

  // Use service client to ensure we get the correct role
  const { createClient: createServiceClient } = await import('@supabase/supabase-js');
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userData, error: roleError } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (roleError) {
    console.error('[Login] Error fetching role:', roleError);
    // Fallback to client role if we can't determine
    const role = 'client';
    const redirectTo = formData.next 
      ? formData.next 
      : getHomeRouteForRole(role);
    return { success: true, redirectTo };
  }

  const role = resolveUserRole(userData?.role as string | null | undefined, user);
  
  // If a specific redirect was requested (e.g. from booking flow), use it
  const redirectUrl = formData.next || getHomeRouteForRole(role);
  
  console.log('[Login] User:', user.email, 'DB Role:', userData?.role, 'Normalized:', role, 'Redirect:', redirectUrl);

  return { success: true, redirectTo: redirectUrl };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirectTo: '/' };
}

function generateTempPassword(length = 16): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

/**
 * Self-service password reset for logged-in users.
 * Generates a new temporary password without requiring the current one.
 * Uses the service-role client to bypass current password verification.
 */
export async function resetMyPassword() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated' };
  }

  const serviceSupabase = getServiceSupabase();
  const tempPassword = generateTempPassword();

  const { error: updateError } = await serviceSupabase.auth.admin.updateUserById(
    user.id,
    {
      password: tempPassword,
      email_confirm: true,
    }
  );

  if (updateError) {
    console.error('[ResetMyPassword] Failed:', updateError);
    return { error: 'Failed to reset password. Please try again.' };
  }

  // Log the action
  await serviceSupabase.from('admin_actions').insert({
    admin_id: user.id,
    action: 'self_reset_password',
    target_type: 'user',
    target_id: user.id,
    notes: `Self-service password reset by ${user.email}`,
  });

  return { success: true, tempPassword };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const protocol = requestHeaders.get('x-forwarded-proto') || 'https';
  const baseUrl = host
    ? `${protocol}://${host}`
    : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');

  const callbackUrl = redirectTo
    ? `${baseUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${baseUrl}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}
