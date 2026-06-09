'use client';

import { AdminData } from './types';
import { Activity, CheckCircle2, Clock, Users } from 'lucide-react';

export default function SessionsTab({ data }: { data: AdminData }) {
  const { bookings, activeProgramsDetail } = data;

  const upcomingBookings = bookings
    .filter((b: any) => b.status === 'confirmed' || b.status === 'scheduled')
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 12);

  const recentCompleted = bookings
    .filter((b: any) => b.status === 'completed')
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
        <p className="text-sm text-slate-500">Upcoming and recent sessions across all therapists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Upcoming Sessions</h3>
              <p className="text-xs text-slate-400 mt-0.5">{upcomingBookings.length} scheduled</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {upcomingBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming sessions</p>
              </div>
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

        {/* Recently Completed */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recently Completed</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest completed sessions</p>
            </div>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {recentCompleted.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No completed sessions yet</p>
              </div>
            ) : (
              recentCompleted.map((b: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{b.clientName || 'Client'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">completed</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{b.therapistName || 'Therapist'}</span>
                    <span className="text-[11px] text-slate-400">
                      {b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Active Programs Progress */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Program Progress</h3>
          <p className="text-xs text-slate-400 mt-0.5">{activeProgramsDetail.length} active programs</p>
        </div>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
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
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#2B2F55] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-400">{p.therapistName || 'Unassigned'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
