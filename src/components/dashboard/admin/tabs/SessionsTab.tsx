'use client';

import { AdminData } from './types';
import { Activity, CheckCircle2, Clock, Target, TrendingUp, BarChart3, Users } from 'lucide-react';

export default function SessionsTab({ data }: { data: AdminData }) {
  const { kpis, bookings, therapists, activeProgramsDetail } = data;

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);

  const completionPct = kpis.sessionCompletionRate || 0;
  const completionStroke = 2 * Math.PI * 40;
  const completionOffset = completionStroke - (completionPct / 100) * completionStroke;

  const therapistGoalScores = therapists
    .filter((t: any) => t.clients?.length > 0)
    .map((t: any) => {
      const scores = t.clients
        .filter((c: any) => c.goalReadinessScore != null)
        .map((c: any) => c.goalReadinessScore);
      const avg = scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : null;
      return {
        name: t.name || t.email || 'Therapist',
        avgScore: avg,
        clientCount: t.clients.length,
        totalSessions: t.clients.reduce((sum: number, c: any) => sum + (c.completedSessions || 0), 0),
      };
    })
    .filter((t: any) => t.avgScore !== null)
    .sort((a: any, b: any) => (b.avgScore || 0) - (a.avgScore || 0));

  const upcomingBookings = bookings
    .filter((b: any) => b.status === 'confirmed' || b.status === 'scheduled')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SessionStatCard
          label="Total Sessions"
          value={fmt(kpis.totalSessions)}
          icon={<Activity className="w-4 h-4" />}
          color="blue"
        />
        <SessionStatCard
          label="Completed"
          value={fmt(kpis.completedSessions)}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="emerald"
        />
        <SessionStatCard
          label="No-Show Rate"
          value={`${kpis.noShowRate}%`}
          icon={<Clock className="w-4 h-4" />}
          color="amber"
        />
        <SessionStatCard
          label="Cancel Rate"
          value={`${kpis.cancelRate}%`}
          icon={<Target className="w-4 h-4" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Completion Rate
            </h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#completionGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={completionStroke}
                  strokeDashoffset={completionOffset}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900 font-mono">{completionPct}%</span>
                <span className="text-[10px] text-slate-500">completed</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                <span className="font-mono text-slate-900">{fmt(kpis.completedSessions)}</span> of{' '}
                <span className="font-mono text-slate-900">{fmt(kpis.totalSessions)}</span> sessions completed
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              Goal Distance by Therapist
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Average assessment scores</p>
          </div>
          <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
            {therapistGoalScores.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">No assessment data available</p>
            ) : (
              therapistGoalScores.map((t: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-slate-900">{t.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {t.clientCount} {t.clientCount === 1 ? 'client' : 'clients'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.avgScore >= 7 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                          t.avgScore >= 4 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                          'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}
                        style={{ width: `${(t.avgScore / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-slate-900 w-10 text-right">
                      {t.avgScore?.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[10px] text-slate-600">{fmt(t.totalSessions)} sessions delivered</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Program Sessions</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{activeProgramsDetail.length} active programs</p>
            </div>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {activeProgramsDetail.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <Target className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-500">No active programs</p>
              </div>
            ) : (
              activeProgramsDetail.map((p: any, i: number) => {
                const total = p.totalSessions || 10;
                const completed = p.sessionsCompleted || 0;
                const pct = Math.min((completed / total) * 100, 100);
                return (
                  <div key={i} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-900">{p.clientName || 'Client'}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {completed}/{total} sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            pct >= 100 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                            pct >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                            'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 w-8 text-right">
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{p.therapistName || 'Unassigned'}</span>
                      {p.nextSessionDate && (
                        <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(p.nextSessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Sessions</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Scheduled bookings</p>
            </div>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
            {upcomingBookings.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <Clock className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-500">No upcoming sessions</p>
              </div>
            ) : (
              upcomingBookings.map((b: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-900">{b.clientName || 'Client'}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      b.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] text-slate-500">{b.therapistName || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{b.time || ''}</span>
                    </div>
                  </div>
                  {b.type && (
                    <div className="mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-500 capitalize">{b.type}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-500" />
          Session Type Distribution
        </h3>
        {Object.keys(data.bookingTypeCounts).length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No booking type data</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.bookingTypeCounts).map(([type, count]) => {
              const total = kpis.totalBookings || 1;
              const pct = ((count as number) / total) * 100;
              return (
                <div key={type} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-300 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-[10px] font-mono text-slate-500">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-lg font-semibold text-slate-900 font-mono mt-2">{fmt(count as number)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionStatCard({ label, value, icon, color }: {
  label: string; value: string; icon: React.ReactNode; color: string;
}) {
  const colorMap: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/10',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/10',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/10',
    red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/10',
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
    </div>
  );
}
