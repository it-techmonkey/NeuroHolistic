'use client';

import { useState } from 'react';
import { AdminData } from './types';
import {
  UserCheck, ChevronDown, ChevronRight, DollarSign, Users,
  Calendar, Phone, Mail, MapPin, Clock, CheckCircle2, Circle
} from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Therapists</h2>
        <p className="text-sm text-slate-500">{therapists.length} active on the platform</p>
      </div>

      <div className="space-y-4">
        {therapists.map((t) => {
          const isExpanded = expandedId === t.id;
          const stats = t.stats || {};
          const clients = t.clients || [];

          return (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-all duration-200">
              {/* Therapist Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
                className="w-full text-left px-6 py-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-lg">
                        {(t.name || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Name & Contact */}
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold text-slate-900 truncate">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[200px]">{t.email}</span>
                        </span>
                        {t.phone && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Phone className="w-3 h-3" />
                            {t.phone}
                          </span>
                        )}
                        {t.country && (
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <MapPin className="w-3 h-3" />
                            {t.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Quick Stats */}
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900">{fmt(stats.totalClients || 0)}</p>
                        <p className="text-[11px] text-slate-400">Clients</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{fmt(stats.upcomingBookings || 0)}</p>
                        <p className="text-[11px] text-slate-400">Upcoming</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-600">{fmtCurrency(stats.revenue || 0)}</p>
                        <p className="text-[11px] text-slate-400">Revenue</p>
                      </div>
                    </div>

                    {/* Expand Arrow */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex sm:hidden items-center gap-4 mt-4 pt-4 border-t border-slate-100">
                  <div className="flex-1 text-center py-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-slate-900">{fmt(stats.totalClients || 0)}</p>
                    <p className="text-[10px] text-slate-400">Clients</p>
                  </div>
                  <div className="flex-1 text-center py-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-blue-600">{fmt(stats.upcomingBookings || 0)}</p>
                    <p className="text-[10px] text-slate-400">Upcoming</p>
                  </div>
                  <div className="flex-1 text-center py-2 bg-slate-50 rounded-lg">
                    <p className="text-sm font-bold text-emerald-600">{fmtCurrency(stats.revenue || 0)}</p>
                    <p className="text-[10px] text-slate-400">Revenue</p>
                  </div>
                </div>
              </button>

              {/* Expanded Content */}
              <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                <div className="border-t border-slate-100 px-6 py-5 space-y-5">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <StatCard
                      icon={<Calendar className="w-4 h-4" />}
                      label="Sessions"
                      value={`${fmt(stats.completedSessions || 0)} / ${fmt(stats.totalSessions || 0)}`}
                      accent="blue"
                    />
                    <StatCard
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      label="Bookings Done"
                      value={fmt(stats.completedBookings || 0)}
                      accent="emerald"
                    />
                    <StatCard
                      icon={<Users className="w-4 h-4" />}
                      label="Active Programs"
                      value={fmt(stats.activePrograms || 0)}
                      accent="violet"
                    />
                    <StatCard
                      icon={<DollarSign className="w-4 h-4" />}
                      label="Total Revenue"
                      value={fmtCurrency(stats.revenue || 0)}
                      accent="amber"
                    />
                  </div>

                  {/* Client List */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-3">
                      Assigned Clients
                      <span className="ml-2 text-xs font-normal text-slate-400">({clients.length})</span>
                    </h4>

                    {clients.length === 0 ? (
                      <div className="bg-slate-50 rounded-xl py-8 text-center">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No clients assigned yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {clients.map((c: any) => {
                          const program = c.program;
                          const progressPct = program
                            ? Math.min((program.completedSessions / Math.max(program.totalSessions, 1)) * 100, 100)
                            : 0;

                          return (
                            <div key={c.id} className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
                              {/* Client Avatar */}
                              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-slate-600">
                                  {(c.name || 'C').charAt(0).toUpperCase()}
                                </span>
                              </div>

                              {/* Client Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-slate-900 truncate">{c.name}</span>
                                  {program && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                      program.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                      program.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                      'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                      {program.status}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.email}</p>
                              </div>

                              {/* Progress */}
                              {program ? (
                                <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                                  <div className="w-32">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[10px] text-slate-400">Progress</span>
                                      <span className="text-[10px] text-slate-500 font-medium">{program.completedSessions}/{program.totalSessions}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full bg-[#2B2F55] transition-all duration-500"
                                        style={{ width: `${progressPct}%` }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <span className="hidden sm:block text-[11px] text-slate-400 flex-shrink-0">No program</span>
                              )}

                              {/* Sessions Count */}
                              <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                <span>{c.completedSessions}/{c.sessionsCount} sessions</span>
                              </div>
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

function StatCard({ icon, label, value, accent }: {
  icon: React.ReactNode; label: string; value: string; accent: string;
}) {
  const accentMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-500' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'text-violet-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
  };
  const colors = accentMap[accent] || accentMap.blue;

  return (
    <div className={`${colors.bg} rounded-xl px-4 py-3`}>
      <div className={`flex items-center gap-1.5 mb-1.5 ${colors.icon}`}>
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className={`text-sm font-bold ${colors.text}`}>{value}</p>
    </div>
  );
}
