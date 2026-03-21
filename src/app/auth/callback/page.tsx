import { createClient } from '@/lib/auth/server';
import { redirect } from 'next/navigation';

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; next?: string }>;
}) {
  const { code, error, next } = await searchParams;

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error)}`);
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      redirect(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
    }

    // Verify session was created by calling getUser()
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect(`/auth/login?error=${encodeURIComponent('Session creation failed')}`);
    }

    console.log('[AuthCallback] Session created successfully for user:', user.id);
  }

  // Redirect to next param (e.g. /booking/payment-options for program flow), or dashboard
  redirect(next || '/dashboard');
}
