'use client';

import { AdminData } from './types';
import {
  CalendarDays, DollarSign, CheckCircle2, CreditCard, Users
} from 'lucide-react';

export default function OverviewTab({ data }: { data: AdminData }) {
  const { kpis, activeProgramsDetail } = data;
  const fmtCurrency = (n: number) => `AED ${new Intl.NumberFormat('en-US').format(n)}`;

  const pendingPayments = data.payments.filter(p => p.status === 'pending_verification');
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Today's Sessions"
          value={`${kpis.todayBookings}`}
          icon={<CalendarDays className="w-5 h-5" />}
          accent="indigo"
          sub={`${kpis.upcomingBookings} upcoming`}
        />
        <KpiCard
          label="Pending Payments"
          value={`${pendingPayments.length}`}
          icon={<CreditCard className="w-5 h-5" />}
          accent={pendingPayments.length > 0 ? 'amber' : 'emerald'}
          sub={pendingPayments.length > 0 ? fmtCurrency(totalPendingAmount) : 'All clear'}
        />
        <KpiCard
          label="Active Programs"
          value={`${kpis.activePrograms}`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accent="blue"
          sub={`${kpis.completedPrograms} completed`}
        />
        <KpiCard
          label="Total Clients"
          value={`${kpis.totalClients}`}
          icon={<Users className="w-5 h-5" />}
          accent="emerald"
          sub={fmtCurrency(kpis.totalRevenue) + ' revenue'}
        />
      </div>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Pending Payment Verifications</h3>
            <p className="text-xs text-slate-400 mt-0.5">{pendingPayments.length} awaiting review</p>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingPayments.slice(0, 5).map((p, i) => (
              <div key={i} className="px-5 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{p.clientName || 'Client'}</p>
                  <p className="text-[11px] text-slate-400">{p.clientEmail}</p>
                </div>
                <p className="text-sm font-bold text-slate-900">{fmtCurrency(p.amount)}</p>
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
            activeProgramsDetail.slice(0, 8).map((p, i) => (
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
