'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Loader2, Video, FileText, User, Mail, TrendingUp, ChevronRight,
  X, Upload, Eye, Download, BarChart3, File, Image, CheckCircle,
  Stethoscope, Activity, Brain, Heart, Shield, Award, Calendar,
  TrendingUp as TrendUp, Printer, Share2, FileSpreadsheet, TrendingDown,
  Lock
} from 'lucide-react';
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
import MarkComplete from './MarkComplete';

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

// Sessions Tab Component - Shows session-level data with documents and forms
export function SessionsTab({
  sessions, documents, onOpenAssessment, onOpenDevForm, onRefresh, onUploadDocument, uploadingDoc
}: {
  sessions: Session[];
  documents: Document[];
  onOpenAssessment: (s: Session) => void;
  onOpenDevForm: (s: Session) => void;
  onRefresh: () => void;
  onUploadDocument: (file: File, sessionId?: string) => void;
  uploadingDoc: boolean;
}) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const getSessionDocuments = (sessionId: string) => {
    return documents.filter(d => d.session_id === sessionId);
  };

  const handleUploadClick = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSessionId) {
      onUploadDocument(file, selectedSessionId);
    }
  };

  // Separate completed and upcoming sessions
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const upcomingSessions = sessions.filter(s => s.status !== 'completed');

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-600 font-medium">Total Sessions</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{sessions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{completedSessions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{upcomingSessions.length}</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            Upcoming Sessions
          </h3>
          <div className="space-y-4">
            {upcomingSessions.map((s: Session) => (
              <SessionCard
                key={s.id}
                session={s}
                documents={documents}
                isExpanded={expandedSession === s.id}
                onToggle={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                onOpenAssessment={() => onOpenAssessment(s)}
                onOpenDevForm={() => onOpenDevForm(s)}
                onRefresh={onRefresh}
                onUploadDocument={() => handleUploadClick(s.id)}
                uploadingDoc={uploadingDoc}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Sessions */}
      {completedSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed Sessions
          </h3>
          <div className="space-y-4">
            {completedSessions.map((s: Session) => (
              <SessionCard
                key={s.id}
                session={s}
                documents={documents}
                isExpanded={expandedSession === s.id}
                onToggle={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                onOpenAssessment={() => onOpenAssessment(s)}
                onOpenDevForm={() => onOpenDevForm(s)}
                onRefresh={onRefresh}
                onUploadDocument={() => handleUploadClick(s.id)}
                uploadingDoc={uploadingDoc}
                isCompleted
              />
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No sessions yet</p>
        </div>
      )}
    </div>
  );
}

// Individual Session Card Component
function SessionCard({
  session,
  documents,
  isExpanded,
  onToggle,
  onOpenAssessment,
  onOpenDevForm,
  onRefresh,
  onUploadDocument,
  uploadingDoc,
  isCompleted = false
}: {
  session: Session;
  documents: Document[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenAssessment: () => void;
  onOpenDevForm: () => void;
  onRefresh: () => void;
  onUploadDocument: () => void;
  uploadingDoc: boolean;
  isCompleted?: boolean;
}) {
  const isConsultation = session.type === 'free_consultation';
  const devFormRequired = !isConsultation && session.program_id;
  const devFormComplete = session.development_form_submitted;
  const sessionDocs = documents.filter(d => d.session_id === session.id);

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
                  {session.session_number ? `Session #${session.session_number}` : 'Free Consultation'}
                </p>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {session.date ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                }) : 'Not scheduled'}
                {session.time && ` at ${session.time}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Form Status Indicators */}
            <div className="flex gap-2">
              {devFormRequired && (
                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                  devFormComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {devFormComplete ? 'Dev Form Complete' : 'Dev Form Required'}
                </span>
              )}
              {isConsultation && (
                <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg">
                  Assessment Required
                </span>
              )}
            </div>

            {sessionDocs.length > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-lg">
                {sessionDocs.length} Doc{sessionDocs.length > 1 ? 's' : ''}
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
            {session.meet_link && !isCompleted && (
              <a href={session.meet_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                <Video className="w-4 h-4" /> Join Session
              </a>
            )}
            {/* Only show Assessment button for free consultations */}
            {isConsultation && (
              <button onClick={onOpenAssessment}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 border border-red-200 hover:bg-red-200">
                <FileText className="w-4 h-4" /> Assessment Form
                <span className="text-xs">(Required)</span>
              </button>
            )}
            {devFormRequired && (
              <button onClick={onOpenDevForm}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  devFormComplete ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                }`}>
                <FileText className="w-4 h-4" /> {devFormComplete ? 'View Dev Form' : 'Dev Form'}
                {!devFormComplete && <span className="text-xs">(Required)</span>}
                {devFormComplete && <CheckCircle className="w-4 h-4" />}
              </button>
            )}
            {!isCompleted && (
              <button onClick={onUploadDocument}
                disabled={uploadingDoc}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors">
                <Upload className="w-4 h-4" /> {uploadingDoc ? 'Uploading...' : 'Upload Document'}
              </button>
            )}
            {!isCompleted && (
              <MarkComplete
                sessionId={session.id}
                isReady={isConsultation ? true : (devFormComplete ?? false)}
                isCompleted={session.status === 'completed'}
                onComplete={onRefresh}
              />
            )}
          </div>

          {/* Session Documents */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <File className="w-4 h-4" /> Documents & Attachments
              {isCompleted && (
                <span className="text-xs font-normal text-slate-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Session locked
                </span>
              )}
            </h4>
            {sessionDocs.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2">
                {sessionDocs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      doc.type === 'pdf' ? 'bg-red-100 text-red-600' :
                      doc.type === 'video' ? 'bg-purple-100 text-purple-600' :
                      doc.type === 'image' ? 'bg-green-100 text-green-600' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {doc.type === 'pdf' ? <FileText className="w-5 h-5" /> :
                       doc.type === 'video' ? <Video className="w-5 h-5" /> :
                       doc.type === 'image' ? <Image className="w-5 h-5" /> :
                       <File className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                      <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                <File className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No documents uploaded for this session</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Reports Tab Component - Clean Professional Medical Style
export function ReportsTab({
  clientId, assessments, devForms, sessions
}: {
  clientId: string;
  assessments: any[];
  devForms: any[];
  sessions: Session[];
}) {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<'assessment' | 'development'>('assessment');
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [selectedDevForm, setSelectedDevForm] = useState<any>(null);

  const baseline = assessments.find((a: any) => a.is_baseline);
  const latest = assessments[assessments.length - 1];
  const currentAssessment = selectedAssessment || latest;

  // Calculate progress metrics
  const firstScore = baseline?.goal_readiness_score || assessments[0]?.goal_readiness_score || 0;
  const lastScore = latest?.goal_readiness_score || 0;
  const improvement = firstScore - lastScore;

  if (assessments.length === 0 && devForms.length === 0) {
    return (
      <div className="text-center py-16 border border-slate-200 rounded-xl">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No Report Data Available</h3>
        <p className="text-slate-500 mt-2">Reports will appear once assessments and development forms are completed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveReport('assessment')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeReport === 'assessment'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Assessment Report
        </button>
        <button
          onClick={() => setActiveReport('development')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeReport === 'development'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Development Report
        </button>
      </div>

      {/* Progress Summary */}
      {assessments.length > 0 && (
        <div className={`border rounded-lg p-6 ${
          improvement >= 0 ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm uppercase tracking-wider ${
                improvement >= 0 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {improvement >= 0 ? 'Symptom Reduction' : 'Symptom Increase'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                improvement >= 0 ? 'text-green-700' : 'text-amber-700'
              }`}>
                {improvement >= 0 ? '+' : ''}{improvement} points
              </p>
              <p className="text-sm text-slate-600 mt-1">
                From {firstScore} to {lastScore}/60
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Lower scores indicate improved wellbeing
              </p>
            </div>
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
              improvement >= 0 ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              {improvement >= 0 ? (
                <TrendingDown className="w-8 h-8 text-green-600" />
              ) : (
                <TrendingUp className="w-8 h-8 text-amber-600" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Progress Timeline Chart */}
      {assessments.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Progress Timeline</h3>
          <div className="h-64 w-full">
            <Line
              data={{
                labels: assessments.map((a: any, i: number) =>
                  new Date(a.assessed_at || a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                ),
                datasets: [{
                  label: 'Score',
                  data: assessments.map((a: any) => a.goal_readiness_score || 0),
                  borderColor: '#6366F1',
                  backgroundColor: '#EEF2FF',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#6366F1',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 2,
                  pointRadius: 4,
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
                      label: (context: any) => `${context.raw}/60`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: '#94A3B8', font: { size: 12 } }
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
        </div>
      )}

      {/* Assessment Report */}
      {activeReport === 'assessment' && (
        <div className="space-y-6">
          {/* Assessment Selector */}
          {assessments.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {assessments.map((a: any, idx: number) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAssessment(a)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    (selectedAssessment?.id === a.id) || (!selectedAssessment && idx === assessments.length - 1)
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {a.is_baseline ? 'Baseline' : `Assessment ${idx}`}
                </button>
              ))}
            </div>
          )}

          {/* Report Document */}
          {currentAssessment && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              {/* Report Header */}
              <div className="border-b border-slate-200 p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">Clinical Assessment Report</h2>
                    <p className="text-sm text-slate-500 mt-1">NeuroHolistic Institute - Confidential</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <Download className="w-4 h-4" /> Export
                    </button>
                  </div>
                </div>

                {/* Client Info */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Client Name</p>
                    <p className="font-medium text-slate-900">{currentAssessment.client_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Assessment Date</p>
                    <p className="font-medium text-slate-900">
                      {new Date(currentAssessment.assessed_at || currentAssessment.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Assessment Type</p>
                    <p className="font-medium text-slate-900">{currentAssessment.is_baseline ? 'Baseline' : 'Follow-up'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Report Generated</p>
                    <p className="font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Clinical Summary */}
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Clinical Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Condition Brief</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {currentAssessment.clinical_condition_brief || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Therapist Main Focus</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {currentAssessment.therapist_focus || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Therapy Goal</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {currentAssessment.therapy_goal || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scores Section */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Assessment Scores</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Nervous System', key: 'nervous_system_score' },
                    { label: 'Emotional', key: 'emotional_state_score' },
                    { label: 'Cognitive', key: 'cognitive_patterns_score' },
                    { label: 'Physical', key: 'body_symptoms_score' },
                    { label: 'Behavioral', key: 'behavioral_patterns_score' },
                    { label: 'Life Functioning', key: 'life_functioning_score' },
                  ].map(metric => (
                    <div key={metric.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-700">☐ {metric.label}</span>
                      <span className="text-sm font-medium text-slate-900">
                        {currentAssessment[metric.key] || 0} <span className="text-slate-400">Out of 10</span>
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 bg-slate-50 rounded-lg px-3 mt-4">
                    <span className="text-sm font-semibold text-slate-900">☐ Goal Readiness</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {currentAssessment.goal_readiness_score || 0} <span className="text-slate-400 font-normal">Out of 60</span>
                    </span>
                  </div>
                </div>

                {/* Progress Comparison */}
                {baseline && latest && currentAssessment.id === latest.id && baseline.id !== latest.id && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-900 mb-4">Progress from Baseline</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 border border-slate-200 rounded-lg">
                        <p className="text-xs text-slate-500 uppercase">Baseline</p>
                        <p className="text-2xl font-bold text-slate-700 mt-1">{baseline.goal_readiness_score || 0}/60</p>
                        <p className="text-xs text-slate-400 mt-1">Starting point</p>
                      </div>
                      <div className={`text-center p-4 border rounded-lg ${
                        (latest.goal_readiness_score || 0) <= (baseline.goal_readiness_score || 0)
                          ? 'border-green-200 bg-green-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}>
                        <p className={`text-xs uppercase ${
                          (latest.goal_readiness_score || 0) <= (baseline.goal_readiness_score || 0)
                            ? 'text-green-600'
                            : 'text-amber-600'
                        }`}>
                          Current
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${
                          (latest.goal_readiness_score || 0) <= (baseline.goal_readiness_score || 0)
                            ? 'text-green-700'
                            : 'text-amber-700'
                        }`}>
                          {latest.goal_readiness_score || 0}/60
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Lower is better</p>
                      </div>
                    </div>
                    <p className="text-center text-sm mt-4">
                      {/* Note: goal_readiness_score is a symptom severity score (0=optimal, 60=severe) 
                          Lower scores = improvement, so we calculate baseline - latest for positive improvement */}
                      <span className={`font-semibold ${
                        (baseline.goal_readiness_score || 0) - (latest.goal_readiness_score || 0) >= 0
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(baseline.goal_readiness_score || 0) - (latest.goal_readiness_score || 0) >= 0 ? '↓' : '↑'}{' '}
                        {Math.abs((baseline.goal_readiness_score || 0) - (latest.goal_readiness_score || 0))} points{' '}
                        {(baseline.goal_readiness_score || 0) - (latest.goal_readiness_score || 0) >= 0 ? 'reduction' : 'increase'} in symptoms
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Development Report */}
      {activeReport === 'development' && (
        <div className="space-y-6">
          {devForms.length > 0 ? (
            <>
              {/* Dev Form Selector */}
              {devForms.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                  {devForms.map((f: any, idx: number) => (
                    <button
                      key={f.id || idx}
                      onClick={() => setSelectedDevForm(f)}
                      className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                        selectedDevForm?.id === f.id || (!selectedDevForm && idx === 0)
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      Session #{f.session_number || idx + 1}
                    </button>
                  ))}
                </div>
              )}

              {/* Report Document */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                {(() => {
                  const form = selectedDevForm || devForms[0];
                  return (
                    <>
                      {/* Report Header */}
                      <div className="border-b border-slate-200 p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-semibold text-slate-900">Session Development Report</h2>
                            <p className="text-sm text-slate-500 mt-1">NeuroHolistic Institute - Confidential</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <Printer className="w-4 h-4" /> Print
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50">
                              <Download className="w-4 h-4" /> Export
                            </button>
                          </div>
                        </div>

                        {/* Session Info */}
                        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-slate-500">Session Number</p>
                            <p className="font-medium text-slate-900">#{form.session_number || '-'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Session Date</p>
                            <p className="font-medium text-slate-900">
                              {new Date(form.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500">Therapist</p>
                            <p className="font-medium text-slate-900">{'Assigned Therapist'}</p>
                          </div>
                          <div>
                            <p className="text-slate-500">Report Generated</p>
                            <p className="font-medium text-slate-900">{new Date().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section 5: Integration Notes & Recommendations */}
                      <div className="p-6 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                          5. Integration Notes & Recommendations
                        </h3>
                        <p className="text-xs text-slate-500 mb-2">(What the client should do until next session)</p>
                        <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg min-h-[80px]">
                          {form.integration_notes || 'No integration notes provided'}
                        </div>
                      </div>

                      {/* Section 6: Therapist Notes */}
                      <div className="p-6 border-b border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                          6. Therapist Notes
                        </h3>
                        <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded-lg min-h-[80px]">
                          {form.therapist_internal_notes || 'No therapist notes provided'}
                        </div>
                      </div>

                      {/* Section 7: Progress Tracking */}
                      <div className="p-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                          7. Progress Tracking
                        </h3>
                        <div className="space-y-3">
                          {[
                            { label: 'Nervous System', key: 'nervous_system_score' },
                            { label: 'Emotional', key: 'emotional_state_score' },
                            { label: 'Cognitive', key: 'cognitive_patterns_score' },
                            { label: 'Physical', key: 'body_symptoms_score' },
                            { label: 'Behavioral', key: 'behavioral_patterns_score' },
                            { label: 'Life Functioning', key: 'life_functioning_score' },
                          ].map(metric => (
                            <div key={metric.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                              <span className="text-sm text-slate-700">☐ {metric.label}</span>
                              <span className="text-sm font-medium text-slate-900">
                                {form[metric.key] || 0} <span className="text-slate-400">Out of 10</span>
                              </span>
                            </div>
                          ))}
                          <div className="flex items-center justify-between py-3 bg-slate-50 rounded-lg px-3 mt-4">
                            <span className="text-sm font-semibold text-slate-900">☐ Goal Readiness</span>
                            <span className="text-sm font-bold text-indigo-600">
                              {form.goal_readiness_score || 0} <span className="text-slate-400 font-normal">Out of 60</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </>
          ) : (
            <div className="text-center py-16 border border-slate-200 rounded-xl">
              <FileSpreadsheet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No Development Forms Available</h3>
              <p className="text-slate-500 mt-2">Session development forms will appear after completing session forms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
