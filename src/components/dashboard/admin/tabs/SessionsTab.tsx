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
      const scores = t.clients.filter((c: any) => c.goalReadinessScore != null).map((c: any) => c.goalReadinessScore);
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <SessionStatCard label="Total Sessions" value={fmt(kpis.totalSessions)} icon={<Activity className="w-5 h-5" />} accent="blue" />
        <SessionStatCard label="Completed" value={fmt(kpis.completedSessions)} icon={<CheckCircle2 className="w-5 h-5" />} accent="emerald" />
        <SessionStatCard label="No-Show Rate" value={`${kpis.noShowRate}%`} icon={<Clock className="w-5 h-5" />} accent="amber" />
        <SessionStatCard label="Cancel Rate" value={`${kpis.cancelRate}%`} icon={<Target className="w-5 h-5" />} accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion Donut */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Completion Rate</h3>
          </div>
          <div className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2B2F55" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={completionStroke} strokeDashoffset={completionOffset} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">{completionPct}%</span>
                <span className="text-[10px] text-slate-400">completed</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">
              <span className="font-semibold text-slate-900">{fmt(kpis.completedSessions)}</span> of{' '}
              <span className="font-semibold text-slate-900">{fmt(kpis.totalSessions)}</span> sessions
            </p>
          </div>
        </div>

        {/* Goal Distance */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Goal Distance by Therapist</h3>
            <p className="text-xs text-slate-400 mt-0.5">Average assessment scores</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {therapistGoalScores.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No assessment data available</p>
            ) : (
              therapistGoalScores.map((t: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-slate-900">{t.name}</span>
                    <span className="text-xs text-slate-400">{t.clientCount} {t.clientCount === 1 ? 'client' : 'clients'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        t.avgScore >= 7 ? 'bg-emerald-500' : t.avgScore >= 4 ? 'bg-amber-500' : 'bg-red-500'
                      }`} style={{ width: `${(t.avgScore / 10) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-slate-900 w-10 text-right">{t.avgScore?.toFixed(1)}/10</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{fmt(t.totalSessions)} sessions delivered</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Programs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Active Programs</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeProgramsDetail.length} in progress</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {activeProgramsDetail.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No active programs</p>
            ) : (
              activeProgramsDetail.map((p: any, i: number) => {
                const total = p.totalSessions || 10;
                const completed = p.sessionsCompleted || 0;
                const pct = Math.min((completed / total) * 100, 100);
                return (
                  <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-slate-900">{p.clientName || 'Client'}</span>
                      <span className="text-xs text-slate-400">{completed}/{total}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${
                          pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-[#2B2F55]' : 'bg-amber-500'
                        }`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] text-slate-400 w-8 text-right">{Math.round(pct)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">{p.therapistName || 'Unassigned'}</span>
                      {p.nextSessionDate && (
                        <span className="text-[11px] text-indigo-600">
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

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Upcoming Sessions</h3>
            <p className="text-xs text-slate-400 mt-0.5">Scheduled bookings</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {upcomingBookings.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No upcoming sessions</p>
            ) : (
              upcomingBookings.map((b: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{b.clientName || 'Client'}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'confirmed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                    }`}>{b.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span className="text-[11px] text-slate-500">{b.therapistName || 'TBD'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </span>
                      <span className="text-[11px] text-slate-400">{b.time || ''}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Session Type Distribution */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Session Types</h3>
        {Object.keys(data.bookingTypeCounts).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No booking type data</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(data.bookingTypeCounts).map(([type, count]) => {
              const total = kpis.totalBookings || 1;
              const pct = ((count as number) / total) * 100;
              return (
                <div key={type} className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 capitalize">{type.replace('_', ' ')}</span>
                    <span className="text-[11px] text-slate-400">{Math.round(pct)}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#2B2F55] transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-lg font-bold text-slate-900 mt-2">{fmt(count as number)}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionStatCard({ label, value, icon, accent }: {
  label: string; value: string; icon: React.ReactNode; accent: string;
}) {
  const accentMap: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    red: 'text-red-600 bg-red-50',
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
    </div>
  );
}
