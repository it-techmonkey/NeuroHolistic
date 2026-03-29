'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import {
  Loader2, Users, Calendar, Clock, CheckCircle, AlertCircle,
  Video, FileText, User, Mail, TrendingUp, ChevronRight,
  X, Filter, Search, BarChart3, Phone, Settings, LogOut,
  UserCircle, ChevronDown, Plus, Trash2, Upload, Download,
  Eye, Edit2, File, Image, Music, TrendingDown
} from 'lucide-react';
import CalendarView from '@/components/dashboard/therapist/CalendarView';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import DiagnosticAssessmentForm from '@/components/dashboard/therapist/DiagnosticAssessmentForm';
import SessionDevelopmentForm from '@/components/dashboard/therapist/SessionDevelopmentForm';
import MarkComplete from '@/components/dashboard/therapist/MarkComplete';
import UploadMaterial from '@/components/dashboard/therapist/UploadMaterial';
import { SessionsTab, ReportsTab } from '@/components/dashboard/therapist/TherapistTabs';
import GoogleCalendarConnect from '@/components/settings/GoogleCalendarConnect';
import ProgressComparison from '@/components/dashboard/therapist/ProgressComparison';

// Types
type Session = {
  id: string;
  client_id: string;
  client_name?: string;
  clients?: { full_name?: string; email?: string };
  date: string;
  time: string;
  type: string;
  status: string;
  session_number?: number;
  meet_link?: string;
  meeting_link?: string;
  program_id?: string;
  development_form_submitted?: boolean;
  is_complete?: boolean;
  therapist_id?: string;
  booking_id?: string;
};

type Client = {
  userId: string;
  fullName: string;
  email: string;
  phone?: string;
  nextSession?: Session | null;
  lastSession?: Session | null;
  program?: {
    id: string;
    status: string;
    totalSessions: number;
    completedSessions: number;
    program_type?: string;
  } | null;
  assessment?: {
    goal_readiness_score: number;
    is_baseline: boolean;
  } | null;
  assessmentCount?: number;
  hasFreeConsultation?: boolean;
  devFormsCount?: number;
  sessionStats?: {
    upcoming: number;
    completed: number;
    total: number;
  };
};

type Document = {
  id: string;
  client_id: string;
  session_id?: string;
  type: 'pdf' | 'video' | 'note' | 'image' | 'other';
  file_url: string;
  file_name: string;
  description?: string;
  created_at: string;
};

type Availability = {
  id: string;
  therapist_id: string;
  day_of_week?: number;
  exception_date?: string;
  start_time: string;
  end_time: string;
  is_blocked: boolean;
};

type DashboardStats = {
  totalClients: number;
  activeProgramClients: number;
  todaySessions: number;
  upcomingSessions: number;
  completedSessions: number;
  pendingAssessments: number;
};

type ViewMode = 'overview' | 'clients' | 'sessions';

export default function TherapistDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [therapistId, setTherapistId] = useState<string | null>(null);
  const [therapistInfo, setTherapistInfo] = useState<any>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('overview');

  // Data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const [pastSessions, setPastSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientFilter, setClientFilter] = useState<'all' | 'active' | 'consultation' | 'awaiting'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected client detail
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientDetail, setClientDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [clientTab, setClientTab] = useState<'overview' | 'sessions' | 'assessments' | 'reports'>('overview');

  // Modal state
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [modalType, setModalType] = useState<'diagnostic' | 'development' | null>(null);

  // Account menu
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Availability modal
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [availability, setAvailability] = useState<Availability[]>([]);

  // Google Calendar modal
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  
  // Calendar visibility
  const [showCalendar, setShowCalendar] = useState(false);

  // Documents
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Baseline assessment data for comparison
  const [baselineScores, setBaselineScores] = useState<{
    nervous_system_score: number;
    emotional_state_score: number;
    cognitive_patterns_score: number;
    body_symptoms_score: number;
    behavioral_patterns_score: number;
    life_functioning_score: number;
    goal_readiness_score: number;
    source: 'assessment' | 'session';
    sessionNumber?: number;
  } | null>(null);
  const [baselineExists, setBaselineExists] = useState(false);
  const [fetchedDevForm, setFetchedDevForm] = useState<any>(null);

  // Map booking ID to session ID for dev form lookup
  const sessionIdMap = useMemo(() => {
    const map = new Map<string, string>();
    (clientDetail?.sessions || []).forEach((s: any) => {
      // For standalone sessions (no booking), s.id is session ID
      if (s.booking_id) {
        map.set(s.booking_id, s.id);
      }
      // For bookings, s.session_ref_id is the linked session ID
      if (s.session_ref_id) {
        map.set(s.id, s.session_ref_id);
      }
      // Always map session ID to itself
      map.set(s.id, s.id);
    });
    return map;
  }, [clientDetail?.sessions]);

  // Fetch dev form when opening modal for a session
  useEffect(() => {
    if (modalType === 'development' && activeSession) {
      // Fetch dev forms for this client and session
      const clientId = activeSession.client_id;
      const sessionId = activeSession.booking_id || activeSession.id;
      fetch(`/api/assessments/session-development?clientId=${clientId}&sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.forms && data.forms.length > 0) {
            // The API already filtered by sessionId (booking or session), so take the first
            setFetchedDevForm(data.forms[0]);
          } else {
            setFetchedDevForm(null);
          }
        })
        .catch(() => setFetchedDevForm(null));
    } else {
      setFetchedDevForm(null);
    }
  }, [modalType, activeSession]);

  const effectiveExistingForm = useMemo(() => {
    if (!activeSession) return null;
    if (clientDetail?.devForms) {
      const found = clientDetail.devForms.find((f: any) => {
        const sessionId = activeSession.booking_id 
          ? sessionIdMap.get(activeSession.booking_id) || activeSession.id
          : sessionIdMap.get(activeSession.id) || activeSession.id;
        return f.session_id === sessionId;
      });
      if (found) return found;
    }
    return fetchedDevForm;
  }, [clientDetail?.devForms, fetchedDevForm, activeSession, sessionIdMap]);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'therapist' && userData?.role !== 'admin') {
        router.push('/dashboard/client');
        return;
      }

      setTherapistId(user.id);
      setTherapistInfo({ ...userData, id: user.id });
      await fetchAllData(user.id);
      await fetchAvailability(user.id);
    }
    init();
  }, [router]);

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

  async function fetchAllData(tid: string) {
    setLoading(true);
    try {
      const [sessionsRes, clientsRes, assessmentsRes] = await Promise.all([
        fetch(`/api/therapist/sessions?therapistId=${tid}`),
        fetch(`/api/therapist/clients`),
        fetch(`/api/assessments/diagnostic?therapistId=${tid}`)
      ]);

      const sessionsData = await sessionsRes.json();
      const clientsData = await clientsRes.json();
      const assessmentsData = await assessmentsRes.json();

      // Store assessments for use in SessionsTab
      if (assessmentsData.assessments) {
        setClientDetail((prev: any) => prev ? { ...prev, assessments: assessmentsData.assessments } : { assessments: assessmentsData.assessments });
      }

      console.log('[Therapist Dashboard] Sessions data:', JSON.stringify(sessionsData, null, 2));
      
      const allSessions: Session[] = sessionsData.sessions || [];
      console.log('[Therapist Dashboard] All sessions count:', allSessions.length);
      console.log('[Therapist Dashboard] Free consultation sessions:', allSessions.filter(s => s.type === 'free_consultation').length);
      // Calculate session stats per client
      const clientSessionStats: Record<string, { upcoming: number; completed: number; total: number }> = {};
      allSessions.forEach((session: Session) => {
        const clientId = session.client_id;
        if (!clientId) return;

        if (!clientSessionStats[clientId]) {
          clientSessionStats[clientId] = { upcoming: 0, completed: 0, total: 0 };
        }
        clientSessionStats[clientId].total++;
        if (session.status === 'completed') {
          clientSessionStats[clientId].completed++;
        } else if (!['cancelled', 'no_show'].includes(session.status)) {
          clientSessionStats[clientId].upcoming++;
        }
      });

      const allClients: Client[] = (clientsData.clients || []).map((client: any) => {
        const program = client.program
          ? {
              ...client.program,
              totalSessions: client.program.totalSessions ?? client.program.total_sessions ?? 10,
              completedSessions:
                client.program.completedSessions ??
                client.program.sessions_completed ??
                client.program.used_sessions ??
                0,
            }
          : client.program;

        const stats = clientSessionStats[client.userId] || { upcoming: 0, completed: 0, total: 0 };

        return {
          ...client,
          program,
          sessionStats: stats,
        };
      });

      const now = new Date();
      // Get today's date in local timezone (DST format)
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      console.log('[Therapist Dashboard] Today date:', today);
      console.log('[Therapist Dashboard] Current time:', now.toISOString());
      console.log('[Therapist Dashboard] All sessions with dates:', allSessions.map(s => ({ id: s.id, type: s.type, status: s.status, date: s.date, time: s.time })));

      const todayList = allSessions.filter(s => {
        if (s.date !== today) return false;
        if (['completed', 'cancelled', 'no_show'].includes(s.status)) return false;
        return true;
      }).sort((a, b) => a.time.localeCompare(b.time));
      console.log('[Therapist Dashboard] Today list:', todayList.length);
      console.log('[Therapist Dashboard] Today list sessions:', JSON.stringify(todayList.map(s => ({ id: s.id, type: s.type, date: s.date, time: s.time })), null, 2));

      const upcomingList = allSessions.filter(s => {
        const sessionDate = new Date(s.date + 'T00:00:00');
        if (sessionDate < now) return false;
        if (['completed', 'cancelled', 'no_show'].includes(s.status)) return false;
        if (s.date === today) return false;
        return true;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      console.log('[Therapist Dashboard] Upcoming list:', upcomingList.length);
      console.log('[Therapist Dashboard] Upcoming list sessions:', JSON.stringify(upcomingList.map(s => ({ id: s.id, type: s.type, date: s.date, time: s.time })), null, 2));

      const pastList = allSessions.filter(s => {
        const sessionDate = new Date(s.date + 'T23:59:59');
        return s.status === 'completed' || sessionDate < now;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const completedSessions = allSessions.filter(s => s.status === 'completed').length;
      const activeProgramClients = allClients.filter(c => c.program?.status === 'active').length;
      const pendingAssessments = upcomingList.filter(s =>
        s.type !== 'free_consultation' && !s.development_form_submitted
      ).length;

      setStats({
        totalClients: allClients.length,
        activeProgramClients,
        todaySessions: todayList.length,
        upcomingSessions: upcomingList.length,
        completedSessions,
        pendingAssessments,
      });

      setTodaySessions(todayList);
      setUpcomingSessions(upcomingList);
      setPastSessions(pastList.slice(0, 20));
      setClients(allClients);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailability(tid: string) {
    try {
      const res = await fetch(`/api/therapist/availability?therapistId=${tid}`);
      if (res.ok) {
        const data = await res.json();
        setAvailability(data.availability || []);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  }

  const fetchClientDetail = async (client: Client) => {
    setSelectedClient(client);
    setClientTab('overview');
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/therapist/client-detail?clientId=${client.userId}`);
      if (res.ok) {
        const data = await res.json();
        setClientDetail(data);

        // Extract baseline assessment for comparison
        const baseline = data.assessments?.find((a: any) => a.is_baseline);
        const devForms = data.devForms || [];

        if (baseline) {
          setBaselineExists(true);

          // For session 1: compare with baseline
          // For session 2+: compare with the previous session's dev form
          const currentSession = data.sessions?.find((s: any) => s.status !== 'completed');
          const currentSessionNum = currentSession?.session_number || 1;

          if (currentSessionNum > 1 && devForms.length > 0) {
            // Get the previous session's dev form
            // Filter out forms with null session_number and those >= current session
            const previousSessionForms = devForms
              .filter((f: any) => f.session_number != null && f.session_number < currentSessionNum)
              .sort((a: any, b: any) => (b.session_number || 0) - (a.session_number || 0));

            if (previousSessionForms.length > 0) {
              const prevForm = previousSessionForms[0];
              // Use the stored session_number, fallback to currentSessionNum - 1
              const prevSessionNum = prevForm.session_number ?? (currentSessionNum - 1);
              setBaselineScores({
                nervous_system_score: prevForm.nervous_system_score ?? 0,
                emotional_state_score: prevForm.emotional_state_score ?? 0,
                cognitive_patterns_score: prevForm.cognitive_patterns_score ?? 0,
                body_symptoms_score: prevForm.body_symptoms_score ?? 0,
                behavioral_patterns_score: prevForm.behavioral_patterns_score ?? 0,
                life_functioning_score: prevForm.life_functioning_score ?? 0,
                goal_readiness_score: (prevForm.nervous_system_score ?? 0) + (prevForm.emotional_state_score ?? 0) +
                  (prevForm.cognitive_patterns_score ?? 0) + (prevForm.body_symptoms_score ?? 0) +
                  (prevForm.behavioral_patterns_score ?? 0) + (prevForm.life_functioning_score ?? 0),
                source: 'session' as const,
                sessionNumber: prevSessionNum,
              });
            } else {
              // No previous dev form, use baseline
              setBaselineScores({
                nervous_system_score: baseline.nervous_system_score ?? 0,
                emotional_state_score: baseline.emotional_state_score ?? 0,
                cognitive_patterns_score: baseline.cognitive_patterns_score ?? 0,
                body_symptoms_score: baseline.body_symptoms_score ?? 0,
                behavioral_patterns_score: baseline.behavioral_patterns_score ?? 0,
                life_functioning_score: baseline.life_functioning_score ?? 0,
                goal_readiness_score: baseline.goal_readiness_score ?? 0,
                source: 'assessment' as const,
              });
            }
          } else {
            // Session 1 or no session number - use baseline
            setBaselineScores({
              nervous_system_score: baseline.nervous_system_score ?? 0,
              emotional_state_score: baseline.emotional_state_score ?? 0,
              cognitive_patterns_score: baseline.cognitive_patterns_score ?? 0,
              body_symptoms_score: baseline.body_symptoms_score ?? 0,
              behavioral_patterns_score: baseline.behavioral_patterns_score ?? 0,
              life_functioning_score: baseline.life_functioning_score ?? 0,
              goal_readiness_score: baseline.goal_readiness_score ?? 0,
              source: 'assessment' as const,
            });
          }
        } else {
          setBaselineExists(false);
          setBaselineScores(null);
        }

        // Also fetch documents for this client
        fetchClientDocuments(client.userId);
      }
    } catch (err) {
      console.error('Failed to load client detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const fetchClientDocuments = async (clientId: string) => {
    try {
      const res = await fetch(`/api/documents?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    }
  };

  const openForm = (session: Session, type: 'diagnostic' | 'development') => {
    setActiveSession(session);
    setModalType(type);
  };

  const closeForm = (refresh = false) => {
    setActiveSession(null);
    setModalType(null);
    if (refresh && therapistId) {
      // Always refresh all data to get updated assessments
      fetchAllData(therapistId);
      // Also refresh client detail if selected
      if (selectedClient) {
        fetchClientDetail(selectedClient);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  // Upload document using server-side R2 upload (bypasses CORS)
  const handleUploadDocument = async (file: File, sessionId?: string) => {
    if (!selectedClient) return;
    setUploadingDoc(true);
    try {
      // Build form data with file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('clientId', selectedClient.userId);
      if (sessionId) formData.append('sessionId', sessionId);

      // Upload via server-side route (handles R2 upload + DB save)
      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        console.error('Upload error response:', data);
        throw new Error(data.error || 'Failed to upload document');
      }

      await fetchClientDocuments(selectedClient.userId);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploadingDoc(false);
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!selectedClient) return;
    try {
      const res = await fetch(`/api/documents?id=${documentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      await fetchClientDocuments(selectedClient.userId);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete document: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!c.fullName?.toLowerCase().includes(query) && !c.email?.toLowerCase().includes(query)) {
        return false;
      }
    }
    switch (clientFilter) {
      case 'active': return c.program?.status === 'active';
      case 'consultation': return !c.program || c.program.status === 'none';
      case 'awaiting': return !c.program && (c.assessmentCount ?? 0) > 0;
      default: return true;
    }
  });

  const isActiveForProgress = (c: Client): boolean => {
    return c.program?.status === 'active' || (!!c.hasFreeConsultation && !c.program);
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-slate-900">Therapist Dashboard</h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex gap-1 bg-slate-100 p-1 rounded-lg">
              {[
                { id: 'overview' as ViewMode, label: 'Overview', icon: BarChart3 },
                { id: 'clients' as ViewMode, label: 'Clients', icon: Users },
                { id: 'sessions' as ViewMode, label: 'Sessions', icon: Calendar },
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
                  {therapistInfo?.full_name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">{therapistInfo?.full_name}</p>
                    <p className="text-xs text-slate-500">{therapistInfo?.email}</p>
                  </div>
                  <button
                    onClick={() => { setShowAccountMenu(false); setShowAvailabilityModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Manage Availability
                  </button>
                  <button
                    onClick={() => { setShowAccountMenu(false); setShowGoogleCalendarModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Video className="w-4 h-4" />
                    Google Calendar
                  </button>
                  <button
                    onClick={() => { setShowAccountMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <UserCircle className="w-4 h-4" />
                    View Profile
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
            { id: 'clients' as ViewMode, label: 'Clients' },
            { id: 'sessions' as ViewMode, label: 'Sessions' },
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
            {/* Therapist Info Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <UserCircle className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{therapistInfo?.full_name}</h2>
                  <p className="text-white/80">NeuroHolistic Therapist</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowAvailabilityModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Set Availability
                </button>
                <button
                  onClick={() => setViewMode('clients')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  View Clients
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="Total Clients" value={stats?.totalClients || 0} color="slate" />
              <StatCard icon={Clock} label="Today" value={stats?.todaySessions || 0} color="indigo" />
              <StatCard icon={Calendar} label="Upcoming" value={stats?.upcomingSessions || 0} color="blue" />
              <StatCard icon={CheckCircle} label="Completed" value={stats?.completedSessions || 0} color="emerald" />
            </div>

            {/* Client Progress Overview */}
            {clients.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    Active Client Progress
                  </h2>
                  <button
                    onClick={() => setViewMode('clients')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {clients.filter(isActiveForProgress).slice(0, 6).map(client => (
                    <div 
                      key={client.userId} 
                      className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 cursor-pointer transition-colors"
                      onClick={() => {
                        setViewMode('clients');
                        fetchClientDetail(client);
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{client.fullName}</p>
                          {client.program?.status === 'active' ? (
                            <p className="text-xs text-slate-500">Active Program</p>
                          ) : client.hasFreeConsultation ? (
                            <p className="text-xs text-slate-500">Free Consultation</p>
                          ) : (
                            <p className="text-xs text-slate-500">Client</p>
                          )}
                        </div>
                      </div>
                      {client.program?.status === 'active' ? (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-indigo-600">
                              {client.program?.completedSessions || 0}/{client.program?.totalSessions || 10} sessions
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(((client.program?.completedSessions || 0) / (client.program?.totalSessions || 10)) * 100, 100)}%` }}
                            />
                          </div>
                        </>
                      ) : client.hasFreeConsultation && client.nextSession ? (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Next Consultation</span>
                          <span className="font-medium text-indigo-600">
                            {new Date(client.nextSession.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {client.nextSession.time}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Status</span>
                          <span className="font-medium text-slate-600">No active program</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {clients.filter(isActiveForProgress).length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p>No active clients</p>
                  </div>
                )}
              </section>
            )}

            {/* Calendar View - Hidden by default */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowCalendar(!showCalendar)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {showCalendar ? 'Hide Calendar' : 'View Calendar'}
              </button>
            </div>
            
            {showCalendar && (
              <CalendarView
                sessions={[...todaySessions, ...upcomingSessions, ...pastSessions] as any[]}
                onSessionClick={(session) => {
                  const client = clients.find(c => c.userId === (session as any).client_id);
                  if (client) {
                    setViewMode('clients');
                    fetchClientDetail(client);
                  }
                }}
              />
            )}

            {/* Today's Sessions - Presentation View */}
            {todaySessions.length > 0 && (
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
                        Today's Sessions
                      </h2>
                      <p className="text-white/60 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl">
                      <p className="text-3xl font-bold">{todaySessions.length}</p>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Sessions</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {todaySessions.map(session => (
                      <TodaySessionCard
                        key={session.id}
                        session={session}
                        onAssessment={() => openForm(session, 'diagnostic')}
                        onDevForm={() => openForm(session, 'development')}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Upcoming Sessions */}
              <section className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    Upcoming Sessions
                  </h2>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.slice(0, 8).map(session => (
                      <div key={session.id} className="px-6 py-3 hover:bg-slate-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {session.clients?.full_name || session.client_name || 'Client'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {session.type === 'free_consultation' ? 'Consultation' : `Session ${session.session_number}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-medium text-slate-900">
                              {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-xs text-slate-500">{session.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-slate-400 text-sm">
                      No upcoming sessions
                    </div>
                  )}
                </div>
              </section>

              {/* Recent Clients */}
              <section className="bg-white rounded-xl border border-slate-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-600" />
                    Recent Clients
                  </h2>
                  <button onClick={() => setViewMode('clients')}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View all <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                  {clients.slice(0, 8).map(client => (
                    <button key={client.userId} onClick={() => { setViewMode('clients'); fetchClientDetail(client); }}
                      className="w-full px-6 py-3 hover:bg-slate-50 text-left">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{client.fullName}</p>
                            <p className="text-xs text-slate-500">{client.email}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          client.program?.status === 'active' ? 'bg-green-100 text-green-700' :
                          client.program?.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {client.program?.status === 'active' ? 'Active' :
                           client.program?.status === 'completed' ? 'Completed' : 'Consultation'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* CLIENTS VIEW */}
        {viewMode === 'clients' && (
          <div className="space-y-6">
            {selectedClient ? (
              <ClientDetailView
                client={selectedClient}
                detail={clientDetail}
                detailLoading={detailLoading}
                activeTab={clientTab}
                onTabChange={setClientTab}
                onBack={() => { setSelectedClient(null); setClientDetail(null); setDocuments([]); setBaselineScores(null); setBaselineExists(false); }}
                onOpenAssessment={(s) => openForm(s, 'diagnostic')}
                onOpenDevForm={(s) => openForm(s, 'development')}
                onRefresh={() => therapistId && fetchAllData(therapistId)}
                documents={documents}
                onUploadDocument={handleUploadDocument}
                uploadingDoc={uploadingDoc}
                uploadSuccess={uploadSuccess}
                baselineScores={baselineScores}
                onDeleteDocument={handleDeleteDocument}
              />
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search clients by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'active', label: 'Active Program' },
                      { id: 'consultation', label: 'Consultation' },
                    ].map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => setClientFilter(filter.id as any)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          clientFilter === filter.id
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {filteredClients.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-slate-900 font-medium">No clients found</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map(client => (
                      <ClientCard key={client.userId} client={client} onClick={() => fetchClientDetail(client)} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SESSIONS VIEW */}
        {viewMode === 'sessions' && (
          <div className="space-y-6">
            {/* Today's Sessions - Presentation View */}
            {todaySessions.length > 0 && (
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
                        Today's Sessions
                      </h2>
                      <p className="text-white/60 mt-1">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl">
                      <p className="text-3xl font-bold">{todaySessions.length}</p>
                      <p className="text-xs text-white/60 uppercase tracking-wider">Sessions</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {todaySessions.map(session => (
                      <TodaySessionCard
                        key={session.id}
                        session={session}
                        onAssessment={() => openForm(session, 'diagnostic')}
                        onDevForm={() => openForm(session, 'development')}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  All Upcoming Sessions ({upcomingSessions.length})
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {upcomingSessions.map(session => (
                  <div key={session.id} className="px-6 py-4 hover:bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {session.clients?.full_name || session.client_name || 'Client'}
                        </p>
                        <p className="text-sm text-slate-500">
                          {session.type === 'free_consultation' ? 'Free Consultation' : `Session ${session.session_number}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-sm text-slate-500">{session.time}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2 flex-wrap">
                      {session.meet_link && (
                        <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200">
                          <Video className="w-4 h-4" /> Join
                        </a>
                      )}
                      {/* Only show Assessment button for free consultations */}
                      {session.type === 'free_consultation' && (
                        <button onClick={() => openForm(session, 'diagnostic')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 border border-red-300">
                          <FileText className="w-4 h-4" />
                          Assessment <span className="text-xs">(Required)</span>
                        </button>
                      )}
                      {session.type !== 'free_consultation' && session.program_id && (
                        <button onClick={() => openForm(session, 'development')}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg ${
                            !session.development_form_submitted
                              ? 'bg-amber-100 text-amber-700 border border-amber-300'
                              : 'bg-green-100 text-green-700'
                          }`}>
                          <FileText className="w-4 h-4" />
                          {session.development_form_submitted ? 'View Dev Form' : 'Dev Form'}
                          {!session.development_form_submitted && <span className="text-xs">(Required)</span>}
                          {session.development_form_submitted && <span className="text-xs ml-1">✓</span>}
                        </button>
                      )}
                      {/* Mark Complete - for all sessions */}
                      {session.status !== 'completed' && (
                        <MarkComplete
                          sessionId={session.id}
                          isReady={session.type === 'free_consultation' || session.development_form_submitted || false}
                          isCompleted={session.status === 'completed'}
                          onComplete={() => therapistId && fetchAllData(therapistId)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Availability Modal */}
      {showAvailabilityModal && (
        <AvailabilityModal
          therapistId={therapistId!}
          availability={availability}
          onClose={() => setShowAvailabilityModal(false)}
          onSave={() => { fetchAvailability(therapistId!); setShowAvailabilityModal(false); }}
        />
      )}

      {/* Google Calendar Modal */}
      {showGoogleCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-lg relative">
            <button
              onClick={() => setShowGoogleCalendarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Google Calendar Settings</h2>
              <GoogleCalendarConnect />
            </div>
          </div>
        </div>
      )}

      {/* Form Modals */}
      {activeSession && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => closeForm()} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10">
              <X className="w-6 h-6" />
            </button>
            <div className="p-8">
              {modalType === 'diagnostic' && (
                <DiagnosticAssessmentForm
                  clientId={activeSession.client_id}
                  therapistId={therapistId!}
                  sessionId={activeSession.id}
                  baselineExists={baselineExists}
                  existingAssessment={clientDetail?.assessments?.find((a: any) => a.is_baseline)}
                  clientData={clientDetail?.clientProfile ? {
                    full_name: clientDetail.clientProfile.full_name,
                    email: clientDetail.clientProfile.email,
                    phone: clientDetail.clientProfile.phone,
                    country: clientDetail.clientProfile.country,
                  } : {
                    // For free consultations without a user account, use session data
                    full_name: activeSession.clients?.full_name || activeSession.client_name || '',
                    email: '',
                    phone: '',
                    country: '',
                  }}
                  onClose={() => closeForm(false)}
                  onSave={() => closeForm(true)}
                />
              )}
              {modalType === 'development' && (
                <SessionDevelopmentForm
                  sessionId={activeSession.id}
                  clientId={activeSession.client_id}
                  therapistId={therapistId!}
                  sessionNumber={activeSession.session_number || 1}
                  sessionDate={activeSession.date || new Date().toISOString().split('T')[0]}
                  comparisonBaseline={baselineScores}
                  existingForm={effectiveExistingForm}
                  onClose={() => closeForm(false)}
                  onSave={(savedForm) => {
                    // Update local state with saved form
                    setFetchedDevForm(savedForm);
                    if (clientDetail) {
                      const updatedDevForms = [...(clientDetail.devForms || [])];
                      const existingIndex = updatedDevForms.findIndex((f: any) => f.session_id === savedForm.session_id);
                      if (existingIndex >= 0) {
                        updatedDevForms[existingIndex] = savedForm;
                      } else {
                        updatedDevForms.push(savedForm);
                      }
                      setClientDetail({ ...clientDetail, devForms: updatedDevForms });
                    }
                    closeForm(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    amber: 'bg-amber-100 text-amber-600',
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

function TodaySessionCard({
  session,
  onAssessment,
  onDevForm,
}: {
  session: Session;
  onAssessment: () => void;
  onDevForm: () => void;
}) {
  const isConsultation = session.type === 'free_consultation';
  const devFormRequired = !isConsultation && session.program_id;
  const devFormComplete = session.development_form_submitted;

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 hover:bg-white/15 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-white text-lg">
            {session.clients?.full_name || session.client_name || 'Client'}
          </p>
          <p className="text-white/70 text-sm">
            {session.type === 'free_consultation' ? 'Free Consultation' : `Session ${session.session_number || 1}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white font-medium text-lg">{session.time}</p>
        </div>
      </div>

      {/* Form Status */}
      <div className="flex flex-wrap gap-2 mb-4">
        {isConsultation && (
          <span className="px-2 py-1 text-xs font-medium bg-red-500/20 text-red-200 rounded-lg">
            Assessment Required
          </span>
        )}
        {devFormRequired && (
          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
            devFormComplete ? 'bg-green-500/20 text-green-200' : 'bg-amber-500/20 text-amber-200'
          }`}>
            {devFormComplete ? 'Dev Form Complete' : 'Dev Form Required'}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {session.meet_link && (
          <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-white/90 transition-colors">
            <Video className="w-4 h-4" /> Join
          </a>
        )}
        {/* Only show Assessment button for free consultations */}
        {isConsultation && (
          <button onClick={onAssessment}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white/20 text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
            <FileText className="w-4 h-4" /> Assessment
          </button>
        )}
        {devFormRequired && (
          <button onClick={onDevForm}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              devFormComplete 
                ? 'bg-green-500/20 text-green-200 hover:bg-green-500/30' 
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}>
            <FileText className="w-4 h-4" /> {devFormComplete ? 'View Dev Form' : 'Dev Form'}
          </button>
        )}
      </div>
    </div>
  );
}

function SessionCard({
  session, onAssessment, onDevForm, onRefresh, variant = 'default'
}: {
  session: Session;
  onAssessment: () => void;
  onDevForm: () => void;
  onRefresh: () => void;
  variant?: 'default' | 'highlighted';
}) {
  const isHighlighted = variant === 'highlighted';
  const isConsultation = session.type === 'free_consultation';
  const devFormComplete = session.development_form_submitted;

  return (
    <div className={`rounded-lg p-4 ${
      isHighlighted ? 'bg-white/10 backdrop-blur-sm border border-white/20' : 'bg-slate-50 border border-slate-200'
    }`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`font-medium ${isHighlighted ? 'text-white' : 'text-slate-900'}`}>
            {session.clients?.full_name || session.client_name || 'Client'}
          </p>
          <p className={`text-sm ${isHighlighted ? 'text-white/80' : 'text-slate-500'}`}>
            {session.type === 'free_consultation' ? 'Free Consultation' : `Session ${session.session_number || 1}`}
          </p>
          <p className={`text-sm mt-1 ${isHighlighted ? 'text-white/80' : 'text-slate-600'}`}>{session.time}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2 flex-wrap">
        {session.meet_link && (
          <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
              isHighlighted ? 'bg-white text-slate-800' : 'bg-indigo-100 text-indigo-700'
            }`}>
            <Video className="w-3 h-3" /> Join
          </a>
        )}
        {/* Only show Assessment button for free consultations */}
        {isConsultation && (
          <button onClick={onAssessment}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
              isHighlighted ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
            <FileText className="w-3 h-3" /> Assessment
          </button>
        )}
        {session.type !== 'free_consultation' && (
          <button onClick={onDevForm}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
              devFormComplete 
                ? 'bg-green-100 text-green-700' 
                : 'bg-amber-500 text-white'
            }`}>
            <FileText className="w-3 h-3" /> {devFormComplete ? 'View Dev Form' : 'Dev Form'}
          </button>
        )}
      </div>
    </div>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  const stats = client.sessionStats || { upcoming: 0, completed: 0, total: 0 };

  return (
    <button
      onClick={onClick}
      className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 truncate">{client.fullName}</h3>
          <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
            <Mail className="w-3 h-3" />
            <span className="truncate">{client.email}</span>
          </div>
          {client.phone && (
            <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{client.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-blue-700">{stats.upcoming}</p>
          <p className="text-[10px] text-blue-600 font-medium">Upcoming</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-green-700">{stats.completed}</p>
          <p className="text-[10px] text-green-600 font-medium">Completed</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <p className="text-lg font-bold text-slate-700">{stats.total}</p>
          <p className="text-[10px] text-slate-600 font-medium">Total</p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          client.program?.status === 'active' ? 'bg-green-100 text-green-800' :
          client.program?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
          'bg-slate-100 text-slate-800'
        }`}>
          {client.program?.status === 'active' ?
            `Active (${client.program.completedSessions}/${client.program.totalSessions})` :
           client.program?.status === 'completed' ? 'Completed' : 'Free Consultation'}
        </span>
      </div>
    </button>
  );
}

function ClientDetailView({
  client, detail, detailLoading, activeTab, onTabChange,
  onBack, onOpenAssessment, onOpenDevForm, onRefresh,
  documents, onUploadDocument, uploadingDoc, uploadSuccess, baselineScores, onDeleteDocument
}: {
  client: Client;
  detail: any;
  detailLoading: boolean;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onBack: () => void;
  onOpenAssessment: (session: Session) => void;
  onOpenDevForm: (session: Session) => void;
  onRefresh: () => void;
  documents: Document[];
  onUploadDocument: (file: File, sessionId?: string) => void;
  uploadingDoc: boolean;
  uploadSuccess: boolean;
  baselineScores: any;
  onDeleteDocument?: (documentId: string) => Promise<void>;
}) {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'assessments', label: 'Assessments', icon: FileText },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  // Build session_number lookup from sessions data
  const sessionNumberLookup = new Map<string, number>();
  (detail?.sessions || []).forEach((s: any) => {
    if (s.id && s.session_number) {
      sessionNumberLookup.set(s.id, s.session_number);
    }
  });

  const progressSessionScores = (detail?.devForms || [])
    .map((form: any, index: number) => {
      // Get session_number from lookup, or fall back to form's session_number, or use index+1 as last resort
      const sessionNumber = sessionNumberLookup.get(form.session_id) ?? form.session_number ?? (index + 1);
      return {
        sessionNumber,
        date: form.session_date || form.created_at || '',
        nervous_system: form.nervous_system_score || 0,
        emotional_state: form.emotional_state_score || 0,
        cognitive_patterns: form.cognitive_patterns_score || 0,
        body_symptoms: form.body_symptoms_score || 0,
        behavioral_patterns: form.behavioral_patterns_score || 0,
        life_functioning: form.life_functioning_score || 0,
        goal_readiness:
          (form.nervous_system_score || 0) +
          (form.emotional_state_score || 0) +
          (form.cognitive_patterns_score || 0) +
          (form.body_symptoms_score || 0) +
          (form.behavioral_patterns_score || 0) +
          (form.life_functioning_score || 0),
      };
    })
    .filter((item: any, index: number, arr: any[]) => {
      // Remove duplicates by sessionNumber, keeping the first occurrence
      return arr.findIndex((x: any) => x.sessionNumber === item.sessionNumber) === index;
    })
    .sort((a: any, b: any) => a.sessionNumber - b.sessionNumber);
  const overviewBaseline = detail?.assessments?.find((a: any) => a.is_baseline);
  const overviewTimelineData: Array<{
    date: string;
    score: number;
    label: string;
    type: 'baseline' | 'assessment' | 'session';
    data: any;
  }> = [];

  if (overviewBaseline) {
    overviewTimelineData.push({
      date: overviewBaseline.assessed_at || overviewBaseline.created_at,
      score: overviewBaseline.goal_readiness_score || 0,
      label: 'Baseline (Free Consult)',
      type: 'baseline',
      data: overviewBaseline,
    });
  }

  (detail?.assessments || [])
    .filter((a: any) => !a.is_baseline)
    .forEach((a: any) => {
      overviewTimelineData.push({
        date: a.assessed_at || a.created_at,
        score: a.goal_readiness_score || 0,
        label: 'Assessment',
        type: 'assessment',
        data: a,
      });
    });

  (detail?.devForms || []).forEach((f: any, idx: number) => {
    const totalScore =
      (f.nervous_system_score || 0) +
      (f.emotional_state_score || 0) +
      (f.cognitive_patterns_score || 0) +
      (f.body_symptoms_score || 0) +
      (f.behavioral_patterns_score || 0) +
      (f.life_functioning_score || 0);

    overviewTimelineData.push({
      date: f.created_at,
      score: totalScore,
      label: `Session ${f.session_number || idx + 1}`,
      type: 'session',
      data: f,
    });
  });

  overviewTimelineData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
        <ChevronRight className="w-4 h-4 rotate-180" />
        Back to all clients
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <User className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-900">{client.fullName}</h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-slate-500">
              <div className="flex items-center gap-1"><Mail className="w-4 h-4" />{client.email}</div>
              {client.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" />{client.phone}</div>}
            </div>
            <div className="mt-3">
              {client.program?.status === 'active' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {client.program.program_type || 'Program'} ({client.program.completedSessions}/{client.program.totalSessions} sessions)
                </span>
              ) : client.program?.status === 'completed' ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Program Completed
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-800">
                  Free Consultation
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 overflow-x-auto">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {detailLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Session Statistics */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-center">
                      <p className="text-sm text-slate-600 font-medium">Total Sessions</p>
                      <p className="text-3xl font-bold text-slate-900 mt-1">
                        {detail?.sessions?.length || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                      <p className="text-sm text-green-600 font-medium">Completed</p>
                      <p className="text-3xl font-bold text-green-700 mt-1">
                        {detail?.sessions?.filter((s: any) => s.status === 'completed').length || 0}
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200 text-center">
                      <p className="text-sm text-amber-600 font-medium">Upcoming</p>
                      <p className="text-3xl font-bold text-amber-700 mt-1">
                        {detail?.sessions?.filter((s: any) => s.status !== 'completed').length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Progress Timeline Chart */}
                  {overviewTimelineData.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        Progress Timeline
                      </h4>
                      <div className="h-64 w-full">
                        <Line
                          data={{
                            labels: overviewTimelineData.map((d) =>
                              new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            ),
                            datasets: [{
                              label: 'Wellbeing Score',
                              data: overviewTimelineData.map((d) => d.score),
                              borderColor: '#6366F1',
                              backgroundColor: '#EEF2FF',
                              fill: true,
                              tension: 0.4,
                              pointBackgroundColor: overviewTimelineData.map((d) =>
                                d.type === 'baseline' ? '#F59E0B' : d.type === 'session' ? '#10B981' : '#6366F1'
                              ),
                              pointBorderColor: '#fff',
                              pointBorderWidth: 2,
                              pointRadius: 6,
                            }]
                          }}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                backgroundColor: '#fff',
                                titleColor: '#1E293B',
                                bodyColor: '#475569',
                                borderColor: '#E2E8F0',
                                borderWidth: 1,
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                  title: (items: any) => {
                                    const idx = items[0].dataIndex;
                                    return overviewTimelineData[idx]?.label || '';
                                  },
                                  label: (context: any) => `Score: ${context.raw}/60`
                                }
                              }
                            },
                            scales: {
                              x: {
                                grid: { display: false },
                                ticks: { color: '#94A3B8', font: { size: 11 } }
                              },
                              y: {
                                min: 0,
                                max: 60,
                                grid: { color: '#E2E8F0' },
                                ticks: { color: '#94A3B8', font: { size: 12 } }
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-4 mt-4 justify-center text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          <span className="text-slate-600">Baseline</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                          <span className="text-slate-600">Assessment</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-600">Session</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 text-center mt-2">Lower scores indicate improvement</p>
                    </div>
                  )}

                  {/* Latest Assessment Overview */}
                  {detail?.assessments?.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-indigo-600" />
                            Latest Assessment
                            {detail.assessments[detail.assessments.length - 1]?.is_baseline && (
                              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Baseline</span>
                            )}
                          </h4>
                          <span className="text-sm text-slate-500">
                            {new Date(detail.assessments[detail.assessments.length - 1]?.assessed_at || detail.assessments[detail.assessments.length - 1]?.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4">
                        {/* Clinical Summary */}
                        {detail.assessments[detail.assessments.length - 1]?.clinical_condition_brief && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condition Brief</p>
                            <p className="text-sm text-slate-700">{detail.assessments[detail.assessments.length - 1]?.clinical_condition_brief}</p>
                          </div>
                        )}
                        {detail.assessments[detail.assessments.length - 1]?.therapist_focus && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Therapist Focus</p>
                            <p className="text-sm text-slate-700">{detail.assessments[detail.assessments.length - 1]?.therapist_focus}</p>
                          </div>
                        )}
                        {detail.assessments[detail.assessments.length - 1]?.therapy_goal && (
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Therapy Goal</p>
                            <p className="text-sm text-slate-700">{detail.assessments[detail.assessments.length - 1]?.therapy_goal}</p>
                          </div>
                        )}

                        {/* Scores Grid */}
                        <div className="pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Assessment Scores</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                              { label: 'Nervous System', key: 'nervous_system_score' },
                              { label: 'Emotional', key: 'emotional_state_score' },
                              { label: 'Cognitive', key: 'cognitive_patterns_score' },
                              { label: 'Physical', key: 'body_symptoms_score' },
                              { label: 'Behavioral', key: 'behavioral_patterns_score' },
                              { label: 'Life Functioning', key: 'life_functioning_score' },
                            ].map(metric => (
                              <div key={metric.key} className="bg-slate-50 rounded-lg p-3">
                                <p className="text-xs text-slate-500">{metric.label}</p>
                                <p className="text-lg font-semibold text-slate-900">
                                  {detail.assessments[detail.assessments.length - 1]?.[metric.key] || 0}
                                  <span className="text-sm font-normal text-slate-400">/10</span>
                                </p>
                              </div>
                            ))}
                            <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                              <p className="text-xs text-indigo-600 font-medium">Goal Readiness</p>
                              <p className="text-lg font-bold text-indigo-700">
                                {detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0}
                                <span className="text-sm font-normal text-indigo-400">/60</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Progress Comparison */}
                        {detail.assessments.length > 1 && (
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Progress from Baseline</p>
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="text-xs text-slate-500">Baseline</p>
                                <p className="text-2xl font-bold text-slate-700">
                                  {detail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0}/60
                                </p>
                              </div>
                              <div className="flex-1 h-1 bg-slate-200 rounded">
                                <div
                                  className="h-full bg-indigo-500 rounded"
                                  style={{ width: `${((detail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0) / 60) * 100}%` }}
                                />
                              </div>
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <div className="flex-1 h-1 bg-slate-200 rounded">
                                <div
                                  className="h-full bg-green-500 rounded"
                                  style={{ width: `${((detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0) / 60) * 100}%` }}
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-green-600">Current</p>
                                <p className="text-2xl font-bold text-green-700">
                                  {detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0}/60
                                </p>
                              </div>
                            </div>
                            <p className="text-center text-sm text-slate-600 mt-2">
                              Change: <span className={`font-semibold ${
                                (detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0) -
                                (detail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0) >= 0
                                  ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {(detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0) -
                                 (detail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0) >= 0 ? '+' : ''}
                                {(detail.assessments[detail.assessments.length - 1]?.goal_readiness_score || 0) -
                                 (detail.assessments.find((a: any) => a.is_baseline)?.goal_readiness_score || 0)} points
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl p-8 text-center">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No assessments yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'sessions' && (
                <div className="relative">
                  {uploadSuccess && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Document uploaded successfully!</span>
                    </div>
                  )}
                  <SessionsTab
                    sessions={(detail?.sessions || []) as Session[]}
                    documents={documents}
                    assessments={detail?.assessments || []}
                    onOpenAssessment={(s: Session) => onOpenAssessment(s)}
                    onOpenDevForm={(s: Session) => onOpenDevForm(s)}
                    onRefresh={onRefresh}
                    onUploadDocument={onUploadDocument}
                    uploadingDoc={uploadingDoc}
                    onDeleteDocument={onDeleteDocument}
                  />
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {baselineScores ? (
                    <ProgressComparison
                      baselineScores={{
                        nervous_system: baselineScores.nervous_system_score || 0,
                        emotional_state: baselineScores.emotional_state_score || 0,
                        cognitive_patterns: baselineScores.cognitive_patterns_score || 0,
                        body_symptoms: baselineScores.body_symptoms_score || 0,
                        behavioral_patterns: baselineScores.behavioral_patterns_score || 0,
                        life_functioning: baselineScores.life_functioning_score || 0,
                        goal_readiness: baselineScores.goal_readiness_score || 0,
                      }}
                      sessionScores={progressSessionScores}
                    />
                  ) : (
                    <div className="text-center py-12 border border-slate-200 rounded-xl">
                      <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No baseline assessment available yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'assessments' && (
                <div className="space-y-6">
                  {detail?.assessments?.length > 0 ? (
                    detail.assessments.map((a: any) => (
                      <div key={a.id} className="border border-slate-200 rounded-xl overflow-hidden">
                        {/* Assessment Header */}
                        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-slate-900">
                                {a.is_baseline ? 'Baseline Assessment' : 'Assessment'}
                              </h4>
                              {a.is_baseline && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded">Baseline</span>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-indigo-600">{a.goal_readiness_score || 0}/60</p>
                              <p className="text-xs text-slate-500">{new Date(a.assessed_at || a.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 space-y-4">
                          {/* Main Complaint */}
                          {a.main_complaint && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Main Complaint</p>
                              <p className="text-sm text-slate-700">{a.main_complaint}</p>
                            </div>
                          )}

                          {/* Current Symptoms */}
                          {a.current_symptoms && a.current_symptoms.length > 0 && (
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Current Symptoms</p>
                              <div className="flex flex-wrap gap-2">
                                {a.current_symptoms.map((symptom: string, idx: number) => (
                                  <span key={idx} className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded">{symptom}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Clinical Summary */}
                          {(a.clinical_condition_brief || a.therapist_focus || a.therapy_goal) && (
                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Clinical Summary</p>
                              <div className="space-y-3">
                                {a.clinical_condition_brief && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Condition Brief</p>
                                    <p className="text-sm text-slate-700">{a.clinical_condition_brief}</p>
                                  </div>
                                )}
                                {a.therapist_focus && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Therapist Focus</p>
                                    <p className="text-sm text-slate-700">{a.therapist_focus}</p>
                                  </div>
                                )}
                                {a.therapy_goal && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Therapy Goal</p>
                                    <p className="text-sm text-slate-700">{a.therapy_goal}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Domain Scores */}
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Assessment Scores</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {[
                                { label: 'Nervous System', key: 'nervous_system_score', pattern: a.nervous_system_pattern },
                                { label: 'Emotional', key: 'emotional_state_score' },
                                { label: 'Cognitive', key: 'cognitive_patterns_score' },
                                { label: 'Physical', key: 'body_symptoms_score' },
                                { label: 'Behavioral', key: 'behavioral_patterns_score' },
                                { label: 'Life Functioning', key: 'life_functioning_score' },
                              ].map(metric => (
                                <div key={metric.key} className="bg-slate-50 rounded-lg p-3">
                                  <p className="text-xs text-slate-500">{metric.label}</p>
                                  <p className="text-lg font-semibold text-slate-900">
                                    {a[metric.key] || 0}<span className="text-sm font-normal text-slate-400">/10</span>
                                  </p>
                                  {metric.pattern && (
                                    <p className="text-xs text-slate-400 mt-1">Pattern: {metric.pattern}</p>
                                  )}
                                </div>
                              ))}
                              <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                                <p className="text-xs text-indigo-600 font-medium">Goal Readiness</p>
                                <p className="text-lg font-bold text-indigo-700">
                                  {a.goal_readiness_score || 0}<span className="text-sm font-normal text-indigo-400">/60</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Pattern Selections */}
                          {(a.emotional_patterns?.length > 0 || a.cognitive_patterns?.length > 0 || 
                            a.body_symptoms?.length > 0 || a.behavioral_patterns?.length > 0 || 
                            a.life_functioning_patterns?.length > 0) && (
                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Selected Patterns</p>
                              <div className="space-y-2">
                                {a.emotional_patterns?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Emotional Patterns:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {a.emotional_patterns.map((p: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {a.cognitive_patterns?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Cognitive Patterns:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {a.cognitive_patterns.map((p: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {a.body_symptoms?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Body Symptoms:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {a.body_symptoms.map((p: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {a.behavioral_patterns?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Behavioral Patterns:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {a.behavioral_patterns.map((p: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {a.life_functioning_patterns?.length > 0 && (
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Life Functioning:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {a.life_functioning_patterns.map((p: string, i: number) => (
                                        <span key={i} className="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 rounded">{p}</span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Root Cause Analysis */}
                          {(a.root_cause_pattern_timeline || a.root_cause_parental_influence || 
                            a.root_cause_core_patterns || a.root_cause_contributing_factors) && (
                            <div className="pt-4 border-t border-slate-100">
                              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Root Cause Analysis</p>
                              <div className="space-y-2">
                                {a.root_cause_pattern_timeline && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Pattern Timeline</p>
                                    <p className="text-sm text-slate-700">{a.root_cause_pattern_timeline}</p>
                                  </div>
                                )}
                                {a.root_cause_parental_influence && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Parental Influence</p>
                                    <p className="text-sm text-slate-700">{a.root_cause_parental_influence}</p>
                                  </div>
                                )}
                                {a.root_cause_core_patterns && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Core Patterns</p>
                                    <p className="text-sm text-slate-700">{a.root_cause_core_patterns}</p>
                                  </div>
                                )}
                                {a.root_cause_contributing_factors && (
                                  <div className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-xs text-slate-500 mb-1">Contributing Factors</p>
                                    <p className="text-sm text-slate-700">{a.root_cause_contributing_factors}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border border-slate-200 rounded-xl">
                      <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No assessments yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reports' && (
                <ReportsTab
                  clientId={client.userId}
                  assessments={detail?.assessments || []}
                  devForms={detail?.devForms || []}
                  sessions={(detail?.sessions || []) as Session[]}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AvailabilityModal({
  therapistId, availability, onClose, onSave
}: {
  therapistId: string;
  availability: Availability[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [blockDate, setBlockDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'recurring' | 'block'>('recurring');

  const daysOfWeek = [
    { id: 0, label: 'Sunday' }, { id: 1, label: 'Monday' }, { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' }, { id: 4, label: 'Thursday' }, { id: 5, label: 'Friday' },
    { id: 6, label: 'Saturday' },
  ];

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSaveRecurring = async () => {
    if (selectedDays.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/therapist/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_recurring', recurring_days: selectedDays, start_time: startTime, end_time: endTime }),
      });
      if (res.ok) onSave();
    } catch (error) {
      console.error('Failed to save availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockDay = async () => {
    if (!blockDate) return;
    setLoading(true);
    try {
      const res = await fetch('/api/therapist/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'block_full_day', date: blockDate }),
      });
      if (res.ok) onSave();
    } catch (error) {
      console.error('Failed to block day:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      const res = await fetch(`/api/therapist/availability?id=${id}`, { method: 'DELETE' });
      if (res.ok) onSave();
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-slate-900">Manage Availability</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setTab('recurring')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                tab === 'recurring' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Weekly Schedule
            </button>
            <button
              onClick={() => setTab('block')}
              className={`px-4 py-2 text-sm font-medium rounded-lg ${
                tab === 'block' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Block Dates
            </button>
          </div>

          {tab === 'recurring' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map(day => (
                    <button
                      key={day.id}
                      onClick={() => toggleDay(day.id)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        selectedDays.includes(day.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg" />
                </div>
              </div>
              <button
                onClick={handleSaveRecurring}
                disabled={loading || selectedDays.length === 0}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Availability'}
              </button>
            </div>
          )}

          {tab === 'block' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Block a Date</label>
                <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg" />
                <button
                  onClick={handleBlockDay}
                  disabled={loading || !blockDate}
                  className="mt-2 w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Blocking...' : 'Block This Day'}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Blocked Dates</label>
                <div className="space-y-2">
                  {availability.filter(a => a.is_blocked && a.exception_date).map(block => (
                    <div key={block.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-red-700">
                        {new Date(block.exception_date + 'T00:00:00').toLocaleDateString()}
                      </span>
                      <button onClick={() => handleDeleteBlock(block.id)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {availability.filter(a => a.is_blocked && a.exception_date).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No blocked dates</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
