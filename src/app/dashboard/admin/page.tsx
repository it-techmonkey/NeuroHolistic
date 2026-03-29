'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AdminData } from '@/components/dashboard/admin/tabs/types';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, Activity,
  BarChart3, Loader2, RefreshCw, LogOut
} from 'lucide-react';
import OverviewTab from '@/components/dashboard/admin/tabs/OverviewTab';
import UsersTab from '@/components/dashboard/admin/tabs/UsersTab';
import TherapistsTab from '@/components/dashboard/admin/tabs/TherapistsTab';
import BookingsTab from '@/components/dashboard/admin/tabs/BookingsTab';
import SessionsTab from '@/components/dashboard/admin/tabs/SessionsTab';
import AnalyticsTab from '@/components/dashboard/admin/tabs/AnalyticsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'therapists', label: 'Therapists', icon: UserCheck },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'sessions', label: 'Sessions', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Failed to load admin data');
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
      if (userData?.role !== 'admin') { router.push('/dashboard/client'); return; }
      setIsAdmin(true);
      await fetchData();
      setLoading(false);
    }
    init();
  }, [router, fetchData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C1222] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="mt-3 text-slate-400 text-sm tracking-wide">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !data) return null;

  return (
    <div className="min-h-screen bg-[#0C1222] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0C1222]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-white tracking-tight">Admin</h1>
                <p className="text-[10px] text-slate-500 tracking-widest uppercase">NeuroHolistic</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-indigo-500/15 text-indigo-400 shadow-sm shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'users' && <UsersTab data={data} />}
        {activeTab === 'therapists' && <TherapistsTab data={data} />}
        {activeTab === 'bookings' && <BookingsTab data={data} />}
        {activeTab === 'sessions' && <SessionsTab data={data} />}
        {activeTab === 'analytics' && <AnalyticsTab data={data} />}
      </main>
    </div>
  );
}
