'use client';

import { useEffect, useMemo, useState } from 'react';
import LogoutButton from '@/components/ui/LogoutButton';
import { isUpcomingSession } from '@/lib/booking/session-flow';
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  LogOut,
  Save,
  Search,
  Upload,
  UserSquare2,
  Video,
  Zap,
} from 'lucide-react';

type SessionAssessment = {
  id: string;
  overallScore: number;
  nervousSystemScore: number;
  emotionalPatternScore: number;
  familyImprintScore: number;
  incidentLoadScore: number;
  bodySymptomScore: number;
  currentStressScore: number;
  therapistNotes: string | null;
  observations: string | null;
  recommendations: string | null;
  pdfUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
};

type SessionRecord = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: 'confirmed' | 'completed' | 'cancelled';
  meetingLink: string | null;
  sessionNumber: number | null;
  canComplete: boolean;
  assessment: SessionAssessment | null;
};

type ClientRecord = {
  userId: string;
  email: string;
  fullName: string;
  therapistOverviewNotes: string;
  averageScore: number | null;
  pendingDocumentationCount: number;
  initialAssessment: {
    severityBand: string | null;
    nervousSystemType: string | null;
    primaryWound: string | null;
    recommendedPhase: string | null;
    assessmentDate: string | null;
  } | null;
  latestAssessment: {
    overallScore: number;
    nervousSystemScore: number;
    emotionalPatternScore: number;
    familyImprintScore: number;
    incidentLoadScore: number;
    bodySymptomScore: number;
    currentStressScore: number;
    therapistNotes: string | null;
    observations: string | null;
    recommendations: string | null;
    createdAt: string;
  } | null;
  nextSession: {
    id: string;
    date: string;
    time: string;
    type: string;
    meetingLink: string | null;
    sessionNumber: number | null;
  } | null;
  program: {
    status: string | null;
    type: string | null;
    totalSessions: number;
    usedSessions: number;
    completedSessions: number;
    remainingSessions: number;
  };
  sessions: SessionRecord[];
};

type DashboardOverview = {
  totalClients: number;
  completedSessions: number;
  upcomingSessions: number;
  pendingDocumentation: number;
  averageScore: number | null;
};

type DashboardResponse = {
  clients: ClientRecord[];
  overview: DashboardOverview;
};

type AssessmentFormState = {
  nervous_system_score: number;
  emotional_pattern_score: number;
  family_imprint_score: number;
  incident_load_score: number;
  body_symptom_score: number;
  current_stress_score: number;
  therapist_notes: string;
  observations: string;
  recommendations: string;
  resource_pdf_url: string;
  resource_mp4_url: string;
};

function createEmptyAssessmentForm(): AssessmentFormState {
  return {
    nervous_system_score: 0,
    emotional_pattern_score: 0,
    family_imprint_score: 0,
    incident_load_score: 0,
    body_symptom_score: 0,
    current_stress_score: 0,
    therapist_notes: '',
    observations: '',
    recommendations: '',
    resource_pdf_url: '',
    resource_mp4_url: '',
  };
}

function fmtDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function fmtDateLong(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function formatAssessmentDate(value: string | null) {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function scoreTone(score: number | null) {
  if (score === null || score === undefined) return 'text-slate-400';
  if (score >= 8) return 'text-red-600';
  if (score >= 6) return 'text-amber-600';
  return 'text-emerald-600';
}

function statusTone(status: SessionRecord['status']) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700';
  if (status === 'confirmed') return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-500';
}

function DomainLine({ label, value }: { label: string; value: number | null }) {
  const safeValue = value ?? 0;

  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-900">{Math.round(safeValue)}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-900 transition-all duration-700" style={{ width: `${Math.min(100, safeValue * 10)}%` }} />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <Icon size={16} className="text-slate-300" />
      </div>
      <p className="text-4xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-3">{hint}</p>
    </div>
  );
}

function OverviewCard({
  client,
  selected,
  onSelect,
}: {
  client: ClientRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left rounded-[1.5rem] border p-5 transition-all ${
        selected ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-lg font-semibold ${selected ? 'text-white' : 'text-slate-900'}`}>{client.fullName}</p>
          <p className={`text-sm ${selected ? 'text-slate-300' : 'text-slate-500'}`}>{client.email}</p>
        </div>
        <span className={`text-sm font-bold ${selected ? 'text-white' : scoreTone(client.averageScore)}`}>
          {client.averageScore !== null ? Math.round(client.averageScore) : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${selected ? 'text-slate-400' : 'text-slate-400'}`}>
            Next Session
          </p>
          <p className={`mt-2 font-medium ${selected ? 'text-white' : 'text-slate-700'}`}>
            {client.nextSession ? `${fmtDate(client.nextSession.date)} · ${fmtTime(client.nextSession.time)}` : 'No future session'}
          </p>
        </div>
        <div>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${selected ? 'text-slate-400' : 'text-slate-400'}`}>
            Pending Docs
          </p>
          <p className={`mt-2 font-medium ${selected ? 'text-white' : 'text-slate-700'}`}>
            {client.pendingDocumentationCount}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function TherapistDashboard() {
  const [tab, setTab] = useState<'overview' | 'clients' | 'upcoming'>('overview');
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overviewNote, setOverviewNote] = useState('');
  const [savingOverviewNote, setSavingOverviewNote] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [assessmentForm, setAssessmentForm] = useState<AssessmentFormState>(createEmptyAssessmentForm());
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  async function fetchData(options?: { preserveSelection?: boolean }) {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/therapist/clients');
      const data = (await res.json()) as DashboardResponse & { error?: string };

      if (!res.ok) {
        throw new Error(data.error || `Failed to load data (${res.status})`);
      }

      setClients(data.clients ?? []);
      setOverview(data.overview ?? null);

      const nextClientId =
        options?.preserveSelection && selectedClientId && data.clients.some((client) => client.userId === selectedClientId)
          ? selectedClientId
          : data.clients[0]?.userId ?? null;

      setSelectedClientId(nextClientId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load therapist dashboard.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return clients;

    return clients.filter((client) => {
      return (
        client.fullName.toLowerCase().includes(normalizedQuery) ||
        client.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [clients, query]);

  const selectedClient = useMemo(
    () => clients.find((client) => client.userId === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  const allUpcomingSessions = useMemo(() => {
    return clients
      .flatMap((client) =>
        client.sessions
          .filter((session) => session.status === 'confirmed' && isUpcomingSession(session))
          .map((session) => ({
            ...session,
            clientName: client.fullName,
            clientId: client.userId,
          }))
      )
      .sort((a, b) => {
        const left = `${a.date}T${a.time}`;
        const right = `${b.date}T${b.time}`;
        return left.localeCompare(right);
      });
  }, [clients]);

  useEffect(() => {
    if (!selectedClient) {
      setOverviewNote('');
      setActiveSessionId(null);
      setAssessmentForm(createEmptyAssessmentForm());
      return;
    }

    setOverviewNote(selectedClient.therapistOverviewNotes ?? '');

    const defaultOpenSession =
      selectedClient.nextSession?.id ??
      selectedClient.sessions.find((session) => session.canComplete)?.id ??
      null;

    setActiveSessionId((current) => {
      const currentSession = current
        ? selectedClient.sessions.find((session) => session.id === current)
        : null;

      return currentSession?.canComplete ? current : defaultOpenSession;
    });
  }, [selectedClient]);

  useEffect(() => {
    setAssessmentForm(createEmptyAssessmentForm());
  }, [activeSessionId]);

  const activeSession = selectedClient?.sessions.find((session) => session.id === activeSessionId) ?? null;

  async function saveOverviewNotes() {
    if (!selectedClient) return;

    setSavingOverviewNote(true);
    setError(null);

    try {
      const res = await fetch('/api/therapist/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClient.userId,
          notes: overviewNote,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save overview notes.');
      }

      setClients((prev) =>
        prev.map((client) =>
          client.userId === selectedClient.userId
            ? { ...client, therapistOverviewNotes: overviewNote }
            : client
        )
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bookingId', activeSession.id);
      formData.append('kind', kind);

      const res = await fetch('/api/therapist/session-resources/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

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
    if (!activeSession) {
      setError('Choose a confirmed session to complete.');
      return;
    }

    setSavingAssessment(true);
    setError(null);

    try {
      const res = await fetch('/api/therapist/session-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: activeSession.id,
          ...assessmentForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete session assessment.');
      }

      await fetchData({ preserveSelection: true });
      setAssessmentForm(createEmptyAssessmentForm());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete session assessment.');
    } finally {
      setSavingAssessment(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-slate-900">
      <div className="fixed top-0 left-0 right-0 border-b border-slate-200 bg-[#F6F6F3]/90 backdrop-blur-xl z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 overflow-x-auto">
            <span className="text-[12px] font-bold uppercase tracking-[0.25em] text-slate-900 whitespace-nowrap">
              Therapist Workspace
            </span>
            <nav className="flex items-center gap-2">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'clients', label: 'Client Records' },
                { id: 'upcoming', label: 'Upcoming Sessions' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id as 'overview' | 'clients' | 'upcoming')}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-[0.18em] transition-colors ${
                    tab === item.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <LogoutButton className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 hover:text-slate-900 transition-colors">
            <LogOut size={14} />
            Logout
          </LogoutButton>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400 mb-4">
              Session Documentation Flow
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
              Track assigned clients, complete sessions, and log therapist assessments.
            </h1>
          </div>
          <div className="w-full md:w-[320px]">
            <label className="relative block">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search assigned clients"
                className="w-full rounded-full border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </label>
          </div>
        </header>

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {tab === 'overview' && (
          <div className="space-y-10">
            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
              <MetricCard
                label="Assigned Clients"
                value={overview?.totalClients ?? 0}
                hint="Clients currently mapped to this therapist."
                icon={UserSquare2}
              />
              <MetricCard
                label="Upcoming Sessions"
                value={overview?.upcomingSessions ?? 0}
                hint="Future confirmed sessions on the calendar."
                icon={Calendar}
              />
              <MetricCard
                label="Completed Sessions"
                value={overview?.completedSessions ?? 0}
                hint="Sessions already marked completed."
                icon={CheckCircle2}
              />
              <MetricCard
                label="Pending Documentation"
                value={overview?.pendingDocumentation ?? 0}
                hint="Completed sessions missing therapist assessment data."
                icon={FileText}
              />
              <MetricCard
                label="Average Score"
                value={overview?.averageScore !== null && overview?.averageScore !== undefined ? Math.round(overview.averageScore) : '—'}
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
                  {filteredClients.map((client) => (
                    <OverviewCard
                      key={client.userId}
                      client={client}
                      selected={selectedClientId === client.userId}
                      onSelect={() => {
                        setSelectedClientId(client.userId);
                        setTab('clients');
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
                  No assigned clients match this search.
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'clients' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <aside className="xl:col-span-4 space-y-5">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Roster</p>
                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {filteredClients.map((client) => (
                    <button
                      key={client.userId}
                      type="button"
                      onClick={() => setSelectedClientId(client.userId)}
                      className={`w-full text-left rounded-[1.5rem] border p-4 transition-all ${
                        selectedClientId === client.userId
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{client.fullName}</p>
                          <p className={`text-xs mt-1 ${selectedClientId === client.userId ? 'text-slate-300' : 'text-slate-500'}`}>
                            {client.email}
                          </p>
                        </div>
                        <span className={`text-sm font-bold ${selectedClientId === client.userId ? 'text-white' : scoreTone(client.averageScore)}`}>
                          {client.averageScore !== null ? Math.round(client.averageScore) : '—'}
                        </span>
                      </div>
                      <div className={`mt-4 flex items-center justify-between text-xs ${selectedClientId === client.userId ? 'text-slate-300' : 'text-slate-500'}`}>
                        <span>{client.program.completedSessions} completed</span>
                        <span>{client.program.remainingSessions} remaining</span>
                      </div>
                    </button>
                  ))}
                  {filteredClients.length === 0 && (
                    <p className="text-sm text-slate-400">No assigned clients match this search.</p>
                  )}
                </div>
              </div>
            </aside>

            <section className="xl:col-span-8">
              {selectedClient ? (
                <div className="space-y-8">
                  <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">Client Record</p>
                        <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{selectedClient.fullName}</h2>
                        <p className="text-slate-500 mt-2">{selectedClient.email}</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 min-w-0">
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Average</p>
                          <p className={`text-2xl font-semibold mt-2 ${scoreTone(selectedClient.averageScore)}`}>
                            {selectedClient.averageScore !== null ? Math.round(selectedClient.averageScore) : '—'}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Completed</p>
                          <p className="text-2xl font-semibold mt-2">{selectedClient.program.completedSessions}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Remaining</p>
                          <p className="text-2xl font-semibold mt-2">{selectedClient.program.remainingSessions}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Next Session</p>
                          <p className="text-sm font-semibold mt-2">
                            {selectedClient.nextSession ? fmtDate(selectedClient.nextSession.date) : 'Not scheduled'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                      <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Initial Severity</p>
                        <p className="text-sm font-semibold mt-2">{selectedClient.initialAssessment?.severityBand || 'Not recorded'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Nervous System</p>
                        <p className="text-sm font-semibold mt-2">{selectedClient.initialAssessment?.nervousSystemType || 'Not recorded'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Primary Phase</p>
                        <p className="text-sm font-semibold mt-2">{selectedClient.initialAssessment?.recommendedPhase || 'Not recorded'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-100 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Initial Assessment</p>
                        <p className="text-sm font-semibold mt-2">{formatAssessmentDate(selectedClient.initialAssessment?.assessmentDate ?? null)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Therapist Overview Note</p>
                        <button
                          type="button"
                          onClick={saveOverviewNotes}
                          disabled={savingOverviewNote}
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          <Save size={13} />
                          {savingOverviewNote ? 'Saving' : 'Save Note'}
                        </button>
                      </div>
                      <textarea
                        value={overviewNote}
                        onChange={(e) => setOverviewNote(e.target.value)}
                        rows={8}
                        placeholder="Ongoing therapist overview for this client."
                        className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                      />
                    </div>

                    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-6">Latest Score Snapshot</p>
                      {selectedClient.latestAssessment ? (
                        <>
                          <div className="flex items-end gap-3 mb-4">
                            <span className={`text-5xl font-semibold tracking-tight ${scoreTone(selectedClient.latestAssessment.overallScore)}`}>
                              {Math.round(selectedClient.latestAssessment.overallScore)}
                            </span>
                            <span className="text-sm text-slate-500 mb-2">
                              recorded {formatAssessmentDate(selectedClient.latestAssessment.createdAt)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <DomainLine label="Nervous System" value={selectedClient.latestAssessment.nervousSystemScore} />
                            <DomainLine label="Emotional Patterns" value={selectedClient.latestAssessment.emotionalPatternScore} />
                            <DomainLine label="Family Imprint" value={selectedClient.latestAssessment.familyImprintScore} />
                            <DomainLine label="Incident Load" value={selectedClient.latestAssessment.incidentLoadScore} />
                            <DomainLine label="Body Symptoms" value={selectedClient.latestAssessment.bodySymptomScore} />
                            <DomainLine label="Current Stress" value={selectedClient.latestAssessment.currentStressScore} />
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400">
                          No therapist session assessment has been recorded for this client yet.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Session Timeline</p>
                        <p className="text-sm text-slate-500">
                          Complete a confirmed session to open the post-session therapist assessment workflow.
                        </p>
                      </div>
                      {selectedClient.nextSession && (
                        <div className="rounded-full bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                          Next session: {fmtDate(selectedClient.nextSession.date)} · {fmtTime(selectedClient.nextSession.time)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {selectedClient.sessions.map((session) => (
                        <div key={session.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <p className="text-lg font-semibold text-slate-900">
                                  {session.sessionNumber ? `Session ${session.sessionNumber}` : 'Session'}
                                </p>
                                <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${statusTone(session.status)}`}>
                                  {session.status}
                                </span>
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
                                <a
                                  href={session.meetingLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                                >
                                  <Video size={14} />
                                  Join Room
                                </a>
                              )}
                              {session.canComplete && (
                                <button
                                  type="button"
                                  onClick={() => setActiveSessionId(session.id)}
                                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] ${
                                    activeSessionId === session.id
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  }`}
                                >
                                  <CheckCircle2 size={14} />
                                  Complete Session
                                </button>
                              )}
                            </div>
                          </div>

                          {session.assessment ? (
                            <div className="mt-5 rounded-[1.25rem] bg-slate-50 p-5">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                                <p className="text-sm font-semibold text-slate-900">
                                  Therapist score: {Math.round(session.assessment.overallScore)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Logged {formatAssessmentDate(session.assessment.createdAt)}
                                </p>
                              </div>
                              {session.assessment.therapistNotes && (
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">{session.assessment.therapistNotes}</p>
                              )}
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-600">
                                <div>Nervous System: {Math.round(session.assessment.nervousSystemScore)}</div>
                                <div>Emotional: {Math.round(session.assessment.emotionalPatternScore)}</div>
                                <div>Family: {Math.round(session.assessment.familyImprintScore)}</div>
                                <div>Incident: {Math.round(session.assessment.incidentLoadScore)}</div>
                                <div>Body: {Math.round(session.assessment.bodySymptomScore)}</div>
                                <div>Stress: {Math.round(session.assessment.currentStressScore)}</div>
                              </div>
                              {(session.assessment.pdfUrl || session.assessment.videoUrl) && (
                                <div className="flex flex-wrap gap-3 mt-4">
                                  {session.assessment.pdfUrl && (
                                    <a
                                      href={session.assessment.pdfUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                      <FileText size={15} />
                                      PDF resource
                                    </a>
                                  )}
                                  {session.assessment.videoUrl && (
                                    <a
                                      href={session.assessment.videoUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                                    >
                                      <Video size={15} />
                                      Video resource
                                    </a>
                                  )}
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

                  <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Post-Session Completion</p>
                        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                          {activeSession
                            ? `${activeSession.sessionNumber ? `Session ${activeSession.sessionNumber}` : 'Selected Session'} completion form`
                            : 'Choose a confirmed session to complete'}
                        </h3>
                      </div>
                      {activeSession && (
                        <div className="rounded-full bg-slate-100 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
                          {fmtDate(activeSession.date)} · {fmtTime(activeSession.time)}
                        </div>
                      )}
                    </div>

                    {activeSession ? (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {[
                            ['nervous_system_score', 'Nervous System'],
                            ['emotional_pattern_score', 'Emotional Patterns'],
                            ['family_imprint_score', 'Family Imprint'],
                            ['incident_load_score', 'Incident Load'],
                            ['body_symptom_score', 'Body Symptoms'],
                            ['current_stress_score', 'Current Stress'],
                          ].map(([field, label]) => (
                            <label key={field} className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
                              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">
                                {label}
                              </span>
                              <input
                                type="number"
                                min={0}
                                max={10}
                                step="0.1"
                                value={assessmentForm[field as keyof AssessmentFormState] as number}
                                onChange={(e) =>
                                  setAssessmentForm((prev) => ({
                                    ...prev,
                                    [field]: Number(e.target.value),
                                  }))
                                }
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                              />
                            </label>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <textarea
                            value={assessmentForm.therapist_notes}
                            onChange={(e) =>
                              setAssessmentForm((prev) => ({ ...prev, therapist_notes: e.target.value }))
                            }
                            rows={6}
                            placeholder="Therapist notes for this session."
                            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                          <textarea
                            value={assessmentForm.observations}
                            onChange={(e) =>
                              setAssessmentForm((prev) => ({ ...prev, observations: e.target.value }))
                            }
                            rows={6}
                            placeholder="Observed patterns, behaviors, and regulation markers."
                            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                          <textarea
                            value={assessmentForm.recommendations}
                            onChange={(e) =>
                              setAssessmentForm((prev) => ({ ...prev, recommendations: e.target.value }))
                            }
                            rows={6}
                            placeholder="Recommendations, homework, and next-session direction."
                            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="rounded-[1.5rem] border border-slate-200 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Attach PDF Resource</p>
                            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50 cursor-pointer">
                              <Upload size={14} />
                              {uploadingPdf ? 'Uploading...' : 'Upload PDF'}
                              <input
                                type="file"
                                accept="application/pdf"
                                className="hidden"
                                disabled={uploadingPdf}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    void uploadResource('pdf', file);
                                  }
                                  e.currentTarget.value = '';
                                }}
                              />
                            </label>
                            <p className="text-xs text-slate-400 mt-3">PDF files up to 15MB.</p>
                            {assessmentForm.resource_pdf_url && (
                              <a
                                href={assessmentForm.resource_pdf_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                <FileText size={15} />
                                View uploaded PDF
                              </a>
                            )}
                          </div>

                          <div className="rounded-[1.5rem] border border-slate-200 p-5">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Attach Video Resource</p>
                            <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50 cursor-pointer">
                              <Upload size={14} />
                              {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                disabled={uploadingVideo}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    void uploadResource('video', file);
                                  }
                                  e.currentTarget.value = '';
                                }}
                              />
                            </label>
                            <p className="text-xs text-slate-400 mt-3">Video files up to 100MB.</p>
                            {assessmentForm.resource_mp4_url && (
                              <a
                                href={assessmentForm.resource_mp4_url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                              >
                                <Video size={15} />
                                View uploaded video
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
                          <p className="text-sm text-slate-500">
                            Saving this form marks the selected session as completed and stores the therapist assessment for the client record.
                          </p>
                          <button
                            type="button"
                            onClick={submitSessionAssessment}
                            disabled={savingAssessment || uploadingPdf || uploadingVideo}
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800 disabled:opacity-50"
                          >
                            <Zap size={14} />
                            {savingAssessment ? 'Completing Session...' : 'Mark Session Completed'}
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
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-24 text-center text-slate-400">
                  Select an assigned client to open the record workspace.
                </div>
              )}
            </section>
          </div>
        )}

        {tab === 'upcoming' && (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Upcoming Sessions</p>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Confirmed sessions waiting to happen
                </h2>
              </div>
              <p className="text-sm text-slate-500">{allUpcomingSessions.length} sessions</p>
            </div>

            <div className="space-y-4">
              {allUpcomingSessions.map((session) => (
                <div key={session.id} className="rounded-[1.5rem] border border-slate-200 p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{session.clientName}</p>
                      <p className="text-sm text-slate-500 mt-2">
                        {fmtDateLong(session.date)} at {fmtTime(session.time)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClientId(session.clientId);
                          setActiveSessionId(session.id);
                          setTab('clients');
                        }}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 hover:bg-slate-50"
                      >
                        <UserSquare2 size={14} />
                        Open Client Record
                      </button>
                      {session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-slate-800"
                        >
                          <Video size={14} />
                          Join Room
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
      </main>
    </div>
  );
}
