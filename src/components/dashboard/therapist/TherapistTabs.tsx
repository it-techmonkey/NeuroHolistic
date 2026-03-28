'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Loader2, Video, FileText, User, Mail, TrendingUp, ChevronRight,
  X, Upload, Eye, Download, BarChart3, File, Image, CheckCircle,
  Stethoscope, Activity, Brain, Heart, Shield, Award, Calendar,
  TrendingUp as TrendUp, Printer, Share2, FileSpreadsheet, TrendingDown,
  Lock, Trash2
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
  session_ref_id?: string | null;
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
  sessions, documents, onOpenAssessment, onOpenDevForm, onRefresh, onUploadDocument, uploadingDoc, onDeleteDocument
}: {
  sessions: Session[];
  documents: Document[];
  onOpenAssessment: (s: Session) => void;
  onOpenDevForm: (s: Session) => void;
  onRefresh: () => void;
  onUploadDocument: (file: File, sessionId?: string) => void;
  uploadingDoc: boolean;
  onDeleteDocument?: (documentId: string) => Promise<void>;
}) {
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const getSessionDocuments = (sessionId: string) => {
    return documents.filter(d => d.session_id === sessionId);
  };

  const handleUploadClick = (sessionId?: string) => {
    setSelectedSessionId(sessionId || null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSessionId) {
      onUploadDocument(file, selectedSessionId);
    }
  };

  // Hide free consultation entries and unscheduled placeholders in this tab
  const visibleSessions = sessions.filter(
    s => s.type !== 'free_consultation' && !!s.date && !!s.time && ['scheduled', 'confirmed', 'completed'].includes(s.status)
  );
  const freeConsultations = sessions.filter(s => s.type === 'free_consultation');
  const upcomingFreeConsultations = freeConsultations.filter(s => s.status !== 'completed');

  // Separate completed and upcoming sessions
  const completedSessions = visibleSessions.filter(s => s.status === 'completed');
  const upcomingSessions = visibleSessions.filter(s => s.status !== 'completed');

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* Session Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
          <p className="text-sm text-indigo-600 font-medium">Total Sessions</p>
          <p className="text-2xl font-bold text-indigo-700 mt-1">{visibleSessions.length}</p>
          {freeConsultations.length > 0 && (
            <p className="text-xs text-indigo-500 mt-1">
              + {freeConsultations.length} free consultation
            </p>
          )}
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-green-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{completedSessions.length}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
          <p className="text-sm text-amber-600 font-medium">Upcoming</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{upcomingSessions.length}</p>
          {upcomingFreeConsultations.length > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              + {upcomingFreeConsultations.length} free consultation
            </p>
          )}
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
                onUploadDocument={() => handleUploadClick(s.type === 'free_consultation' ? undefined : (s.session_ref_id || s.id))}
                uploadingDoc={uploadingDoc}
                onDeleteDocument={onDeleteDocument}
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
                onUploadDocument={() => {}}
                uploadingDoc={false}
                isCompleted={true}
                onDeleteDocument={onDeleteDocument}
              />
            ))}
          </div>
        </div>
      )}

      {visibleSessions.length === 0 && (
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
  isCompleted = false,
  onDeleteDocument
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
  onDeleteDocument?: (documentId: string) => Promise<void>;
}) {
  const isConsultation = session.type === 'free_consultation';
  const effectiveSessionId = session.session_ref_id || session.id;
  const devFormRequired = !isConsultation && session.program_id;
  const devFormComplete = session.development_form_submitted;
  const sessionDocs = documents.filter(
    (d) => d.session_id === effectiveSessionId || (isConsultation && !d.session_id)
  );

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
                sessionId={effectiveSessionId}
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
                    <div className="flex items-center gap-1">
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
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
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      {!isCompleted && onDeleteDocument && (
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            if (confirm('Delete this document? This cannot be undone.')) {
                              await onDeleteDocument(doc.id);
                              onRefresh();
                            }
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete document">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
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

// Reports Tab Component - Shows session-by-session comparisons
export function ReportsTab({
  clientId, assessments, devForms, sessions
}: {
  clientId: string;
  assessments: any[];
  devForms: any[];
  sessions: Session[];
}) {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<'timeline' | 'comparison'>('timeline');
  const [selectedComparison, setSelectedComparison] = useState<number>(0);

  const baseline = assessments.find((a: any) => a.is_baseline);

  // Build unified timeline data combining assessments and dev forms
  const buildTimelineData = () => {
    const timeline: Array<{
      date: string;
      score: number;
      label: string;
      type: 'baseline' | 'assessment' | 'session';
      data: any;
    }> = [];

    // Add baseline assessment
    if (baseline) {
      timeline.push({
        date: baseline.assessed_at || baseline.created_at,
        score: baseline.goal_readiness_score || 0,
        label: 'Baseline (Free Consult)',
        type: 'baseline',
        data: baseline
      });
    }

    // Add other assessments (non-baseline)
    assessments.filter((a: any) => !a.is_baseline).forEach((a: any) => {
      timeline.push({
        date: a.assessed_at || a.created_at,
        score: a.goal_readiness_score || 0,
        label: `Assessment`,
        type: 'assessment',
        data: a
      });
    });

    // Add development forms with their scores
    devForms.forEach((f: any, idx: number) => {
      const totalScore = (f.nervous_system_score || 0) + (f.emotional_state_score || 0) +
        (f.cognitive_patterns_score || 0) + (f.body_symptoms_score || 0) +
        (f.behavioral_patterns_score || 0) + (f.life_functioning_score || 0);
      
      timeline.push({
        date: f.created_at,
        score: totalScore,
        label: `Session ${f.session_number || idx + 1}`,
        type: 'session',
        data: f
      });
    });

    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return timeline;
  };

  const timelineData = buildTimelineData();
  const firstScore = timelineData[0]?.score || baseline?.goal_readiness_score || assessments[0]?.goal_readiness_score || 0;
  const lastScore = timelineData[timelineData.length - 1]?.score || firstScore;
  const improvement = firstScore - lastScore;

  // Build comparison pairs (baseline vs session 1, session 1 vs session 2, etc.)
  const buildComparisons = () => {
    const comparisons: Array<{
      label: string;
      from: { label: string; score: number; data: any };
      to: { label: string; score: number; data: any };
      improvement: number;
    }> = [];

    // Baseline vs Session 1 (first dev form)
    if (baseline && devForms.length > 0) {
      const firstDevForm = devForms[0];
      const firstScore = (firstDevForm.nervous_system_score || 0) + (firstDevForm.emotional_state_score || 0) +
        (firstDevForm.cognitive_patterns_score || 0) + (firstDevForm.body_symptoms_score || 0) +
        (firstDevForm.behavioral_patterns_score || 0) + (firstDevForm.life_functioning_score || 0);
      
      comparisons.push({
        label: 'Baseline → Session 1',
        from: { label: 'Baseline (Free Consult)', score: baseline.goal_readiness_score || 0, data: baseline },
        to: { label: `Session 1`, score: firstScore, data: firstDevForm },
        improvement: (baseline.goal_readiness_score || 0) - firstScore
      });
    }

    // Session N vs Session N+1
    for (let i = 0; i < devForms.length - 1; i++) {
      const current = devForms[i];
      const next = devForms[i + 1];
      
      const currentScore = (current.nervous_system_score || 0) + (current.emotional_state_score || 0) +
        (current.cognitive_patterns_score || 0) + (current.body_symptoms_score || 0) +
        (current.behavioral_patterns_score || 0) + (current.life_functioning_score || 0);
      
      const nextScore = (next.nervous_system_score || 0) + (next.emotional_state_score || 0) +
        (next.cognitive_patterns_score || 0) + (next.body_symptoms_score || 0) +
        (next.behavioral_patterns_score || 0) + (next.life_functioning_score || 0);

      comparisons.push({
        label: `Session ${i + 1} → Session ${i + 2}`,
        from: { label: `Session ${i + 1}`, score: currentScore, data: current },
        to: { label: `Session ${i + 2}`, score: nextScore, data: next },
        improvement: currentScore - nextScore
      });
    }

    return comparisons;
  };

  const comparisons = buildComparisons();
  const currentComparison = comparisons[selectedComparison] || comparisons[0];

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
          onClick={() => setActiveReport('timeline')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeReport === 'timeline'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Progress Timeline
        </button>
        <button
          onClick={() => setActiveReport('comparison')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
            activeReport === 'comparison'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Session Comparison
        </button>
      </div>

      {/* Progress Summary */}
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

      {/* Progress Timeline Tab */}
      {activeReport === 'timeline' && (
        <div className="space-y-6">
          {timelineData.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                Progress Timeline (Baseline → Sessions)
              </h3>
              <div className="h-64 w-full">
                <Line
                  data={{
                    labels: timelineData.map(d => 
                      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    ),
                    datasets: [{
                      label: 'Wellbeing Score',
                      data: timelineData.map(d => d.score),
                      borderColor: '#6366F1',
                      backgroundColor: '#EEF2FF',
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: timelineData.map(d => 
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
                            return timelineData[idx]?.label || '';
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
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No timeline data available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Session Comparison Tab */}
      {activeReport === 'comparison' && (
        <div className="space-y-6">
          {comparisons.length > 0 ? (
            <>
              {/* Comparison Selector */}
              <div className="flex gap-2 flex-wrap">
                {comparisons.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedComparison(idx)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      selectedComparison === idx
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Comparison Card */}
              {currentComparison && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">
                    {currentComparison.label} Comparison
                  </h3>
                  
                  {/* Before/After Scores */}
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-6 border border-slate-200 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Before</p>
                      <p className="text-xl font-medium text-slate-700 mb-1">{currentComparison.from.label}</p>
                      <p className="text-4xl font-bold text-slate-900 mt-2">{currentComparison.from.score}<span className="text-lg text-slate-400">/60</span></p>
                    </div>
                    <div className={`text-center p-6 border rounded-lg ${
                      currentComparison.improvement >= 0 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-amber-200 bg-amber-50'
                    }`}>
                      <p className={`text-sm uppercase tracking-wider mb-2 ${
                        currentComparison.improvement >= 0 ? 'text-green-600' : 'text-amber-600'
                      }`}>After</p>
                      <p className="text-xl font-medium text-slate-700 mb-1">{currentComparison.to.label}</p>
                      <p className={`text-4xl font-bold mt-2 ${
                        currentComparison.improvement >= 0 ? 'text-green-700' : 'text-amber-700'
                      }`}>{currentComparison.to.score}<span className="text-lg opacity-60">/60</span></p>
                    </div>
                  </div>

                  {/* Improvement Summary */}
                  <div className={`p-4 rounded-lg text-center ${
                    currentComparison.improvement >= 0 ? 'bg-green-100' : 'bg-amber-100'
                  }`}>
                    <p className={`text-2xl font-bold ${
                      currentComparison.improvement >= 0 ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {currentComparison.improvement >= 0 ? '↓' : '↑'} {Math.abs(currentComparison.improvement)} points
                    </p>
                    <p className={`text-sm ${
                      currentComparison.improvement >= 0 ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {currentComparison.improvement >= 0 ? 'Symptom Reduction' : 'Symptom Increase'}
                    </p>
                  </div>

                  {/* Domain-wise Comparison */}
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Domain Comparison</h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Nervous System', key: 'nervous_system_score' },
                        { label: 'Emotional', key: 'emotional_state_score' },
                        { label: 'Cognitive', key: 'cognitive_patterns_score' },
                        { label: 'Physical', key: 'body_symptoms_score' },
                        { label: 'Behavioral', key: 'behavioral_patterns_score' },
                        { label: 'Life Functioning', key: 'life_functioning_score' },
                      ].map(metric => {
                        const fromScore = currentComparison.from.data[metric.key] || 0;
                        const toScore = currentComparison.to.data[metric.key] || 0;
                        const diff = fromScore - toScore;
                        return (
                          <div key={metric.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                            <span className="text-sm text-slate-700">{metric.label}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-slate-500">{fromScore}/10</span>
                              <span className="text-slate-300">→</span>
                              <span className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                {toScore}/10
                              </span>
                              {diff !== 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  diff > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {diff > 0 ? '-' : '+'}{Math.abs(diff)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Complete at least one session to see comparisons</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
