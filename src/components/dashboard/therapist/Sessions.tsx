'use client';
import { useState, useEffect } from 'react';
import { Loader2, Video, FileText, CheckCircle, Clock, Calendar, User, ExternalLink, XCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Link2, Unlink } from 'lucide-react';
import DiagnosticAssessmentForm from './DiagnosticAssessmentForm';
import SessionDevelopmentForm from './SessionDevelopmentForm';
import UploadMaterial from './UploadMaterial';
import MarkComplete from './MarkComplete';

export default function Sessions({ therapistId }: { therapistId: string }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Google Calendar state
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  
  // Modal State
  const [activeSession, setActiveSession] = useState<any>(null);
  const [modalType, setModalType] = useState<'diagnostic' | 'development' | null>(null);

  // Check Google Calendar status
  const checkGoogleStatus = async () => {
    try {
      const res = await fetch('/api/google/status');
      if (res.ok) {
        const data = await res.json();
        setGoogleConnected(data.connected);
      }
    } catch {
      setGoogleConnected(false);
    }
  };

  // Connect Google Calendar
  const handleConnectGoogle = async () => {
    setConnectingGoogle(true);
    try {
      const res = await fetch('/api/google/connect');
      const data = await res.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      console.error('Failed to connect Google:', err);
      setConnectingGoogle(false);
    }
  };

  // Check for OAuth callback results in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      window.history.replaceState({}, '', window.location.pathname);
      checkGoogleStatus();
    }
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`/api/therapist/sessions?therapistId=${therapistId}`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    checkGoogleStatus();
  }, [therapistId]);

  const openForm = (session: any, type: 'diagnostic' | 'development') => {
    setActiveSession(session);
    setModalType(type);
  };

  const closeForm = (refresh = false) => {
    setActiveSession(null);
    setModalType(null);
    if (refresh) fetchSessions();
  };

  const now = new Date();
  const upcomingSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date || s.start_time);
    return sessionDate >= now && s.status !== 'completed';
  }).sort((a, b) => new Date(a.date || a.start_time).getTime() - new Date(b.date || b.start_time).getTime());

  const completedSessions = sessions.filter(s => s.status === 'completed' || new Date(s.date || s.start_time) < now)
    .sort((a, b) => new Date(b.date || b.start_time).getTime() - new Date(a.date || a.start_time).getTime());

  const displayedSessions = filter === 'upcoming' ? upcomingSessions : filter === 'completed' ? completedSessions : sessions;

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  };

  const getSessionsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading sessions...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sessions</h2>
          <p className="text-sm text-slate-500">Manage your sessions and join meetings</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Google Calendar Status */}
          <div className="flex items-center gap-2">
            {googleConnected === true ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                <Link2 className="w-4 h-4" />
                Calendar Connected
              </span>
            ) : googleConnected === false ? (
              <button
                onClick={handleConnectGoogle}
                disabled={connectingGoogle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200 hover:bg-blue-100 disabled:opacity-50 transition-colors"
              >
                {connectingGoogle ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Unlink className="w-4 h-4" />
                )}
                Connect Calendar
              </button>
            ) : null}
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'list' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === 'calendar' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-600 border border-slate-300'
              }`}
            >
              Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
          <p className="text-xs text-blue-500">Upcoming</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
          <p className="text-xs text-green-500">Completed</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{upcomingSessions.filter(s => s.meet_link || s.meeting_link).length}</p>
          <p className="text-xs text-yellow-600">With Meet Link</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{sessions.length}</p>
          <p className="text-xs text-purple-500">Total Sessions</p>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold text-slate-900">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              if (!day) return <div key={idx} className="h-24 bg-slate-50 rounded-lg" />;
              
              const daySessions = getSessionsForDate(day);
              const isToday = day.toDateString() === now.toDateString();
              const isSelected = day.toDateString() === currentMonth.toDateString();

              return (
                <div
                  key={idx}
                  className={`h-24 p-1 border rounded-lg overflow-hidden ${
                    isToday ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
                  } hover:border-indigo-300 transition-colors`}
                >
                  <div className={`text-xs font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-14">
                    {daySessions.slice(0, 2).map((session: any) => (
                      <div
                        key={session.id}
                        className={`text-[10px] px-1 py-0.5 rounded truncate ${
                          session.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}
                        title={`${session.client_name} - ${session.time || 'No time'}`}
                      >
                        {session.time || '—'} {session.client_name?.split(' ')[0]}
                      </div>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-[10px] text-slate-500 px-1">
                        +{daySessions.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
              <span className="text-xs text-slate-600">Upcoming</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span className="text-xs text-slate-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-indigo-50 border border-indigo-500"></div>
              <span className="text-xs text-slate-600">Today</span>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <>
          {/* Filter Tabs */}
          <div className="flex space-x-2 border-b border-slate-200">
            {[
              { id: 'upcoming', label: 'Upcoming', count: upcomingSessions.length },
              { id: 'completed', label: 'Completed', count: completedSessions.length },
              { id: 'all', label: 'All Sessions', count: sessions.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  filter === tab.id
                    ? 'border-b-2 border-indigo-600 text-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Upcoming Sessions with Meet Links - Prominent Section */}
          {filter === 'upcoming' && upcomingSessions.filter(s => s.meet_link || s.meeting_link).length > 0 && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingSessions.filter(s => s.meet_link || s.meeting_link).slice(0, 4).map((session) => (
                  <div key={session.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{session.client_name || session.clients?.full_name}</p>
                        <p className="text-sm text-white/80">
                          {session.session_number ? `Session #${session.session_number}` : 'Free Consultation'}
                        </p>
                        <p className="text-sm text-white/80 mt-1">
                          {session.date ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : ''} at {session.time}
                        </p>
                      </div>
                    </div>
                    <a
                      href={session.meet_link || session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                    >
                      <Video className="w-4 h-4" />
                      Join Meeting
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-4">
            {displayedSessions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 font-medium">No {filter} sessions</h3>
              </div>
            ) : (
              displayedSessions.map((session) => (
                <div key={session.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-lg ${
                          session.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {session.status === 'completed' ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Video className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">
                              {session.session_number ? `Session #${session.session_number}` : 'Free Consultation'}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              session.status === 'completed' ? 'bg-green-100 text-green-700' :
                              session.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {session.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                            <User className="w-4 h-4" />
                            <span>{session.client_name || session.clients?.full_name || 'Client'}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{session.date ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Not scheduled'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{session.time || 'Not set'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        {(session.meet_link || session.meeting_link) && session.status !== 'completed' && (
                          <a
                            href={session.meet_link || session.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            Join
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        <button
                          onClick={() => openForm(session, 'diagnostic')}
                          className="inline-flex items-center gap-1 px-3 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50"
                        >
                          <FileText className="w-4 h-4" />
                          Assessment
                        </button>
                        {/* Only show Dev Form for program sessions, not free consultations */}
                        {session.type !== 'free_consultation' && session.program_id && (
                          <button
                            onClick={() => openForm(session, 'development')}
                            className={`inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg ${
                              session.development_form_submitted 
                                ? 'border border-green-300 bg-green-50 text-green-700' 
                                : 'border border-yellow-300 bg-yellow-50 text-yellow-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            {session.development_form_submitted ? 'Dev Form ✓' : 'Dev Form'}
                          </button>
                        )}
                        
                        <UploadMaterial sessionId={session.id} onUploadComplete={() => {}} />
                        
                        {/* For free consultations, allow completion without development form */}
                        {/* For program sessions, require development form */}
                        <MarkComplete 
                          sessionId={session.id} 
                          isReady={session.type === 'free_consultation' || !session.program_id || session.development_form_submitted} 
                          isCompleted={session.status === 'completed'}
                          onComplete={() => fetchSessions()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal for Forms */}
      {activeSession && modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button 
              onClick={() => closeForm()}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
            >
              <XCircle className="w-8 h-8" />
            </button>
            
            <div className="p-8">
              {modalType === 'diagnostic' && (
                <DiagnosticAssessmentForm 
                  clientId={activeSession.client_id}
                  therapistId={therapistId}
                  sessionId={activeSession.id}
                  clientData={
                    activeSession.clients
                      ? {
                          full_name: activeSession.clients.full_name,
                          email: activeSession.clients.email,
                          phone: activeSession.clients.phone,
                          country: activeSession.clients.country,
                        }
                      : undefined
                  }
                  onClose={() => closeForm(false)}
                  onSave={() => closeForm(true)}
                />
              )}
              {modalType === 'development' && (
                 <SessionDevelopmentForm
                   sessionId={activeSession.id}
                   clientId={activeSession.client_id}
                   therapistId={therapistId}
                   sessionNumber={activeSession.session_number || 1}
                   sessionDate={activeSession.date || new Date().toISOString().split('T')[0]}
                   onClose={() => closeForm(false)}
                   onSave={() => closeForm(true)}
                 />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
