'use client';

import { useState, useEffect } from 'react';
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Loader2 } from 'lucide-react';

export default function Overview() {
  const [data, setData] = useState<any>(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const kpis = data?.kpis || {};

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 0,
    }).format(amount / 100); // Convert from fils to AED
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Clients</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.totalClients || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Therapists</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.totalTherapists || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Programs</p>
              <p className="text-2xl font-bold text-slate-900">{kpis.activePrograms || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(kpis.totalRevenue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Upcoming Bookings</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{kpis.upcomingBookings || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Total Leads</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.totalLeads || 0}</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <p className="text-sm text-slate-500">Assessments This Month</p>
          <p className="text-3xl font-bold text-slate-900 mt-2">{kpis.assessmentsThisMonth || 0}</p>
        </div>
      </div>

      {/* Therapist Breakdown */}
      {data?.therapistStats && data.therapistStats.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="font-medium text-slate-900">Therapist Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Therapist</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Clients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Upcoming</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.therapistStats.map((t: any) => (
                  <tr key={t.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.clientCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.completedSessions}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{t.upcomingCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatCurrency(t.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
