import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Build response to pass cookies through
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser();

  // ── Public routes — no auth required ──────────────────────
  const publicPaths = ['/', '/auth', '/consultation', '/programs', '/method', '/about',
    '/team', '/events', '/retreats', '/corporate-wellbeing', '/research',
    '/academy', '/assessment', '/faqs'];
  
  const isPublic = publicPaths.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isApiRoute = pathname.startsWith('/api/');

  if (isPublic || isApiRoute) {
    return supabaseResponse;
  }

  // ── Unauthenticated → login ────────────────────────────────
  if (!user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Get role from public.users
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role ?? 'client';

  // ── /admin → founder only ──────────────────────────────────
  if (pathname.startsWith('/admin')) {
    if (role !== 'founder') {
      return NextResponse.redirect(new URL(role === 'therapist' ? '/therapist' : '/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // ── /therapist → therapist or founder only ─────────────────
  if (pathname.startsWith('/therapist')) {
    if (role !== 'therapist' && role !== 'founder') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return supabaseResponse;
  }

  // ── /dashboard → client or founder ────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (role === 'therapist') {
      return NextResponse.redirect(new URL('/therapist', request.url));
    }
    if (role === 'founder') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
