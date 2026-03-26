'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Correct hook for App Router
import { supabase } from '@/lib/supabase/client';
import Sessions from '@/components/dashboard/client/Sessions';
import Materials from '@/components/dashboard/client/Materials';
import Progress from '@/components/dashboard/client/Progress';
import Account from '@/components/dashboard/client/Account';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('sessions');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard(userId: string, userEmail: string) {
      try {
        const res = await fetch(`/api/client/dashboard?clientId=${userId}`);
        if (!res.ok) throw new Error('Failed to load dashboard data');
        const dashboardData = await res.json();
        const { data: { user } } = await supabase.auth.getUser();
        setData({ ...dashboardData, user });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    async function init() {
      // Wait a moment for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('[ClientDashboard] User:', user);
      
      if (!user) {
        // Try refreshing session before redirecting
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: { user: refreshedUser } } = await supabase.auth.getUser();
          if (refreshedUser) {
            console.log('[ClientDashboard] User after refresh:', refreshedUser);
            await loadDashboard(refreshedUser.id, refreshedUser.email || '');
            return;
          }
        }
        router.push('/auth/login');
        return;
      }

      await loadDashboard(user.id, user.email || '');
    }

    init();
  }, [router]);

  if (loading) return <div className="p-12 text-center text-slate-500">Loading dashboard...</div>;
  if (error) return <div className="p-12 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-light text-slate-900">Health Dashboard</h1>
            <nav className="flex space-x-8">
              {['sessions', 'materials', 'progress', 'account'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-16 capitalize
                    ${activeTab === tab 
                      ? 'border-indigo-500 text-slate-900' 
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'sessions' && (
          <Sessions 
            upcoming={data.upcomingSessions} 
            past={data.pastSessions} 
            pending={data.pendingSessions}
            programStatus={data.programStatus}
            hasActiveProgram={data.programStatus === 'active'}
          />
        )}
        {activeTab === 'materials' && <Materials materials={data.materials} />}
        {activeTab === 'progress' && <Progress assessments={data.progress} />}
        {activeTab === 'account' && <Account user={data.user} />}
      </div>
    </div>
  );
}
