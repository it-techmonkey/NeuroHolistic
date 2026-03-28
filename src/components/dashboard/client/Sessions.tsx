'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, X, FileText, CheckCircle, AlertCircle, User, Stethoscope, Activity, TrendingUp, Award } from 'lucide-react';

type Slot = {
  time: string;
  display: string;
};

type ProgramStatus = 'active' | 'completed' | 'consultation_done' | 'none';
type SessionFilter = 'all' | 'upcoming' | 'completed';

export default function Sessions({
  upcoming,
  past,
  pending,
  programStatus = 'none',
  hasActiveProgram = false,
  assessments = [],
  devForms = [],
}: {
  upcoming: any[];
  past: any[];
  pending?: any[];
  programStatus?: ProgramStatus;
  hasActiveProgram?: boolean;
  assessments?: any[];
  devForms?: any[];
}) {
  const [reschedulingSession, setReschedulingSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');

  useEffect(() => {
    if (!reschedulingSession || !selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchSlots() {
      setSlotsLoading(true);
      setRescheduleError('');
      try {
        const res = await fetch(
          `/api/bookings/availability?therapistId=${reschedulingSession.therapist_user_id || reschedulingSession.therapist_id}&date=${selectedDate}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
        }
      } catch {
        setRescheduleError('Could not load availability');
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [reschedulingSession, selectedDate]);

  const handleRescheduleConfirm = async () => {
    if (!reschedulingSession || !selectedDate || !selectedSlot) return;

    setRescheduleError('');
    try {
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reschedulingSession.id,
          newDate: selectedDate,
          newTime: selectedSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reschedule failed');
      }

      setRescheduleSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setRescheduleError(err.message);
    }
  };

  const closeReschedule = () => {
    setReschedulingSession(null);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot('');
    setRescheduleError('');
    setRescheduleSuccess(false);
  };

  // Check if user has a scheduled consultation
  const scheduledConsultation = upcoming.find((s: any) => s.type === 'free_consultation' && s.status === 'confirmed');
  const hasScheduledConsultation = !!scheduledConsultation;

  // Filtered past sessions for completed filter
  const filteredPast = sessionFilter === 'completed'
    ? past.filter(s => s.status === 'completed')
    : past;

  // Calculate progress metrics
  // Note: goal_readiness_score is a symptom severity score (0=optimal, 60=severe)
  // Lower scores = improvement, so we calculate firstScore - lastScore for positive improvement
  const latestAssessment = assessments?.length > 0 ? assessments[assessments.length - 1] : null;
  const firstAssessment = assessments?.length > 0 ? assessments[0] : null;
  const progressChange = latestAssessment && firstAssessment
    ? (firstAssessment.goal_readiness_score || 0) - (latestAssessment.goal_readiness_score || 0)
    : 0;

  // Determine what action buttons to show
  const getActionButtons = () => {
    switch (programStatus) {
      case 'active':
        return (
          <div className="flex space-x-3">
            <Link
              href="/booking/schedule-session"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Next Session
            </Link>
          </div>
        );
      case 'completed':
        return (
          <div className="flex space-x-3">
            <Link
              href="/booking/paid-program-booking"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book a New Program
            </Link>
          </div>
        );
      case 'consultation_done':
        return (
          <div className="flex space-x-3">
            <Link
              href="/booking/paid-program-booking"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book a Paid Program
            </Link>
          </div>
        );
      case 'none':
      default:
        return (
          <div className="flex space-x-3">
            <Link
              href="/consultation/book"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Free Consultation
            </Link>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Session Statistics - Clickable */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setSessionFilter(sessionFilter === 'upcoming' ? 'all' : 'upcoming')}
          className={`text-left bg-gradient-to-br rounded-xl p-4 border transition-all cursor-pointer ${
            sessionFilter === 'upcoming'
              ? 'from-indigo-100 to-purple-100 border-indigo-300 ring-2 ring-indigo-200'
              : 'from-indigo-50 to-purple-50 border-indigo-100 hover:border-indigo-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-sm text-indigo-600 font-medium">Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-indigo-700">{upcoming.length}</p>
        </button>
        <button
          onClick={() => setSessionFilter(sessionFilter === 'completed' ? 'all' : 'completed')}
          className={`text-left bg-gradient-to-br rounded-xl p-4 border transition-all cursor-pointer ${
            sessionFilter === 'completed'
              ? 'from-green-100 to-emerald-100 border-green-300 ring-2 ring-green-200'
              : 'from-green-50 to-emerald-50 border-green-100 hover:border-green-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Completed</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{past.filter(s => s.status === 'completed').length}</p>
        </button>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span className="text-sm text-amber-600 font-medium">Dev Forms</span>
          </div>
          <p className="text-2xl font-bold text-amber-700">{devForms?.length || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Assessments</span>
          </div>
          <p className="text-2xl font-bold text-purple-700">{assessments?.length || 0}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'all' as SessionFilter, label: 'All Sessions', count: upcoming.length + past.length },
          { id: 'upcoming' as SessionFilter, label: 'Upcoming', count: upcoming.length },
          { id: 'completed' as SessionFilter, label: 'Completed', count: past.filter(s => s.status === 'completed').length },
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

      {/* Progress Summary Card */}
      {latestAssessment && firstAssessment && (
        <div className={`rounded-2xl p-6 border ${
          progressChange >= 0 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
            : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium uppercase tracking-wider ${
                progressChange >= 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {progressChange >= 0 ? 'Symptom Reduction' : 'Symptom Increase'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                progressChange >= 0 ? 'text-green-700' : 'text-amber-700'
              }`}>
                {progressChange >= 0 ? '+' : ''}{progressChange} points
              </p>
              <p className={`text-sm mt-1 ${
                progressChange >= 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                From {firstAssessment.goal_readiness_score || 0} to {latestAssessment.goal_readiness_score || 0}/60
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Lower scores indicate improved wellbeing
              </p>
            </div>
            <div className={`p-4 rounded-2xl ${
              progressChange >= 0 ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              {progressChange >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-600" />
              ) : (
                <Award className="w-8 h-8 text-amber-600" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Consultation Banner */}
      {hasScheduledConsultation && (
        <section>
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-emerald-900">Free Consultation Scheduled</h3>
                <p className="text-sm text-emerald-700 mt-1">
                  Your consultation is booked. Join using the link when it's time.
                </p>
                <p className="text-sm text-emerald-600 mt-2 font-medium">
                  {new Date(scheduledConsultation.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {scheduledConsultation.time}
                </p>
                {scheduledConsultation.therapist_name && (
                  <p className="text-xs text-emerald-500 mt-1">Therapist: {scheduledConsultation.therapist_name}</p>
                )}
              </div>
              <div className="flex space-x-3">
                {scheduledConsultation.meeting_link && (
                  <a
                    href={scheduledConsultation.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Join Session
                  </a>
                )}
                <button
                  onClick={() => setReschedulingSession(scheduledConsultation)}
                  className="inline-flex items-center px-5 py-2.5 border border-emerald-300 text-sm font-medium rounded-xl text-emerald-700 bg-white hover:bg-emerald-50"
                >
                  Reschedule
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Program Actions */}
      {!hasScheduledConsultation && (
        <section>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  {programStatus === 'active' ? 'Your Therapy Program' :
                   programStatus === 'completed' ? 'Program Completed' :
                   programStatus === 'consultation_done' ? 'Free Consultation Completed' :
                   'Start Your Wellness Journey'}
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  {programStatus === 'active' ? 'You have an active program. Book your next session.' :
                   programStatus === 'completed' ? 'You have completed your program. Book another to continue your journey.' :
                   programStatus === 'consultation_done' ? 'Great start! Book a paid program to continue your therapy journey.' :
                   'Book a free consultation to begin your healing journey.'}
                </p>
              </div>
              <div className="hidden md:block">
                {getActionButtons()}
              </div>
            </div>
            <div className="mt-4 md:hidden">
              {getActionButtons()}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Sessions - Filtered */}
      {(sessionFilter === 'all' || sessionFilter === 'upcoming') && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
            Upcoming Sessions
          </h2>
          {upcoming.length === 0 ? (
            <div className="bg-slate-50 p-8 rounded-xl border border-slate-200 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming sessions scheduled.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map(session => (
                <div key={session.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        session.type === 'free_consultation' ? 'bg-purple-100' : 'bg-indigo-100'
                      }`}>
                        <User className={`w-6 h-6 ${
                          session.type === 'free_consultation' ? 'text-purple-600' : 'text-indigo-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {session.type === 'free_consultation' ? 'Free Consultation' :
                           session.session_number ? `Session #${session.session_number}` : 'Session'}
                        </div>
                        <div className="text-sm text-slate-600 flex items-center space-x-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.time}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Therapist: {session.therapist_name || 'Assigned'}</div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      {session.meeting_link && (
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Join Session
                        </a>
                      )}
                      {hasActiveProgram && (
                        <button
                          onClick={() => setReschedulingSession(session)}
                          className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50"
                        >
                          Reschedule
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pending Sessions - Only show for active programs */}
      {hasActiveProgram && pending && pending.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
            Pending Sessions
          </h2>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
            <div className="text-center">
              <p className="text-slate-700 mb-4">
                You have {pending.length} session{pending.length > 1 ? 's' : ''} waiting to be scheduled.
              </p>
              <Link
                href="/booking/schedule-session"
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-amber-600 hover:bg-amber-700 shadow-sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Next Session
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Past Sessions - Filtered */}
      {(sessionFilter === 'all' || sessionFilter === 'completed') && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-slate-400" />
            {sessionFilter === 'completed' ? 'Completed Sessions' : 'Past Sessions'}
          </h2>
          {filteredPast.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              {sessionFilter === 'completed' ? 'No completed sessions yet.' : 'No past sessions.'}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              {filteredPast.map(session => (
                <div key={session.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      session.status === 'completed' ? 'bg-green-100' : 'bg-slate-100'
                    }`}>
                      {session.status === 'completed' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900">
                        {session.type === 'free_consultation' ? 'Free Consultation' :
                         session.session_number ? `Session #${session.session_number}` : 'Session'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(session.date).toLocaleDateString()} at {session.time}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Dev Forms Section */}
      {devForms && devForms.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Session Progress Notes
          </h2>
          <div className="space-y-4">
            {devForms.map((form: any) => (
              <div key={form.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-purple-50 px-4 py-3 border-b border-slate-200">
                  <div className="flex justify-between items-center">
                    <p className="font-medium text-slate-900">
                      Session {form.session_number || '?'}
                    </p>
                    <p className="text-sm text-slate-500">
                      {new Date(form.session_date || form.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="p-4 space-y-4">
                  {/* Integration Notes */}
                  {form.integration_notes && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Integration Notes</p>
                      <p className="text-sm text-slate-700">{form.integration_notes}</p>
                    </div>
                  )}

                  {/* Shift Observed */}
                  {form.shift_observed && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Shift Observed</p>
                      <p className="text-sm text-slate-700">{form.shift_observed}</p>
                    </div>
                  )}

                  {/* Client Feedback */}
                  {form.client_feedback && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your Feedback</p>
                      <p className="text-sm text-slate-700">{form.client_feedback}</p>
                    </div>
                  )}

                  {/* Session Scores */}
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Session Scores</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-green-50 rounded-lg p-2">
                        <p className="text-lg font-bold text-green-700">
                          {(form.nervous_system_score ?? 0) + (form.emotional_state_score ?? 0) +
                           (form.cognitive_patterns_score ?? 0) + (form.body_symptoms_score ?? 0) +
                           (form.behavioral_patterns_score ?? 0) + (form.life_functioning_score ?? 0)}/60
                        </p>
                        <p className="text-[10px] text-green-600">Wellbeing</p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <p className="text-lg font-bold text-blue-700">{form.post_session_mood ?? 0}/10</p>
                        <p className="text-[10px] text-blue-600">Mood</p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <p className="text-lg font-bold text-purple-700">{form.post_session_intensity ?? 0}/10</p>
                        <p className="text-[10px] text-purple-600">Intensity</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Reschedule Modal */}
      {reschedulingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Reschedule Session</h3>
              <button onClick={closeReschedule} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            {rescheduleSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-green-700 font-medium text-lg">Session rescheduled successfully!</p>
                <p className="text-sm text-slate-500 mt-2">Reloading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rescheduleError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {rescheduleError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Time</label>
                    {slotsLoading ? (
                      <p className="text-sm text-slate-400">Loading availability...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map(slot => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-2 text-xs rounded-lg border transition-colors ${
                              selectedSlot === slot.time
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                            }`}
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={closeReschedule} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleConfirm}
                    disabled={!selectedSlot}
                    className={`px-6 py-2.5 text-sm rounded-xl text-white font-medium ${
                      selectedSlot ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
