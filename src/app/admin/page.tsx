'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { AlertCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type PaymentRecord = {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  type: string;
  clientName: string;
  createdAt: string;
};

type TherapistStat = {
  id: string;
  name: string;
  email: string;
  clientCount: number;
  revenue: number;
  activePrograms: number;
  completedSessions: number;
  upcomingCount: number;
  averageScore: number | null;
};

type ClientStat = {
  id: string;
  name: string;
  email: string;
  therapistName: string | null;
  programStatus: string | null;
  sessionsUsed: number;
  totalSessions: number;
  assessmentScore: number | null;
  averageSessionScore: number | null;
  totalPaid: number;
  joinedAt: string;
};

type LeadRecord = {
  id: string;
  name: string;
  email: string;
  country: string;
  source: string;
  created_at: string;
};

type AssessmentRecord = {
  id: string;
  clientName: string;
  full_name: string;
  email: string;
  overall_dysregulation_score: number | null;
  overall_severity_band: string | null;
  nervous_system_type: string | null;
  submitted_at: string;
};

type AdminData = {
  kpis: { totalRevenue: number };
  payments: PaymentRecord[];
  therapistStats: TherapistStat[];
  clientStats: ClientStat[];
  leads: LeadRecord[];
  assessments: AssessmentRecord[];
};

type FounderTab = 'finance' | 'team' | 'clients' | 'growth' | 'assessments';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtAED(fils: number) {
  return `AED ${(fils / 100).toLocaleString('en-AE', { minimumFractionDigits: 0 })}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function calculateAverageLTV(clientStats: ClientStat[]) {
  if (!clientStats?.length) return 0;
  const totalValue = clientStats.reduce((sum, c) => sum + (c.totalPaid || 0), 0);
  return Math.round(totalValue / clientStats.length);
}

function calculateConversionRate(leads: LeadRecord[], clients: ClientStat[]) {
  if (!leads?.length) return 0;
  const leadsEmail = new Set(leads.map((l) => l.email?.toLowerCase()));
  const convertedCount = clients.filter((c) => leadsEmail.has(c.email?.toLowerCase())).length;
  return leads.length > 0 ? Math.round((convertedCount / leads.length) * 100 * 10) / 10 : 0;
}

function calculateLeadSources(leads: LeadRecord[]) {
  const sources: Record<string, number> = {};
  leads.forEach((lead) => {
    const source = lead.source || 'Direct';
    sources[source] = (sources[source] || 0) + 1;
  });
  return sources;
}

function calculateMonthlyGrowth(payments: PaymentRecord[], _clients: ClientStat[]) {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthRevenue = payments
    .filter((p) => p.status === 'paid' && new Date(p.createdAt) >= thisMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const lastMonthRevenue = payments
    .filter((p) => p.status === 'paid' && new Date(p.createdAt) >= lastMonth && new Date(p.createdAt) < thisMonth)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  if (lastMonthRevenue === 0) return 0;
  return Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 * 10) / 10;
}

function calculateLTVTrend(_payments: PaymentRecord[], clientStats: ClientStat[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthClients = clientStats.filter((c) => new Date(c.joinedAt) >= thisMonthStart);
  const lastMonthClients = clientStats.filter((c) => new Date(c.joinedAt) >= lastMonthStart && new Date(c.joinedAt) < thisMonthStart);

  const avgThisMonth = thisMonthClients.length > 0
    ? thisMonthClients.reduce((s, c) => s + (c.totalPaid || 0), 0) / thisMonthClients.length
    : 0;
  const avgLastMonth = lastMonthClients.length > 0
    ? lastMonthClients.reduce((s, c) => s + (c.totalPaid || 0), 0) / lastMonthClients.length
    : 0;

  if (avgLastMonth === 0) return null;
  return Math.round(((avgThisMonth - avgLastMonth) / avgLastMonth) * 100 * 10) / 10;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
  const [tab, setTab] = useState<FounderTab>('finance');
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewRes, approvalsRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/payments'),
      ]);
      if (!overviewRes.ok) throw new Error(`Failed to fetch: ${overviewRes.status}`);
      const json: AdminData = await overviewRes.json();
      setData(json);
      if (approvalsRes.ok) {
        const approvalsJson = await approvalsRes.json();
        setPendingApprovals(approvalsJson.payments || []);
      } else {
        setPendingApprovals([]);
      }
    } catch (e) {
      console.error('[Admin Dashboard Error]', e);
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePaymentDecision = useCallback(async (programId: string, action: 'accept' | 'reject') => {
    setApprovalLoading(programId);
    try {
      const res = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Action failed');
      setPendingApprovals((prev) => prev.filter((p) => p.id !== programId));
      await fetchData();
    } catch (e) {
      console.error('[Admin Payment Decision]', e);
      setError(e instanceof Error ? e.message : 'Failed to process payment decision');
    } finally {
      setApprovalLoading(null);
    }
  }, [fetchData]);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const pendingAmount = useMemo(() => {
    if (!data?.payments) return 0;
    return data.payments
      .filter((p) => p.status !== 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [data?.payments]);

  const pendingPct = useMemo(() => {
    if (!data?.payments?.length) return '0%';
    const count = data.payments.filter((p) => p.status !== 'paid').length;
    return Math.round((count / data.payments.length) * 100) + '%';
  }, [data?.payments]);

  if (loading) {
    return (
      <DashboardShell role="admin" activeTab={tab} onTabChange={(t) => setTab(t as FounderTab)}>
        <div className="flex items-center justify-center py-32 text-xs uppercase tracking-widest text-slate-400">
          Loading executive data…
        </div>
      </DashboardShell>
    );
  }

  if (error) {
    return (
      <DashboardShell role="admin" activeTab={tab} onTabChange={(t) => setTab(t as FounderTab)}>
        <div className="flex items-center justify-center py-32">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle size={20} />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="admin" activeTab={tab} onTabChange={(t) => setTab(t as FounderTab)}>

      {/* ── FINANCE ── */}
      {tab === 'finance' && (
        <div className="space-y-12">
          <section className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Manual Payment Approvals</h3>
                <p className="text-xs text-slate-500 mt-1">Approve payments manually after your internal confirmation with client/therapist.</p>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                Pending: {pendingApprovals.length}
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {pendingApprovals.length === 0 ? (
                <div className="px-6 py-8 text-sm text-slate-500 text-center">No pending payments to approve.</div>
              ) : (
                pendingApprovals.map((payment) => (
                  <div key={payment.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{payment.clientName} • AED {(payment.pricePaid || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {payment.programType} program • Therapist: {payment.therapistName} • {payment.clientEmail}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePaymentDecision(payment.id, 'reject')}
                        disabled={approvalLoading === payment.id}
                        className="px-3 py-1.5 text-xs rounded border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handlePaymentDecision(payment.id, 'accept')}
                        disabled={approvalLoading === payment.id}
                        className="px-3 py-1.5 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {approvalLoading === payment.id ? 'Processing...' : 'Approve Payment'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <header>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Total Verified Revenue</p>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900">
              {fmtAED(data?.kpis?.totalRevenue || 0)}
            </h1>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-200 border border-slate-200 overflow-hidden rounded-xl">
            {[
              {
                label: 'Average LTV',
                value: fmtAED(stats?.avgLTV || 0),
                trend: stats?.ltvTrend != null ? (stats.ltvTrend >= 0 ? '+' + stats.ltvTrend + '%' : stats.ltvTrend + '%') : 'N/A',
              },
              {
                label: 'Pending Collections',
                value: fmtAED(pendingAmount),
                trend: pendingPct,
              },
              {
                label: 'Monthly Growth',
                value: (stats?.monthlyGrowth || 0) + '%',
                trend: (stats?.monthlyGrowth || 0) > 0 ? '+' + (stats?.monthlyGrowth || 0) + '%' : (stats?.monthlyGrowth || 0) + '%',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">{stat.label}</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-2xl font-light tracking-tight">{stat.value}</p>
                  <span className={`text-xs font-semibold ${stat.trend?.startsWith('+') ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <section>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">Transaction Stream</h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {data?.payments?.slice(0, 10).map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-6 py-4 border-b border-slate-100 last:border-b-0">
                      <div className="flex items-center gap-6">
                        <span className="text-[10px] font-mono text-slate-400 w-24">{fmtDate(p.createdAt)}</span>
                        <p className="text-sm font-medium w-40 truncate">{p.clientName}</p>
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 w-32">{p.type.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md text-center w-20 ${
                          p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                          p.status === 'failed' ? 'bg-red-50 text-red-600' :
                          p.status === 'refunded' ? 'bg-slate-100 text-slate-600' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {p.status}
                        </span>
                        <p className="text-sm font-semibold tabular-nums w-24 text-right">{fmtAED(p.amount)}</p>
                      </div>
                    </div>
                  ))}
                  {!data?.payments?.length && (
                    <div className="py-12 text-center text-slate-400 text-xs">No transactions recorded</div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ── TEAM ── */}
      {tab === 'team' && (
        <div className="space-y-10">
          <header className="flex justify-between items-end pb-6 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Practitioner Overview</h2>
            <p className="text-base font-medium text-slate-600">{data?.therapistStats?.length || 0} Practitioners</p>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data?.therapistStats?.map((t) => (
              <div key={t.id} className="border border-slate-200 rounded-xl bg-white p-6 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{t.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{t.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase text-slate-400">Clients</p>
                    <p className="text-xl font-bold text-indigo-600">{t.clientCount}</p>
                  </div>
                </div>
                <dl className="space-y-3">
                  {[
                    { label: 'Total Revenue', value: fmtAED(t.revenue) },
                    { label: 'Active Programs', value: String(t.activePrograms) },
                    { label: 'Completed Sessions', value: String(t.completedSessions), accent: 'text-emerald-600' },
                    { label: 'Upcoming Sessions', value: String(t.upcomingCount) },
                    { label: 'Avg Session Score', value: t.averageScore != null ? String(t.averageScore) : '—' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-xs">
                      <dt className="text-slate-400">{row.label}</dt>
                      <dd className={`font-semibold ${row.accent || 'text-slate-900'}`}>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GROWTH ── */}
      {tab === 'growth' && (
        <div className="space-y-10">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-6 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lead Conversion Pipeline</h2>
            <p className="text-xl font-light">
              {stats?.conversionRate || 0}%
              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-widest ml-2">Conversion Rate</span>
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50">
                        <th className="px-6 py-3">Name</th>
                        <th className="px-6 py-3">Source</th>
                        <th className="px-6 py-3">Country</th>
                        <th className="px-6 py-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data?.leads?.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">{lead.name}</p>
                            <p className="text-xs text-slate-400">{lead.email}</p>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-600 font-medium">{lead.source || 'Direct'}</td>
                          <td className="px-6 py-4 text-xs text-slate-600">{lead.country || '—'}</td>
                          <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">{fmtDate(lead.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!data?.leads?.length && (
                    <div className="py-12 text-center text-slate-400 text-xs">No leads recorded</div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit">
              <h3 className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-6">Lead Attribution</h3>
              <div className="space-y-5">
                {stats?.leadSources && Object.entries(stats.leadSources).map(([source, count]) => {
                  const percentage = data?.leads?.length ? Math.round((count / data.leads.length) * 100) : 0;
                  return (
                    <div key={source}>
                      <div className="flex justify-between text-xs font-medium mb-1.5">
                        <span>{source}</span>
                        <span className="text-slate-400">{percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#2B2F55] rounded-full transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CLIENTS ── */}
      {tab === 'clients' && (
        <div className="space-y-10">
          <header className="flex justify-between items-end pb-6 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Client Directory</h2>
            <p className="text-base font-medium text-slate-600">{data?.clientStats?.length || 0} Clients</p>
          </header>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50">
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Therapist</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3 text-center">Sessions</th>
                    <th className="px-5 py-3">Dysreg. Score</th>
                    <th className="px-5 py-3">Avg Score</th>
                    <th className="px-5 py-3">Paid</th>
                    <th className="px-5 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.clientStats?.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-medium">{client.name}</td>
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono">{client.email}</td>
                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                          {client.therapistName || 'Unassigned'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${
                          client.programStatus === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {client.programStatus || 'None'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center text-xs font-medium">
                        {client.sessionsUsed}/{client.totalSessions}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium">{client.assessmentScore ?? '—'}</td>
                      <td className="px-5 py-4 text-xs font-medium">{client.averageSessionScore ?? '—'}</td>
                      <td className="px-5 py-4 font-mono text-sm">{fmtAED(client.totalPaid)}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">{fmtDate(client.joinedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.clientStats?.length && (
                <div className="py-12 text-center text-slate-400 text-xs">No clients found</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ASSESSMENTS ── */}
      {tab === 'assessments' && (
        <div className="space-y-10">
          <header className="flex justify-between items-end pb-6 border-b border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Assessment Results</h2>
            <p className="text-base font-medium text-slate-600">{data?.assessments?.length || 0} Assessments</p>
          </header>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 bg-slate-50">
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Dysreg. Score</th>
                    <th className="px-5 py-3">Severity</th>
                    <th className="px-5 py-3">NS Type</th>
                    <th className="px-5 py-3">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.assessments?.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-medium">{a.clientName || a.full_name}</td>
                      <td className="px-5 py-4 text-xs text-slate-400 font-mono">{a.email}</td>
                      <td className="px-5 py-4 text-sm font-semibold">{a.overall_dysregulation_score ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${
                          a.overall_severity_band === 'Severe' ? 'bg-red-50 text-red-600' :
                          a.overall_severity_band === 'Moderate' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {a.overall_severity_band || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs text-slate-600">{a.nervous_system_type || '—'}</td>
                      <td className="px-5 py-4 text-xs text-slate-400">{fmtDate(a.submitted_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data?.assessments?.length && (
                <div className="py-12 text-center text-slate-400 text-xs">No assessments found</div>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardShell>
  );
}
