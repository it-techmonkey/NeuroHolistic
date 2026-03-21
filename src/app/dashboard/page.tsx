import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';
import Link from 'next/link';
import FadeIn from '@/components/ui/FadeIn';
import LogoutButton from '@/components/ui/LogoutButton';
import { 
  Calendar, 
  Clock, 
  Activity, 
  Target, 
  ChevronRight,
  TrendingUp,
  User,
  Zap,
  ArrowUpRight,
  LogOut
} from 'lucide-react';

export const metadata = {
  title: 'Dashboard — NeuroHolistic',
  description: 'Your personal wellness journey',
};

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

function fmtTime(t: string) {
  const [h, m] = t.split(':');
  const hr = parseInt(h);
  return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
}

// Clean text-based severity
function SeverityIndicator({ band }: { band: string }) {
  // Use opacity/weight instead of color for severity to maintain editorial look
  const styles: Record<string, string> = {
    'Mild': 'opacity-40',
    'Moderate': 'opacity-60',
    'Significant': 'opacity-80',
    'High': 'opacity-100 font-semibold',
  };
  
  return (
    <div className="flex items-center gap-2 border border-slate-200 px-3 py-1 rounded-full">
      <div className={`w-1.5 h-1.5 rounded-full bg-[#2B2F55] ${styles[band] || 'opacity-50'}`} />
      <span className="text-[10px] uppercase tracking-[0.1em] text-slate-900 font-medium">
        {band || 'Pending'}
      </span>
    </div>
  );
}

function ProgressLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="py-2 group">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
        <span className="text-sm font-mono text-slate-900">{Math.round(value)}%</span>
      </div>
      <div className="h-[1px] w-full bg-slate-100">
        <div 
          className="h-full bg-[#2B2F55] transition-all duration-1000 group-hover:h-[2px]" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('users').select('full_name').eq('id', user.id).single();
  const firstName = profile?.full_name?.split(' ')[0] || 'User';

  const [programsRes, assessmentsRes, bookingsRes] = await Promise.all([
    supabase.from('programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
    supabase.from('assessments').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false }).limit(1),
    supabase.from('bookings').select('*').eq('user_id', user.id).order('date', { ascending: false }),
  ]);

  const program = programsRes.data?.[0];
  const assessment = assessmentsRes.data?.[0];
  const bookings = bookingsRes.data ?? [];

  // Check if client has ever had a consultation
  const hasHadConsultation = bookings.some(b => b.type === 'consultation');
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const upcoming = bookings
    .filter(b => b.status === 'confirmed' && new Date(b.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextSession = upcoming[0];
  const usedPct = program ? Math.round((program.used_sessions / program.total_sessions) * 100) : 0;

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-indigo-50">
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
        
        {/* Header: Minimal & Content-Focused */}
        <header className="mb-20">
        <FadeIn className="space-y-8">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-tight">
                Good morning, <span className="font-medium">{firstName}</span>.
              </h1>
              <LogoutButton className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-medium text-slate-400 hover:text-slate-900 transition-colors">
                <LogOut size={14} strokeWidth={1.5} />
                Logout
              </LogoutButton>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <Link 
                href="/assessment" 
                className="group flex items-center gap-3 text-xs uppercase tracking-[0.15em] font-medium text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                  <Activity size={14} strokeWidth={1.5} />
                </span>
                Update Assessment
              </Link>
              <Link 
                href={hasHadConsultation && !program ? '/booking/payment-options' : hasHadConsultation ? '/booking/schedule-session' : '/booking/schedule-session'} 
                className="group flex items-center gap-3 text-xs uppercase tracking-[0.15em] font-medium text-slate-400 hover:text-slate-900 transition-colors"
              >
                <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                  <Calendar size={14} strokeWidth={1.5} />
                </span>
                {hasHadConsultation && !program ? 'Choose a Program' : 'Book Session'}
              </Link>
            </div>
          </FadeIn>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-24">
            
            {/* 1. Primary Highlight: Next Appointment */}
            <section>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium mb-8">
                Next Engagement
              </span>
              {nextSession ? (
                <div className="group relative">
                  <div className="absolute -left-6 top-0 bottom-0 w-[1px] bg-slate-100 hidden md:block" />
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6">
                      <p className="text-3xl md:text-4xl font-light tracking-tight text-slate-900">
                        {fmtDate(nextSession.date)}
                      </p>
                      <div className="flex items-center gap-8 text-slate-500">
                        <div className="flex items-center gap-3">
                          <Clock size={16} strokeWidth={1.5} className="text-slate-400" />
                          <span className="text-sm font-medium tracking-wide">{fmtTime(nextSession.time)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <User size={16} strokeWidth={1.5} className="text-slate-400" />
                          <span className="text-sm font-medium tracking-wide">{nextSession.therapist_name || 'Dr. Fawzia Yassmina'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {nextSession.meeting_link && (
                        <Link href={nextSession.meeting_link} className="px-8 py-4 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-all">
                          Join Room
                        </Link>
                      )}
                      <button className="px-8 py-4 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-slate-50 transition-colors">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 border-t border-b border-slate-100 text-slate-400 font-light text-lg">
                  No upcoming sessions scheduled.
                </div>
              )}
            </section>

            {/* 2. Program Trajectory */}
            <section>
              <div className="flex items-end justify-between mb-12 border-b border-slate-100 pb-4">
                <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-medium">
                  Program Trajectory
                </span>
                {program && (
                  <span className="text-xs font-medium text-slate-900 tracking-wide">
                    {program.program_type === 'group' ? 'Group Practice' : 'Private Direct'}
                  </span>
                )}
              </div>
              
              {program ? (
                <div className="max-w-3xl">
                  <div className="mb-16">
                    <div className="flex justify-between items-end mb-6">
                      <p className="text-6xl font-light tracking-tighter text-slate-900">
                        {usedPct}<span className="text-2xl align-top ml-1 text-slate-400">%</span>
                      </p>
                      <p className="text-sm text-slate-500 pb-2 font-medium">
                        {program.used_sessions} / {program.total_sessions} Sessions
                      </p>
                    </div>
                    <div className="h-[1px] w-full bg-slate-100 relative">
                      <div className="absolute top-0 bottom-0 left-0 bg-[#2B2F55] transition-all duration-1000" style={{ width: `${usedPct}%` }} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-12">
                    <div className="border-l border-slate-100 pl-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3">Current Phase</p>
                      <p className="text-xl font-light text-slate-900">{assessment?.recommended_phase_primary || 'Stabilization'}</p>
                    </div>
                    <div className="border-l border-slate-100 pl-6">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-3">Status</p>
                      <p className="text-xl font-light text-slate-900 capitalize">{program.status}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/programs" className="group flex items-center gap-2 text-slate-900 font-medium border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                  <span className="flex-1">Enroll in a program to begin your journey</span>
                  <ArrowUpRight className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-slate-400" size={20} strokeWidth={1.5} />
                </Link>
              )}
            </section>
          </div>

          {/* Sidebar Area: Data & Insights */}
          <aside className="lg:col-span-4 space-y-20">
            
            {/* Health Snapshot */}
            <section>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-8">Biometric Snapshot</h2>
              {assessment ? (
                <div className="space-y-8">
                  <div className="pb-8 border-b border-slate-50">
                    <p className="text-xs text-slate-400 mb-1">System Dysregulation</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold">{Math.round(assessment.overall_dysregulation_score)}</span>
                      <SeverityIndicator band={assessment.overall_severity_band} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <ProgressLine label="Nervous System" value={assessment.nervous_system_score} />
                    <ProgressLine label="Emotional Pattern" value={assessment.emotional_pattern_score} />
                    <ProgressLine label="Current Stress" value={assessment.current_stress_score} />
                  </div>

                  <div className="pt-6">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2 text-slate-900 font-medium text-sm">
                        <Zap size={14} className="fill-current" />
                        Focus Area
                      </div>
                      <p className="text-[13px] text-slate-500 leading-relaxed">
                        Priority: {assessment.recommended_phase_primary}. Focus on parasympathetic activation.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No biometric data recorded.</p>
              )}
            </section>

            {/* Quick Science Tip */}
            <section className="pt-10 border-t border-slate-100">
              <h3 className="text-[15px] font-semibold mb-3">Long-term adaptation</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6">
                Your nervous system adapts in 4-week cycles. Tracking consistency is more vital than immediate results.
              </p>
              <Link href="/research" className="text-xs font-bold uppercase tracking-widest text-slate-900 flex items-center gap-1 hover:gap-2 transition-all">
                The Science <ChevronRight size={12} />
              </Link>
            </section>

          </aside>
        </div>
      </div>
    </div>
  );
}