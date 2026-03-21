'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LogoutButton from '@/components/ui/LogoutButton';
import { 
  Users, 
  Calendar, 
  Activity, 
  ChevronRight, 
  Video, 
  FileText, 
  CheckCircle2, 
  Clock,
  Zap,
  ArrowUpRight,
  LogOut
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Client {
  userId: string | null;
  email: string;
  fullName: string;
  assessmentScore: number | null;
  severityBand: string | null;
  nervousSystemType: string | null;
  primaryWound: string | null;
  recommendedPhase: string | null;
  programStatus: string | null;
  sessionsUsed: number;
  totalSessions: number;
  upcomingDate: string | null;
  upcomingTime: string | null;
  meetingLink: string | null;
  nervousSystemScore: number | null;
  emotionalScore: number | null;
  familyScore: number | null;
  incidentScore: number | null;
  bodyScore: number | null;
  stressScore: number | null;
  allBookings: Booking[];
  therapistNotes: string | null;
  assessmentDate: string | null;
}

interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  meeting_link: string | null;
  type: string;
}

interface Overview {
  totalClients: number;
  completedSessions: number;
  upcomingToday: number;
  pendingAssessments: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });
}

function fmtTime(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function SeverityDot({ band }: { band: string | null }) {
  const colors: Record<string, string> = {
    'Mild': 'bg-emerald-500',
    'Moderate': 'bg-amber-500',
    'Significant': 'bg-orange-500',
    'High': 'bg-red-500',
    'Very High': 'bg-red-700',
  };
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${colors[band ?? ''] || 'bg-slate-300'}`} />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{band}</span>
    </div>
  );
}

function DomainLine({ label, value }: { label: string; value: number | null }) {
  const v = value ?? 0;
  return (
    <div className="py-2.5">
      <div className="flex justify-between text-[12px] mb-1.5">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="font-bold text-slate-900 tabular-nums">{Math.round(v)}</span>
      </div>
      <div className="h-[2px] w-full bg-slate-100">
        <div 
          className="h-full bg-slate-900 transition-all duration-700" 
          style={{ width: `${Math.min(100, v)}%` }} 
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TherapistDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<'overview' | 'clients' | 'schedule'>('overview');
  const [clients, setClients] = useState<Client[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [selected, setSelected] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/therapist/clients');
      if (res.status === 401) { router.push('/auth/login'); return; }
      if (res.status === 403) { router.push('/dashboard'); return; }
      if (!res.ok) throw new Error('Failed to load data');
      const data = await res.json();
      setClients(data.clients ?? []);
      setOverview(data.overview ?? null);
      if ((data.clients ?? []).length > 0 && !selected) {
        setSelected(data.clients[0]);
        setNoteText(data.clients[0].therapistNotes ?? '');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [router, selected]);

  useEffect(() => { fetchData(); }, []); 

  async function saveNote() {
    if (!selected) return;
    setSavingNote(true);
    await fetch('/api/therapist/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: selected.email, notes: noteText }),
    });
    setSavingNote(false);
    setClients(prev => prev.map(c => c.email === selected.email ? { ...c, therapistNotes: noteText } : c));
    setSelected(prev => prev ? { ...prev, therapistNotes: noteText } : null);
  }

  const allUpcoming = clients.flatMap(c => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return c.allBookings
      .filter(b => b.status === 'confirmed' && new Date(b.date) >= today)
      .map(b => ({ ...b, clientName: c.fullName, clientEmail: c.email }))
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-50">
      {/* Editorial Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-8 overflow-hidden">
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-900 whitespace-nowrap hidden md:inline">Therapist Portal</span>
            <span className="text-[13px] font-bold uppercase tracking-[0.2em] text-slate-900 whitespace-nowrap md:hidden">Portal</span>
            <nav className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar mask-linear-fade pr-4">
              {['overview', 'clients', 'schedule'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTab(t as any)}
                  className={`text-[12px] font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${tab === t ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4 md:gap-6 shrink-0">
            <div className="text-[11px] font-medium text-slate-400 hidden md:block">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
            </div>
            <LogoutButton className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest">
              <LogOut size={13} strokeWidth={1.5} />
              <span className="hidden sm:inline">Logout</span>
            </LogoutButton>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        
        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <div className="space-y-24">
            <header>
              <h1 className="text-4xl font-light tracking-tight">Practice <span className="font-semibold">Intelligence</span></h1>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12 border-y border-slate-100">
              {[
                { label: 'Active Roster', val: overview?.totalClients ?? clients.length, icon: Users },
                { label: 'Completed', val: overview?.completedSessions ?? 0, icon: CheckCircle2 },
                { label: 'Upcoming', val: allUpcoming.length, icon: Calendar },
                { label: 'Assessments', val: clients.filter(c => c.assessmentScore !== null).length, icon: Activity },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-light">{val}</span>
                    <Icon size={16} className="text-slate-300" />
                  </div>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Client Directory</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                      <th className="pb-4 font-bold">Client Name</th>
                      <th className="pb-4 font-bold">Clinical Status</th>
                      <th className="pb-4 font-bold">Progress</th>
                      <th className="pb-4 text-right font-bold">Dossier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {clients.map(c => (
                      <tr key={c.email} className="group hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => { setSelected(c); setNoteText(c.therapistNotes ?? ''); setTab('clients'); }}>
                        <td className="py-5">
                          <p className="text-[15px] font-semibold text-slate-900">{c.fullName}</p>
                          <p className="text-xs text-slate-400">{c.email}</p>
                        </td>
                        <td className="py-5">
                          <SeverityDot band={c.severityBand} />
                        </td>
                        <td className="py-5">
                          <span className="text-xs font-medium text-slate-600">{c.sessionsUsed} / {c.totalSessions} sessions</span>
                        </td>
                        <td className="py-5 text-right">
                          <ArrowUpRight size={16} className="inline text-slate-300 group-hover:text-indigo-600 transition-colors" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {/* ── CLIENTS TAB (Dossier View) ── */}
        {tab === 'clients' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Minimal Sidebar List */}
            <div className="lg:col-span-4 space-y-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Roster</h2>
              <div className="space-y-1">
                {clients.map(c => (
                  <button 
                    key={c.email} 
                    onClick={() => { setSelected(c); setNoteText(c.therapistNotes ?? ''); }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${selected?.email === c.email ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                  >
                    <p className="text-[14px] font-bold">{c.fullName}</p>
                    <p className="text-[11px] opacity-60 font-medium">{c.severityBand || 'New'}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Dossier Area */}
            {selected ? (
              <div className="lg:col-span-8 space-y-20">
                <header className="pb-10 border-b border-slate-100">
                  <SeverityDot band={selected.severityBand} />
                  <h1 className="text-4xl font-bold tracking-tight mt-4">{selected.fullName}</h1>
                  <p className="text-slate-500 mt-2 font-medium">{selected.email}</p>
                  
                  <div className="grid grid-cols-3 gap-8 mt-12">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nervous System</p>
                      <p className="text-sm font-bold text-slate-700">{selected.nervousSystemType || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Phase</p>
                      <p className="text-sm font-bold text-indigo-600">{selected.recommendedPhase || 'TBD'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Utilization</p>
                      <p className="text-sm font-bold text-slate-700">{selected.sessionsUsed} / {selected.totalSessions}</p>
                    </div>
                  </div>
                </header>

                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Clinical Domain Scores</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    <DomainLine label="Nervous System" value={selected.nervousSystemScore} />
                    <DomainLine label="Emotional Patterns" value={selected.emotionalScore} />
                    <DomainLine label="Family Imprint" value={selected.familyScore} />
                    <DomainLine label="Incident Load" value={selected.incidentScore} />
                    <DomainLine label="Body Symptoms" value={selected.bodyScore} />
                    <DomainLine label="Current Stress" value={selected.stressScore} />
                  </div>
                </section>

                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Clinical Progress Notes</h2>
                  <textarea
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    rows={6}
                    placeholder="Enter private observations..."
                    className="w-full text-[15px] leading-relaxed text-slate-700 bg-slate-50 rounded-2xl p-6 border-none focus:ring-1 focus:ring-slate-200 transition-all placeholder:text-slate-300"
                  />
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={saveNote} 
                      disabled={savingNote}
                      className="px-6 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 disabled:opacity-30 transition-all"
                    >
                      {savingNote ? 'Syncing...' : 'Save Dossier'}
                    </button>
                  </div>
                </section>

                <section>
                  <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Engagement History</h2>
                  <div className="space-y-1">
                    {selected.allBookings.map(b => (
                      <div key={b.id} className="flex items-center justify-between py-4 border-b border-slate-50">
                        <div>
                          <p className="text-[14px] font-bold text-slate-900">{fmtDate(b.date)} at {fmtTime(b.time)}</p>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{b.type.replace(/_/g,' ')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{b.status}</span>
                          {b.meeting_link && (
                            <a href={b.meeting_link} target="_blank" className="text-indigo-600 hover:text-indigo-800 transition-colors"><Video size={18} strokeWidth={1.5} /></a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : (
              <div className="lg:col-span-8 flex items-center justify-center py-40 border border-dashed border-slate-100 rounded-[40px]">
                <p className="text-slate-300 font-medium italic">Select a client to open dossier</p>
              </div>
            )}
          </div>
        )}

        {/* ── SCHEDULE TAB ── */}
        {tab === 'schedule' && (
          <div className="max-w-3xl">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-12">Upcoming Clinical Engagements</h2>
            <div className="space-y-8">
              {allUpcoming.map(b => (
                <div key={b.id} className="flex items-start gap-12 pb-8 border-b border-slate-100 group">
                  <div className="w-20 pt-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{new Date(b.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' })}</p>
                    <p className="text-3xl font-light">{new Date(b.date + 'T00:00:00').getDate()}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xl font-bold text-slate-900">{(b as any).clientName}</p>
                    <div className="flex items-center gap-4 mt-2 text-slate-500">
                      <div className="flex items-center gap-1.5"><Clock size={14} /> <span className="text-sm font-medium">{fmtTime(b.time)}</span></div>
                      <div className="flex items-center gap-1.5"><FileText size={14} /> <span className="text-sm font-medium uppercase tracking-wider text-[11px]">{b.type.replace(/_/g,' ')}</span></div>
                    </div>
                  </div>
                  {b.meeting_link && (
                    <a href={b.meeting_link} target="_blank" className="px-5 py-2.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all flex items-center gap-2">
                      <Video size={14} /> Join Room
                    </a>
                  )}
                </div>
              ))}
              {allUpcoming.length === 0 && (
                <p className="py-20 text-center text-slate-300 italic">No scheduled appointments found.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}