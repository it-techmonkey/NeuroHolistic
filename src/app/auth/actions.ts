'use server';

import { createClient } from '@/lib/auth/server';
import { getHomeRouteForRole, normalizeUserRole } from '@/lib/auth/role-routing';

// Helper to get service role client for admin operations
function getServiceClient() {
  const { createClient: createServiceClient } = require('@supabase/supabase-js');
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
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

  const supabase = await createClient();
  const serviceSupabase = getServiceClient();

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
        country: formData.country?.trim() ?? '',
      },
      emailRedirectTo,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Create user record in public.users with role='client'
  // Use service client to bypass RLS, and upsert to handle existing users
  if (authData.user?.id) {
    const { error: insertError } = await serviceSupabase.from('users').upsert({
      id: authData.user.id,
      email: formData.email,
      role: 'client',
      full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
      phone: formData.phone.trim() || null,
      country: formData.country?.trim() ?? null,
    }, {
      onConflict: 'id',
      ignoreDuplicates: true,
    });
    
    if (insertError) {
      console.error('[SignUp] Error creating user record:', insertError);
    }
  }

  if (authData.session && formData.redirectTo) {
    return {
      success: true,
      redirectTo: formData.redirectTo,
    };
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

  const role = normalizeUserRole(userData?.role as string | null | undefined);
  
  // Always redirect to /dashboard which will handle role-based routing
  const redirectUrl = '/dashboard';
  
  console.log('[Login] User:', user.email, 'DB Role:', userData?.role, 'Normalized:', role, 'Redirect:', redirectUrl);

  return { success: true, redirectTo: redirectUrl };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { redirectTo: '/' };
}

/**
 * Sign in with Google OAuth
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = await createClient();

  const callbackUrl = redirectTo
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=${encodeURIComponent(redirectTo)}`
    : `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`;

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
