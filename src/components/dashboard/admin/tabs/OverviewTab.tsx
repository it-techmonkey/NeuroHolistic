'use client';

import { AdminData } from './types';
import {
  Users, UserCheck, CalendarDays, DollarSign, TrendingUp, Target,
  FileText, Activity, AlertTriangle, Clock, ChevronRight, Zap,
  BarChart3, Globe, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle
} from 'lucide-react';

export default function OverviewTab({ data }: { data: AdminData }) {
  const { kpis, monthlyRevenue, recentActivity, countryDistribution, activeProgramsDetail } = data;

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const fmtCurrency = (n: number) => `AED ${fmt(n)}`;

  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Total Revenue"
          value={fmtCurrency(kpis.totalRevenue)}
          icon={<DollarSign className="w-4 h-4" />}
          color="emerald"
        />
        <KpiCard
          label="Total Clients"
          value={fmt(kpis.totalClients)}
          icon={<Users className="w-4 h-4" />}
          color="blue"
          sub={`${kpis.totalUsers} total users`}
        />
        <KpiCard
          label="Therapists"
          value={fmt(kpis.totalTherapists)}
          icon={<UserCheck className="w-4 h-4" />}
          color="violet"
        />
        <KpiCard
          label="Active Programs"
          value={fmt(kpis.activePrograms)}
          icon={<Target className="w-4 h-4" />}
          color="amber"
          sub={`${kpis.completedPrograms} completed`}
        />
        <KpiCard
          label="Upcoming"
          value={fmt(kpis.upcomingBookings)}
          icon={<CalendarDays className="w-4 h-4" />}
          color="cyan"
          sub={`${kpis.todayBookings} today`}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <MiniKpi label="Bookings" value={fmt(kpis.totalBookings)} />
        <MiniKpi label="Sessions" value={fmt(kpis.totalSessions)} />
        <MiniKpi label="Assessments" value={fmt(kpis.totalAssessments)} />
        <MiniKpi label="Documents" value={fmt(kpis.totalDocuments)} />
        <MiniKpi label="Leads" value={fmt(kpis.totalLeads)} />
        <MiniKpi label="Conversion" value={`${kpis.conversionRate}%`} highlight={kpis.conversionRate >= 30} />
        <MiniKpi label="Completion" value={`${kpis.sessionCompletionRate}%`} highlight={kpis.sessionCompletionRate >= 70} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900">Revenue Trend</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Last 6 months</p>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-2 h-40">
              {monthlyRevenue.map((m, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {m.revenue > 0 ? fmtCurrency(m.revenue) : '—'}
                  </span>
                  <div className="w-full relative">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-violet-500 transition-all duration-500"
                      style={{
                        height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 8 : 2)}%`,
                        minHeight: m.revenue > 0 ? '8px' : '2px',
                        opacity: i === monthlyRevenue.length - 1 ? 1 : 0.6,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Country Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              Clients by Country
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-56 overflow-y-auto">
            {countryDistribution.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No data yet</p>
            ) : (
              countryDistribution.slice(0, 10).map((c, i) => {
                const maxCount = countryDistribution[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 w-20 truncate">{c.country}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${(c.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 w-6 text-right">{c.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Programs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Active Programs</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeProgramsDetail.length} in progress</p>
            </div>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {activeProgramsDetail.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No active programs</p>
            ) : (
              activeProgramsDetail.slice(0, 8).map((p, i) => (
                <div key={i} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-900">{p.clientName}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {p.sessionsCompleted}/{p.totalSessions} sessions
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                        style={{ width: `${(p.sessionsCompleted / Math.max(p.totalSessions, 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{p.therapistName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Latest platform events</p>
            </div>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {recentActivity.map((a, i) => (
              <div key={i} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                    a.type === 'booking' ? 'bg-blue-400' :
                    a.type === 'assessment' ? 'bg-violet-400' :
                    a.type === 'payment' ? 'bg-emerald-400' :
                    'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate">{a.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-slate-500 capitalize">{a.type}</span>
                      {a.status && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          a.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          a.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                          a.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          a.status === 'submitted' ? 'bg-violet-500/10 text-violet-400' :
                          'bg-white/5 text-slate-400'
                        }`}>
                          {a.status}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-600">
                        {a.timestamp ? new Date(a.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status overview bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Booking Status Distribution</h3>
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {Object.entries(data.bookingStatusCounts).map(([status, count]) => {
            const total = kpis.totalBookings || 1;
            const pct = (count / total) * 100;
            if (pct === 0) return null;
            const colors: Record<string, string> = {
              confirmed: 'bg-blue-500',
              completed: 'bg-emerald-500',
              cancelled: 'bg-red-500',
              scheduled: 'bg-amber-500',
              no_show: 'bg-orange-500',
              pending: 'bg-slate-500',
            };
            return (
              <div
                key={status}
                className={(colors[status] || 'bg-slate-500') + ' transition-all duration-500 relative group'}
                style={{ width: `${pct}%` }}
              >
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  {status}: {count} ({Math.round(pct)}%)
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {Object.entries(data.bookingStatusCounts).map(([status, count]) => {
            const colors: Record<string, string> = {
              confirmed: 'bg-blue-500', completed: 'bg-emerald-500', cancelled: 'bg-red-500',
              scheduled: 'bg-amber-500', no_show: 'bg-orange-500', pending: 'bg-slate-500',
            };
            return (
              <div key={status} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-500'}`} />
                <span className="text-[11px] text-slate-400 capitalize">{status.replace('_', ' ')} ({count})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color, sub }: {
  label: string; value: string; icon: React.ReactNode; color: string; sub?: string;
}) {
  const colorMap: Record<string, string> = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/10',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/10',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/10',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/10',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorMap[color]} border flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-[22px] font-semibold text-slate-900 font-mono tracking-tight">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniKpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
      <p className={`text-lg font-semibold font-mono tracking-tight ${highlight ? 'text-emerald-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
