'use client';

import { AdminData } from './types';
import {
  Users, UserCheck, CalendarDays, DollarSign, Target,
  Activity, Clock, ChevronRight, Globe, CheckCircle2, XCircle
} from 'lucide-react';

export default function OverviewTab({ data }: { data: AdminData }) {
  const { kpis, monthlyRevenue, recentActivity, countryDistribution, activeProgramsDetail } = data;

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const fmtCurrency = (n: number) => `AED ${fmt(n)}`;

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard label="Revenue" value={fmtCurrency(kpis.totalRevenue)} icon={<DollarSign className="w-5 h-5" />} accent="emerald" />
        <KpiCard label="Clients" value={fmt(kpis.totalClients)} icon={<Users className="w-5 h-5" />} accent="blue" sub={`${kpis.totalUsers} total users`} />
        <KpiCard label="Therapists" value={fmt(kpis.totalTherapists)} icon={<UserCheck className="w-5 h-5" />} accent="violet" />
        <KpiCard label="Active Programs" value={fmt(kpis.activePrograms)} icon={<Target className="w-5 h-5" />} accent="amber" sub={`${kpis.completedPrograms} completed`} />
        <KpiCard label="Today's Bookings" value={fmt(kpis.todayBookings)} icon={<CalendarDays className="w-5 h-5" />} accent="indigo" sub={`${kpis.upcomingBookings} upcoming`} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatBlock label="Conversion" value={`${kpis.conversionRate}%`} good={kpis.conversionRate >= 30} />
        <StatBlock label="Completion" value={`${kpis.sessionCompletionRate}%`} good={kpis.sessionCompletionRate >= 70} />
        <StatBlock label="No-Show" value={`${kpis.noShowRate}%`} good={kpis.noShowRate <= 10} />
        <StatBlock label="Cancel" value={`${kpis.cancelRate}%`} good={kpis.cancelRate <= 10} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Revenue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Last 6 months</p>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3 h-44">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {m.revenue > 0 ? `${(m.revenue / 1000).toFixed(0)}k` : '—'}
                  </span>
                  <div className="w-full">
                    <div
                      className="w-full rounded-t-md bg-[#2B2F55] transition-all duration-500"
                      style={{
                        height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 8 : 2)}%`,
                        minHeight: m.revenue > 0 ? '8px' : '2px',
                        opacity: i === monthlyRevenue.length - 1 ? 1 : 0.6,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" />
              Clients by Country
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
            {countryDistribution.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No data yet</p>
            ) : (
              countryDistribution.slice(0, 8).map((c, i) => {
                const maxCount = countryDistribution[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-20 truncate">{c.country}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2B2F55] transition-all duration-500"
                        style={{ width: `${(c.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-6 text-right">{c.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Programs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Programs</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeProgramsDetail.length} in progress</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeProgramsDetail.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No active programs</p>
            ) : (
              activeProgramsDetail.slice(0, 6).map((p, i) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-900">{p.clientName}</span>
                    <span className="text-xs text-slate-400">
                      {p.sessionsCompleted}/{p.totalSessions}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2B2F55] transition-all"
                        style={{ width: `${(p.sessionsCompleted / Math.max(p.totalSessions, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">{p.therapistName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest platform events</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No recent activity</p>
            ) : (
              recentActivity.slice(0, 8).map((a, i) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      a.type === 'booking' ? 'bg-blue-500' :
                      a.type === 'assessment' ? 'bg-violet-500' :
                      a.type === 'payment' ? 'bg-emerald-500' :
                      'bg-amber-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 truncate">{a.description}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] text-slate-400 capitalize">{a.type}</span>
                        {a.status && (
                          <StatusBadge status={a.status} />
                        )}
                        {a.timestamp && (
                          <span className="text-[11px] text-slate-400">
                            {new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Status Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Booking Status</h3>
        <div className="flex gap-1 h-6 rounded-lg overflow-hidden">
          {Object.entries(data.bookingStatusCounts).map(([status, count]) => {
            const total = kpis.totalBookings || 1;
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            const bg: Record<string, string> = {
              confirmed: 'bg-blue-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500',
              scheduled: 'bg-amber-500', no_show: 'bg-orange-500', pending: 'bg-slate-300',
            };
            return (
              <div
                key={status}
                className={`${bg[status] || 'bg-slate-300'} transition-all relative group`}
                style={{ width: `${pct}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {status.replace('_', ' ')}: {count} ({Math.round(pct)}%)
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {Object.entries(data.bookingStatusCounts).map(([status, count]) => {
            const bg: Record<string, string> = {
              confirmed: 'bg-blue-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500',
              scheduled: 'bg-amber-500', no_show: 'bg-orange-500', pending: 'bg-slate-300',
            };
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${bg[status] || 'bg-slate-300'}`} />
                <span className="text-[11px] text-slate-500 capitalize">{status.replace('_', ' ')} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, accent, sub }: {
  label: string; value: string; icon: React.ReactNode; accent: string; sub?: string;
}) {
  const accentMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50',
    blue: 'text-blue-600 bg-blue-50',
    violet: 'text-violet-600 bg-violet-50',
    amber: 'text-amber-600 bg-amber-50',
    indigo: 'text-indigo-600 bg-indigo-50',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentMap[accent] || 'text-slate-600 bg-slate-50'}`}>
          {icon}
        </div>
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function StatBlock({ label, value, good }: { label: string; value: string; good: boolean }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
      <p className={`text-lg font-bold ${good ? 'text-emerald-600' : 'text-amber-600'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-50 text-emerald-700',
    confirmed: 'bg-blue-50 text-blue-700',
    cancelled: 'bg-red-50 text-red-700',
    submitted: 'bg-violet-50 text-violet-700',
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${styles[status] || 'bg-slate-50 text-slate-500'}`}>
      {status}
    </span>
  );
}
