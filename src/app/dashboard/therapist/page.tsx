'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Clients from '@/components/dashboard/therapist/Clients';
import Sessions from '@/components/dashboard/therapist/Sessions';
import Reports from '@/components/dashboard/therapist/Reports';
import { Loader2, Users, Calendar, BarChart3 } from 'lucide-react';

export default function TherapistDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'sessions' | 'reports'>('clients');
  const [loading, setLoading] = useState(true);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [therapistInfo, setTherapistInfo] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Verify role
      const { data: userData } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'therapist' && userData?.role !== 'admin') {
        router.push('/dashboard/client');
        return;
      }

      setTherapistId(user.id);
      setTherapistInfo(userData);
      setLoading(false);
    }
    init();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const tabs = [
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div>
              <h1 className="text-xl font-light text-slate-900">Therapist Workspace</h1>
              {therapistInfo?.full_name && (
                <p className="text-xs text-slate-500">{therapistInfo.full_name}</p>
              )}
            </div>
            <nav className="flex space-x-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'clients' && <Clients therapistId={therapistId!} />}
        {activeTab === 'sessions' && <Sessions therapistId={therapistId!} />}
        {activeTab === 'reports' && <Reports therapistId={therapistId!} />}
      </div>
    </div>
  );
}
