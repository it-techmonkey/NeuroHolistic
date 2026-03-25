'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { getHomeRouteForRole, normalizeUserRole } from '@/lib/auth/role-routing';

export default function DashboardPage() {
  const router = useRouter();
  const { user, role, isLoading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkRoleAndRedirect() {
      console.log('[Dashboard] isLoading:', isLoading, 'user:', !!user, 'role:', role);

      if (isLoading) return;

      if (!user) {
        console.log('[Dashboard] No user, redirecting to login');
        router.replace('/auth/login');
        return;
      }

      // Always fetch fresh role from API to avoid stale state
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        const data = await res.json();
        console.log('[Dashboard] Fresh role from API:', data.role);
        
        const normalizedRole = normalizeUserRole(data.role);
        const redirectRoute = getHomeRouteForRole(normalizedRole);
        console.log('[Dashboard] Redirecting to:', redirectRoute);
        router.replace(redirectRoute);
      } catch (e) {
        console.error('[Dashboard] Error fetching role:', e);
        // Fallback to context role
        const normalizedRole = normalizeUserRole(role);
        const redirectRoute = getHomeRouteForRole(normalizedRole);
        router.replace(redirectRoute);
      }
    }

    checkRoleAndRedirect();
  }, [user, role, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-500">Redirecting to your dashboard...</p>
        <p className="text-slate-400 text-sm mt-2">Loading role...</p>
      </div>
    </div>
  );
}
