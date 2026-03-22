'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import LogoutButton from '@/components/ui/LogoutButton';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { supabase } from '@/lib/supabase/client';
import { 
  Calendar, 
  Activity, 
  Clock,
  User,
  Zap,
  FileText,
  Video,
  ArrowRight,
  LogOut
} from 'lucide-react';

// --- Simplified Helpers ---
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric',
  });
}

function fmtTime(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-slate-900 transition-all duration-1000" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

function DashboardContent() {
  const [firstName, setFirstName] = useState('User');
  const [program, setProgram] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [sessionProgress, setSessionProgress] = useState<any[]>([]);
  const [averageSessionScore, setAverageSessionScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
        if (profile?.full_name) setFirstName(profile.full_name.split(' ')[0]);

        const { data: programs } = await supabase.from('programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1);
        if (programs?.length) setProgram(programs[0]);

        const { data: assessments } = await supabase.from('assessments').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(1);
        if (assessments?.length) setAssessment(assessments[0]);

        const { data: allBookings } = await supabase.from('bookings').select('*').eq('user_id', user.id).order('date', { ascending: false });
        setBookings(allBookings ?? []);

        const progressRes = await fetch('/api/users/session-progress');
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          setSessionProgress(progressData.timeline ?? []);
          setAverageSessionScore(progressData.averageScore ?? null);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.date) >= now).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextSession = upcoming[0];
  const usedPct = program ? Math.round((program.used_sessions / program.total_sessions) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-bold text-slate-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FBFBFC] text-slate-900">
      <div className="max-w-[1100px] mx-auto px-6 pt-32 pb-24">
        
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {firstName}</h1>
            <p className="text-slate-500 mt-1">Here is a summary of your journey.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/assessment" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors">
              <Activity size={16} /> View Progress
            </Link>
            <Link href="/booking/schedule-session" className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors">
              <Calendar size={16} /> Book Session
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Next Session Card */}
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Session</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase">Confirmed</span>
              </div>

              {nextSession ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl font-bold">{fmtDate(nextSession.date)}</h2>
                    <div className="flex items-center gap-6 mt-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-2"><Clock size={16} /> {fmtTime(nextSession.time)}</div>
                      <div className="flex items-center gap-2"><User size={16} /> {nextSession.therapist_name || 'Dr. Fawzia'}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    {nextSession.meeting_link && (
                      <Link href={nextSession.meeting_link} className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-800">
                        Join Call
                      </Link>
                    )}
                    <Link href={`/booking/schedule-session?reschedule=${nextSession.id}`} className="px-6 py-3 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50">
                      Reschedule
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-medium">No sessions scheduled.</p>
              )}
            </section>

            {/* Progress Card */}
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center justify-between mb-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Your Progress</span>
                <span className="text-xs font-bold text-slate-900">{program?.program_type === 'group' ? 'Group Circle' : 'Private Direct'}</span>
              </div>

              {program ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div>
                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-5xl font-bold tracking-tighter">{usedPct}%</span>
                      <span className="text-slate-400 font-bold mb-1">Complete</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500">{program.used_sessions} of {program.total_sessions} sessions finished</p>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Current Focus</p>
                      <p className="text-lg font-bold">{assessment?.recommended_phase_primary || 'Stabilization'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 font-medium">Enroll in a program to see your progress.</p>
              )}
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* Health Scores Card */}
            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Health Scores</h2>
              
              {assessment ? (
                <div className="space-y-6">
                  {averageSessionScore !== null && (
                    <div className="pb-6 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Average Session Score</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{Math.round(averageSessionScore)}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase">Across completed sessions</span>
                      </div>
                    </div>
                  )}
                  <div className="pb-6 border-b border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Overall Score</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">{Math.round(assessment.overall_dysregulation_score)}</span>
                      <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded uppercase">{assessment.overall_severity_band}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ProgressLine label="Nervous System" value={assessment.nervous_system_score} />
                    <ProgressLine label="Emotional state" value={assessment.emotional_pattern_score} />
                    <ProgressLine label="Current Stress" value={assessment.current_stress_score} />
                  </div>

                  <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white">
                    <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-widest">
                      <Zap size={14} className="text-yellow-400 fill-current" /> Advice
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Focus on {assessment.recommended_phase_primary} this week to help stabilize your system.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-medium">No scores found.</p>
              )}
            </section>

            <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">Session Clinical Records</h2>
              <div className="space-y-5">
                {sessionProgress
                  .filter((row) => row.sessionAssessment)
                  .slice(0, 6)
                  .map((row) => (
                    <div key={row.booking.id} className="border border-slate-100 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                          {fmtDate(row.booking.date)} • {fmtTime(row.booking.time)}
                        </p>
                        <span className="text-sm font-bold text-slate-900">
                          Score {Math.round(row.sessionAssessment.overall_dysregulation_score)}
                        </span>
                      </div>
                      {row.sessionAssessment.therapist_notes && (
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{row.sessionAssessment.therapist_notes}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs">
                        {row.sessionAssessment.resource_pdf_url && (
                          <a href={row.sessionAssessment.resource_pdf_url} target="_blank" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800">
                            <FileText size={14} /> PDF
                          </a>
                        )}
                        {row.sessionAssessment.resource_mp4_url && (
                          <a href={row.sessionAssessment.resource_mp4_url} target="_blank" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800">
                            <Video size={14} /> MP4
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                {!sessionProgress.some((row) => row.sessionAssessment) && (
                  <p className="text-sm text-slate-400">Your therapist will add session scores and notes here after each session.</p>
                )}
              </div>
            </section>

            {/* Logout */}
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