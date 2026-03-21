'use client';

import { useAuth, type UserRole } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protect a route based on authentication and role.
 * 
 * IMPORTANT: Only redirects after isLoading=false AND role is resolved.
 * This prevents the "infinite loading" bug caused by role being null
 * while the initial auth check is still in progress.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Do nothing while auth is loading
    if (isLoading) return;

    // Not authenticated → login
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // If a requiredRole is given, wait until role is actually resolved (not null)
    // before deciding to redirect — this avoids redirecting during the DB fetch
    if (requiredRole && role !== null && role !== requiredRole) {
      // Wrong role: redirect to the right dashboard
      if (role === 'therapist') router.push('/therapist');
      else if (role === 'founder') router.push('/admin');
      else router.push('/dashboard');
    }
  }, [isAuthenticated, role, isLoading, requiredRole, router]);

  // Show loading spinner while auth resolves
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm tracking-wide">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Has a requiredRole but role is still being fetched — keep showing spinner
  // (role=null while isLoading=false can briefly occur on fast navigations)
  if (requiredRole && role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  // Wrong role — render nothing while redirect fires
  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
