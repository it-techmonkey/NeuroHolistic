'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { AdminData } from '@/components/dashboard/admin/tabs/types';
import {
  LayoutDashboard, Users, UserCheck, CalendarDays, Activity,
  BarChart3, Loader2, RefreshCw, LogOut, CreditCard, Award, Percent
} from 'lucide-react';
import OverviewTab from '@/components/dashboard/admin/tabs/OverviewTab';
import UsersTab from '@/components/dashboard/admin/tabs/UsersTab';
import TherapistsTab from '@/components/dashboard/admin/tabs/TherapistsTab';
import BookingsTab from '@/components/dashboard/admin/tabs/BookingsTab';
import SessionsTab from '@/components/dashboard/admin/tabs/SessionsTab';
import AnalyticsTab from '@/components/dashboard/admin/tabs/AnalyticsTab';
import PaymentsTab from '@/components/dashboard/admin/tabs/PaymentsTab';
import CertificatesTab from '@/components/dashboard/admin/tabs/CertificatesTab';
import DiscountsTab from '@/components/dashboard/admin/tabs/DiscountsTab';

const tabs = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'therapists', label: 'Therapists', icon: UserCheck },
  { id: 'bookings', label: 'Bookings', icon: CalendarDays },
  { id: 'sessions', label: 'Sessions', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'discounts', label: 'Discounts', icon: Percent },
  { id: 'certificates', label: 'Certificates', icon: Award },
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
    window.location.replace('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#2B2F55] mx-auto" />
          <p className="mt-3 text-slate-500 text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !data) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#2B2F55] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <div>
                <h1 className="text-sm font-semibold text-slate-900">Admin Dashboard</h1>
                <p className="text-[11px] text-slate-400">NeuroHolistic Institute</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-1">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#2B2F55] text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile nav */}
          <div className="lg:hidden flex gap-1 pb-3 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-[#2B2F55] text-white'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
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

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'overview' && <OverviewTab data={data} />}
        {activeTab === 'users' && <UsersTab data={data} />}
        {activeTab === 'therapists' && <TherapistsTab data={data} />}
        {activeTab === 'bookings' && <BookingsTab data={data} />}
        {activeTab === 'sessions' && <SessionsTab data={data} />}
        {activeTab === 'analytics' && <AnalyticsTab data={data} />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'discounts' && <DiscountsTab />}
        {activeTab === 'certificates' && <CertificatesTab data={data} />}
      </main>
    </div>
  );
}
