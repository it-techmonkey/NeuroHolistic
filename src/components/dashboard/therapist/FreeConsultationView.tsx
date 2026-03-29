'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2, Video, FileText, CheckCircle, Clock, Calendar, User,
  ExternalLink, XCircle, Upload, Eye, Trash2, File, Image,
  Lock, AlertCircle, ChevronRight, RefreshCw
} from 'lucide-react';
import DiagnosticAssessmentForm from './DiagnosticAssessmentForm';

// Types
type ConsultationSession = {
  id: string;
  client_id: string | null;
  client_name: string;
  clients?: {
    full_name?: string;
    email?: string;
    phone?: string;
    country?: string;
  } | null;
  date: string;
  time: string;
  type: string;
  status: string;
  meet_link: string | null;
  meeting_link: string | null;
  assessment_submitted: boolean;
  is_complete: boolean;
  created_at: string;
};

type Document = {
  id: string;
  client_id: string;
  session_id?: string | null;
  type: 'pdf' | 'video' | 'note' | 'image' | 'other';
  file_url: string;
  file_name: string;
  description?: string;
  created_at: string;
};

// Props
interface FreeConsultationViewProps {
  therapistId: string;
  onRefresh?: () => void;
}

export default function FreeConsultationView({ therapistId, onRefresh }: FreeConsultationViewProps) {
  const [sessions, setSessions] = useState<ConsultationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  // Assessment state
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [activeSession, setActiveSession] = useState<ConsultationSession | null>(null);
  const [existingAssessment, setExistingAssessment] = useState<any>(null);
  const [assessmentLoading, setAssessmentLoading] = useState(false);

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSessionForUpload, setSelectedSessionForUpload] = useState<string | null>(null);
  const [selectedClientForUpload, setSelectedClientForUpload] = useState<string | null>(null);

  // Mark complete state
  const [completingSessionId, setCompletingSessionId] = useState<string | null>(null);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch(`/api/therapist/sessions?therapistId=${therapistId}`);
      if (!res.ok) return;
      const data = await res.json();
      const allSessions: ConsultationSession[] = (data.sessions || []).filter(
        (s: any) => s.type === 'free_consultation'
      );
      console.log('[FreeConsultationView] Fetched sessions:', allSessions.map(s => ({
        id: s.id,
        status: s.status,
        assessment_submitted: s.assessment_submitted,
      })));
      setSessions(allSessions);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  // Force refresh on mount and when assessment form closes
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch documents for therapist
  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchDocuments();
  }, [fetchSessions, fetchDocuments, refreshKey]);

  // Open assessment form
  const openAssessmentForm = async (session: ConsultationSession) => {
    setActiveSession(session);
    setAssessmentLoading(true);
    setShowAssessmentForm(true);

    try {
      const res = await fetch(
        `/api/assessments/diagnostic?clientId=${session.client_id || ''}&therapistId=${therapistId}`
      );
      if (res.ok) {
        const data = await res.json();
        const baseline = data.assessments?.find((a: any) => a.is_baseline) || data.assessments?.[0];
        setExistingAssessment(baseline || null);
      }
    } catch (err) {
      console.error('Failed to fetch assessment:', err);
    } finally {
      setAssessmentLoading(false);
    }
  };

  // After assessment is saved, close modal and force a full page reload
  // to ensure the UI reflects the latest server state (avoids React closure issues)
  const handleAssessmentSaved = useCallback(() => {
    setShowAssessmentForm(false);
    setActiveSession(null);
    setExistingAssessment(null);
    // Use replace() to avoid adding to browser history
    window.location.replace(window.location.href);
  }, []);

  const handleCloseAssessmentForm = () => {
    setShowAssessmentForm(false);
    setActiveSession(null);
    setExistingAssessment(null);
  };

  // Document upload
  const handleUploadClick = (sessionId: string, clientId: string | null) => {
    if (!clientId && !sessionId) {
      setUploadError('Cannot upload documents: no session or client associated');
      return;
    }
    setSelectedSessionForUpload(sessionId);
    setSelectedClientForUpload(clientId);
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSessionForUpload) return;

    setUploadingDoc(true);
    setUploadProgress('Uploading...');
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sessionId', selectedSessionForUpload);
      if (selectedClientForUpload) {
        formData.append('clientId', selectedClientForUpload);
      }

      setUploadProgress('Uploading to server...');

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress('Processing...');
      await fetchDocuments();
      setUploadProgress('Upload complete!');

      setTimeout(() => setUploadProgress(null), 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
      setUploadProgress(null);
    } finally {
      setUploadingDoc(false);
      setSelectedSessionForUpload(null);
      setSelectedClientForUpload(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Delete document
  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Delete this document? This cannot be undone.')) return;
    try {
      const res = await fetch(`/api/documents?id=${documentId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      await fetchDocuments();
    } catch (err) {
      alert('Failed to delete document: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  // View document
  const handleViewDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/view`);
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Failed to get document URL:', err);
    }
  };

  // Mark complete
  const handleMarkComplete = async (sessionId: string) => {
    if (!confirm('Mark this consultation as complete?')) return;

    setCompletingSessionId(sessionId);
    try {
      const res = await fetch('/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark complete');

      // Reload page to reflect updated session status
      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark complete');
      setCompletingSessionId(null);
    }
  };

  // Get documents for a session
  const getSessionDocuments = (sessionId: string): Document[] => {
    return documents.filter(d => d.session_id === sessionId);
  };

  // Filter sessions
  const now = new Date();
  const upcomingSessions = sessions.filter(s => {
    const sessionDate = new Date(s.date + 'T00:00:00');
    return sessionDate >= now && s.status !== 'completed';
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const completedSessions = sessions.filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayedSessions = filter === 'upcoming' ? upcomingSessions
    : filter === 'completed' ? completedSessions
    : sessions;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-slate-500">Loading consultations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Free Consultations</h2>
          <p className="text-sm text-slate-500">
            Manage free consultation sessions — fill assessment, upload documents, and mark complete
          </p>
        </div>
        <button
          onClick={() => setRefreshKey(k => k + 1)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{upcomingSessions.length}</p>
          <p className="text-xs text-blue-500 font-medium">Upcoming</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{completedSessions.length}</p>
          <p className="text-xs text-green-500 font-medium">Completed</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-100">
          <p className="text-2xl font-bold text-amber-600">
            {upcomingSessions.filter(s => !s.assessment_submitted).length}
          </p>
          <p className="text-xs text-amber-600 font-medium">Pending Assessment</p>
        </div>
      </div>

      {/* Upload feedback */}
      {uploadProgress && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {uploadProgress === 'Upload complete!' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {uploadProgress}
        </div>
      )}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {uploadError}
          <button onClick={() => setUploadError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {[
          { id: 'upcoming' as const, label: 'Upcoming', count: upcomingSessions.length },
          { id: 'completed' as const, label: 'Completed', count: completedSessions.length },
          { id: 'all' as const, label: 'All', count: sessions.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
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

      {/* Sessions List */}
      {displayedSessions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium">No {filter} consultations</h3>
          <p className="text-sm text-slate-500 mt-1">
            {filter === 'upcoming'
              ? 'New free consultations will appear here.'
              : filter === 'completed'
              ? 'Completed consultations will appear here.'
              : 'No consultation sessions found.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedSessions.map(session => {
            const assessmentDone = session.assessment_submitted;
            const isCompleted = session.status === 'completed';
            const meetLink = session.meet_link || session.meeting_link;
            const canMarkComplete = assessmentDone && !isCompleted;
            const isCompleting = completingSessionId === session.id;
            const isExpanded = expandedSession === session.id;
            const sessionDocs = getSessionDocuments(session.id);

            return (
              <div key={session.id} className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                isCompleted ? 'border-green-200 bg-green-50/30' : 'border-slate-200 bg-white'
              } ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}`}>
                {/* Card Header */}
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${isCompleted ? 'bg-green-100' : 'bg-purple-100'}`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <User className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-slate-900">Free Consultation</h3>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            isCompleted ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {isCompleted ? 'Completed' : session.status}
                          </span>
                          {!isCompleted && (
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              assessmentDone ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {assessmentDone ? 'Assessment Done' : 'Assessment Required'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                          <User className="w-4 h-4" />
                          <span>{session.clients?.full_name || session.client_name || 'Client'}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{session.date ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric'
                            }) : 'Not scheduled'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{session.time || 'Not set'}</span>
                          </div>
                        </div>
                        {sessionDocs.length > 0 && (
                          <div className="mt-1 text-xs text-purple-600">
                            {sessionDocs.length} document{sessionDocs.length > 1 ? 's' : ''} attached
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                      isExpanded ? 'rotate-90' : ''
                    }`} />
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 sm:p-6 space-y-5 bg-white">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Join Session */}
                      {meetLink && !isCompleted && (
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          Join Session
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}

                      {/* Assessment Form */}
                      <button
                        onClick={() => openAssessmentForm(session)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          assessmentDone
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                        }`}
                      >
                        <FileText className="w-4 h-4" />
                        {assessmentDone ? 'View Assessment' : 'Assessment Form'}
                        {!assessmentDone && <span className="text-xs">(Required)</span>}
                        {assessmentDone && <CheckCircle className="w-4 h-4" />}
                      </button>

                      {/* Upload Document */}
                      {!isCompleted && (
                        <button
                          onClick={() => handleUploadClick(session.id, session.client_id)}
                          disabled={uploadingDoc}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200 hover:bg-purple-100 disabled:opacity-50 transition-colors"
                        >
                          {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          {uploadingDoc ? 'Uploading...' : 'Upload Document'}
                        </button>
                      )}

                      {/* Mark Complete */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkComplete(session.id)}
                          disabled={!canMarkComplete || isCompleting}
                          title={!assessmentDone ? 'Complete the diagnostic assessment first' : 'Mark consultation as complete'}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                            !canMarkComplete
                              ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                              : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                          {isCompleting ? 'Saving...' : 'Mark Complete'}
                        </button>
                      )}
                    </div>

                    {/* Assessment Status Banner */}
                    {!isCompleted && !assessmentDone && (
                      <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Assessment Required</p>
                          <p className="text-xs text-amber-600 mt-0.5">
                            Fill the diagnostic assessment form before marking this consultation as complete.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Documents Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <File className="w-4 h-4" />
                        Documents & Attachments
                      </h4>
                      {sessionDocs.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                          {sessionDocs.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                doc.type === 'pdf' ? 'bg-red-100' :
                                doc.type === 'video' ? 'bg-purple-100' :
                                doc.type === 'image' ? 'bg-green-100' : 'bg-slate-200'
                              }`}>
                                {doc.type === 'pdf' ? <FileText className="w-5 h-5 text-red-600" /> :
                                 doc.type === 'video' ? <Video className="w-5 h-5 text-purple-600" /> :
                                 doc.type === 'image' ? <Image className="w-5 h-5 text-green-600" /> :
                                 <File className="w-5 h-5 text-slate-600" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
                                <p className="text-xs text-slate-500">
                                  {new Date(doc.created_at).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleViewDocument(doc.id)}
                                  className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {!isCompleted && (
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
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

                    {/* Session Info */}
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Session Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Client</p>
                          <p className="font-medium text-slate-900">
                            {session.clients?.full_name || session.client_name || 'Client'}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Email</p>
                          <p className="font-medium text-slate-900">{session.clients?.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">Date & Time</p>
                          <p className="font-medium text-slate-900">
                            {session.date ? new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', {
                              weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                            }) : 'Not scheduled'}{session.time ? ` at ${session.time}` : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Status</p>
                          <p className="font-medium text-slate-900 capitalize">{session.status}</p>
                        </div>
                        {meetLink && (
                          <div className="col-span-2">
                            <p className="text-slate-500">Meet Link</p>
                            <a href={meetLink} target="_blank" rel="noopener noreferrer"
                              className="font-medium text-indigo-600 hover:text-indigo-800 break-all">
                              {meetLink}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assessment Form Modal */}
      {showAssessmentForm && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={handleCloseAssessmentForm}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
            >
              <XCircle className="w-8 h-8" />
            </button>
            <div className="p-8">
              {assessmentLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  <span className="ml-2 text-slate-500">Loading assessment...</span>
                </div>
              ) : (
                <DiagnosticAssessmentForm
                  clientId={activeSession.client_id || null}
                  therapistId={therapistId}
                  sessionId={activeSession.id}
                  existingAssessment={existingAssessment}
                  isSessionCompleted={activeSession.status === 'completed'}
                  clientData={
                    activeSession.clients
                      ? {
                          full_name: activeSession.clients.full_name,
                          email: activeSession.clients.email,
                          phone: activeSession.clients.phone,
                          country: activeSession.clients.country,
                        }
                      : {
                          full_name: activeSession.client_name || '',
                          email: '',
                          phone: '',
                          country: '',
                        }
                  }
                  onClose={handleCloseAssessmentForm}
                  onSave={handleAssessmentSaved}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
