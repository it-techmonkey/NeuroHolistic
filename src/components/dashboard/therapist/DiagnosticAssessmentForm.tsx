'use client';

import { useState, useEffect } from 'react';

interface DiagnosticAssessmentFormProps {
  clientId: string | null;
  therapistId: string;
  sessionId?: string;
  existingAssessment?: any;
  baselineExists?: boolean;
  clientData?: {
    full_name?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
  onClose: () => void;
  onSave: (assessment: any) => void;
  isSessionCompleted?: boolean;
}

const NERVOUS_SYSTEM_PATTERNS = [
  { value: 'regulated', label: 'Regulated' },
  { value: 'hyper', label: 'Hyper (anxious / tense)' },
  { value: 'hypo', label: 'Hypo (shutdown / low energy)' },
  { value: 'mixed', label: 'Mixed' },
];

const CURRENT_SYMPTOM_OPTIONS = [
  'Anxiety',
  'Emotional distress',
  'Low mood',
  'Numbness',
  'Overthinking',
  'Panic',
  'Sleep difficulty',
  'Relationship difficulty',
  'Physical symptoms',
  'Lack of direction',
  'Fatigue',
  'Stress overload',
  'Other',
];

const EMOTIONAL_PATTERNS = [
  'Anxiety / fear',
  'Sadness / low mood',
  'Numbness',
  'Irritability',
  'Shame / guilt',
];

const COGNITIVE_PATTERNS = [
  'Overthinking',
  'Negative self-talk',
  'Catastrophizing',
  'Control-driven thinking',
  'Mental rigidity',
];

const BODY_SYMPTOMS = [
  'Tension',
  'Fatigue',
  'Sleep issues',
  'Digestive issues',
  'Pain / pressure',
  'Health Condition',
];

const BEHAVIORAL_PATTERNS = [
  'Avoidance',
  'People-pleasing',
  'Over-control',
  'Withdrawal',
  'Reactivity',
];

const LIFE_FUNCTIONING = [
  'Relationships',
  'Work / career',
  'Daily functioning',
  'Decision-making',
  'Self-worth',
];

const PATTERN_TIMELINE_OPTIONS = [
  { value: 'recent_activation', label: 'Recent activation' },
  { value: 'long_standing', label: 'Long-standing pattern' },
  { value: 'lifelong', label: 'Lifelong / early imprint expression' },
  { value: 'unclear', label: 'Unclear' },
];

const PARENTAL_INFLUENCE_OPTIONS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None / no clear influence' },
  { value: 'other', label: 'Other (specify)' },
];

const CORE_PATTERN_OPTIONS = [
  'Abandonment',
  'Rejection / Not enough',
  'Control / Safety',
  'Suppression / Expression',
  'Other',
];

const CONTRIBUTING_FACTOR_OPTIONS = [
  'Emotional inconsistency',
  'Lack of safety',
  'High pressure / responsibility',
  'Trauma / shock event',
  'Emotional neglect',
  'Other',
];

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh', 'Belarus', 'Belgium',
  'Bolivia', 'Bosnia and Herzegovina', 'Brazil', 'Bulgaria', 'Cambodia',
  'Canada', 'Chile', 'China', 'Colombia', 'Costa Rica', 'Croatia', 'Cuba',
  'Cyprus', 'Czech Republic', 'Denmark', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Estonia', 'Ethiopia', 'Finland', 'France',
  'Georgia', 'Germany', 'Ghana', 'Greece', 'Guatemala', 'Honduras', 'Hong Kong',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Latvia', 'Lebanon', 'Libya', 'Lithuania', 'Luxembourg', 'Malaysia',
  'Mexico', 'Moldova', 'Morocco', 'Myanmar', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Nigeria', 'North Korea', 'Norway', 'Oman',
  'Pakistan', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Puerto Rico', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia',
  'Singapore', 'Slovakia', 'Slovenia', 'South Africa', 'South Korea', 'Spain',
  'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Syria', 'Taiwan',
  'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zimbabwe',
];

const SCORE_LABELS: Record<number, string> = {
  0: 'Not present',
  1: 'Minimal',
  2: 'Very mild',
  3: 'Mild',
  4: 'Mild to moderate',
  5: 'Moderate',
  6: 'Moderate to significant',
  7: 'Significant',
  8: 'Severe',
  9: 'Very severe',
  10: 'Extreme',
};

export default function DiagnosticAssessmentForm({
  clientId,
  therapistId,
  sessionId,
  existingAssessment,
  baselineExists = false,
  clientData,
  onClose,
  onSave,
  isSessionCompleted = false,
}: DiagnosticAssessmentFormProps) {
  const parseMultiValue = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.filter((v) => typeof v === 'string') as string[];
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
    }
    return [];
  };

  const getParentalInfluenceKey = (value: unknown): string => {
    const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (!normalized) return '';
    const direct = PARENTAL_INFLUENCE_OPTIONS.find((opt) => opt.value === normalized);
    if (direct) return direct.value;
    const byLabel = PARENTAL_INFLUENCE_OPTIONS.find((opt) => opt.label.toLowerCase() === normalized);
    return byLabel?.value || 'other';
  };

  const isCompleted = existingAssessment?.status === 'completed' || isSessionCompleted;
  const isSubmitted = existingAssessment?.status === 'submitted';
  const isReadOnly = isCompleted || isSubmitted;

  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scorePromptedFields, setScorePromptedFields] = useState<Record<string, boolean>>({
    nervous_system_score: (existingAssessment?.nervous_system_score ?? 0) > 0,
    emotional_state_score: (existingAssessment?.emotional_state_score ?? 0) > 0,
    cognitive_patterns_score: (existingAssessment?.cognitive_patterns_score ?? 0) > 0,
    body_symptoms_score: (existingAssessment?.body_symptoms_score ?? 0) > 0,
    behavioral_patterns_score: (existingAssessment?.behavioral_patterns_score ?? 0) > 0,
    life_functioning_score: (existingAssessment?.life_functioning_score ?? 0) > 0,
  });
  const [scorePrompt, setScorePrompt] = useState<{
    field: string;
    title: string;
    description: string;
  } | null>(null);

  const [form, setForm] = useState({
    // Basic Information
    client_name: existingAssessment?.client_name ?? clientData?.full_name ?? '',
    date_of_birth: existingAssessment?.date_of_birth ?? '',
    client_email: existingAssessment?.client_email ?? clientData?.email ?? '',
    client_phone: existingAssessment?.client_phone ?? clientData?.phone ?? '',
    client_country: existingAssessment?.client_country ?? clientData?.country ?? '',
    client_occupation: existingAssessment?.client_occupation ?? '',
    relationship_status: existingAssessment?.relationship_status ?? '',

    // Main Concerns
    main_complaint: existingAssessment?.main_complaint ?? '',
    current_symptoms: parseMultiValue(existingAssessment?.current_symptoms),
    current_symptoms_other: existingAssessment?.current_symptoms_other ?? '',

    // Previous Therapy
    previous_therapy: existingAssessment?.previous_therapy ?? false,
    previous_therapy_details: existingAssessment?.previous_therapy_details ?? '',

    // Symptoms - Nervous System
    nervous_system_pattern: existingAssessment?.nervous_system_pattern ?? '',
    nervous_system_score: existingAssessment?.nervous_system_score ?? 0,

    // Symptoms - Emotional State
    emotional_patterns: parseMultiValue(existingAssessment?.emotional_patterns),
    emotional_state_score: existingAssessment?.emotional_state_score ?? 0,

    // Symptoms - Cognitive Patterns
    cognitive_patterns: parseMultiValue(existingAssessment?.cognitive_patterns),
    cognitive_patterns_score: existingAssessment?.cognitive_patterns_score ?? 0,

    // Symptoms - Body Symptoms
    body_symptoms: parseMultiValue(existingAssessment?.body_symptoms),
    health_condition_specify: existingAssessment?.health_condition_specify ?? '',
    body_symptoms_score: existingAssessment?.body_symptoms_score ?? 0,

    // Symptoms - Behavioral Patterns
    behavioral_patterns: parseMultiValue(existingAssessment?.behavioral_patterns),
    behavioral_patterns_score: existingAssessment?.behavioral_patterns_score ?? 0,

    // Symptoms - Life Functioning
    life_functioning_patterns: parseMultiValue(existingAssessment?.life_functioning_patterns),
    life_functioning_score: existingAssessment?.life_functioning_score ?? 0,

    // Root Cause Analysis
    root_cause_pattern_timeline: existingAssessment?.root_cause_pattern_timeline ?? '',
    root_cause_parental_influence: getParentalInfluenceKey(existingAssessment?.root_cause_parental_influence),
    root_cause_parental_influence_other: existingAssessment?.root_cause_parental_influence_other ?? '',
    root_cause_core_patterns: parseMultiValue(existingAssessment?.root_cause_core_patterns),
    root_cause_core_patterns_other: existingAssessment?.root_cause_core_patterns_other ?? '',
    root_cause_contributing_factors: parseMultiValue(existingAssessment?.root_cause_contributing_factors),
    root_cause_contributing_factors_other: existingAssessment?.root_cause_contributing_factors_other ?? '',

    // Clinical Summary
    clinical_condition_brief: existingAssessment?.clinical_condition_brief ?? '',
    therapist_focus: existingAssessment?.therapist_focus ?? '',
    therapy_goal: existingAssessment?.therapy_goal ?? '',
  });

  useEffect(() => {
    if (isReadOnly) return;
    if (!clientData) return;
    setForm((prev) => ({
      ...prev,
      client_name: prev.client_name || clientData.full_name || '',
      client_email: prev.client_email || clientData.email || '',
      client_phone: prev.client_phone || clientData.phone || '',
      client_country: prev.client_country || clientData.country || '',
    }));
  }, [
    isReadOnly,
    clientData?.full_name,
    clientData?.email,
    clientData?.phone,
    clientData?.country,
  ]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openScorePrompt = (field: string, title: string, description: string) => {
    if (isReadOnly) return;
    if (scorePromptedFields[field]) return;
    setScorePromptedFields((prev) => ({ ...prev, [field]: true }));
    setScorePrompt({ field, title, description });
  };

  const toggleArrayItem = (field: string, item: string) => {
    setForm(prev => {
      const arr = prev[field as keyof typeof prev] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  const goalReadinessScore = form.nervous_system_score + form.emotional_state_score +
    form.cognitive_patterns_score + form.body_symptoms_score +
    form.behavioral_patterns_score + form.life_functioning_score;

  const handleSave = async () => {
    if (!form.main_complaint) {
      setError('Main complaint is required');
      return;
    }
    if (!form.client_name) {
      setError('Full name is required');
      return;
    }
    if (!form.date_of_birth) {
      setError('Date of birth is required');
      return;
    }
    if (!form.client_email) {
      setError('Email is required');
      return;
    }
    if (!form.client_phone) {
      setError('Phone is required');
      return;
    }
    if (form.current_symptoms.length === 0) {
      setError('At least one current symptom is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Serialize structured root cause fields as text for DB compatibility
      const rootCauseTimeline = form.root_cause_pattern_timeline || null;
      const rootCauseParental = form.root_cause_parental_influence === 'other'
        ? (form.root_cause_parental_influence_other || 'Other')
        : (PARENTAL_INFLUENCE_OPTIONS.find(o => o.value === form.root_cause_parental_influence)?.label || form.root_cause_parental_influence || null);
      const rootCauseCore = Array.isArray(form.root_cause_core_patterns)
        ? form.root_cause_core_patterns.map(p => p === 'Other' && form.root_cause_core_patterns_other ? `Other: ${form.root_cause_core_patterns_other}` : p).join(', ')
        : form.root_cause_core_patterns || null;
      const rootCauseContributing = Array.isArray(form.root_cause_contributing_factors)
        ? form.root_cause_contributing_factors.map(f => f === 'Other' && form.root_cause_contributing_factors_other ? `Other: ${form.root_cause_contributing_factors_other}` : f).join(', ')
        : form.root_cause_contributing_factors || null;

      const payload = {
        clientId: clientId || null,
        therapistId,
        sessionId,
        data: {
          ...form,
          root_cause_pattern_timeline: rootCauseTimeline,
          root_cause_parental_influence: rootCauseParental,
          root_cause_core_patterns: rootCauseCore,
          root_cause_contributing_factors: rootCauseContributing,
          assessed_at: new Date().toISOString(),
          status: 'submitted',
        },
      };

      console.log('[DiagnosticAssessmentForm] Submitting payload:', JSON.stringify(payload, null, 2));

      const res = await fetch('/api/assessments/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Server returned an invalid response');
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save assessment');
      }

      onSave(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { title: 'Basic Information', shortTitle: 'Info' },
    { title: 'Main Concerns', shortTitle: 'Concerns' },
    { title: 'Symptoms', shortTitle: 'Symptoms' },
    { title: 'Root Cause', shortTitle: 'Root Cause' },
    { title: 'Clinical Summary', shortTitle: 'Summary' },
  ];

  const ScoreSlider = ({ label, field, value, disabled = false }: { label: string; field: string; value: number; disabled?: boolean }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-indigo-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => updateField(field, parseInt(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-slate-200 rounded-lg appearance-none accent-indigo-600 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      />
      <p className="text-xs text-slate-500">{SCORE_LABELS[value]}</p>
    </div>
  );

  const quickScoreOptions = [0, 3, 5, 7, 10];

  const PatternCheckbox = ({
    options,
    field,
    disabled = false,
    maxSelect,
    onSelectNew,
  }: {
    options: string[];
    field: string;
    disabled?: boolean;
    maxSelect?: number;
    onSelectNew?: () => void;
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => {
        const selectedArr = form[field as keyof typeof form] as string[];
        const selected = selectedArr.includes(option);
        const atLimit = maxSelect ? selectedArr.length >= maxSelect && !selected : false;
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (disabled || atLimit) return;
              toggleArrayItem(field, option);
              if (!selected) onSelectNew?.();
            }}
            disabled={disabled || atLimit}
            className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
              selected
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : disabled
                ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
                : atLimit
                ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {selected ? '✓ ' : ''}{option}
          </button>
        );
      })}
    </div>
  );

  const SingleSelect = ({
    options,
    field,
    disabled = false,
    onSelectNew,
  }: {
    options: { value: string; label: string }[];
    field: string;
    disabled?: boolean;
    onSelectNew?: () => void;
  }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            if (disabled) return;
            const current = form[field as keyof typeof form];
            updateField(field, option.value);
            if (current !== option.value) onSelectNew?.();
          }}
          disabled={disabled}
          className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
            form[field as keyof typeof form] === option.value
              ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
              : disabled
              ? 'bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">
                  {isCompleted ? 'Diagnostic Assessment (Locked)' : 'Diagnostic Assessment'}
                </h2>
                {isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                    Locked
                  </span>
                )}
                {existingAssessment?.status === 'submitted' && !isCompleted && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                    Submitted
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                {isCompleted
                  ? 'This assessment has been locked after session completion.'
                  : existingAssessment?.is_baseline
                  ? 'Editing baseline assessment'
                  : 'New baseline assessment'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Goal Readiness</p>
              <p className="text-2xl font-bold text-indigo-600">{goalReadinessScore}/60</p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSection(idx)}
                className={`px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === idx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.shortTitle}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Section 0: Basic Information */}
          {activeSection === 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => updateField('client_name', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => updateField('client_email', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={(e) => updateField('client_phone', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <select
                    value={form.client_country}
                    onChange={(e) => updateField('client_country', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  >
                    <option value="">Select country...</option>
                    {COUNTRIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.client_occupation}
                    onChange={(e) => updateField('client_occupation', e.target.value)}
                    disabled={isReadOnly}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                <select
                  value={form.relationship_status}
                  onChange={(e) => updateField('relationship_status', e.target.value)}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select...</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="in_relationship">In a Relationship</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 1: Main Concerns */}
          {activeSection === 1 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Main Concerns</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">What is the main reason you are seeking support? *</label>
                <textarea
                  value={form.main_complaint}
                  onChange={(e) => updateField('main_complaint', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Describe the primary reason for seeking support..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Symptoms * (select all that apply)</label>
                <PatternCheckbox options={CURRENT_SYMPTOM_OPTIONS} field="current_symptoms" disabled={isReadOnly} />
                {form.current_symptoms.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.current_symptoms_other}
                      onChange={(e) => updateField('current_symptoms_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other symptoms..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>
              <div className="border-t border-slate-200 pt-6">
                <h4 className="font-medium text-slate-900 mb-3">Previous Therapy</h4>
                <div className="flex items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => !isReadOnly && updateField('previous_therapy', !form.previous_therapy)}
                    disabled={isReadOnly}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      form.previous_therapy ? 'bg-indigo-600' : 'bg-slate-200'
                    } ${isReadOnly ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        form.previous_therapy ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-700">Has previous therapy experience</span>
                </div>
                {form.previous_therapy && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Previous Therapy Details</label>
                    <textarea
                      value={form.previous_therapy_details}
                      onChange={(e) => updateField('previous_therapy_details', e.target.value)}
                      rows={4}
                      disabled={isReadOnly}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      placeholder="Describe previous therapy experience, types, duration, outcomes..."
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: Symptoms */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Symptoms Assessment</h3>

              {/* 1. Nervous System */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.nervous_system_pattern ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">1. Nervous System</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Observed Pattern (select 1-2 dominant)</label>
                  <SingleSelect
                    options={NERVOUS_SYSTEM_PATTERNS}
                    field="nervous_system_pattern"
                    disabled={isReadOnly}
                    onSelectNew={() =>
                      openScorePrompt(
                        'nervous_system_score',
                        'Nervous System Score',
                        'You selected a nervous system pattern. Set the severity now.'
                      )
                    }
                  />
                </div>
                {form.nervous_system_pattern && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How dysregulated is the client most of the time?"
                      field="nervous_system_score"
                      value={form.nervous_system_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 2. Emotional State */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.emotional_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">2. Emotional State</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dominant Emotional Pattern (top 2)</label>
                  <PatternCheckbox
                    options={EMOTIONAL_PATTERNS}
                    field="emotional_patterns"
                    disabled={isReadOnly}
                    maxSelect={2}
                    onSelectNew={() =>
                      openScorePrompt(
                        'emotional_state_score',
                        'Emotional State Score',
                        'You selected an emotional pattern. Set the severity now.'
                      )
                    }
                  />
                </div>
                {form.emotional_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much do emotions overwhelm or limit the client?"
                      field="emotional_state_score"
                      value={form.emotional_state_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 3. Cognitive Patterns */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.cognitive_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">3. Cognitive Patterns</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dominant Thought Patterns (top 2)</label>
                  <PatternCheckbox
                    options={COGNITIVE_PATTERNS}
                    field="cognitive_patterns"
                    disabled={isReadOnly}
                    maxSelect={2}
                    onSelectNew={() =>
                      openScorePrompt(
                        'cognitive_patterns_score',
                        'Cognitive Patterns Score',
                        'You selected a cognitive pattern. Set the severity now.'
                      )
                    }
                  />
                </div>
                {form.cognitive_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much are thoughts repetitive or uncontrollable?"
                      field="cognitive_patterns_score"
                      value={form.cognitive_patterns_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 4. Body Symptoms */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.body_symptoms.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">4. Body Symptoms</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Main Physical Expressions (top 2)</label>
                  <PatternCheckbox
                    options={BODY_SYMPTOMS}
                    field="body_symptoms"
                    disabled={isReadOnly}
                    maxSelect={2}
                    onSelectNew={() =>
                      openScorePrompt(
                        'body_symptoms_score',
                        'Body Symptoms Score',
                        'You selected a body symptom. Set the severity now.'
                      )
                    }
                  />
                  {form.body_symptoms.includes('Health Condition') && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-slate-700 mb-1">If health condition specify</label>
                      <input
                        type="text"
                        value={form.health_condition_specify}
                        onChange={(e) => updateField('health_condition_specify', e.target.value)}
                        disabled={isReadOnly}
                        placeholder="Specify the health condition..."
                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  )}
                </div>
                {form.body_symptoms.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much do physical symptoms affect the client?"
                      field="body_symptoms_score"
                      value={form.body_symptoms_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 5. Behavioral Patterns */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.behavioral_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">5. Behavioral Patterns</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Dominant Behaviors (top 2)</label>
                  <PatternCheckbox
                    options={BEHAVIORAL_PATTERNS}
                    field="behavioral_patterns"
                    disabled={isReadOnly}
                    maxSelect={2}
                    onSelectNew={() =>
                      openScorePrompt(
                        'behavioral_patterns_score',
                        'Behavioral Patterns Score',
                        'You selected a behavioral pattern. Set the severity now.'
                      )
                    }
                  />
                </div>
                {form.behavioral_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much are behaviors driven by these patterns?"
                      field="behavioral_patterns_score"
                      value={form.behavioral_patterns_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* 6. Life Functioning */}
              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.life_functioning_patterns.length > 0 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <h4 className="font-medium text-slate-800 mb-3">6. Life Functioning</h4>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Impact Areas (top 2)</label>
                  <PatternCheckbox
                    options={LIFE_FUNCTIONING}
                    field="life_functioning_patterns"
                    disabled={isReadOnly}
                    maxSelect={2}
                    onSelectNew={() =>
                      openScorePrompt(
                        'life_functioning_score',
                        'Life Functioning Score',
                        'You selected a life-impact pattern. Set the severity now.'
                      )
                    }
                  />
                </div>
                {form.life_functioning_patterns.length > 0 && (
                  <div className="px-4 pb-4 border-t border-indigo-100 pt-4">
                    <ScoreSlider
                      label="Severity — How much is the client's life impacted overall?"
                      field="life_functioning_score"
                      value={form.life_functioning_score}
                      disabled={isReadOnly}
                    />
                  </div>
                )}
              </div>

              {/* Baseline Score Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3">Baseline Score</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nervous System:</span>
                    <span className="font-medium">{form.nervous_system_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional:</span>
                    <span className="font-medium">{form.emotional_state_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive:</span>
                    <span className="font-medium">{form.cognitive_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical:</span>
                    <span className="font-medium">{form.body_symptoms_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Behavioral:</span>
                    <span className="font-medium">{form.behavioral_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Life Functioning:</span>
                    <span className="font-medium">{form.life_functioning_score}/10</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Goal Readiness:</span>
                  <span className="text-indigo-600">{goalReadinessScore}/60</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Root Cause Analysis */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Root Cause Analysis</h3>

              {/* 1. Pattern Expression Timeline */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Pattern Expression Timeline — "How long have you been aware of this pattern or experiencing its effects?"
                </label>
                <SingleSelect options={PATTERN_TIMELINE_OPTIONS} field="root_cause_pattern_timeline" disabled={isReadOnly} />
              </div>

              {/* 2. Dominant Parental Influence */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">2. Dominant Parental Influence</label>
                <SingleSelect options={PARENTAL_INFLUENCE_OPTIONS} field="root_cause_parental_influence" disabled={isReadOnly} />
                {form.root_cause_parental_influence === 'other' && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_parental_influence_other}
                      onChange={(e) => updateField('root_cause_parental_influence_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {/* 3. Core Pattern */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">3. Core Pattern (select top 1-2)</label>
                <PatternCheckbox options={CORE_PATTERN_OPTIONS} field="root_cause_core_patterns" disabled={isReadOnly} maxSelect={2} />
                {form.root_cause_core_patterns.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_core_patterns_other}
                      onChange={(e) => updateField('root_cause_core_patterns_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other core pattern..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>

              {/* 4. Key Contributing Factors */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">4. Key Contributing Factors</label>
                <PatternCheckbox options={CONTRIBUTING_FACTOR_OPTIONS} field="root_cause_contributing_factors" disabled={isReadOnly} />
                {form.root_cause_contributing_factors.includes('Other') && (
                  <div className="mt-3">
                    <input
                      type="text"
                      value={form.root_cause_contributing_factors_other}
                      onChange={(e) => updateField('root_cause_contributing_factors_other', e.target.value)}
                      disabled={isReadOnly}
                      placeholder="Please specify other contributing factors..."
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: Clinical Summary */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Clinical Summary</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Condition Brief</label>
                <textarea
                  value={form.clinical_condition_brief}
                  onChange={(e) => updateField('clinical_condition_brief', e.target.value)}
                  rows={4}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Brief clinical summary of the client's condition..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapist Main Focus</label>
                <textarea
                  value={form.therapist_focus}
                  onChange={(e) => updateField('therapist_focus', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Areas the therapist will focus on..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapy Goal</label>
                <textarea
                  value={form.therapy_goal}
                  onChange={(e) => updateField('therapy_goal', e.target.value)}
                  rows={3}
                  disabled={isReadOnly}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="Goals for therapy outcomes..."
                />
              </div>

              {/* Baseline Score */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3">Baseline Score</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span>Nervous System:</span>
                    <span className="font-medium">{form.nervous_system_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Emotional:</span>
                    <span className="font-medium">{form.emotional_state_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cognitive:</span>
                    <span className="font-medium">{form.cognitive_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Physical:</span>
                    <span className="font-medium">{form.body_symptoms_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Behavioral:</span>
                    <span className="font-medium">{form.behavioral_patterns_score}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Life Functioning:</span>
                    <span className="font-medium">{form.life_functioning_score}/10</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Goal Readiness:</span>
                  <span className="text-indigo-600">{goalReadinessScore}/60</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </button>
          <div className="flex gap-3">
            {!isReadOnly && activeSection > 0 && (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection - 1)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
            {!isReadOnly && activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection + 1)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : !isReadOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : existingAssessment ? 'Update Assessment' : 'Submit Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
      {scorePrompt && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-slate-200 p-5">
            <h3 className="text-base font-semibold text-slate-900">{scorePrompt.title}</h3>
            <p className="text-sm text-slate-600 mt-1 mb-4">{scorePrompt.description}</p>
            <p className="text-xs text-slate-500 mb-3">
              Tip: set a rough score now; you can fine-tune it anytime before submission.
            </p>
            <ScoreSlider
              label="Severity"
              field={scorePrompt.field}
              value={(form[scorePrompt.field as keyof typeof form] as number) ?? 0}
              disabled={false}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {quickScoreOptions.map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => updateField(scorePrompt.field, score)}
                  className={`px-2.5 py-1.5 rounded text-xs border transition-colors ${
                    (form[scorePrompt.field as keyof typeof form] as number) === score
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                type="button"
                onClick={() => setScorePrompt(null)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
