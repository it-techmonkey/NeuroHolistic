import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/database.types';
import { canAccessPath, getHomeRouteForRole, normalizeUserRole } from '@/lib/auth/role-routing';

const PUBLIC_PREFIXES = [
  '/',
  '/auth',
  '/method',
  '/programs',
  '/about',
  '/team',
  '/events',
  '/retreats',
  '/corporate-wellbeing',
  '/research',
  '/academy',
  '/faqs',
  '/book',
  '/assessment',
  '/privacy',
  '/terms',
  '/consultation',
];

const AUTH_REQUIRED_PREFIXES = ['/dashboard', '/therapist', '/admin', '/booking'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isApiRoute = pathname.startsWith('/api/');
  const isNextInternal = pathname.startsWith('/_next/') || pathname === '/favicon.ico';
  const isPublic = PUBLIC_PREFIXES.some((prefix) =>
    pathname === prefix || (prefix !== '/' && pathname.startsWith(prefix + '/'))
  );

  if (isApiRoute || isNextInternal || isPublic) {
    return NextResponse.next({
      request: { headers: request.headers },
    });
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Try to get user, and if that fails, try to refresh the session
  let { data: { user } } = await supabase.auth.getUser();

  // If no user but we have session cookies, try to refresh
  if (!user) {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: { user: refreshedUser } } = await supabase.auth.refreshSession();
      user = refreshedUser;
    }
  }

  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (requiresAuth && !user) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!user) {
    return response;
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = normalizeUserRole(profile?.role as string | null | undefined);

  if (!canAccessPath(role, pathname)) {
    const redirectRoute = getHomeRouteForRole(role);
    return NextResponse.redirect(new URL(redirectRoute, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
