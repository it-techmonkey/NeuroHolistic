'use server';

import { createClient } from '@/lib/auth/server';
import { getServiceSupabase } from '@/lib/supabase/service';
import { headers } from 'next/headers';

/**
 * Sign in with Google OAuth
 * Redirects user to Google consent screen
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

/**
 * Handle Google OAuth callback
 * Creates user record if new user
 */
export async function handleGoogleCallback() {
  const supabase = await createClient();
  const serviceSupabase = getServiceSupabase();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: 'Failed to get user from Google' };
  }

  // Check if user record already exists
  const { data: existingUser } = await serviceSupabase
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .single();

  // If user doesn't exist in our users table, create them
  if (!existingUser) {
    const fullName = user.user_metadata?.full_name || 
                     user.user_metadata?.name || 
                     user.email?.split('@')[0] || 
                     'User';
    
    const { error: insertError } = await serviceSupabase.from('users').upsert({
      id: user.id,
      email: user.email!,
      role: 'client',
      full_name: fullName,
      phone: user.user_metadata?.phone || null,
      country: user.user_metadata?.country || null,
    }, {
      onConflict: 'id',
    });

    if (insertError) {
      console.error('[GoogleCallback] Error creating user record:', insertError);
    }
  }

  return { success: true, user };
}
