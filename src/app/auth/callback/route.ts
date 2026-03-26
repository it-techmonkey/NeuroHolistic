import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verify session was created
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Create user record if it doesn't exist (for OAuth users)
        const { createClient: createServiceClient } = await import('@supabase/supabase-js');
        const serviceSupabase = createServiceClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const { data: existingUser } = await serviceSupabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!existingUser) {
          await serviceSupabase.from('users').upsert({
            id: user.id,
            email: user.email!,
            role: 'client',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone: user.user_metadata?.phone || null,
            country: user.user_metadata?.country || null,
          }, { onConflict: 'id' });
        }

        // Get user role for redirect
        const { data: profile } = await serviceSupabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        const role = profile?.role || 'client';
        const redirectUrl = role === 'admin' ? '/dashboard/admin' 
          : role === 'therapist' ? '/dashboard/therapist' 
          : '/dashboard/client';

        console.log('[AuthCallback] Success, redirecting to:', redirectUrl);
        redirect(redirectUrl);
      }
    }

    console.error('[AuthCallback] Error:', error?.message);
    redirect(`/auth/login?error=${encodeURIComponent(error?.message || 'Authentication failed')}`);
  }

  // No code, redirect to login
  redirect('/auth/login');
}
