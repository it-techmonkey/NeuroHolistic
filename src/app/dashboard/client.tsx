'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/ui/LogoutButton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import {
  Calendar,
  Clock,
  FileText,
  LogOut,
  User,
  Video,
  Zap,
} from 'lucide-react';

type SessionAssessment = {
  id: string;
  overall_dysregulation_score: number;
  nervous_system_score: number;
  emotional_pattern_score: number;
  family_imprint_score: number;
  incident_load_score: number;
  body_symptom_score: number;
  current_stress_score: number;
  therapist_notes: string | null;
  observations: string | null;
  recommendations: string | null;
  resource_pdf_url: string | null;
  resource_mp4_url: string | null;
  created_at: string;
};

type TimelineRow = {
  booking: {
    id: string;
    date: string;
    time: string;
    type: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    therapist_name: string | null;
    meeting_link: string | null;
  };
  sessionAssessment: SessionAssessment | null;
};

type DashboardData = {
  averageScore: number | null;
  latestAssessment: SessionAssessment | null;
  nextUpcomingBooking: {
    id: string;
    date: string;
    time: string;
    therapist_name: string | null;
    meeting_link: string | null;
    sessionNumber: number | null;
  } | null;
  summary: {
    totalSessions: number | null;
    usedSessions: number;
    completedSessions: number;
    scheduledSessions: number;
    remainingSessions: number | null;
    canScheduleNextSession: boolean;
    nextSchedulableSessionNumber: number | null;
    programType: 'private' | 'group' | null;
  };
  timeline: TimelineRow[];
};

function fmtDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  });
}

function fmtTime(time: string) {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function DashboardContent() {
  const [firstName, setFirstName] = useState('User');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const [{ data: profile }, progressRes] = await Promise.all([
          supabase.from('users').select('full_name').eq('id', user.id).single(),
          fetch('/api/users/session-progress'),
        ]);

        if (profile?.full_name) {
          setFirstName(profile.full_name.split(' ')[0]);
        }

        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setData(progressData);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bold text-slate-400">
        Loading...
      </div>
    );
  }

  const summary = data?.summary;
  const nextSession = data?.nextUpcomingBooking ?? null;
  const latestAssessment = data?.latestAssessment ?? null;
  const completedSessions = (data?.timeline ?? []).filter((row) => row.booking.status === 'completed');
  const totalSessions = summary?.totalSessions ?? 0;
  const completedCount = summary?.completedSessions ?? 0;
  const completionPct = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;
  const programLabel =
    summary?.programType === 'group'
      ? 'Group Program'
      : summary?.programType === 'private'
        ? 'Private Program'
        : 'Program';
  const guidance =
    latestAssessment?.recommendations ||
    latestAssessment?.therapist_notes ||
    latestAssessment?.observations ||
    'Your therapist will add notes and resources here as completed sessions are reviewed.';

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900">
      <div className="max-w-[1100px] mx-auto px-6 pt-32 pb-24">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}</h1>
            <p className="text-slate-500 mt-1">Track completed sessions, therapist notes, and your next booking.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="#session-history"
              className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              View Session History
            </Link>
            {nextSession ? (
              <Link
                href={`/booking/schedule-session?reschedule=${nextSession.id}`}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <Calendar size={16} /> Manage Next Session
              </Link>
            ) : summary?.canScheduleNextSession ? (
              <Link
                href="/booking/schedule-session"
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors"
              >
                <Calendar size={16} /> Schedule Next Session
              </Link>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Session</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                  {nextSession ? 'Confirmed' : 'Not Scheduled'}
                </span>
              </div>

              {nextSession ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl font-bold">{fmtDate(nextSession.date)}</h2>
                    <div className="flex flex-wrap items-center gap-6 mt-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <Clock size={16} /> {fmtTime(nextSession.time)}
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={16} /> {nextSession.therapist_name || 'Assigned Therapist'}
                      </div>
                    </div>
                    {nextSession.sessionNumber && (
                      <p className="text-sm text-slate-500 mt-4">This is Session {nextSession.sessionNumber} in your program.</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {nextSession.meeting_link && (
                      <Link
                        href={nextSession.meeting_link}
                        className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800"
                      >
                        Join Call
                      </Link>
                    )}
                    <Link
                      href={`/booking/schedule-session?reschedule=${nextSession.id}`}
                      className="px-6 py-3 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50"
                    >
                      Reschedule
                    </Link>
                  </div>
                </div>
              ) : summary?.canScheduleNextSession ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl font-bold">Ready to Schedule</h2>
                    <p className="text-slate-500 mt-3">
                      Session {summary.nextSchedulableSessionNumber} is the next session available to book.
                    </p>
                  </div>
                  <Link
                    href="/booking/schedule-session"
                    className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800 text-center"
                  >
                    Schedule Session
                  </Link>
                </div>
              ) : summary?.remainingSessions === 0 ? (
                <p className="text-slate-500 font-medium">All sessions in your current program have already been allocated.</p>
              ) : (
                <p className="text-slate-500 font-medium">
                  Your next session becomes bookable only when there is no other future session currently scheduled.
                </p>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Progress Across Sessions</span>
                <span className="text-xs font-bold text-slate-900">{programLabel}</span>
              </div>

              {totalSessions > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-bold tracking-tighter">{completionPct}%</span>
                      <span className="text-slate-400 font-bold mb-1">Completed</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500">
                      {completedCount} of {totalSessions} sessions completed
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Current Scheduling Status</p>
                      <p className="text-lg font-bold">
                        {nextSession
                          ? 'Next session scheduled'
                          : summary?.canScheduleNextSession
                            ? 'Next session ready to book'
                            : 'Awaiting therapist update'}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Remaining Sessions</p>
                      <p className="text-lg font-bold">{summary?.remainingSessions ?? 0}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-medium">Enroll in a program to see your session progress.</p>
              )}
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-8">
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
                Therapist Session Scores
              </h2>

              {latestAssessment ? (
                <div className="space-y-6">
                  {data?.averageScore !== null && data?.averageScore !== undefined && (
                    <div className="pb-6 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Average Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{Math.round(data.averageScore)}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">Across completed sessions</span>
                      </div>
                    </div>
                  )}

                  <div className="pb-6 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Latest Therapist Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{Math.round(latestAssessment.overall_dysregulation_score)}</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">
                        {new Date(latestAssessment.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ProgressLine label="Nervous System" value={latestAssessment.nervous_system_score} />
                    <ProgressLine label="Emotional State" value={latestAssessment.emotional_pattern_score} />
                    <ProgressLine label="Current Stress" value={latestAssessment.current_stress_score} />
                  </div>

                  <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest">
                      <Zap size={14} className="text-yellow-400 fill-current" /> Therapist Guidance
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{guidance}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium">
                  Completed-session scores will appear here after your therapist records them.
                </p>
              )}
            </section>

            <section
              id="session-history"
              className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm scroll-mt-32"
            >
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
                Completed Session Records
              </h2>
              <div className="space-y-5">
                {completedSessions.map((row) => (
                  <div key={row.booking.id} className="border border-slate-100 rounded-2xl p-4">
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {fmtDate(row.booking.date)} • {fmtTime(row.booking.time)}
                      </p>
                      <span className="text-sm font-bold text-slate-900">
                        {row.sessionAssessment
                          ? `Score ${Math.round(row.sessionAssessment.overall_dysregulation_score)}`
                          : 'Assessment pending'}
                      </span>
                    </div>

                    {row.sessionAssessment?.therapist_notes ? (
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">{row.sessionAssessment.therapist_notes}</p>
                    ) : (
                      <p className="text-sm text-slate-400 mb-3">
                        Your therapist has not added notes for this completed session yet.
                      </p>
                    )}

                    {(row.sessionAssessment?.resource_pdf_url || row.sessionAssessment?.resource_mp4_url) && (
                      <div className="flex items-center gap-3 text-xs">
                        {row.sessionAssessment?.resource_pdf_url && (
                          <a
                            href={row.sessionAssessment.resource_pdf_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
                          >
                            <FileText size={14} /> PDF
                          </a>
                        )}
                        {row.sessionAssessment?.resource_mp4_url && (
                          <a
                            href={row.sessionAssessment.resource_mp4_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800"
                          >
                            <Video size={14} /> Video
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {completedSessions.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Completed sessions and therapist materials will appear here as they are finished.
                  </p>
                )}
              </div>
            </section>

            <div className="px-4">
              <LogoutButton className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors">
                <LogOut size={14} /> Sign Out
              </LogoutButton>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
