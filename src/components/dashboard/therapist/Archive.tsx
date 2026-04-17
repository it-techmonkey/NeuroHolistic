'use client';

import { useState, useEffect } from 'react';
import {
  Loader2, User, Mail, Phone, Calendar, FileText, Plus, ChevronRight,
  X, Search, Archive, TrendingUp, Edit2, Trash2, Globe, Briefcase, Heart
} from 'lucide-react';

// Types
type ArchivedClient = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  date_of_birth: string | null;
  occupation: string | null;
  relationship_status: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

type ArchivedAssessment = {
  id: string;
  archived_client_id: string;
  therapist_id: string;
  client_name: string | null;
  main_complaint: string;
  current_symptoms: string[];
  nervous_system_pattern: string | null;
  nervous_system_score: number;
  emotional_state_score: number;
  cognitive_patterns_score: number;
  body_symptoms_score: number;
  behavioral_patterns_score: number;
  life_functioning_score: number;
  goal_readiness_score: number;
  session_number: number | null;
  assessment_date: string | null;
  created_at: string;
};

type ArchivedDevForm = {
  id: string;
  archived_client_id: string;
  therapist_id: string;
  session_number: number | null;
  session_date: string | null;
  techniques_used: string[];
  key_interventions: string | null;
  nervous_system_score: number;
  emotional_state_score: number;
  cognitive_patterns_score: number;
  body_symptoms_score: number;
  behavioral_patterns_score: number;
  life_functioning_score: number;
  goal_readiness_score: number;
  created_at: string;
};

type ViewMode = 'list' | 'detail';

interface ArchiveProps {
  therapistId: string;
}

export default function ArchiveTab({ therapistId }: ArchiveProps) {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [clients, setClients] = useState<ArchivedClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ArchivedClient | null>(null);
  const [assessments, setAssessments] = useState<ArchivedAssessment[]>([]);
  const [devForms, setDevForms] = useState<ArchivedDevForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [showDevForm, setShowDevForm] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'assessments' | 'development'>('overview');
  const [saving, setSaving] = useState(false);
  const [editingClient, setEditingClient] = useState<ArchivedClient | null>(null);

  // New client form state
  const [clientForm, setClientForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    date_of_birth: '',
    occupation: '',
    relationship_status: '',
    notes: '',
  });

  // Assessment form state
  const [assessmentForm, setAssessmentForm] = useState({
    session_number: '',
    assessment_date: '',
    main_complaint: '',
    current_symptoms: [] as string[],
    nervous_system_pattern: '',
    nervous_system_score: 0,
    emotional_state_score: 0,
    cognitive_patterns_score: 0,
    body_symptoms_score: 0,
    behavioral_patterns_score: 0,
    life_functioning_score: 0,
  });

  // Dev form state
  const [devForm, setDevForm] = useState({
    session_number: '',
    session_date: '',
    techniques_used: [] as string[],
    key_interventions: '',
    nervous_system_score: 0,
    emotional_state_score: 0,
    cognitive_patterns_score: 0,
    body_symptoms_score: 0,
    behavioral_patterns_score: 0,
    life_functioning_score: 0,
  });

  const CURRENT_SYMPTOM_OPTIONS = [
    'Anxiety', 'Emotional distress', 'Low mood', 'Numbness', 'Overthinking',
    'Panic', 'Sleep difficulty', 'Relationship difficulty', 'Physical symptoms',
    'Lack of direction', 'Fatigue', 'Stress overload',
  ];

  const TECHNIQUE_OPTIONS = [
    'Timeline', 'Control Room', 'Hypnoses Womb', 'Hypnoses Birth',
    'Hypnoses 1', 'Hypnoses 2', 'Hypnoses 3', 'Hypnoses 4', 'Hypnoses 5',
    'Neural Shock', 'Cognition Expansion', 'Void Expansion', 'Creation',
    'Flow', 'Cutting Cord', 'Grounding', 'Environmental Breathing', 'Clearing',
  ];

  const NERVOUS_SYSTEM_OPTIONS = [
    { value: 'regulated', label: 'Regulated' },
    { value: 'hyper', label: 'Hyper (anxious / tense)' },
    { value: 'hypo', label: 'Hypo (shutdown / low energy)' },
    { value: 'mixed', label: 'Mixed' },
  ];

  const SCORE_LABELS: Record<number, string> = {
    0: 'Not present', 1: 'Minimal', 2: 'Very mild', 3: 'Mild',
    4: 'Mild to moderate', 5: 'Moderate', 6: 'Moderate to significant',
    7: 'Significant', 8: 'Severe', 9: 'Very severe', 10: 'Extreme',
  };

  // Fetch clients
  useEffect(() => {
    fetchClients();
  }, [therapistId]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/archive/clients?therapistId=${therapistId}`);
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Failed to fetch archived clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientDetail = async (client: ArchivedClient) => {
    setSelectedClient(client);
    setViewMode('detail');
    setDetailTab('overview');
    try {
      const [assessmentsRes, devFormsRes] = await Promise.all([
        fetch(`/api/archive/assessments?archivedClientId=${client.id}`),
        fetch(`/api/archive/development-forms?archivedClientId=${client.id}`),
      ]);
      if (assessmentsRes.ok) {
        const data = await assessmentsRes.json();
        setAssessments(data.assessments || []);
      }
      if (devFormsRes.ok) {
        const data = await devFormsRes.json();
        setDevForms(data.forms || []);
      }
    } catch (err) {
      console.error('Failed to fetch client detail:', err);
    }
  };

  const handleCreateClient = async () => {
    if (!clientForm.full_name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, ...clientForm }),
      });
      if (res.ok) {
        const data = await res.json();
        setClients(prev => [data.client, ...prev]);
        setShowNewClientForm(false);
        resetClientForm();
      }
    } catch (err) {
      console.error('Failed to create client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateClient = async () => {
    if (!editingClient || !clientForm.full_name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingClient.id, ...clientForm }),
      });
      if (res.ok) {
        const data = await res.json();
        setClients(prev => prev.map(c => c.id === editingClient.id ? data.client : c));
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient(data.client);
        }
        setEditingClient(null);
        resetClientForm();
      }
    } catch (err) {
      console.error('Failed to update client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Delete this archived client and all their data?')) return;
    try {
      const res = await fetch(`/api/archive/clients?id=${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        if (selectedClient?.id === clientId) {
          setSelectedClient(null);
          setViewMode('list');
        }
      }
    } catch (err) {
      console.error('Failed to delete client:', err);
    }
  };

  const handleCreateAssessment = async () => {
    if (!selectedClient || !assessmentForm.main_complaint.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivedClientId: selectedClient.id,
          therapistId,
          data: {
            ...assessmentForm,
            client_name: selectedClient.full_name,
            client_email: selectedClient.email,
            client_phone: selectedClient.phone,
            client_country: selectedClient.country,
            session_number: assessmentForm.session_number ? parseInt(assessmentForm.session_number) : null,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessments(prev => [data.assessment, ...prev]);
        setShowAssessmentForm(false);
        resetAssessmentForm();
      }
    } catch (err) {
      console.error('Failed to create assessment:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDevForm = async () => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/development-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivedClientId: selectedClient.id,
          therapistId,
          data: {
            ...devForm,
            session_number: devForm.session_number ? parseInt(devForm.session_number) : null,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDevForms(prev => [data.form, ...prev]);
        setShowDevForm(false);
        resetDevForm();
      }
    } catch (err) {
      console.error('Failed to create development form:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssessment = async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      const res = await fetch(`/api/archive/assessments?id=${id}`, { method: 'DELETE' });
      if (res.ok) setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete assessment:', err);
    }
  };

  const handleDeleteDevForm = async (id: string) => {
    if (!confirm('Delete this development form?')) return;
    try {
      const res = await fetch(`/api/archive/development-forms?id=${id}`, { method: 'DELETE' });
      if (res.ok) setDevForms(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete development form:', err);
    }
  };

  const resetClientForm = () => {
    setClientForm({ full_name: '', email: '', phone: '', country: '', date_of_birth: '', occupation: '', relationship_status: '', notes: '' });
  };

  const resetAssessmentForm = () => {
    setAssessmentForm({ session_number: '', assessment_date: '', main_complaint: '', current_symptoms: [], nervous_system_pattern: '', nervous_system_score: 0, emotional_state_score: 0, cognitive_patterns_score: 0, body_symptoms_score: 0, behavioral_patterns_score: 0, life_functioning_score: 0 });
  };

  const resetDevForm = () => {
    setDevForm({ session_number: '', session_date: '', techniques_used: [], key_interventions: '', nervous_system_score: 0, emotional_state_score: 0, cognitive_patterns_score: 0, body_symptoms_score: 0, behavioral_patterns_score: 0, life_functioning_score: 0 });
  };

  const openEditClient = (client: ArchivedClient) => {
    setEditingClient(client);
    setClientForm({
      full_name: client.full_name,
      email: client.email || '',
      phone: client.phone || '',
      country: client.country || '',
      date_of_birth: client.date_of_birth || '',
      occupation: client.occupation || '',
      relationship_status: client.relationship_status || '',
      notes: client.notes || '',
    });
  };

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const ScoreInput = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-slate-600">{label}</label>
        <span className="text-xs text-indigo-600 font-medium">{SCORE_LABELS[value] || ''}</span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>0</span>
        <span>10</span>
      </div>
    </div>
  );

  // Modal overlay component
  const Modal = ({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && selectedClient) {
    const totalScore = (assessment: ArchivedAssessment | ArchivedDevForm) =>
      (assessment.nervous_system_score || 0) + (assessment.emotional_state_score || 0) +
      (assessment.cognitive_patterns_score || 0) + (assessment.body_symptoms_score || 0) +
      (assessment.behavioral_patterns_score || 0) + (assessment.life_functioning_score || 0);

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button onClick={() => { setViewMode('list'); setSelectedClient(null); }} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back to archived clients
        </button>

        {/* Client Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center">
                <Archive className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">{selectedClient.full_name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                  {selectedClient.email && <div className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selectedClient.email}</div>}
                  {selectedClient.phone && <div className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selectedClient.phone}</div>}
                  {selectedClient.country && <div className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />{selectedClient.country}</div>}
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Archived Client
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEditClient(selectedClient)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDeleteClient(selectedClient.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex">
              {[
                { id: 'overview' as const, label: 'Overview', icon: User },
                { id: 'assessments' as const, label: 'Assessments', icon: FileText },
                { id: 'development' as const, label: 'Development Forms', icon: TrendingUp },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    detailTab === tab.id
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
            {/* Overview Tab */}
            {detailTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Total Assessments</p>
                    <p className="text-2xl font-bold text-slate-900">{assessments.length}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Development Forms</p>
                    <p className="text-2xl font-bold text-slate-900">{devForms.length}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-1">Latest Score</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {assessments.length > 0 ? `${totalScore(assessments[0])}/60` : devForms.length > 0 ? `${totalScore(devForms[0])}/60` : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-xs text-slate-500 mb-2">Notes</p>
                    <p className="text-sm text-slate-700">{selectedClient.notes}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedClient.date_of_birth && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      DOB: {new Date(selectedClient.date_of_birth).toLocaleDateString()}
                    </div>
                  )}
                  {selectedClient.occupation && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Briefcase className="w-4 h-4 text-slate-400" />
                      {selectedClient.occupation}
                    </div>
                  )}
                  {selectedClient.relationship_status && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Heart className="w-4 h-4 text-slate-400" />
                      {selectedClient.relationship_status}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assessments Tab */}
            {detailTab === 'assessments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-slate-900">Diagnostic Assessments</h3>
                  <button
                    onClick={() => setShowAssessmentForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Assessment
                  </button>
                </div>

                {assessments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No assessments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessments.map(a => (
                      <div key={a.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {a.session_number ? `Session ${a.session_number}` : 'Assessment'}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                              {totalScore(a)}/60
                            </span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{a.main_complaint}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : new Date(a.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteAssessment(a.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Development Forms Tab */}
            {detailTab === 'development' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-slate-900">Development Forms</h3>
                  <button
                    onClick={() => setShowDevForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Form
                  </button>
                </div>

                {devForms.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No development forms yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devForms.map(f => (
                      <div key={f.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">
                              {f.session_number ? `Session ${f.session_number}` : 'Development Form'}
                            </p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                              {totalScore(f)}/60
                            </span>
                          </div>
                          {f.techniques_used?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {f.techniques_used.map(t => (
                                <span key={t} className="text-xs px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-2">
                            {f.session_date ? new Date(f.session_date).toLocaleDateString() : new Date(f.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button onClick={() => handleDeleteDevForm(f.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Assessment Form Modal */}
        {showAssessmentForm && (
          <Modal onClose={() => { setShowAssessmentForm(false); resetAssessmentForm(); }} title="Add Diagnostic Assessment">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session Number</label>
                  <input
                    type="number"
                    min={1}
                    value={assessmentForm.session_number}
                    onChange={e => setAssessmentForm(prev => ({ ...prev, session_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Date</label>
                  <input
                    type="date"
                    value={assessmentForm.assessment_date}
                    onChange={e => setAssessmentForm(prev => ({ ...prev, assessment_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Main Complaint *</label>
                <textarea
                  value={assessmentForm.main_complaint}
                  onChange={e => setAssessmentForm(prev => ({ ...prev, main_complaint: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the main concerns..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Symptoms</label>
                <div className="flex flex-wrap gap-2">
                  {CURRENT_SYMPTOM_OPTIONS.map(symptom => (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => {
                        const symptoms = assessmentForm.current_symptoms;
                        setAssessmentForm(prev => ({
                          ...prev,
                          current_symptoms: symptoms.includes(symptom)
                            ? symptoms.filter(s => s !== symptom)
                            : [...symptoms, symptom],
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        assessmentForm.current_symptoms.includes(symptom)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nervous System Pattern</label>
                <select
                  value={assessmentForm.nervous_system_pattern}
                  onChange={e => setAssessmentForm(prev => ({ ...prev, nervous_system_pattern: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select...</option>
                  {NERVOUS_SYSTEM_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700">Domain Scores</h4>
                <ScoreInput label="Nervous System" value={assessmentForm.nervous_system_score} onChange={v => setAssessmentForm(prev => ({ ...prev, nervous_system_score: v }))} />
                <ScoreInput label="Emotional State" value={assessmentForm.emotional_state_score} onChange={v => setAssessmentForm(prev => ({ ...prev, emotional_state_score: v }))} />
                <ScoreInput label="Cognitive Patterns" value={assessmentForm.cognitive_patterns_score} onChange={v => setAssessmentForm(prev => ({ ...prev, cognitive_patterns_score: v }))} />
                <ScoreInput label="Body Symptoms" value={assessmentForm.body_symptoms_score} onChange={v => setAssessmentForm(prev => ({ ...prev, body_symptoms_score: v }))} />
                <ScoreInput label="Behavioral Patterns" value={assessmentForm.behavioral_patterns_score} onChange={v => setAssessmentForm(prev => ({ ...prev, behavioral_patterns_score: v }))} />
                <ScoreInput label="Life Functioning" value={assessmentForm.life_functioning_score} onChange={v => setAssessmentForm(prev => ({ ...prev, life_functioning_score: v }))} />
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <span className="text-xs text-indigo-600">Total Dysregulation Score</span>
                  <p className="text-xl font-bold text-indigo-700">
                    {assessmentForm.nervous_system_score + assessmentForm.emotional_state_score + assessmentForm.cognitive_patterns_score + assessmentForm.body_symptoms_score + assessmentForm.behavioral_patterns_score + assessmentForm.life_functioning_score}/60
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button onClick={() => { setShowAssessmentForm(false); resetAssessmentForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleCreateAssessment} disabled={saving || !assessmentForm.main_complaint.trim()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Assessment'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Development Form Modal */}
        {showDevForm && (
          <Modal onClose={() => { setShowDevForm(false); resetDevForm(); }} title="Add Development Form">
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session Number</label>
                  <input
                    type="number"
                    min={1}
                    value={devForm.session_number}
                    onChange={e => setDevForm(prev => ({ ...prev, session_number: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={devForm.session_date}
                    onChange={e => setDevForm(prev => ({ ...prev, session_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Techniques Used</label>
                <div className="flex flex-wrap gap-2">
                  {TECHNIQUE_OPTIONS.map(technique => (
                    <button
                      key={technique}
                      type="button"
                      onClick={() => {
                        const techniques = devForm.techniques_used;
                        setDevForm(prev => ({
                          ...prev,
                          techniques_used: techniques.includes(technique)
                            ? techniques.filter(t => t !== technique)
                            : [...techniques, technique],
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        devForm.techniques_used.includes(technique)
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {technique}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Key Interventions</label>
                <textarea
                  value={devForm.key_interventions}
                  onChange={e => setDevForm(prev => ({ ...prev, key_interventions: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe key interventions used..."
                />
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-700">Domain Scores</h4>
                <ScoreInput label="Nervous System" value={devForm.nervous_system_score} onChange={v => setDevForm(prev => ({ ...prev, nervous_system_score: v }))} />
                <ScoreInput label="Emotional State" value={devForm.emotional_state_score} onChange={v => setDevForm(prev => ({ ...prev, emotional_state_score: v }))} />
                <ScoreInput label="Cognitive Patterns" value={devForm.cognitive_patterns_score} onChange={v => setDevForm(prev => ({ ...prev, cognitive_patterns_score: v }))} />
                <ScoreInput label="Body Symptoms" value={devForm.body_symptoms_score} onChange={v => setDevForm(prev => ({ ...prev, body_symptoms_score: v }))} />
                <ScoreInput label="Behavioral Patterns" value={devForm.behavioral_patterns_score} onChange={v => setDevForm(prev => ({ ...prev, behavioral_patterns_score: v }))} />
                <ScoreInput label="Life Functioning" value={devForm.life_functioning_score} onChange={v => setDevForm(prev => ({ ...prev, life_functioning_score: v }))} />
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <span className="text-xs text-green-600">Total Wellbeing Score</span>
                  <p className="text-xl font-bold text-green-700">
                    {devForm.nervous_system_score + devForm.emotional_state_score + devForm.cognitive_patterns_score + devForm.body_symptoms_score + devForm.behavioral_patterns_score + devForm.life_functioning_score}/60
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button onClick={() => { setShowDevForm(false); resetDevForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={handleCreateDevForm} disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Form'}
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Client Modal */}
        {editingClient && (
          <Modal onClose={() => { setEditingClient(null); resetClientForm(); }} title="Edit Archived Client">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={clientForm.full_name}
                  onChange={e => setClientForm(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={clientForm.email} onChange={e => setClientForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={clientForm.phone} onChange={e => setClientForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input type="text" value={clientForm.country} onChange={e => setClientForm(prev => ({ ...prev, country: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input type="date" value={clientForm.date_of_birth} onChange={e => setClientForm(prev => ({ ...prev, date_of_birth: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input type="text" value={clientForm.occupation} onChange={e => setClientForm(prev => ({ ...prev, occupation: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                  <input type="text" value={clientForm.relationship_status} onChange={e => setClientForm(prev => ({ ...prev, relationship_status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea value={clientForm.notes} onChange={e => setClientForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button onClick={() => { setEditingClient(null); resetClientForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
                <button onClick={handleUpdateClient} disabled={saving || !clientForm.full_name.trim()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Update'}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Archived Clients</h2>
          <p className="text-sm text-slate-500">Manual entries for past clients</p>
        </div>
        <button
          onClick={() => setShowNewClientForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search archived clients..."
          className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Client Cards */}
      {filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium">No archived clients</h3>
          <p className="text-slate-500 text-sm mt-1">Add past client records manually</p>
          <button
            onClick={() => setShowNewClientForm(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add First Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <button
              key={client.id}
              onClick={() => fetchClientDetail(client)}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left w-full"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{client.full_name}</h3>
                  {client.email && (
                    <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Added {new Date(client.created_at).toLocaleDateString()}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">
                  Archived
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* New Client Modal */}
      {showNewClientForm && (
        <Modal onClose={() => { setShowNewClientForm(false); resetClientForm(); }} title="Add Archived Client">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={clientForm.full_name}
                onChange={e => setClientForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Client's full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={clientForm.email} onChange={e => setClientForm(prev => ({ ...prev, email: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input type="tel" value={clientForm.phone} onChange={e => setClientForm(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="+1 234 567 890" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                <input type="text" value={clientForm.country} onChange={e => setClientForm(prev => ({ ...prev, country: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Country" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                <input type="date" value={clientForm.date_of_birth} onChange={e => setClientForm(prev => ({ ...prev, date_of_birth: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                <input type="text" value={clientForm.occupation} onChange={e => setClientForm(prev => ({ ...prev, occupation: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Occupation" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                <input type="text" value={clientForm.relationship_status} onChange={e => setClientForm(prev => ({ ...prev, relationship_status: e.target.value }))} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Single, Married" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={clientForm.notes} onChange={e => setClientForm(prev => ({ ...prev, notes: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Any additional notes..." />
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button onClick={() => { setShowNewClientForm(false); resetClientForm(); }} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={handleCreateClient} disabled={saving || !clientForm.full_name.trim()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Add Client'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
