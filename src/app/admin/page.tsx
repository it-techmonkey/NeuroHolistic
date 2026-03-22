'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import LogoutButton from '@/components/ui/LogoutButton';
import { 
  TrendingUp, 
  Users, 
  BarChart3, 
  ArrowUpRight, 
  Search,
  MoreHorizontal,
  DollarSign,
  AlertCircle,
  LogOut
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtAED(fils: number) {
  return `AED ${(fils / 100).toLocaleString('en-AE', { minimumFractionDigits: 0 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateAverageLTV(clientStats: any[]) {
  if (!clientStats?.length) return 0;
  const totalValue = clientStats.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  return Math.round(totalValue / clientStats.length);
}

function calculateConversionRate(leads: any[], clients: any[]) {
  if (!leads?.length) return 0;
  const leadsEmail = new Set(leads.map((l: any) => l.email?.toLowerCase()));
  const convertedCount = clients.filter((c: any) => leadsEmail.has(c.email?.toLowerCase())).length;
  return leads.length > 0 ? Math.round((convertedCount / leads.length) * 100 * 10) / 10 : 0;
}

function calculateLeadSources(leads: any[]) {
  const sources: Record<string, number> = {};
  leads.forEach((lead: any) => {
    const source = lead.source || 'Direct';
    sources[source] = (sources[source] || 0) + 1;
  });
  return sources;
}

function calculateMonthlyGrowth(payments: any[], clients: any[]) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  
  const thisMonthRevenue = payments
    .filter((p: any) => p.status === 'paid' && new Date(p.createdAt) >= thisMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  const lastMonthRevenue = payments
    .filter((p: any) => p.status === 'paid' && new Date(p.createdAt) >= lastMonth && new Date(p.createdAt) < thisMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  
  if (lastMonthRevenue === 0) return 0;
  return Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 10) / 10;
}

function calculateClientRetention(bookings: any[]) {
  if (!bookings?.length) return 0;
  const completedCount = bookings.filter((b: any) => b.status === 'completed').length;
  return bookings.length > 0 ? Math.round((completedCount / bookings.length) * 100 * 10) / 10 : 0;
}

function calculateLTVTrend(payments: any[], clientStats: any[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Clients who joined this month vs last month
  const thisMonthClients = clientStats.filter((c: any) => new Date(c.joinedAt) >= thisMonthStart);
  const lastMonthClients = clientStats.filter((c: any) => new Date(c.joinedAt) >= lastMonthStart && new Date(c.joinedAt) < thisMonthStart);

  const avgThisMonth = thisMonthClients.length > 0
    ? thisMonthClients.reduce((s: number, c: any) => s + (c.totalPaid || 0), 0) / thisMonthClients.length
    : 0;
  const avgLastMonth = lastMonthClients.length > 0
    ? lastMonthClients.reduce((s: number, c: any) => s + (c.totalPaid || 0), 0) / lastMonthClients.length
    : 0;

  if (avgLastMonth === 0) return null; // Not enough data
  const pct = Math.round(((avgThisMonth - avgLastMonth) / avgLastMonth) * 100 * 10) / 10;
  return pct;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SuperAdminDashboard() {
  const [tab, setTab] = useState<'finance' | 'staff' | 'growth' | 'clients' | 'assessments'>('finance');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/overview');
      // Middleware ensures only founders reach /admin.
      // Surface API errors in the UI rather than silently redirecting.
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('[Admin Dashboard Error]', e);
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Memoized calculations
  const stats = useMemo(() => {
    if (!data) return null;
    return {
      avgLTV: calculateAverageLTV(data.clientStats),
      conversionRate: calculateConversionRate(data.leads, data.clientStats),
      monthlyGrowth: calculateMonthlyGrowth(data.payments, data.clientStats),
      leadSources: calculateLeadSources(data.leads),
      ltvTrend: calculateLTVTrend(data.payments, data.clientStats),
    };
  }, [data]);

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-400">Loading Executive Data...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex items-center gap-4 text-red-600">
        <AlertCircle size={20} />
        <span className="text-sm font-semibold">{error}</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      
      {/* ── Executive Top Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-100 px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12 overflow-hidden">
          <span className="hidden md:inline text-sm font-bold tracking-tighter uppercase whitespace-nowrap">NEURO<span className="font-light opacity-50">HOLISTIC</span> <span className="ml-2 font-light text-slate-400">HQ</span></span>
          <span className="md:hidden text-sm font-bold tracking-tighter uppercase whitespace-nowrap">NH<span className="font-light opacity-50">HQ</span></span>
          <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
            {['finance', 'staff', 'growth', 'clients', 'assessments'].map((t) => (
              <button 
                key={t}
                onClick={() => setTab(t as any)}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${tab === t ? 'text-slate-900 border-b border-slate-900 pb-1' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
           <span className="hidden sm:inline text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded whitespace-nowrap">LIVE MARKET</span>
           <div className="w-8 h-8 rounded-full bg-slate-900 shrink-0" />
           <LogoutButton className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
             <LogOut size={12} strokeWidth={2} />
             <span className="hidden sm:inline">Logout</span>
           </LogoutButton>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-8 pt-32 pb-20">

        {/* ── FINANCE: The Money View ── */}
        {tab === 'finance' && (
          <div className="space-y-16">
            <header className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Total Verified Revenue</p>
                <h1 className="text-5xl font-light tracking-tighter text-slate-900">{fmtAED(data?.kpis?.totalRevenue || 0)}</h1>
              </div>
              <div className="flex gap-4">
                <button className="px-6 py-2 border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-colors">Tax Report</button>
                <button className="px-6 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">Payouts</button>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100 border border-slate-100 overflow-hidden rounded-2xl">
              {[
                { label: 'Average LTV', value: fmtAED(stats?.avgLTV || 0), trend: stats?.ltvTrend !== null && stats?.ltvTrend !== undefined ? (stats.ltvTrend >= 0 ? '+' + stats.ltvTrend + '%' : stats.ltvTrend + '%') : 'N/A' },
                { label: 'Pending Collections', value: fmtAED(data?.payments?.filter((p: any) => p.status !== 'paid').reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0), trend: data?.payments?.length ? Math.round(data.payments.filter((p: any) => p.status !== 'paid').length / data.payments.length * 100) + '%' : '0%' },
                { label: 'Monthly Growth', value: (stats?.monthlyGrowth || 0) + '%', trend: (stats?.monthlyGrowth || 0) > 0 ? '+' + (stats?.monthlyGrowth || 0) + '%' : (stats?.monthlyGrowth || 0) + '%' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-10">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">{stat.label}</p>
                  <div className="flex items-baseline gap-4">
                    <p className="text-3xl font-light tracking-tight">{stat.value}</p>
                    <span className={`text-[10px] font-bold ${stat.trend?.startsWith('+') ? 'text-emerald-600' : 'text-amber-600'}`}>{stat.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Transaction Stream</h3>
              <div className="border-t border-slate-100 overflow-x-auto">
                <div className="min-w-[600px]">
                  {data?.payments?.slice(0, 10).map((p: any) => (
                    <div key={p.id} className="flex items-center justify-between py-5 border-b border-slate-100">
                      <div className="flex items-center gap-8">
                        <span className="text-[10px] font-mono text-slate-300 uppercase w-20">{fmtDate(p.createdAt)}</span>
                        <p className="text-sm font-semibold w-40 truncate">{p.clientName}</p>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 w-32">{p.type.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-12">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded w-20 text-center ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>{p.status}</span>
                        <p className="text-sm font-bold tabular-nums w-20 text-right">{fmtAED(p.amount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── STAFF: Efficiency & Payouts ── */}
        {tab === 'staff' && (
          <div className="space-y-12">
            <header className="flex justify-between items-end pb-8 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Practitioner Contribution</h2>
              <p className="text-lg font-light text-slate-600">{data?.therapistStats?.length || 0} Practitioners</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data?.therapistStats?.map((t: any) => {
                const bookedSessions = (t.completedSessions || 0) + (t.upcomingCount || 0);
                return (
                  <div key={t.id} className="border border-slate-100 p-8 rounded-2xl bg-white hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h3 className="text-xl font-bold">{t.name}</h3>
                        <p className="text-xs text-slate-400">{t.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold uppercase text-slate-400">Clients</p>
                        <p className="text-2xl font-bold text-indigo-600">{t.clientCount}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Total Revenue</span>
                        <span className="font-semibold">{fmtAED(t.revenue)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Active Programs</span>
                        <span className="font-semibold">{t.activePrograms}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Completed Sessions</span>
                        <span className="font-semibold text-emerald-600">{t.completedSessions}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Upcoming Sessions</span>
                        <span className="font-semibold">{t.upcomingCount}</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-slate-400">Avg Session Score</span>
                        <span className="font-semibold">{t.averageScore ?? '—'}</span>
                      </div>
                    </div>
                    <button className="w-full py-3 bg-slate-50 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors">View Details</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GROWTH: Lead Pipeline ── */}
        {tab === 'growth' && (
          <div className="space-y-12">
             <div className="flex justify-between items-end pb-8 border-b border-slate-100">
               <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Lead Conversion Pipeline</h2>
               <p className="text-2xl font-light">{stats?.conversionRate || 0}% <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest ml-2">Conversion Rate</span></p>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 overflow-x-auto">
                   <table className="w-full text-left min-w-[600px]">
                     <thead>
                        <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="pb-4">Name</th>
                          <th className="pb-4">Source</th>
                          <th className="pb-4">Country</th>
                          <th className="pb-4 text-right">Date</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {data?.leads?.map((lead: any) => (
                          <tr key={lead.id} className="group cursor-pointer hover:bg-slate-50">
                            <td className="py-5">
                               <p className="text-sm font-semibold">{lead.name}</p>
                               <p className="text-xs text-slate-400">{lead.email}</p>
                            </td>
                            <td className="py-5 text-xs text-slate-600 uppercase tracking-tighter font-medium">{lead.source || 'Direct'}</td>
                            <td className="py-5 text-xs text-slate-600">{lead.country || '—'}</td>
                            <td className="py-5 text-right text-xs text-slate-400 font-mono">{fmtDate(lead.created_at)}</td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                   {!data?.leads?.length && (
                     <div className="py-12 text-center text-slate-400 text-xs">No leads recorded</div>
                   )}
                </div>
                
                <div className="bg-slate-50 rounded-2xl p-8 h-fit">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Lead Attribution</h3>
                   <div className="space-y-6">
                      {stats?.leadSources && Object.entries(stats.leadSources).map(([source, count]: [string, any]) => {
                        const percentage = data?.leads?.length ? Math.round((count / data.leads.length) * 100) : 0;
                        return (
                          <div key={source}>
                             <div className="flex justify-between text-xs font-medium mb-2">
                                <span>{source}</span>
                                <span className="text-slate-400 font-semibold">{percentage}%</span>
                             </div>
                             <div className="h-[2px] w-full bg-slate-200">
                                <div className="h-full bg-slate-900 transition-all" style={{ width: `${percentage}%` }} />
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ── CLIENTS: Client Directory ── */}
        {tab === 'clients' && (
          <div className="space-y-12">
            <header className="flex justify-between items-end pb-8 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Client Directory</h2>
              <p className="text-lg font-light text-slate-600">{data?.clientStats?.length || 0} Active Clients</p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="pb-4">Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Assigned Therapist</th>
                    <th className="pb-4">Program Status</th>
                    <th className="pb-4 text-center">Sessions</th>
                    <th className="pb-4">Dysregulation Score</th>
                    <th className="pb-4">Avg Session Score</th>
                    <th className="pb-4">Total Paid</th>
                    <th className="pb-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.clientStats?.map((client: any) => (
                    <tr key={client.id} className="group hover:bg-slate-50 border-b border-slate-100">
                      <td className="py-5 font-semibold">{client.name}</td>
                      <td className="py-5 text-xs text-slate-400 font-mono">{client.email}</td>
                      <td className="py-5">
                        <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{client.therapistName || 'Unassigned'}</span>
                      </td>
                      <td className="py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${client.programStatus === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                          {client.programStatus || 'None'}
                        </span>
                      </td>
                      <td className="py-5 text-center text-xs font-medium">
                        <span className="font-semibold">{client.sessionsUsed}/{client.totalSessions}</span>
                      </td>
                      <td className="py-5 text-xs font-semibold">{client.assessmentScore ?? '—'}</td>
                      <td className="py-5 text-xs font-semibold">{client.averageSessionScore ?? '—'}</td>
                      <td className="py-5 font-mono text-sm">{fmtAED(client.totalPaid)}</td>
                      <td className="py-5 text-xs text-slate-400">{fmtDate(client.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.clientStats?.length && (
                <div className="py-12 text-center text-slate-400 text-xs">No clients found</div>
              )}
            </div>
          </div>
        )}

        {/* ── ASSESSMENTS: Results Overview ── */}
        {tab === 'assessments' && (
          <div className="space-y-12">
            <header className="flex justify-between items-end pb-8 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Assessment Results</h2>
              <p className="text-lg font-light text-slate-600">{data?.assessments?.length || 0} Assessments</p>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="pb-4">Client Name</th>
                    <th className="pb-4">Email</th>
                    <th className="pb-4">Dysregulation Score</th>
                    <th className="pb-4">Severity Band</th>
                    <th className="pb-4">Nervous System Type</th>
                    <th className="pb-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.assessments?.map((assessment: any) => (
                    <tr key={assessment.id} className="group hover:bg-slate-50">
                      <td className="py-5 font-semibold">{assessment.clientName || assessment.full_name}</td>
                      <td className="py-5 text-xs text-slate-400 font-mono">{assessment.email}</td>
                      <td className="py-5 text-sm font-bold">{assessment.overall_dysregulation_score ?? '—'}</td>
                      <td className="py-5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          assessment.overall_severity_band === 'Severe' ? 'bg-red-50 text-red-600' :
                          assessment.overall_severity_band === 'Moderate' ? 'bg-amber-50 text-amber-600' :
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {assessment.overall_severity_band || '—'}
                        </span>
                      </td>
                      <td className="py-5 text-xs text-slate-600">{assessment.nervous_system_type || '—'}</td>
                      <td className="py-5 text-xs text-slate-400">{fmtDate(assessment.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.assessments?.length && (
                <div className="py-12 text-center text-slate-400 text-xs">No assessments found</div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}