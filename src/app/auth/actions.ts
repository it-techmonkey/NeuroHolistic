'use server';

import { createClient } from '@/lib/auth/server';

export async function signUp(formData: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  redirectTo?: string;
}) {
  if (formData.password !== formData.passwordConfirm) {
    return { error: 'Passwords do not match' };
  }

  if (formData.password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  const supabase = await createClient();

  const emailRedirectTo = formData.redirectTo
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(formData.redirectTo)}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        phone: formData.phone.trim(),
      },
      emailRedirectTo,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Create user record in public.users with role='client'
  if (authData.user?.id) {
    await supabase.from('users').insert({
      id: authData.user.id,
      email: formData.email,
      role: 'client',
    }).then(({ error }) => {
      if (error) console.error('[SignUp] Error creating user record:', error);
    });
  }

  return {
    success: true,
    message: 'Account created! Check your email to verify your account before logging in.',
  };
}

/**
 * Login server action.
 * Returns { error } on failure, or { redirectTo } on success.
 * The CLIENT is responsible for navigating to redirectTo.
 * This avoids the NEXT_REDIRECT error swallowed by try/catch in client components.
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

  // Get role for redirect
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = userData?.role || 'client';

    // If a next param was provided, always use it
    if (formData.next) {
      return { success: true, redirectTo: formData.next };
    }

    // Route based on role
    if (role === 'founder') {
      return { success: true, redirectTo: '/admin' };
    }

    if (role === 'therapist') {
      return { success: true, redirectTo: '/therapist' };
    }

    // Clients always go to dashboard
    if (role === 'client') {
      return { success: true, redirectTo: '/dashboard' };
    }
  }

  return { success: true, redirectTo: '/dashboard' };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirectTo: '/' };
}
