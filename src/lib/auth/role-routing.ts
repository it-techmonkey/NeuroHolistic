import type { UserRole } from './server';

export function normalizeUserRole(rawRole: string | null | undefined): UserRole {
  if (rawRole === 'admin' || rawRole === 'therapist' || rawRole === 'client') {
    return rawRole;
  }
  // Backwards compat: treat legacy 'founder' as 'admin'
  if (rawRole === 'founder') {
    return 'admin';
  }
  return 'client';
}

export function getHomeRouteForRole(role: UserRole): string {
  if (role === 'admin') return '/dashboard/admin';
  if (role === 'therapist') return '/dashboard/therapist';
  return '/dashboard/client';
}

export function canAccessPath(role: UserRole, pathname: string): boolean {
  // More specific paths must come first
  if (pathname.startsWith('/dashboard/admin')) return role === 'admin';
  if (pathname.startsWith('/dashboard/therapist')) return role === 'therapist' || role === 'admin';
  if (pathname.startsWith('/dashboard/client')) return role === 'client' || role === 'admin';
  
  // Legacy paths
  if (pathname.startsWith('/admin')) return role === 'admin';
  if (pathname.startsWith('/therapist')) return role === 'therapist' || role === 'admin';

  return true;
}