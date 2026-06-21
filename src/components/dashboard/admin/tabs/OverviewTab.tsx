'use client';

import { useMemo } from 'react';
import { AdminData } from './types';
import {
  CalendarDays, DollarSign, CheckCircle2, CreditCard, Users,
  Clock, ArrowRight,
} from 'lucide-react';

export default function OverviewTab({ data }: { data: AdminData }) {
  const { kpis, activeProgramsDetail } = data;
  const fmtCurrency = (n: number) => `AED ${new Intl.NumberFormat('en-US').format(n)}`;

  const pendingPayments = data.payments.filter(p => p.status === 'pending_verification');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  const upcomingBookings = useMemo(() => {
    const now = new Date();
    return data.bookings
      .filter((b: any) =>
        (b.status === 'confirmed' || b.status === 'scheduled') &&
        b.date && b.time &&
        new Date(`${b.date}T${b.time}`) >= now
      )
      .sort((a: any, b: any) => {
        const da = new Date(`${a.date}T${a.time}`);
        const db = new Date(`${b.date}T${b.time}`);
        return da.getTime() - db.getTime();
      })
      .slice(0, 6);
  }, [data.bookings]);

  const therapistStats = useMemo(() => {
    const now = new Date();
    return (data.therapists ?? []).map((t: any) => {
      const upcoming = data.bookings.filter((b: any) =>
        (b.therapistName === t.name) &&
        (b.status === 'confirmed' || b.status === 'scheduled') &&
        b.date && b.time &&
        new Date(`${b.date}T${b.time}`) >= now
      ).length;
      return { ...t, upcomingCount: upcoming };
    })
    .filter((t: any) => t.stats?.totalClients > 0)
    .sort((a: any, b: any) => (b.upcomingCount) - (a.upcomingCount))
    .slice(0, 5);
  }, [data.therapists, data.bookings]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Today's Sessions"
          value={`${kpis.todayBookings}`}
          icon={<CalendarDays className="w-5 h-5" />}
          accent="indigo"
          sub={`${kpis.upcomingBookings} upcoming total`}
        />
        <KpiCard
          label="Total Clients"
          value={`${kpis.totalClients}`}
          icon={<Users className="w-5 h-5" />}
          accent="emerald"
          sub={`${kpis.totalTherapists} therapists`}
        />
        <KpiCard
          label="Active Programs"
          value={`${kpis.activePrograms}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="blue"
          sub={`${kpis.completedPrograms} completed`}
        />
        <KpiCard
          label="Total Revenue"
          value={fmtCurrency(kpis.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
          accent="emerald"
          sub={`${fmtCurrency(kpis.academyRevenue)} academy`}
        />
      </div>

      {/* Upcoming Sessions + Pending Payments side by side */}
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
          <div className="divide-y divide-slate-100">
            {upcomingBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No upcoming sessions</p>
              </div>
            ) : (
              upcomingBookings.map((b: any, i: number) => {
                const dateObj = new Date(`${b.date}T${b.time}`);
                const isToday = dateObj.toDateString() === new Date().toDateString();
                const isTomorrow = dateObj.toDateString() === new Date(Date.now() + 86400000).toDateString();
                const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

                return (
                  <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{b.clientName || 'Client'}</p>
                        <p className="text-[11px] text-slate-400 truncate">with {b.therapistName || 'Therapist'}</p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className={`text-xs font-medium ${isToday ? 'text-indigo-600' : isTomorrow ? 'text-amber-600' : 'text-slate-600'}`}>{dateLabel}</p>
                        <p className="text-[11px] text-slate-400">{timeLabel}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Pending Payments</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {pendingPayments.length > 0
                  ? `${pendingPayments.length} awaiting review`
                  : 'All payments verified'}
              </p>
            </div>
            {pendingPayments.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                <DollarSign className="w-3.5 h-3.5" />
                {fmtCurrency(totalPendingAmount)}
              </span>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {pendingPayments.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No pending payments</p>
              </div>
            ) : (
              pendingPayments.slice(0, 5).map((p, i) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.clientName || 'Client'}</p>
                    <p className="text-[11px] text-slate-400">{p.clientEmail}</p>
                  </div>
                  <p className="text-sm font-bold text-slate-900 flex-shrink-0 ml-3">{fmtCurrency(p.amount)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Therapist Activity + Active Programs side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Therapist Activity */}
        {therapistStats.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Therapist Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">{therapistStats.length} therapists</p>
            </div>
            <div className="divide-y divide-slate-100">
              {therapistStats.map((t: any, i: number) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.stats?.totalClients || 0} clients</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-slate-700">{t.upcomingCount}</p>
                    <p className="text-[11px] text-slate-400">upcoming</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Programs */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Active Programs</h3>
            <p className="text-xs text-slate-400 mt-0.5">{activeProgramsDetail.length} in progress</p>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {activeProgramsDetail.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No active programs</p>
              </div>
            ) : (
              activeProgramsDetail.slice(0, 6).map((p, i) => (
                <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-medium text-slate-900 truncate">{p.clientName}</span>
                      {p.programType === 'academy' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-purple-50 text-purple-700 border border-purple-200 flex-shrink-0">
                          Academy
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0 ml-2">
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
