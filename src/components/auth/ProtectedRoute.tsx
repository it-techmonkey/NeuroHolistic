'use client';

import { useAuth, type UserRole } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

/**
 * Protect a route based on authentication and role
 * Usage: Wrap route content with <ProtectedRoute requiredRole="therapist">
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Wrong role
    if (requiredRole && role !== requiredRole) {
      router.push(role === 'therapist' ? '/therapist' : '/dashboard');
      return;
    }
  }, [isAuthenticated, role, isLoading, requiredRole, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary-200 rounded-full animate-pulse" />
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or wrong role
  if (!isAuthenticated || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
