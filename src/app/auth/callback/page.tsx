import { createClient } from '@/lib/auth/server';
import { getHomeRouteForRole, normalizeUserRole } from '@/lib/auth/role-routing';
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

    if (next) {
      redirect(next);
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = normalizeUserRole(profile?.role as string | null | undefined);
    redirect(getHomeRouteForRole(role));
  }

  redirect(next || '/dashboard');
}
