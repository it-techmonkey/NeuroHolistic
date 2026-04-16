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

export function getRoleFromAuthMetadata(
  user:
    | {
        app_metadata?: Record<string, unknown> | null;
        user_metadata?: Record<string, unknown> | null;
      }
    | null
    | undefined
): UserRole | null {
  const appRole = typeof user?.app_metadata?.['role'] === 'string'
    ? (user.app_metadata['role'] as string)
    : null;
  const userRole = typeof user?.user_metadata?.['role'] === 'string'
    ? (user.user_metadata['role'] as string)
    : null;

  for (const candidate of [appRole, userRole]) {
    if (candidate === 'admin' || candidate === 'therapist' || candidate === 'client') {
      return candidate;
    }
    if (candidate === 'founder') {
      return 'admin';
    }
  }

  return null;
}

export function resolveUserRole(
  rawRole: string | null | undefined,
  user?:
    | {
        app_metadata?: Record<string, unknown> | null;
        user_metadata?: Record<string, unknown> | null;
      }
    | null
): UserRole {
  const normalizedProfileRole = normalizeUserRole(rawRole);
  if (rawRole === 'admin' || rawRole === 'therapist' || rawRole === 'client' || rawRole === 'founder') {
    return normalizedProfileRole;
  }

  return getRoleFromAuthMetadata(user) ?? normalizedProfileRole;
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