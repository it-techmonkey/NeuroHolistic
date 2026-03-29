'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  Loader2, Calendar, Clock, CheckCircle, AlertCircle,
  Video, FileText, User, Mail, TrendingUp, ChevronRight,
  Search, BarChart3, Settings, LogOut, UserCircle,
  ChevronDown, Download, Eye, File, Image
} from 'lucide-react';
import Progress from '@/components/dashboard/client/Progress';
import Account from '@/components/dashboard/client/Account';

// Types
type Session = {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  session_number?: number;
  meeting_link?: string;
  therapist_name?: string;
  therapist_user_id?: string;
  program_id?: string;
  development_form_submitted?: boolean;
  session_id?: string | null; // Actual session ID for document filtering
};

type Assessment = {
  id: string;
  goal_readiness_score: number;
  is_baseline: boolean;
  assessed_at?: string;
  created_at: string;
  clinical_condition_brief?: string;
  therapist_focus?: string;
  therapy_goal?: string;
  nervous_system_score?: number;
  emotional_state_score?: number;
  cognitive_patterns_score?: number;
  body_symptoms_score?: number;
  behavioral_patterns_score?: number;
  life_functioning_score?: number;
};

type DevForm = {
  id: string;
  session_number?: number;
  created_at: string;
  integration_notes?: string;
  pre_session_energy?: number;
  post_session_energy?: number;
  nervous_system_score?: number;
  emotional_state_score?: number;
  cognitive_patterns_score?: number;
  body_symptoms_score?: number;
  behavioral_patterns_score?: number;
  life_functioning_score?: number;
  goal_readiness_score?: number;
};

type Document = {
  id: string;
  session_id?: string;
  type: 'pdf' | 'video' | 'note' | 'image' | 'other';
  file_url: string;
  file_name: string;
  description?: string;
  created_at: string;
};

type DashboardData = {
  upcomingSessions: Session[];
  pastSessions: Session[];
  pendingSessions?: Session[];
  programStatus: string;
  hasActiveProgram: boolean;
  hasCompletedFreeConsult?: boolean;
  hasBookedFreeConsult?: boolean;
  bookedFreeConsult?: Session;
  hasCompletedAllSessions?: boolean;
  assessments: Assessment[];
  devForms: DevForm[];
  materials: any[];
  completedSessionIds?: string[];
  user?: any;
};

type ViewMode = 'overview' | 'sessions' | 'progress' | 'account';
type SessionFilter = 'all' | 'upcoming' | 'completed';

export default function ClientDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Session detail state
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);

  // Session filter state
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');

  // Account menu state
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function init() {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: { user: refreshedUser } } = await supabase.auth.getUser();
          if (refreshedUser) {
            setUserInfo(refreshedUser);
            await fetchDashboardData(refreshedUser.id);
            await fetchUserProfile(refreshedUser.id);
            return;
          }
        }
        router.push('/auth/login');
        return;
      }

      setUserInfo(user);
      await fetchDashboardData(user.id);
      await fetchUserProfile(user.id);
    }

    init();
  }, [router]);

  async function fetchUserProfile(userId: string) {
    try {
      const res = await fetch(`/api/users/profile?userId=${userId}`);
      if (res.ok) {
        const profileData = await res.json();
        setUserProfile(profileData);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    }
  }

  // Close account menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function fetchDashboardData(userId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/client/dashboard?clientId=${userId}`);
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const dashboardData = await res.json();
      setData(dashboardData);
      
      // Fetch documents for all sessions
      const allSessions = [...(dashboardData.upcomingSessions || []), ...(dashboardData.pastSessions || [])];
      if (allSessions.length > 0) {
        await fetchDocuments(userId);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDocuments(clientId: string) {
    try {
      const res = await fetch(`/api/documents?clientId=${clientId}`);
      if (res.ok) {
        const docData = await res.json();
        setDocuments(docData.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const getSessionDocuments = (session: Session) => {
    // Documents are stored with session_id pointing to sessions table ID
    // We can only show documents if we have a valid session_id
    const effectiveSessionId = session.session_id;
    
    // No session_id means no documents can be shown (session not yet created/mapped)
    if (!effectiveSessionId) {
      return [];
    }
    
    // Only show documents if the session is completed
    const completedIds = data?.completedSessionIds || [];
    const isSessionCompleted = completedIds.includes(effectiveSessionId);
    
    if (!isSessionCompleted) {
      return [];
    }
    
    return documents.filter(d => d.session_id === effectiveSessionId);
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      default: return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const allSessions = [...(data?.upcomingSessions || []), ...(data?.pastSessions || [])];
  const completedSessions = data?.pastSessions?.filter(s => s.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'overview' as ViewMode, label: 'Overview', icon: BarChart3 },
                { id: 'sessions' as ViewMode, label: 'Sessions', icon: Calendar },
                { id: 'progress' as ViewMode, label: 'Progress', icon: TrendingUp },
                { id: 'account' as ViewMode, label: 'Account', icon: Settings },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    viewMode === tab.id
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Account Menu */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  {userInfo?.user_metadata?.full_name?.split(' ')[0] || userInfo?.email?.split('@')[0] || 'Account'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {userInfo?.user_metadata?.full_name || 'Client'}
                    </p>
                    <p className="text-xs text-slate-500">{userInfo?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowAccountMenu(false); setViewMode('account'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <UserCircle className="w-4 h-4" />
                    View Profile
                  </button>
                  <button
                    onClick={() => { setShowAccountMenu(false); setViewMode('progress'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <TrendingUp className="w-4 h-4" />
                    View Progress
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Mobile Navigation */}
        <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview' as ViewMode, label: 'Overview' },
            { id: 'sessions' as ViewMode, label: 'Sessions' },
            { id: 'progress' as ViewMode, label: 'Progress' },
            { id: 'account' as ViewMode, label: 'Account' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                viewMode === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW VIEW */}
        {viewMode === 'overview' && (
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">
                    Welcome back, {userProfile?.full_name?.split(' ')[0] || userInfo?.user_metadata?.first_name || userInfo?.user_metadata?.full_name?.split(' ')[0] || userInfo?.email?.split('@')[0] || 'there'}
                  </h2>
                  <p className="text-white/80">Track your wellness journey</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {/* Conditional CTA based on user's booking state */}
                {/* Free consultation booked but not completed - show Join button */}
                {data?.hasBookedFreeConsult && data?.bookedFreeConsult && !data?.hasCompletedFreeConsult && (
                  <div className="flex flex-wrap gap-3">
                    {data.bookedFreeConsult.meeting_link && (
                      <a
                        href={data.bookedFreeConsult.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join Free Consultation
                      </a>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm text-white/90">
                      <Calendar className="w-4 h-4" />
                      {new Date(data.bookedFreeConsult.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {data.bookedFreeConsult.time}
                    </div>
                  </div>
                )}
                {/* No free consultation booked - show Book button */}
                {data?.programStatus === 'none' && !data?.hasCompletedFreeConsult && !data?.hasBookedFreeConsult && (
                  <a
                    href="/consultation/book"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Free Consultation
                  </a>
                )}
                {/* Free consultation completed - show Book Paid Program */}
                {data?.programStatus === 'consultation_done' && (
                  <a
                    href="/booking/paid-program-booking"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book a Paid Program
                  </a>
                )}
                {data?.programStatus === 'active' && (
                  <a
                    href="/booking/schedule-session"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-semibold hover:bg-white/90 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    Book Next Session
                  </a>
                )}
                {data?.programStatus === 'active' && (
                  <button
                    onClick={() => setViewMode('sessions')}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    View Sessions
                  </button>
                )}
                <button
                  onClick={() => setViewMode('progress')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  View Progress
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => { setSessionFilter('upcoming'); setViewMode('sessions'); }}
                className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data?.upcomingSessions?.length || 0}</p>
                <p className="text-sm text-slate-500">Upcoming</p>
              </button>
              <button
                onClick={() => { setSessionFilter('completed'); setViewMode('sessions'); }}
                className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-green-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{completedSessions.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </button>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data?.assessments?.length || 0}</p>
                <p className="text-sm text-slate-500">Assessments</p>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{data?.devForms?.length || 0}</p>
                <p className="text-sm text-slate-500">Dev Forms</p>
              </div>
            </div>

            {/* Upcoming Sessions */}
            {data?.upcomingSessions && data.upcomingSessions.length > 0 && (
              <section className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-6 h-6 text-indigo-300" />
                        </div>
                        Upcoming Sessions
                      </h2>
                      <p className="text-white/60 mt-1">Your scheduled therapy sessions</p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl">
                      <p className="text-3xl font-bold">{data.upcomingSessions.length}</p>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Sessions</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.upcomingSessions.slice(0, 3).map(session => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        isHighlighted
                        documents={getSessionDocuments(session)}
                      />
                    ))}
                  </div>
                  {data.upcomingSessions.length > 3 && (
                    <button
                      onClick={() => setViewMode('sessions')}
                      className="mt-4 text-sm text-white/80 hover:text-white flex items-center gap-1"
                    >
                      View all sessions <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </section>
            )}

            {/* Recent Progress */}
            {data?.assessments && data.assessments.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Progress Over Time
                  </h2>
                  <button
                    onClick={() => setViewMode('progress')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    View details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(() => {
                    // Get latest scores from devForms if available, otherwise from assessments
                    const latestDevForm = data?.devForms?.[data.devForms.length - 1];
                    const latestAssessment = data?.assessments?.[data.assessments.length - 1];
                    const source = latestDevForm || latestAssessment || {};
                    
                    return [
                      { label: 'Stress & Anxiety', key: 'nervous_system_score' },
                      { label: 'Emotional Balance', key: 'emotional_state_score' },
                      { label: 'Thought Patterns', key: 'cognitive_patterns_score' },
                      { label: 'Physical Wellbeing', key: 'body_symptoms_score' },
                      { label: 'Habits & Behaviors', key: 'behavioral_patterns_score' },
                      { label: 'Daily Life', key: 'life_functioning_score' },
                    ].map(metric => (
                      <div key={metric.key} className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="text-xs text-slate-500">{metric.label}</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {(source as any)?.[metric.key] || 0}
                          <span className="text-sm font-normal text-slate-400">/10</span>
                        </p>
                      </div>
                    ));
                  })()}
                </div>
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-900">Goal Readiness Score</span>
                    <span className="text-2xl font-bold text-indigo-700">
                      {(() => {
                        const latestDevForm = data?.devForms?.[data.devForms.length - 1];
                        if (latestDevForm) {
                          const score = (latestDevForm.nervous_system_score || 0) + (latestDevForm.emotional_state_score || 0) +
                            (latestDevForm.cognitive_patterns_score || 0) + (latestDevForm.body_symptoms_score || 0) +
                            (latestDevForm.behavioral_patterns_score || 0) + (latestDevForm.life_functioning_score || 0);
                          return score;
                        }
                        return data?.assessments?.[data.assessments.length - 1]?.goal_readiness_score || 0;
                      })()}/60
                    </span>
                  </div>
                  <p className="text-xs text-indigo-600 mt-1">Lower scores indicate improved wellbeing</p>
                </div>
              </section>
            )}
          </div>
        )}

        {/* SESSIONS VIEW */}
        {viewMode === 'sessions' && (
          <div className="space-y-6">
            {/* Session Stats - Clickable */}
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setSessionFilter('all')}
                className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${
                  sessionFilter === 'all'
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Calendar className={`w-8 h-8 mx-auto mb-2 ${sessionFilter === 'all' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <p className="text-2xl font-bold text-slate-900">{allSessions.length}</p>
                <p className="text-sm text-slate-500">Total Sessions</p>
              </button>
              <button
                onClick={() => setSessionFilter('completed')}
                className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${
                  sessionFilter === 'completed'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${sessionFilter === 'completed' ? 'text-green-600' : 'text-slate-400'}`} />
                <p className="text-2xl font-bold text-slate-900">{completedSessions.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </button>
              <button
                onClick={() => setSessionFilter('upcoming')}
                className={`rounded-xl border p-4 text-center transition-all cursor-pointer ${
                  sessionFilter === 'upcoming'
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <Clock className={`w-8 h-8 mx-auto mb-2 ${sessionFilter === 'upcoming' ? 'text-amber-600' : 'text-slate-400'}`} />
                <p className="text-2xl font-bold text-slate-900">{data?.upcomingSessions?.length || 0}</p>
                <p className="text-sm text-slate-500">Upcoming</p>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {[
                { id: 'all' as SessionFilter, label: 'All Sessions', count: allSessions.length },
                { id: 'upcoming' as SessionFilter, label: 'Upcoming', count: data?.upcomingSessions?.length || 0 },
                { id: 'completed' as SessionFilter, label: 'Completed', count: completedSessions.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSessionFilter(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    sessionFilter === tab.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Sessions List - Filtered */}
            {sessionFilter === 'upcoming' && data?.upcomingSessions && data.upcomingSessions.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Sessions ({data.upcomingSessions.length})
                </h2>
                <div className="space-y-4">
                  {data.upcomingSessions.map(session => (
                    <SessionDetailCard
                      key={session.id}
                      session={session}
                      isExpanded={expandedSession === session.id}
                      onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                      documents={getSessionDocuments(session)}
                    />
                  ))}
                </div>
              </section>
            )}

            {sessionFilter === 'completed' && data?.pastSessions && data.pastSessions.filter(s => s.status === 'completed').length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  Completed Sessions ({data.pastSessions.filter(s => s.status === 'completed').length})
                </h2>
                <div className="space-y-4">
                  {data.pastSessions.filter(s => s.status === 'completed').map(session => (
                    <SessionDetailCard
                      key={session.id}
                      session={session}
                      isExpanded={expandedSession === session.id}
                      onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                      documents={getSessionDocuments(session)}
                      isCompleted={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {sessionFilter === 'all' && (
              <>
                {/* Upcoming Sessions */}
                {data?.upcomingSessions && data.upcomingSessions.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Upcoming Sessions ({data.upcomingSessions.length})
                    </h2>
                    <div className="space-y-4">
                      {data.upcomingSessions.map(session => (
                        <SessionDetailCard
                          key={session.id}
                          session={session}
                          isExpanded={expandedSession === session.id}
                          onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                          documents={getSessionDocuments(session)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Past Sessions */}
                {data?.pastSessions && data.pastSessions.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-slate-400" />
                      Past Sessions ({data.pastSessions.length})
                    </h2>
                    <div className="space-y-4">
                      {data.pastSessions.map(session => (
                        <SessionDetailCard
                          key={session.id}
                          session={session}
                          isExpanded={expandedSession === session.id}
                          onToggle={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                          documents={getSessionDocuments(session)}
                          isCompleted={session.status === 'completed'}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {/* Empty states */}
            {sessionFilter === 'upcoming' && (!data?.upcomingSessions || data.upcomingSessions.length === 0) && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 font-medium">No upcoming sessions</h3>
                <p className="text-slate-500 text-sm mt-1">Book a session to get started.</p>
              </div>
            )}

            {sessionFilter === 'completed' && (!data?.pastSessions || data.pastSessions.filter(s => s.status === 'completed').length === 0) && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 font-medium">No completed sessions yet</h3>
                <p className="text-slate-500 text-sm mt-1">Complete a session to see it here.</p>
              </div>
            )}

            {sessionFilter === 'all' && allSessions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 font-medium">No sessions yet</h3>
                <p className="text-slate-500 text-sm mt-1">Book a consultation to get started.</p>
              </div>
            )}

            {/* All Documents Section - Only show documents from completed sessions */}
            {(() => {
              const completedIds = data?.completedSessionIds || [];
              // Only show documents that have a session_id AND that session is completed
              const visibleDocs = documents.filter(d => d.session_id && completedIds.includes(d.session_id));
              if (visibleDocs.length === 0) return null;
              return (
              <section className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <File className="w-5 h-5 text-indigo-600" />
                  All Documents ({visibleDocs.length})
                </h2>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {visibleDocs.map(doc => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                          {doc.type === 'pdf' ? <FileText className="w-5 h-5 text-red-500" /> :
                           doc.type === 'video' ? <Video className="w-5 h-5 text-purple-500" /> :
                           doc.type === 'image' ? <Image className="w-5 h-5 text-green-500" /> :
                           <File className="w-5 h-5 text-slate-500" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                          <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(`/api/documents/${doc.id}/view`);
                              const data = await res.json();
                              if (data.url) {
                                window.open(data.url, '_blank');
                              }
                            } catch (error) {
                              console.error('Failed to get document URL:', error);
                            }
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              );
            })()}
          </div>
        )}

        {/* PROGRESS VIEW */}
        {viewMode === 'progress' && (
          <Progress
            assessments={data?.assessments || []}
            devForms={data?.devForms || []}
          />
        )}

        {/* ACCOUNT VIEW */}
        {viewMode === 'account' && (
          <Account user={userInfo} />
        )}
      </div>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    amber: 'bg-amber-100 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function SessionCard({
  session,
  isHighlighted = false,
  documents,
}: {
  session: Session;
  isHighlighted?: boolean;
  documents: Document[];
}) {
  return (
    <div className={`rounded-xl p-5 border transition-colors ${
      isHighlighted 
        ? 'bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15' 
        : 'bg-white border-slate-200 hover:border-slate-300'
    }`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`font-semibold text-lg ${isHighlighted ? 'text-white' : 'text-slate-900'}`}>
            {session.type === 'free_consultation' ? 'Free Consultation' : `Session ${session.session_number || 1}`}
          </p>
          <p className={`text-sm ${isHighlighted ? 'text-white/70' : 'text-slate-500'}`}>
            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { 
              weekday: 'short', month: 'short', day: 'numeric' 
            })} at {session.time}
          </p>
        </div>
      </div>
      
      {session.therapist_name && (
        <p className={`text-sm mb-3 ${isHighlighted ? 'text-white/70' : 'text-slate-600'}`}>
          Therapist: {session.therapist_name}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {session.meeting_link && (
          <a
            href={session.meeting_link}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isHighlighted
                ? 'bg-white text-slate-900 hover:bg-white/90'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <Video className="w-4 h-4" /> Join
          </a>
        )}
        {documents.length > 0 && (
          <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm ${
            isHighlighted ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
          }`}>
            <File className="w-4 h-4" /> {documents.length} Doc{documents.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function SessionDetailCard({
  session,
  isExpanded,
  onToggle,
  documents,
  isCompleted = false,
}: {
  session: Session;
  isExpanded: boolean;
  onToggle: () => void;
  documents: Document[];
  isCompleted?: boolean;
}) {
  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'video': return <Video className="w-5 h-5 text-purple-500" />;
      case 'image': return <Image className="w-5 h-5 text-green-500" />;
      default: return <File className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
      isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'
    } ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
      {/* Session Header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900">
                  {session.type === 'free_consultation' ? 'Free Consultation' : `Session #${session.session_number || 1}`}
                </p>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Completed
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                })}
                {session.time && ` at ${session.time}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {session.therapist_name && (
              <span className="text-sm text-slate-500 hidden sm:block">
                {session.therapist_name}
              </span>
            )}
            {documents.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg">
                {documents.length} Doc{documents.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Session Content */}
      {isExpanded && (
        <div className="border-t border-slate-100 p-4 space-y-4 bg-white">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {session.meeting_link && !isCompleted && (
              <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Video className="w-4 h-4" /> Join Session
              </a>
            )}
          </div>

          {/* Session Documents */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <File className="w-4 h-4" /> Documents & Attachments
            </h4>
            {documents.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-slate-200">
                      {getDocIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                      <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/documents/${doc.id}/view`);
                          const data = await res.json();
                          if (data.url) {
                            window.open(data.url, '_blank');
                          }
                        } catch (error) {
                          console.error('Failed to get document URL:', error);
                        }
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`/api/documents/${doc.id}/view`);
                          const data = await res.json();
                          if (data.url) {
                            const a = document.createElement('a');
                            a.href = data.url;
                            a.download = doc.file_name;
                            a.click();
                          }
                        } catch (error) {
                          console.error('Failed to download document:', error);
                        }
                      }}
                      className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <File className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No documents available for this session</p>
              </div>
            )}
          </div>

          {/* Session Info */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Session Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Date & Time</p>
                <p className="font-medium text-slate-900">
                  {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                  })} at {session.time}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Session Type</p>
                <p className="font-medium text-slate-900">
                  {session.type === 'free_consultation' ? 'Free Consultation' : 'Therapy Session'}
                </p>
              </div>
              {session.therapist_name && (
                <div>
                  <p className="text-slate-500">Therapist</p>
                  <p className="font-medium text-slate-900">{session.therapist_name}</p>
                </div>
              )}
              <div>
                <p className="text-slate-500">Status</p>
                <p className={`font-medium ${isCompleted ? 'text-green-600' : 'text-slate-900'}`}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
