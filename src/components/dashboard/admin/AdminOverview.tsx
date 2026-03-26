'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  UserCheck, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Clock,
  Target,
  PieChart
} from 'lucide-react';

interface OverviewData {
  kpis: {
    totalClients: number;
    totalTherapists: number;
    activePrograms: number;
    totalRevenue: number;
    upcomingBookings: number;
    totalBookings: number;
    totalLeads: number;
    assessmentsThisMonth: number;
  };
  therapistStats: Array<{
    id: string;
    name: string;
    email: string;
    clientCount: number;
    upcomingCount: number;
    completedSessions: number;
    assessmentsCount: number;
    revenue: number;
  }>;
  recentBookings: any[];
  recentLeads: any[];
}

export default function AdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch('/api/admin/overview');
        if (res.ok) {
          const data = await res.json();
          setData(data);
        }
      } catch (err) {
        console.error('Failed to load overview:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalClients: 0,
    totalTherapists: 0,
    activePrograms: 0,
    totalRevenue: 0,
    upcomingBookings: 0,
    totalBookings: 0,
    totalLeads: 0,
    assessmentsThisMonth: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, Admin</h2>
            <p className="text-indigo-100">Here's what's happening with your business today.</p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <p className="text-indigo-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold">{formatCurrency(kpis.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Clients */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              12%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Clients</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{kpis.totalClients || 0}</p>
          <p className="text-slate-400 text-xs mt-2">Active accounts on platform</p>
        </div>

        {/* Active Programs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              8%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Active Programs</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{kpis.activePrograms || 0}</p>
          <p className="text-slate-400 text-xs mt-2">Currently in progress</p>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              5%
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Upcoming Sessions</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{kpis.upcomingBookings || 0}</p>
          <p className="text-slate-400 text-xs mt-2">Scheduled this week</p>
        </div>

        {/* Therapists */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex items-center text-slate-500 text-sm font-medium">
              <Activity className="w-4 h-4 mr-1" />
              Active
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium">Therapists</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{kpis.totalTherapists || 0}</p>
          <p className="text-slate-400 text-xs mt-2">Team members</p>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Leads */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Leads</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.totalLeads || 0}</p>
            </div>
          </div>
        </div>

        {/* Assessments This Month */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Assessments This Month</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.assessmentsThisMonth || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-slate-500 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.totalBookings || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Therapist Performance */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Therapist Performance</h3>
                <p className="text-sm text-slate-500 mt-1">Revenue and client metrics</p>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.therapistStats?.slice(0, 5).map((therapist) => (
              <div key={therapist.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {therapist.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{therapist.name}</p>
                      <p className="text-sm text-slate-500">{therapist.clientCount} clients</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(therapist.revenue)}</p>
                    <p className="text-xs text-slate-500">{therapist.completedSessions} sessions</p>
                  </div>
                </div>
              </div>
            ))}
            {(!data?.therapistStats || data.therapistStats.length === 0) && (
              <div className="px-6 py-8 text-center text-slate-500">
                No therapist data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Recent Bookings</h3>
                <p className="text-sm text-slate-500 mt-1">Latest appointments</p>
              </div>
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View all →
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentBookings?.slice(0, 5).map((booking) => (
              <div key={booking.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      booking.status === 'completed' ? 'bg-green-500' :
                      booking.status === 'confirmed' ? 'bg-blue-500' :
                      booking.status === 'cancelled' ? 'bg-red-500' :
                      'bg-slate-400'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-900">{booking.name || 'Client'}</p>
                      <p className="text-sm text-slate-500">
                        {booking.type === 'free_consultation' ? 'Free Consultation' :
                         booking.type === 'paid_program' ? 'Paid Program' : 'Session'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{formatDate(booking.date)}</p>
                    <p className="text-xs text-slate-500">{booking.time}</p>
                  </div>
                </div>
              </div>
            ))}
            {(!data?.recentBookings || data.recentBookings.length === 0) && (
              <div className="px-6 py-8 text-center text-slate-500">
                No recent bookings
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
