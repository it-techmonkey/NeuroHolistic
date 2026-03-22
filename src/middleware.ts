import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { canAccessPath, getHomeRouteForRole, normalizeUserRole } from '@/lib/auth/role-routing';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith('/api/');
  const isNextInternal = pathname.startsWith('/_next/') || pathname === '/favicon.ico';

  const publicPrefixes = [
    '/', '/auth', '/method', '/programs', '/about',
    '/team', '/events', '/retreats', '/corporate-wellbeing',
    '/research', '/academy', '/faqs', '/consultation',
    '/assessment',
  ];

  const isPublic = publicPrefixes.some(p =>
    pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
  );

  if (isApiRoute || isNextInternal || isPublic) {
    return NextResponse.next({ request });
  }

  // Build response first — required by @supabase/ssr cookie handling
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

  // IMPORTANT: getUser() validates the JWT server-side — never use getSession() here
  const { data: { user } } = await supabase.auth.getUser();

  const authRequiredPrefixes = ['/dashboard', '/therapist', '/admin', '/booking'];
  const requiresAuth = authRequiredPrefixes.some(prefix => pathname.startsWith(prefix));

  // ── Unauthenticated → redirect to login ────────────────────
  if (requiresAuth && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    const response = NextResponse.redirect(loginUrl);
    // Copy over any Supabase cookies
    supabaseResponse.cookies.getAll().forEach(c => response.cookies.set(c));
    return response;
  }

  if (!user) {
    return supabaseResponse;
  }

  // ── Fetch role for authenticated users ─────────────────────
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = normalizeUserRole(profile?.role as string | null | undefined);

  if (!canAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getHomeRouteForRole(role), request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)',
  ],
};
