import type { UserRole } from './server';

export function normalizeUserRole(rawRole: string | null | undefined): UserRole {
  if (rawRole === 'founder' || rawRole === 'therapist' || rawRole === 'client') {
    return rawRole;
  }

  return 'client';
}

export function getHomeRouteForRole(role: UserRole): string {
  if (role === 'founder') return '/admin';
  if (role === 'therapist') return '/therapist';
  return '/dashboard';
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  if (pathname.startsWith('/admin')) return role === 'founder';
  if (pathname.startsWith('/therapist')) return role === 'therapist' || role === 'founder';
  if (pathname.startsWith('/dashboard')) return role === 'client';

  return true;
}