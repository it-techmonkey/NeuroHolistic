'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
  Loader2, User, Mail, Phone, Calendar, FileText, Plus, ChevronRight,
  X, Search, Archive, TrendingUp, Edit2, Trash2, Globe, Briefcase, Heart,
  BarChart3, Activity, TrendingDown, ChevronDown, ChevronUp
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

// Constants
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

// Modal Component
const Modal = memo(function Modal({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
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
});

// Score Input Component
function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
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
}

// Client Form Modal
const ClientFormModal = memo(function ClientFormModal({
  onClose, onSave, saving, initialData, title,
}: {
  onClose: () => void;
  onSave: (data: Omit<ArchivedClient, 'id' | 'created_by' | 'created_at' | 'updated_at'>) => void;
  saving: boolean;
  initialData?: Partial<ArchivedClient>;
  title: string;
}) {
  const [form, setForm] = useState({
    full_name: initialData?.full_name ?? '',
    email: initialData?.email ?? '',
    phone: initialData?.phone ?? '',
    country: initialData?.country ?? '',
    date_of_birth: initialData?.date_of_birth ?? '',
    occupation: initialData?.occupation ?? '',
    relationship_status: initialData?.relationship_status ?? '',
    notes: initialData?.notes ?? '',
  });

  const updateField = useCallback((field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <Modal onClose={onClose} title={title}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => updateField('full_name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Client's full name"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={e => updateField('phone', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="+1 234 567 890" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input type="text" value={form.country} onChange={e => updateField('country', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Country" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
            <input type="date" value={form.date_of_birth} onChange={e => updateField('date_of_birth', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
            <input type="text" value={form.occupation} onChange={e => updateField('occupation', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Occupation" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
            <input type="text" value={form.relationship_status} onChange={e => updateField('relationship_status', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Single, Married" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => updateField('notes', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Any additional notes..." />
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => onSave(form as any)} disabled={saving || !form.full_name.trim()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : title.includes('Add') ? 'Add Client' : 'Update'}
          </button>
        </div>
      </div>
    </Modal>
  );
});

// Assessment Form Modal
const AssessmentFormModal = memo(function AssessmentFormModal({
  onClose, onSave, saving,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
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

  const updateField = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleSymptom = useCallback((symptom: string) => {
    setForm(prev => ({
      ...prev,
      current_symptoms: prev.current_symptoms.includes(symptom)
        ? prev.current_symptoms.filter(s => s !== symptom)
        : [...prev.current_symptoms, symptom],
    }));
  }, []);

  const totalScore = form.nervous_system_score + form.emotional_state_score + form.cognitive_patterns_score + form.body_symptoms_score + form.behavioral_patterns_score + form.life_functioning_score;

  return (
    <Modal onClose={onClose} title="Add Diagnostic Assessment">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session Number</label>
            <input type="number" min={1} value={form.session_number} onChange={e => updateField('session_number', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assessment Date</label>
            <input type="date" value={form.assessment_date} onChange={e => updateField('assessment_date', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Main Complaint *</label>
          <textarea value={form.main_complaint} onChange={e => updateField('main_complaint', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe the main concerns..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Current Symptoms</label>
          <div className="flex flex-wrap gap-2">
            {CURRENT_SYMPTOM_OPTIONS.map(symptom => (
              <button key={symptom} type="button" onClick={() => toggleSymptom(symptom)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.current_symptoms.includes(symptom)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >{symptom}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nervous System Pattern</label>
          <select value={form.nervous_system_pattern} onChange={e => updateField('nervous_system_pattern', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">Select...</option>
            {NERVOUS_SYSTEM_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700">Domain Scores</h4>
          <ScoreInput label="Nervous System" value={form.nervous_system_score} onChange={v => updateField('nervous_system_score', v)} />
          <ScoreInput label="Emotional State" value={form.emotional_state_score} onChange={v => updateField('emotional_state_score', v)} />
          <ScoreInput label="Cognitive Patterns" value={form.cognitive_patterns_score} onChange={v => updateField('cognitive_patterns_score', v)} />
          <ScoreInput label="Body Symptoms" value={form.body_symptoms_score} onChange={v => updateField('body_symptoms_score', v)} />
          <ScoreInput label="Behavioral Patterns" value={form.behavioral_patterns_score} onChange={v => updateField('behavioral_patterns_score', v)} />
          <ScoreInput label="Life Functioning" value={form.life_functioning_score} onChange={v => updateField('life_functioning_score', v)} />
          <div className="bg-indigo-50 rounded-lg p-3 text-center">
            <span className="text-xs text-indigo-600">Total Dysregulation Score</span>
            <p className="text-xl font-bold text-indigo-700">{totalScore}/60</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving || !form.main_complaint.trim()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Assessment'}
          </button>
        </div>
      </div>
    </Modal>
  );
});

// Development Form Modal
const DevFormModal = memo(function DevFormModal({
  onClose, onSave, saving,
}: {
  onClose: () => void;
  onSave: (data: any) => void;
  saving: boolean;
}) {
  const [form, setForm] = useState({
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

  const updateField = useCallback((field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const toggleTechnique = useCallback((technique: string) => {
    setForm(prev => ({
      ...prev,
      techniques_used: prev.techniques_used.includes(technique)
        ? prev.techniques_used.filter(t => t !== technique)
        : [...prev.techniques_used, technique],
    }));
  }, []);

  const totalScore = form.nervous_system_score + form.emotional_state_score + form.cognitive_patterns_score + form.body_symptoms_score + form.behavioral_patterns_score + form.life_functioning_score;

  return (
    <Modal onClose={onClose} title="Add Development Form">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session Number</label>
            <input type="number" min={1} value={form.session_number} onChange={e => updateField('session_number', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. 1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Session Date</label>
            <input type="date" value={form.session_date} onChange={e => updateField('session_date', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Techniques Used</label>
          <div className="flex flex-wrap gap-2">
            {TECHNIQUE_OPTIONS.map(technique => (
              <button key={technique} type="button" onClick={() => toggleTechnique(technique)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  form.techniques_used.includes(technique)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
              >{technique}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Key Interventions</label>
          <textarea value={form.key_interventions} onChange={e => updateField('key_interventions', e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Describe key interventions used..." />
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700">Domain Scores</h4>
          <ScoreInput label="Nervous System" value={form.nervous_system_score} onChange={v => updateField('nervous_system_score', v)} />
          <ScoreInput label="Emotional State" value={form.emotional_state_score} onChange={v => updateField('emotional_state_score', v)} />
          <ScoreInput label="Cognitive Patterns" value={form.cognitive_patterns_score} onChange={v => updateField('cognitive_patterns_score', v)} />
          <ScoreInput label="Body Symptoms" value={form.body_symptoms_score} onChange={v => updateField('body_symptoms_score', v)} />
          <ScoreInput label="Behavioral Patterns" value={form.behavioral_patterns_score} onChange={v => updateField('behavioral_patterns_score', v)} />
          <ScoreInput label="Life Functioning" value={form.life_functioning_score} onChange={v => updateField('life_functioning_score', v)} />
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <span className="text-xs text-green-600">Total Wellbeing Score</span>
            <p className="text-xl font-bold text-green-700">{totalScore}/60</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => onSave(form)} disabled={saving} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save Form'}
          </button>
        </div>
      </div>
    </Modal>
  );
});

// Archived Client Reports Component
function ArchivedClientReports({ assessments, devForms }: { assessments: ArchivedAssessment[]; devForms: ArchivedDevForm[] }) {
  const [activeReport, setActiveReport] = useState<'timeline' | 'comparison' | 'detailed'>('timeline');
  const [selectedComparison, setSelectedComparison] = useState(0);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const baseline = assessments[0]; // First assessment as baseline

  const totalScore = (item: any) =>
    (item.nervous_system_score || 0) + (item.emotional_state_score || 0) +
    (item.cognitive_patterns_score || 0) + (item.body_symptoms_score || 0) +
    (item.behavioral_patterns_score || 0) + (item.life_functioning_score || 0);

  // Build timeline data
  const timelineData = (() => {
    const timeline: Array<{ date: string; score: number; label: string; type: string }> = [];

    assessments.forEach(a => {
      const date = a.assessment_date || a.created_at;
      timeline.push({
        date,
        score: totalScore(a),
        label: a.session_number ? `Assessment ${a.session_number}` : 'Baseline',
        type: 'assessment',
      });
    });

    devForms.forEach(f => {
      const date = f.session_date || f.created_at;
      timeline.push({
        date,
        score: totalScore(f),
        label: f.session_number ? `Session ${f.session_number}` : 'Session',
        type: 'session',
      });
    });

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return timeline;
  })();

  const firstScore = timelineData[0]?.score || 0;
  const lastScore = timelineData[timelineData.length - 1]?.score || firstScore;
  const improvement = firstScore - lastScore;

  // Build comparisons
  const comparisons = (() => {
    const result: Array<{
      label: string;
      from: { label: string; score: number; data: any };
      to: { label: string; score: number; data: any };
      improvement: number;
    }> = [];

    if (baseline && devForms.length > 0) {
      const firstDev = devForms[0];
      result.push({
        label: 'Baseline → Session 1',
        from: { label: 'Baseline', score: totalScore(baseline), data: baseline },
        to: { label: 'Session 1', score: totalScore(firstDev), data: firstDev },
        improvement: totalScore(baseline) - totalScore(firstDev),
      });
    }

    for (let i = 0; i < devForms.length - 1; i++) {
      const current = devForms[i];
      const next = devForms[i + 1];
      result.push({
        label: `Session ${i + 1} → Session ${i + 2}`,
        from: { label: `Session ${i + 1}`, score: totalScore(current), data: current },
        to: { label: `Session ${i + 2}`, score: totalScore(next), data: next },
        improvement: totalScore(current) - totalScore(next),
      });
    }

    return result;
  })();

  const currentComparison = comparisons[selectedComparison] || comparisons[0];

  if (assessments.length === 0 && devForms.length === 0) {
    return (
      <div className="text-center py-16 border border-slate-200 rounded-xl">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No Report Data Available</h3>
        <p className="text-slate-500 mt-2">Add assessments and development forms to see reports.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Type Selector */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
        {[
          { id: 'timeline' as const, label: 'Progress Timeline', icon: FileText },
          { id: 'comparison' as const, label: 'Session Comparison', icon: Activity },
          { id: 'detailed' as const, label: 'Detailed Report', icon: BarChart3 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeReport === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Progress Summary */}
      <div className={`border rounded-lg p-6 ${improvement >= 0 ? 'bg-white border-slate-200' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm uppercase tracking-wider ${improvement >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
              {improvement >= 0 ? 'Symptom Reduction' : 'Symptom Increase'}
            </p>
            <p className={`text-3xl font-bold mt-1 ${improvement >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
              {improvement >= 0 ? '+' : ''}{improvement} points
            </p>
            <p className="text-sm text-slate-600 mt-1">From {firstScore} to {lastScore}/60</p>
            <p className="text-xs text-slate-500 mt-1">Lower scores indicate improved wellbeing</p>
          </div>
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${improvement >= 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
            {improvement >= 0 ? <TrendingDown className="w-8 h-8 text-green-600" /> : <TrendingUp className="w-8 h-8 text-amber-600" />}
          </div>
        </div>
      </div>

      {/* Timeline Tab */}
      {activeReport === 'timeline' && timelineData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Progress Timeline</h3>
          <div className="h-64 w-full">
            <Line
              data={{
                labels: timelineData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                  label: 'Dysregulation Level',
                  data: timelineData.map(d => d.score),
                  borderColor: '#6366F1',
                  backgroundColor: '#EEF2FF',
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: timelineData.map(d => d.type === 'assessment' ? '#F59E0B' : '#10B981'),
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
                      title: (items: any) => timelineData[items[0].dataIndex]?.label || '',
                      label: (context: any) => `Score: ${context.raw}/60`,
                    }
                  }
                },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#94A3B8', font: { size: 11 } } },
                  y: { min: 0, max: 60, grid: { color: '#E2E8F0' }, ticks: { color: '#94A3B8', font: { size: 12 } } },
                }
              }}
            />
          </div>
          <div className="flex gap-4 mt-4 justify-center text-xs">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-slate-600">Assessment</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-600">Session</span></div>
          </div>
        </div>
      )}

      {/* Comparison Tab */}
      {activeReport === 'comparison' && (
        <div className="space-y-6">
          {comparisons.length > 0 ? (
            <>
              <div className="flex gap-2 flex-wrap">
                {comparisons.map((c, idx) => (
                  <button key={idx} onClick={() => setSelectedComparison(idx)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                      selectedComparison === idx ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >{c.label}</button>
                ))}
              </div>
              {currentComparison && (
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">{currentComparison.label} Comparison</h3>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="text-center p-6 border border-slate-200 rounded-lg bg-slate-50">
                      <p className="text-sm text-slate-500 uppercase tracking-wider mb-2">Before</p>
                      <p className="text-xl font-medium text-slate-700 mb-1">{currentComparison.from.label}</p>
                      <p className="text-4xl font-bold text-slate-900 mt-2">{currentComparison.from.score}<span className="text-lg text-slate-400">/60</span></p>
                    </div>
                    <div className={`text-center p-6 border rounded-lg ${currentComparison.improvement >= 0 ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
                      <p className={`text-sm uppercase tracking-wider mb-2 ${currentComparison.improvement >= 0 ? 'text-green-600' : 'text-amber-600'}`}>After</p>
                      <p className="text-xl font-medium text-slate-700 mb-1">{currentComparison.to.label}</p>
                      <p className={`text-4xl font-bold mt-2 ${currentComparison.improvement >= 0 ? 'text-green-700' : 'text-amber-700'}`}>{currentComparison.to.score}<span className="text-lg opacity-60">/60</span></p>
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${currentComparison.improvement >= 0 ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <p className={`text-2xl font-bold ${currentComparison.improvement >= 0 ? 'text-green-700' : 'text-amber-700'}`}>
                      {currentComparison.improvement >= 0 ? '↓' : '↑'} {Math.abs(currentComparison.improvement)} points
                    </p>
                    <p className={`text-sm ${currentComparison.improvement >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
                      {currentComparison.improvement >= 0 ? 'Symptom Reduction' : 'Symptom Increase'}
                    </p>
                  </div>
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
                              <span className={`text-sm font-medium ${diff >= 0 ? 'text-green-600' : 'text-amber-600'}`}>{toScore}/10</span>
                              {diff !== 0 && <span className={`text-xs px-2 py-0.5 rounded ${diff > 0 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{diff > 0 ? '-' : '+'}{Math.abs(diff)}</span>}
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
              <p className="text-slate-500">Add at least two entries to see comparisons</p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Report Tab */}
      {activeReport === 'detailed' && (
        <div className="space-y-4">
          {assessments.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <button onClick={() => setExpandedItem(expandedItem === a.id ? null : a.id)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><FileText className="w-5 h-5 text-amber-600" /></div>
                  <div className="text-left">
                    <h3 className="font-medium text-slate-900">{a.session_number ? `Assessment - Session ${a.session_number}` : 'Diagnostic Assessment'}</h3>
                    <p className="text-sm text-slate-500">{new Date(a.assessment_date || a.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-indigo-600">{totalScore(a)}/60</span>
                  {expandedItem === a.id ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </button>
              {expandedItem === a.id && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  {a.main_complaint && <div className="mt-4"><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Main Complaint</p><p className="text-sm text-slate-700">{a.main_complaint}</p></div>}
                  {a.current_symptoms?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Symptoms</p>
                      <div className="flex flex-wrap gap-2">{a.current_symptoms.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">{s}</span>)}</div>
                    </div>
                  )}
                  <div className="mt-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Domain Scores</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { label: 'Nervous System', key: 'nervous_system_score' },
                        { label: 'Emotional', key: 'emotional_state_score' },
                        { label: 'Cognitive', key: 'cognitive_patterns_score' },
                        { label: 'Physical', key: 'body_symptoms_score' },
                        { label: 'Behavioral', key: 'behavioral_patterns_score' },
                        { label: 'Life Functioning', key: 'life_functioning_score' },
                      ].map(d => (
                        <div key={d.key} className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs text-slate-500">{d.label}</p>
                          <p className="text-lg font-semibold text-slate-900">{a[d.key as keyof ArchivedAssessment] || 0}/10</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {devForms.map((f, idx) => {
            const itemId = `dev-${f.id}`;
            return (
              <div key={f.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button onClick={() => setExpandedItem(expandedItem === itemId ? null : itemId)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><Activity className="w-5 h-5 text-green-600" /></div>
                    <div className="text-left">
                      <h3 className="font-medium text-slate-900">Session {f.session_number || idx + 1}</h3>
                      <p className="text-sm text-slate-500">{new Date(f.session_date || f.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-green-600">{totalScore(f)}/60</span>
                    {expandedItem === itemId ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </button>
                {expandedItem === itemId && (
                  <div className="px-6 pb-6 border-t border-slate-100">
                    {f.techniques_used?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Techniques Used</p>
                        <div className="flex flex-wrap gap-2">{f.techniques_used.map(t => <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{t}</span>)}</div>
                      </div>
                    )}
                    {f.key_interventions && <div className="mt-4"><p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Key Interventions</p><p className="text-sm text-slate-700">{f.key_interventions}</p></div>}
                    <div className="mt-4">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Domain Scores</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { label: 'Nervous System', key: 'nervous_system_score' },
                          { label: 'Emotional', key: 'emotional_state_score' },
                          { label: 'Cognitive', key: 'cognitive_patterns_score' },
                          { label: 'Physical', key: 'body_symptoms_score' },
                          { label: 'Behavioral', key: 'behavioral_patterns_score' },
                          { label: 'Life Functioning', key: 'life_functioning_score' },
                        ].map(d => (
                          <div key={d.key} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs text-slate-500">{d.label}</p>
                            <p className="text-lg font-semibold text-slate-900">{(f as any)[d.key] || 0}/10</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Main Archive Component
export default function ArchiveTab({ therapistId }: { therapistId: string }) {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ArchivedClient[]>([]);
  const [selectedClient, setSelectedClient] = useState<ArchivedClient | null>(null);
  const [assessments, setAssessments] = useState<ArchivedAssessment[]>([]);
  const [devForms, setDevForms] = useState<ArchivedDevForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modal, setModal] = useState<'newClient' | 'editClient' | 'assessment' | 'devForm' | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'assessments' | 'development' | 'reports'>('overview');
  const [saving, setSaving] = useState(false);

  const fetchClients = useCallback(async () => {
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
  }, [therapistId]);

  useEffect(() => { fetchClients(); }, [fetchClients]);

  const fetchClientDetail = useCallback(async (client: ArchivedClient) => {
    setSelectedClient(client);
    setDetailTab('overview');
    try {
      const [aRes, dRes] = await Promise.all([
        fetch(`/api/archive/assessments?archivedClientId=${client.id}`),
        fetch(`/api/archive/development-forms?archivedClientId=${client.id}`),
      ]);
      if (aRes.ok) { const d = await aRes.json(); setAssessments(d.assessments || []); }
      if (dRes.ok) { const d = await dRes.json(); setDevForms(d.forms || []); }
    } catch (err) { console.error('Failed to fetch client detail:', err); }
  }, []);

  const handleCreateClient = useCallback(async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/archive/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapistId, ...data }),
      });
      if (res.ok) {
        const result = await res.json();
        setClients(prev => [result.client, ...prev]);
        setModal(null);
      }
    } catch (err) { console.error('Failed to create client:', err); }
    finally { setSaving(false); }
  }, [therapistId]);

  const handleUpdateClient = useCallback(async (data: any) => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/clients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedClient.id, ...data }),
      });
      if (res.ok) {
        const result = await res.json();
        setClients(prev => prev.map(c => c.id === selectedClient.id ? result.client : c));
        setSelectedClient(result.client);
        setModal(null);
      }
    } catch (err) { console.error('Failed to update client:', err); }
    finally { setSaving(false); }
  }, [selectedClient]);

  const handleDeleteClient = useCallback(async (clientId: string) => {
    if (!confirm('Delete this archived client and all their data?')) return;
    try {
      const res = await fetch(`/api/archive/clients?id=${clientId}`, { method: 'DELETE' });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
        setSelectedClient(null);
      }
    } catch (err) { console.error('Failed to delete client:', err); }
  }, []);

  const handleCreateAssessment = useCallback(async (data: any) => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivedClientId: selectedClient.id,
          therapistId,
          data: {
            ...data,
            client_name: selectedClient.full_name,
            client_email: selectedClient.email,
            client_phone: selectedClient.phone,
            client_country: selectedClient.country,
            session_number: data.session_number ? parseInt(data.session_number) : null,
          },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setAssessments(prev => [result.assessment, ...prev]);
        setModal(null);
      }
    } catch (err) { console.error('Failed to create assessment:', err); }
    finally { setSaving(false); }
  }, [selectedClient, therapistId]);

  const handleCreateDevForm = useCallback(async (data: any) => {
    if (!selectedClient) return;
    setSaving(true);
    try {
      const res = await fetch('/api/archive/development-forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          archivedClientId: selectedClient.id,
          therapistId,
          data: { ...data, session_number: data.session_number ? parseInt(data.session_number) : null },
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setDevForms(prev => [result.form, ...prev]);
        setModal(null);
      }
    } catch (err) { console.error('Failed to create development form:', err); }
    finally { setSaving(false); }
  }, [selectedClient, therapistId]);

  const handleDeleteAssessment = useCallback(async (id: string) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      const res = await fetch(`/api/archive/assessments?id=${id}`, { method: 'DELETE' });
      if (res.ok) setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error('Failed to delete assessment:', err); }
  }, []);

  const handleDeleteDevForm = useCallback(async (id: string) => {
    if (!confirm('Delete this development form?')) return;
    try {
      const res = await fetch(`/api/archive/development-forms?id=${id}`, { method: 'DELETE' });
      if (res.ok) setDevForms(prev => prev.filter(f => f.id !== id));
    } catch (err) { console.error('Failed to delete development form:', err); }
  }, []);

  const totalScore = (item: ArchivedAssessment | ArchivedDevForm) =>
    (item.nervous_system_score || 0) + (item.emotional_state_score || 0) +
    (item.cognitive_patterns_score || 0) + (item.body_symptoms_score || 0) +
    (item.behavioral_patterns_score || 0) + (item.life_functioning_score || 0);

  const filteredClients = clients.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.full_name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>;
  }

  // Detail View
  if (selectedClient) {
    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedClient(null)} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back to archived clients
        </button>

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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 mt-2">Archived Client</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModal('editClient')} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => handleDeleteClient(selectedClient.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200">
            <nav className="flex">
              {[
                { id: 'overview' as const, label: 'Overview', icon: User },
                { id: 'assessments' as const, label: 'Assessments', icon: FileText },
                { id: 'development' as const, label: 'Development Forms', icon: TrendingUp },
                { id: 'reports' as const, label: 'Reports', icon: BarChart3 },
              ].map(tab => (
                <button key={tab.id} onClick={() => setDetailTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    detailTab === tab.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                ><tab.icon className="w-4 h-4" />{tab.label}</button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {detailTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4"><p className="text-xs text-slate-500 mb-1">Total Assessments</p><p className="text-2xl font-bold text-slate-900">{assessments.length}</p></div>
                  <div className="bg-slate-50 rounded-lg p-4"><p className="text-xs text-slate-500 mb-1">Development Forms</p><p className="text-2xl font-bold text-slate-900">{devForms.length}</p></div>
                  <div className="bg-slate-50 rounded-lg p-4"><p className="text-xs text-slate-500 mb-1">Latest Score</p><p className="text-2xl font-bold text-indigo-600">{assessments.length > 0 ? `${totalScore(assessments[0])}/60` : devForms.length > 0 ? `${totalScore(devForms[0])}/60` : 'N/A'}</p></div>
                </div>
                {selectedClient.notes && <div className="bg-slate-50 rounded-lg p-4"><p className="text-xs text-slate-500 mb-2">Notes</p><p className="text-sm text-slate-700">{selectedClient.notes}</p></div>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {selectedClient.date_of_birth && <div className="flex items-center gap-2 text-slate-600"><Calendar className="w-4 h-4 text-slate-400" />DOB: {new Date(selectedClient.date_of_birth).toLocaleDateString()}</div>}
                  {selectedClient.occupation && <div className="flex items-center gap-2 text-slate-600"><Briefcase className="w-4 h-4 text-slate-400" />{selectedClient.occupation}</div>}
                  {selectedClient.relationship_status && <div className="flex items-center gap-2 text-slate-600"><Heart className="w-4 h-4 text-slate-400" />{selectedClient.relationship_status}</div>}
                </div>
              </div>
            )}

            {detailTab === 'assessments' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-slate-900">Diagnostic Assessments</h3>
                  <button onClick={() => setModal('assessment')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" />Add Assessment</button>
                </div>
                {assessments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg"><FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No assessments yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {assessments.map(a => (
                      <div key={a.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{a.session_number ? `Session ${a.session_number}` : 'Assessment'}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{totalScore(a)}/60</span>
                          </div>
                          <p className="text-sm text-slate-500 mt-1">{a.main_complaint}</p>
                          <p className="text-xs text-slate-400 mt-1">{a.assessment_date ? new Date(a.assessment_date).toLocaleDateString() : new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteAssessment(a.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'development' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-slate-900">Development Forms</h3>
                  <button onClick={() => setModal('devForm')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" />Add Form</button>
                </div>
                {devForms.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-lg"><TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" /><p className="text-slate-500">No development forms yet</p></div>
                ) : (
                  <div className="space-y-3">
                    {devForms.map(f => (
                      <div key={f.id} className="bg-slate-50 rounded-lg p-4 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900">{f.session_number ? `Session ${f.session_number}` : 'Development Form'}</p>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{totalScore(f)}/60</span>
                          </div>
                          {f.techniques_used?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {f.techniques_used.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">{t}</span>)}
                            </div>
                          )}
                          <p className="text-xs text-slate-400 mt-2">{f.session_date ? new Date(f.session_date).toLocaleDateString() : new Date(f.created_at).toLocaleDateString()}</p>
                        </div>
                        <button onClick={() => handleDeleteDevForm(f.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'reports' && (
              <ArchivedClientReports assessments={assessments} devForms={devForms} />
            )}
          </div>
        </div>

        {modal === 'editClient' && <ClientFormModal onClose={() => setModal(null)} onSave={handleUpdateClient} saving={saving} initialData={selectedClient} title="Edit Archived Client" />}
        {modal === 'assessment' && <AssessmentFormModal onClose={() => setModal(null)} onSave={handleCreateAssessment} saving={saving} />}
        {modal === 'devForm' && <DevFormModal onClose={() => setModal(null)} onSave={handleCreateDevForm} saving={saving} />}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Archived Clients</h2>
          <p className="text-sm text-slate-500">Manual entries for past clients</p>
        </div>
        <button onClick={() => setModal('newClient')} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search archived clients..." className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

      {filteredClients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <Archive className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-slate-900 font-medium">No archived clients</h3>
          <p className="text-slate-500 text-sm mt-1">Add past client records manually</p>
          <button onClick={() => setModal('newClient')} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Plus className="w-4 h-4" />Add First Client</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <button key={client.id} onClick={() => fetchClientDetail(client)} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all text-left w-full">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0"><User className="w-5 h-5 text-amber-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{client.full_name}</h3>
                  {client.email && <div className="flex items-center gap-1 text-sm text-slate-500 mt-0.5"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{client.email}</span></div>}
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Added {new Date(client.created_at).toLocaleDateString()}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700">Archived</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {modal === 'newClient' && <ClientFormModal onClose={() => setModal(null)} onSave={handleCreateClient} saving={saving} title="Add Archived Client" />}
    </div>
  );
}
