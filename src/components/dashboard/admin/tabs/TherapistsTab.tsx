'use client';

import { useState } from 'react';
import { AdminData } from './types';
import { UserCheck, ChevronDown, ChevronUp, DollarSign, Users, Calendar, FileText, Target, TrendingUp } from 'lucide-react';

export default function TherapistsTab({ data }: { data: AdminData }) {
  const { therapists } = data;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fmt = (n: number) => new Intl.NumberFormat('en-US').format(n);
  const fmtCurrency = (n: number) => `AED ${fmt(n)}`;

  if (therapists.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
        <UserCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm text-slate-500">No therapists found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Therapists</h2>
        <p className="text-sm text-slate-500">{therapists.length} total</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {therapists.map((t) => {
          const isExpanded = expandedId === t.id;
          const stats = t.stats || {};
          const clients = t.clients || [];

          return (
            <div key={t.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors">
              <button onClick={() => setExpandedId(isExpanded ? null : t.id)} className="w-full text-left px-5 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{t.name}</p>
                      <p className="text-xs text-slate-500 truncate">{t.email}</p>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 mt-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 mt-1" />}
                </div>

                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Users className="w-3 h-3" /><span className="text-[11px]">Clients</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{fmt(stats.totalClients || 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <DollarSign className="w-3 h-3" /><span className="text-[11px]">Revenue</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-600">{fmtCurrency(stats.totalRevenue || 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <Calendar className="w-3 h-3" /><span className="text-[11px]">Sessions</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{fmt(stats.completedSessions || 0)}/{fmt(stats.totalSessions || 0)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-slate-400 mb-1">
                      <FileText className="w-3 h-3" /><span className="text-[11px]">Assessments</span>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{fmt(stats.assessments || 0)}</p>
                  </div>
                </div>
              </button>

              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    <StatPill icon={<Target className="w-3 h-3" />} label="Active" value={fmt(stats.activePrograms || 0)} />
                    <StatPill icon={<TrendingUp className="w-3 h-3" />} label="Completed" value={fmt(stats.completedPrograms || 0)} />
                    <StatPill icon={<Calendar className="w-3 h-3" />} label="Upcoming" value={fmt(stats.upcomingBookings || 0)} />
                    <StatPill icon={<FileText className="w-3 h-3" />} label="Dev Forms" value={fmt(stats.devForms || 0)} />
                  </div>

                  {stats.avgGoalReadiness != null && (
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-slate-500">Avg Goal Distance:</span>
                      <span className="text-sm font-bold text-amber-600">{stats.avgGoalReadiness}%</span>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold text-slate-900 mb-3">Clients ({clients.length})</p>
                    {clients.length === 0 ? (
                      <p className="text-xs text-slate-400 py-3">No clients assigned</p>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {clients.map((c: any) => {
                          const program = c.program;
                          const progressPct = program ? (program.completedSessions / Math.max(program.totalSessions, 1)) * 100 : 0;
                          const assessment = c.latestAssessment;

                          return (
                            <div key={c.id} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-slate-900 truncate">{c.name}</span>
                                {program && (
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    program.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                    program.status === 'completed' ? 'bg-blue-50 text-blue-700' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>{program.status}</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mb-2 truncate">{c.email}</p>

                              {program ? (
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500">Progress</span>
                                    <span className="text-[11px] text-slate-400">{program.completedSessions}/{program.totalSessions} sessions</span>
                                  </div>
                                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-[#2B2F55] transition-all duration-500" style={{ width: `${progressPct}%` }} />
                                  </div>
                                  {program.pricePaid > 0 && (
                                    <p className="text-[11px] text-emerald-600 font-medium">{fmtCurrency(program.pricePaid)}</p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-[11px] text-slate-400">No active program</p>
                              )}

                              {assessment && (
                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
                                  <Target className="w-3 h-3 text-amber-500" />
                                  <span className="text-[11px] text-slate-500">Goal Distance:</span>
                                  <span className="text-[11px] font-bold text-amber-600">{assessment.goalReadinessScore}%</span>
                                  {assessment.assessedAt && (
                                    <span className="text-[11px] text-slate-400 ml-auto">
                                      {new Date(assessment.assessedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1 text-slate-400 mb-1">
        {icon}<span className="text-[11px]">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}
