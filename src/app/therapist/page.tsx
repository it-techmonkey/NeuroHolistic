'use client';

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import DomainScoreBar from '@/components/dashboard/shared/DomainScoreBar';
import StatusBadge from '@/components/dashboard/shared/StatusBadge';
import { isUpcomingSession } from '@/lib/booking/session-flow';
import {
  Activity,
  Calendar,
  CheckCircle2,
  FileText,
  Save,
  Search,
  Upload,
  UserSquare2,
  Video,
  Zap,
} from 'lucide-react';

/* ────────────────────────────── Types ────────────────────────────── */

type SessionAssessment = {
  id: string; overallScore: number;
  nervousSystemScore: number; emotionalPatternScore: number;
  familyImprintScore: number; incidentLoadScore: number;
  bodySymptomScore: number; currentStressScore: number;
  therapistNotes: string | null; observations: string | null;
  recommendations: string | null; pdfUrl: string | null;
  videoUrl: string | null; createdAt: string;
};

type SessionRecord = {
  id: string; date: string; time: string; type: string;
  status: 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  meetingLink: string | null; sessionNumber: number | null;
  canComplete: boolean; assessment: SessionAssessment | null;
};

type ClientRecord = {
  userId: string; email: string; fullName: string;
  therapistOverviewNotes: string; averageScore: number | null;
  pendingDocumentationCount: number;
  initialAssessment: {
    severityBand: string | null; nervousSystemType: string | null;
    primaryWound: string | null; recommendedPhase: string | null;
    assessmentDate: string | null;
  } | null;
  latestAssessment: {
    overallScore: number; nervousSystemScore: number; emotionalPatternScore: number;
    familyImprintScore: number; incidentLoadScore: number;
    bodySymptomScore: number; currentStressScore: number;
    therapistNotes: string | null; observations: string | null;
    recommendations: string | null; createdAt: string;
  } | null;
  nextSession: {
    id: string; date: string; time: string; type: string;
    meetingLink: string | null; sessionNumber: number | null;
  } | null;
  program: {
    status: string | null; type: string | null;
    totalSessions: number; usedSessions: number;
    completedSessions: number; remainingSessions: number;
  };
  sessions: SessionRecord[];
};

type DashboardOverview = {
  totalClients: number; completedSessions: number;
  upcomingSessions: number; pendingDocumentation: number;
  averageScore: number | null;
};

type DashboardResponse = { clients: ClientRecord[]; overview: DashboardOverview };

type AssessmentFormState = {
  nervous_system_score: number; emotional_pattern_score: number;
  family_imprint_score: number; incident_load_score: number;
  body_symptom_score: number; current_stress_score: number;
  therapist_notes: string; observations: string; recommendations: string;
  resource_pdf_url: string; resource_mp4_url: string;
};

/* ────────────────────────────── Helpers ────────────────────────────── */

function createEmptyAssessmentForm(): AssessmentFormState {
  return {
    nervous_system_score: 0, emotional_pattern_score: 0, family_imprint_score: 0,
    incident_load_score: 0, body_symptom_score: 0, current_stress_score: 0,
    therapist_notes: '', observations: '', recommendations: '',
    resource_pdf_url: '', resource_mp4_url: '',
  };
}
const fmtDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
const fmtDateLong = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
const fmtTime = (t: string) => { const [h, m] = t.split(':'); const hr = parseInt(h, 10); return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; };
const formatAssessmentDate = (v: string | null) => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not recorded';
function scoreTone(score: number | null) {
  if (score === null || score === undefined) return 'text-slate-400';
  if (score >= 8) return 'text-red-600';
  return score >= 6 ? 'text-amber-600' : 'text-emerald-600';
}
const SCORE_FIELDS: [keyof AssessmentFormState, string][] = [
  ['nervous_system_score', 'Nervous System'], ['emotional_pattern_score', 'Emotional Patterns'],
  ['family_imprint_score', 'Family Imprint'], ['incident_load_score', 'Incident Load'],
  ['body_symptom_score', 'Body Symptoms'], ['current_stress_score', 'Current Stress'],
];

/* ────────────────────────── Inline components ────────────────────────── */

function MetricCard({ label, value, hint, icon: Icon }: {
  label: string; value: string | number; hint: string; icon: typeof Activity;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <Icon size={16} className="text-slate-300" />
      </div>
      <p className="text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-3">{hint}</p>
    </div>
  );
}

function OverviewCard({ client, selected, onSelect }: {
  client: ClientRecord; selected: boolean; onSelect: () => void;
}) {
  const s = selected;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-2xl border p-5 transition-all ${
        s ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-lg font-semibold ${s ? 'text-white' : 'text-slate-900'}`}>{client.fullName}</p>
          <p className={`text-sm ${s ? 'text-slate-300' : 'text-slate-500'}`}>{client.email}</p>
        </div>
        <span className={`text-sm font-bold ${s ? 'text-white' : scoreTone(client.averageScore)}`}>
          {client.averageScore !== null ? Math.round(client.averageScore) : '—'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        {([
          ['Next Session', client.nextSession ? `${fmtDate(client.nextSession.date)} · ${fmtTime(client.nextSession.time)}` : 'No future session'],
          ['Pending Docs', String(client.pendingDocumentationCount)],
        ] as [string, string][]).map(([lbl, val]) => (
          <div key={lbl}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{lbl}</p>
            <p className={`mt-2 font-medium ${s ? 'text-white' : 'text-slate-700'}`}>{val}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

/* ────────────────────────── Main Component ────────────────────────── */

export default function TherapistDashboard() {
  const [tab, setTab] = useState('overview');
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewNote, setOverviewNote] = useState('');
  const [savingOverviewNote, setSavingOverviewNote] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [assessmentForm, setAssessmentForm] = useState(createEmptyAssessmentForm());
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  /* ── Data fetching ── */

  async function fetchData(options?: { preserveSelection?: boolean }) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/therapist/clients');
      const data = (await res.json()) as DashboardResponse & { error?: string };
      if (!res.ok) throw new Error(data.error || `Failed to load data (${res.status})`);

      setClients(data.clients ?? []);
      setOverview(data.overview ?? null);

      const nextClientId =
        options?.preserveSelection && selectedClientId && data.clients.some((c) => c.userId === selectedClientId)
          ? selectedClientId
          : data.clients[0]?.userId ?? null;
      setSelectedClientId(nextClientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load therapist dashboard.');
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { void fetchData(); }, []);

  /* ── Derived state ── */

  const filteredClients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => c.fullName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [clients, query]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.userId === selectedClientId) ?? null,
    [clients, selectedClientId],
  );

  const allUpcomingSessions = useMemo(() => {
    return clients
      .flatMap((c) =>
        c.sessions
          .filter((s) => (s.status === 'confirmed' || s.status === 'scheduled') && isUpcomingSession(s))
          .map((s) => ({ ...s, clientName: c.fullName, clientId: c.userId })),
      )
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }, [clients]);

  /* ── Side-effects ── */

  useEffect(() => {
    if (!selectedClient) {
      setOverviewNote('');
      setActiveSessionId(null);
      setAssessmentForm(createEmptyAssessmentForm());
      return;
    }
    setOverviewNote(selectedClient.therapistOverviewNotes ?? '');
    const defaultSession =
      selectedClient.nextSession?.id ??
      selectedClient.sessions.find((s) => s.canComplete)?.id ?? null;
    setActiveSessionId((cur) => {
      const curSession = cur ? selectedClient.sessions.find((s) => s.id === cur) : null;
      return curSession?.canComplete ? cur : defaultSession;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setAssessmentForm(createEmptyAssessmentForm()); }, [activeSessionId]);

  const activeSession = selectedClient?.sessions.find((s) => s.id === activeSessionId) ?? null;

  /* ── Actions ── */

  async function saveOverviewNotes() {
    if (!selectedClient) return;
    setSavingOverviewNote(true);
    setError(null);
    try {
      const res = await fetch('/api/therapist/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClient.userId, notes: overviewNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save overview notes.');
      setClients((prev) =>
        prev.map((c) => (c.userId === selectedClient.userId ? { ...c, therapistOverviewNotes: overviewNote } : c)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save overview notes.');
    } finally {
      setSavingOverviewNote(false);
    }
  }

  async function uploadResource(kind: 'pdf' | 'video', file: File) {
    if (!activeSession) {
      setError('Choose the session you want to complete before uploading a resource.');
      return;
    }
    const setUploading = kind === 'pdf' ? setUploadingPdf : setUploadingVideo;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bookingId', activeSession.id);
      fd.append('kind', kind);
      const res = await fetch('/api/therapist/session-resources/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setAssessmentForm((prev) => ({
        ...prev,
        resource_pdf_url: kind === 'pdf' ? data.url : prev.resource_pdf_url,
        resource_mp4_url: kind === 'video' ? data.url : prev.resource_mp4_url,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function submitSessionAssessment() {
    if (!activeSession) { setError('Choose a confirmed session to complete.'); return; }
    setSavingAssessment(true);
    setError(null);
    try {
      const res = await fetch('/api/therapist/session-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: activeSession.id, ...assessmentForm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete session assessment.');
      await fetchData({ preserveSelection: true });
      setAssessmentForm(createEmptyAssessmentForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete session assessment.');
    } finally {
      setSavingAssessment(false);
    }
  }

  /* ── Render ── */

  if (loading) {
    return (
      <DashboardShell role="therapist">
        <div className="flex items-center justify-center py-40">
          <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="therapist" activeTab={tab} onTabChange={setTab}>
      {/* Page header + search */}
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
            Session Documentation Flow
          </p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
            Track assigned clients, complete sessions, and log therapist assessments.
          </h1>
        </div>
        <label className="relative block w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assigned clients"
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </label>
      </header>

      {error && (
        <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
      )}

      {/* ═══════════════════════ Overview Tab ═══════════════════════ */}
      {tab === 'overview' && (
        <div className="space-y-10">
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
            <MetricCard label="Assigned Clients" value={overview?.totalClients ?? 0} hint="Clients currently mapped to this therapist." icon={UserSquare2} />
            <MetricCard label="Upcoming Sessions" value={overview?.upcomingSessions ?? 0} hint="Future confirmed sessions on the calendar." icon={Calendar} />
            <MetricCard label="Completed Sessions" value={overview?.completedSessions ?? 0} hint="Sessions already marked completed." icon={CheckCircle2} />
            <MetricCard label="Pending Documentation" value={overview?.pendingDocumentation ?? 0} hint="Completed sessions missing therapist assessment data." icon={FileText} />
            <MetricCard
              label="Average Score"
              value={overview?.averageScore != null ? Math.round(overview.averageScore) : '—'}
              hint="Average across all therapist session assessments."
              icon={Activity}
            />
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Assigned Client Overview</h2>
              <p className="text-sm text-slate-500">{filteredClients.length} visible</p>
            </div>
            {filteredClients.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredClients.map((c) => (
                  <OverviewCard
                    key={c.userId}
                    client={c}
                    selected={selectedClientId === c.userId}
                    onSelect={() => { setSelectedClientId(c.userId); setTab('clients'); }}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
                No assigned clients match this search.
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══════════════════════ Clients Tab ═══════════════════════ */}
      {tab === 'clients' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* ── Roster sidebar ── */}
          <aside className="xl:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Roster</p>
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {filteredClients.map((c) => {
                  const sel = selectedClientId === c.userId;
                  return (
                    <button
                      key={c.userId}
                      type="button"
                      onClick={() => setSelectedClientId(c.userId)}
                      className={`w-full text-left rounded-2xl border p-4 transition-all ${
                        sel ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{c.fullName}</p>
                          <p className={`text-xs mt-1 ${sel ? 'text-slate-300' : 'text-slate-500'}`}>{c.email}</p>
                        </div>
                        <span className={`text-sm font-bold ${sel ? 'text-white' : scoreTone(c.averageScore)}`}>
                          {c.averageScore !== null ? Math.round(c.averageScore) : '—'}
                        </span>
                      </div>
                      <div className={`mt-4 flex items-center justify-between text-xs ${sel ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span>{c.program.completedSessions} completed</span>
                        <span>{c.program.remainingSessions} remaining</span>
                      </div>
                    </button>
                  );
                })}
                {filteredClients.length === 0 && (
                  <p className="text-sm text-slate-400">No assigned clients match this search.</p>
                )}
              </div>
            </div>
          </aside>

          {/* ── Selected client detail ── */}
          <section className="xl:col-span-8">
            {selectedClient ? (
              <div className="space-y-8">
                {/* Client header card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Client Record</p>
                      <h2 className="text-3xl font-semibold tracking-tight">{selectedClient.fullName}</h2>
                      <p className="text-slate-500 mt-1">{selectedClient.email}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                      {([
                        ['Average', selectedClient.averageScore !== null ? Math.round(selectedClient.averageScore) : '—', scoreTone(selectedClient.averageScore)],
                        ['Completed', selectedClient.program.completedSessions, ''],
                        ['Remaining', selectedClient.program.remainingSessions, ''],
                        ['Next Session', selectedClient.nextSession ? fmtDate(selectedClient.nextSession.date) : 'Not scheduled', ''],
                      ] as [string, string | number, string][]).map(([lbl, val, tone]) => (
                        <div key={lbl} className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{lbl}</p>
                          <p className={`text-2xl font-semibold mt-2 ${tone}`}>{val}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Initial assessment info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {([
                      ['Initial Severity', selectedClient.initialAssessment?.severityBand],
                      ['Nervous System', selectedClient.initialAssessment?.nervousSystemType],
                      ['Primary Phase', selectedClient.initialAssessment?.recommendedPhase],
                      ['Initial Assessment', formatAssessmentDate(selectedClient.initialAssessment?.assessmentDate ?? null)],
                    ] as const).map(([lbl, val]) => (
                      <div key={lbl} className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{lbl}</p>
                        <p className="text-sm font-semibold mt-2">{val || 'Not recorded'}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overview notes + Latest scores */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Therapist Overview Note</p>
                      <button type="button" onClick={saveOverviewNotes} disabled={savingOverviewNote} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800 disabled:opacity-50">
                        <Save size={13} /> {savingOverviewNote ? 'Saving' : 'Save Note'}
                      </button>
                    </div>
                    <textarea value={overviewNote} onChange={(e) => setOverviewNote(e.target.value)} rows={8} placeholder="Ongoing therapist overview for this client." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10" />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-5">Latest Score Snapshot</p>
                    {selectedClient.latestAssessment ? (
                      <>
                        <div className="flex items-end gap-3 mb-5">
                          <span className={`text-5xl font-semibold tracking-tight ${scoreTone(selectedClient.latestAssessment.overallScore)}`}>
                            {Math.round(selectedClient.latestAssessment.overallScore)}
                          </span>
                          <span className="text-sm text-slate-500 mb-2">
                            recorded {formatAssessmentDate(selectedClient.latestAssessment.createdAt)}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {([
                            ['Nervous System', selectedClient.latestAssessment.nervousSystemScore],
                            ['Emotional Patterns', selectedClient.latestAssessment.emotionalPatternScore],
                            ['Family Imprint', selectedClient.latestAssessment.familyImprintScore],
                            ['Incident Load', selectedClient.latestAssessment.incidentLoadScore],
                            ['Body Symptoms', selectedClient.latestAssessment.bodySymptomScore],
                            ['Current Stress', selectedClient.latestAssessment.currentStressScore],
                          ] as [string, number][]).map(([lbl, val]) => (
                            <DomainScoreBar key={lbl} label={lbl} value={Math.round(val)} maxValue={10} />
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">
                        No therapist session assessment has been recorded for this client yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Session timeline — uses StatusBadge */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Session Timeline</p>
                      <p className="text-sm text-slate-500">Complete a confirmed session to open the post-session assessment workflow.</p>
                    </div>
                    {selectedClient.nextSession && (
                      <div className="rounded-full bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">Next: {fmtDate(selectedClient.nextSession.date)} · {fmtTime(selectedClient.nextSession.time)}</div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedClient.sessions.map((session) => (
                      <div key={session.id} className="rounded-2xl border border-slate-200 p-5">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <p className="text-lg font-semibold text-slate-900">
                                {session.sessionNumber ? `Session ${session.sessionNumber}` : 'Session'}
                              </p>
                              <StatusBadge status={session.status} />
                            </div>
                            <p className="text-sm text-slate-500 mt-2">
                              {fmtDateLong(session.date)} at {fmtTime(session.time)}
                            </p>
                            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mt-3">
                              {session.type.replace(/_/g, ' ')}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {session.meetingLink && (
                              <a href={session.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50">
                                <Video size={14} /> Join Room
                              </a>
                            )}
                            {session.canComplete && (
                              <button type="button" onClick={() => setActiveSessionId(session.id)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${activeSessionId === session.id ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}>
                                <CheckCircle2 size={14} /> Complete Session
                              </button>
                            )}
                          </div>
                        </div>

                        {session.assessment ? (
                          <div className="mt-5 rounded-xl bg-slate-50 p-5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                              <p className="text-sm font-semibold text-slate-900">
                                Therapist score: {Math.round(session.assessment.overallScore)}
                              </p>
                              <p className="text-xs text-slate-500">Logged {formatAssessmentDate(session.assessment.createdAt)}</p>
                            </div>
                            {session.assessment.therapistNotes && (
                              <p className="text-sm text-slate-600 leading-relaxed mb-4">{session.assessment.therapistNotes}</p>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                              {([
                                ['Nervous System', session.assessment.nervousSystemScore],
                                ['Emotional', session.assessment.emotionalPatternScore],
                                ['Family', session.assessment.familyImprintScore],
                                ['Incident', session.assessment.incidentLoadScore],
                                ['Body', session.assessment.bodySymptomScore],
                                ['Stress', session.assessment.currentStressScore],
                              ] as [string, number][]).map(([l, v]) => (
                                <div key={l}>{l}: {Math.round(v)}</div>
                              ))}
                            </div>
                            {(session.assessment.pdfUrl || session.assessment.videoUrl) && (
                              <div className="flex flex-wrap gap-3 mt-4">
                                {([
                                  [session.assessment.pdfUrl, FileText, 'PDF resource'],
                                  [session.assessment.videoUrl, Video, 'Video resource'],
                                ] as [string | null, typeof FileText, string][])
                                  .filter(([url]) => url)
                                  .map(([url, Icon, text]) => (
                                    <a key={text} href={url!} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                      <Icon size={15} /> {text}
                                    </a>
                                  ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="mt-5 text-sm text-slate-400">
                            {session.status === 'completed'
                              ? 'This session is completed but still needs therapist documentation.'
                              : 'No therapist assessment recorded for this session yet.'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Post-session completion form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Post-Session Completion</p>
                      <h3 className="text-2xl font-semibold tracking-tight">
                        {activeSession ? `${activeSession.sessionNumber ? `Session ${activeSession.sessionNumber}` : 'Selected Session'} completion form` : 'Choose a confirmed session to complete'}
                      </h3>
                    </div>
                    {activeSession && (
                      <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">{fmtDate(activeSession.date)} · {fmtTime(activeSession.time)}</div>
                    )}
                  </div>

                  {activeSession ? (
                    <div className="space-y-8">
                      {/* Score inputs */}
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {SCORE_FIELDS.map(([field, label]) => (
                          <label key={field} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">{label}</span>
                            <input
                              type="number"
                              min={0}
                              max={10}
                              step="0.1"
                              value={assessmentForm[field] as number}
                              onChange={(e) => setAssessmentForm((prev) => ({ ...prev, [field]: Number(e.target.value) }))}
                              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                            />
                          </label>
                        ))}
                      </div>

                      {/* Notes, observations, recommendations */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {([
                          ['therapist_notes', 'Therapist notes for this session.'],
                          ['observations', 'Observed patterns, behaviors, and regulation markers.'],
                          ['recommendations', 'Recommendations, homework, and next-session direction.'],
                        ] as const).map(([field, placeholder]) => (
                          <textarea
                            key={field}
                            value={assessmentForm[field]}
                            onChange={(e) => setAssessmentForm((prev) => ({ ...prev, [field]: e.target.value }))}
                            rows={6}
                            placeholder={placeholder}
                            className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                        ))}
                      </div>

                      {/* File uploads */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                          { kind: 'pdf' as const, label: 'Attach PDF Resource', accept: 'application/pdf', uploading: uploadingPdf, url: assessmentForm.resource_pdf_url, hint: 'PDF files up to 15MB.', btnText: uploadingPdf ? 'Uploading...' : 'Upload PDF', linkText: 'View uploaded PDF', LinkIcon: FileText },
                          { kind: 'video' as const, label: 'Attach Video Resource', accept: 'video/*', uploading: uploadingVideo, url: assessmentForm.resource_mp4_url, hint: 'Video files up to 100MB.', btnText: uploadingVideo ? 'Uploading...' : 'Upload Video', linkText: 'View uploaded video', LinkIcon: Video },
                        ]).map((up) => (
                          <div key={up.kind} className="rounded-2xl border border-slate-200 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">{up.label}</p>
                            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50 cursor-pointer">
                              <Upload size={14} />
                              {up.btnText}
                              <input type="file" accept={up.accept} className="hidden" disabled={up.uploading} onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) void uploadResource(up.kind, file);
                                e.currentTarget.value = '';
                              }} />
                            </label>
                            <p className="text-xs text-slate-400 mt-3">{up.hint}</p>
                            {up.url && (
                              <a href={up.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                                <up.LinkIcon size={15} /> {up.linkText}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
                        <p className="text-sm text-slate-500">Saving marks the session as completed and stores the therapist assessment.</p>
                        <button type="button" onClick={submitSessionAssessment} disabled={savingAssessment || uploadingPdf || uploadingVideo} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800 disabled:opacity-50">
                          <Zap size={14} /> {savingAssessment ? 'Completing Session...' : 'Mark Session Completed'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      Select a confirmed session from the timeline above to complete it and log the post-session assessment.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-24 text-center text-slate-400">
                Select an assigned client to open the record workspace.
              </div>
            )}
          </section>
        </div>
      )}

      {/* ═══════════════════════ Schedule (Upcoming) Tab ═══════════════════════ */}
      {tab === 'schedule' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Upcoming Sessions</p>
              <h2 className="text-2xl font-semibold tracking-tight">Confirmed sessions waiting to happen</h2>
            </div>
            <p className="text-sm text-slate-500">{allUpcomingSessions.length} sessions</p>
          </div>

          <div className="space-y-4">
            {allUpcomingSessions.map((session) => (
              <div key={session.id} className="rounded-2xl border border-slate-200 p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{session.clientName}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {fmtDateLong(session.date)} at {fmtTime(session.time)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => { setSelectedClientId(session.clientId); setActiveSessionId(session.id); setTab('clients'); }} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50">
                      <UserSquare2 size={14} /> Open Client Record
                    </button>
                    {session.meetingLink && (
                      <a href={session.meetingLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800">
                        <Video size={14} /> Join Room
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {allUpcomingSessions.length === 0 && (
              <p className="py-16 text-center text-slate-400">No future confirmed sessions are currently assigned.</p>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
