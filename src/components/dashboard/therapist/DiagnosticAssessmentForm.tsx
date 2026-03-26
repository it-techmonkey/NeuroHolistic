'use client';

import { useState, useEffect } from 'react';

interface DiagnosticAssessmentFormProps {
  clientId: string;
  therapistId: string;
  sessionId?: string;
  existingAssessment?: any;
  clientData?: {
    full_name?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
  onClose: () => void;
  onSave: (assessment: any) => void;
}

const NERVOUS_SYSTEM_PATTERNS = [
  { value: 'regulated', label: 'Regulated - Generally calm and responsive' },
  { value: 'hyper', label: 'Hyper - Overactive, anxiety-driven responses' },
  { value: 'hypo', label: 'Hypo - Underactive, shutdown responses' },
  { value: 'mixed', label: 'Mixed - Alternating between states' },
];

const SYMPTOM_OPTIONS = [
  'Anxiety', 'Depression', 'Insomnia', 'Chronic Pain', 'Fatigue',
  'Brain Fog', 'Emotional Numbness', 'Panic Attacks', 'Relationship Issues',
  'Self-Esteem Issues', 'Anger Issues', 'Grief', 'Trauma Responses',
  'Stress', 'Burnout', 'Phobias', 'OCD Tendencies', 'ADD/ADHD Symptoms',
];

const EMOTIONAL_PATTERNS = [
  'Suppressed Anger', 'Chronic Sadness', 'Fear of Abandonment',
  'Emotional Numbness', 'Hypervigilance', 'Shame', 'Guilt',
  'Jealousy', 'Loneliness', 'Overwhelm',
];

const COGNITIVE_PATTERNS = [
  'Catastrophizing', 'Black-and-White Thinking', 'Mind Reading',
  'Personalization', 'Should Statements', 'Labeling',
  'Overgeneralization', 'Mental Filtering', 'Fortune Telling',
  'Magnification/Minimization',
];

const BODY_SYMPTOMS = [
  'Tension Headaches', 'Neck/Shoulder Pain', 'Back Pain',
  'Digestive Issues', 'Chest Tightness', 'Jaw Clenching',
  'Muscle Tension', 'Fatigue', 'Sleep Disturbances', 'Appetite Changes',
];

const BEHAVIORAL_PATTERNS = [
  'Avoidance', 'People-Pleasing', 'Perfectionism',
  'Procrastination', 'Compulsive Behaviors', 'Isolation',
  'Overworking', 'Substance Use', 'Self-Harm Tendencies', 'Risk-Taking',
];

const LIFE_FUNCTIONING = [
  'Work Performance', 'Social Relationships', 'Family Dynamics',
  'Self-Care', 'Physical Health', 'Emotional Regulation',
  'Decision Making', 'Concentration', 'Motivation', 'Overall Life Satisfaction',
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
  clientData,
  onClose,
  onSave,
}: DiagnosticAssessmentFormProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Section 1: Basic Info - Auto-fill from clientData if available
    client_name: existingAssessment?.client_name ?? clientData?.full_name ?? '',
    date_of_birth: existingAssessment?.date_of_birth ?? '',
    client_email: existingAssessment?.client_email ?? clientData?.email ?? '',
    client_phone: existingAssessment?.client_phone ?? clientData?.phone ?? '',
    client_country: existingAssessment?.client_country ?? clientData?.country ?? '',
    client_occupation: existingAssessment?.client_occupation ?? '',
    relationship_status: existingAssessment?.relationship_status ?? '',

    // Section 2: Main Concerns
    main_complaint: existingAssessment?.main_complaint ?? '',
    current_symptoms: existingAssessment?.current_symptoms ?? [],

    // Section 3: Previous Therapy
    previous_therapy: existingAssessment?.previous_therapy ?? false,
    previous_therapy_details: existingAssessment?.previous_therapy_details ?? '',

    // Section 4: Core Assessment
    nervous_system_pattern: existingAssessment?.nervous_system_pattern ?? '',
    emotional_patterns: existingAssessment?.emotional_patterns ?? [],
    cognitive_patterns: existingAssessment?.cognitive_patterns ?? [],
    body_symptoms: existingAssessment?.body_symptoms ?? [],
    behavioral_patterns: existingAssessment?.behavioral_patterns ?? [],
    life_functioning_patterns: existingAssessment?.life_functioning_patterns ?? [],

    // Scores (0-10 each)
    nervous_system_score: existingAssessment?.nervous_system_score ?? 5,
    emotional_state_score: existingAssessment?.emotional_state_score ?? 5,
    cognitive_patterns_score: existingAssessment?.cognitive_patterns_score ?? 5,
    body_symptoms_score: existingAssessment?.body_symptoms_score ?? 5,
    behavioral_patterns_score: existingAssessment?.behavioral_patterns_score ?? 5,
    life_functioning_score: existingAssessment?.life_functioning_score ?? 5,

    // Section 5: Root Cause Analysis
    root_cause_pattern_timeline: existingAssessment?.root_cause_pattern_timeline ?? '',
    root_cause_parental_influence: existingAssessment?.root_cause_parental_influence ?? '',
    root_cause_core_patterns: existingAssessment?.root_cause_core_patterns ?? '',
    root_cause_contributing_factors: existingAssessment?.root_cause_contributing_factors ?? '',

    // Section 6: Clinical Summary
    clinical_condition_brief: existingAssessment?.clinical_condition_brief ?? '',
    therapist_focus: existingAssessment?.therapist_focus ?? '',
    therapy_goal: existingAssessment?.therapy_goal ?? '',
  });

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
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

    setLoading(true);
    setError('');

    try {
      // Note: goal_readiness_score is auto-calculated by the database
      // Note: session_id is set to null to avoid foreign key constraint issues
      const payload = {
        clientId,
        therapistId,
        sessionId: null,
        data: {
          ...form,
          // Do NOT include goal_readiness_score - it's auto-calculated
          assessed_at: new Date().toISOString(),
          status: 'submitted',
        },
      };

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
    { title: 'Previous Therapy', shortTitle: 'History' },
    { title: 'Core Assessment', shortTitle: 'Assessment' },
    { title: 'Root Cause Analysis', shortTitle: 'Root Cause' },
    { title: 'Clinical Summary', shortTitle: 'Summary' },
  ];

  const ScoreSlider = ({ label, field, value }: { label: string; field: string; value: number }) => (
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
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <p className="text-xs text-slate-500">{SCORE_LABELS[value]}</p>
    </div>
  );

  const PatternCheckbox = ({ options, field }: { options: string[]; field: string }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(option => {
        const selected = (form[field as keyof typeof form] as string[]).includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => toggleArrayItem(field, option)}
            className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
              selected
                ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            {selected ? '✓ ' : ''}{option}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Diagnostic Assessment</h2>
              <p className="text-sm text-slate-500 mt-1">
                {existingAssessment ? 'Editing existing assessment' : 'New assessment'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Wellbeing Score</p>
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
              <h3 className="font-medium text-slate-900 mb-4">Client Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.client_name}
                    onChange={(e) => updateField('client_name', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.client_email}
                    onChange={(e) => updateField('client_email', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={form.client_phone}
                    onChange={(e) => updateField('client_phone', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={form.client_country}
                    onChange={(e) => updateField('client_country', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Occupation</label>
                  <input
                    type="text"
                    value={form.client_occupation}
                    onChange={(e) => updateField('client_occupation', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Relationship Status</label>
                <select
                  value={form.relationship_status}
                  onChange={(e) => updateField('relationship_status', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
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
              <h3 className="font-medium text-slate-900 mb-4">Main Concerns & Symptoms</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Main Complaint *</label>
                <textarea
                  value={form.main_complaint}
                  onChange={(e) => updateField('main_complaint', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Describe the primary reason for seeking therapy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Current Symptoms (select all that apply)</label>
                <PatternCheckbox options={SYMPTOM_OPTIONS} field="current_symptoms" />
              </div>
            </div>
          )}

          {/* Section 2: Previous Therapy */}
          {activeSection === 2 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Previous Therapy History</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateField('previous_therapy', !form.previous_therapy)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    form.previous_therapy ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
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
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Describe previous therapy experience, types, duration, outcomes..."
                  />
                </div>
              )}
            </div>
          )}

          {/* Section 3: Core Assessment */}
          {activeSection === 3 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Core Clinical Assessment</h3>

              {/* Nervous System Pattern */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nervous System Pattern</label>
                <div className="grid grid-cols-2 gap-2">
                  {NERVOUS_SYSTEM_PATTERNS.map(pattern => (
                    <button
                      key={pattern.value}
                      type="button"
                      onClick={() => updateField('nervous_system_pattern', pattern.value)}
                      className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                        form.nervous_system_pattern === pattern.value
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {pattern.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pattern Selections */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Emotional Patterns</label>
                <PatternCheckbox options={EMOTIONAL_PATTERNS} field="emotional_patterns" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cognitive Patterns</label>
                <PatternCheckbox options={COGNITIVE_PATTERNS} field="cognitive_patterns" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Body Symptoms</label>
                <PatternCheckbox options={BODY_SYMPTOMS} field="body_symptoms" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Behavioral Patterns</label>
                <PatternCheckbox options={BEHAVIORAL_PATTERNS} field="behavioral_patterns" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Life Functioning Areas</label>
                <PatternCheckbox options={LIFE_FUNCTIONING} field="life_functioning_patterns" />
              </div>

              {/* Severity Scores */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h4 className="font-medium text-slate-900 mb-4">Severity Scores (0-10)</h4>
                <div className="space-y-4">
                  <ScoreSlider label="Nervous System Dysregulation" field="nervous_system_score" value={form.nervous_system_score} />
                  <ScoreSlider label="Emotional State" field="emotional_state_score" value={form.emotional_state_score} />
                  <ScoreSlider label="Cognitive Patterns" field="cognitive_patterns_score" value={form.cognitive_patterns_score} />
                  <ScoreSlider label="Body Symptoms" field="body_symptoms_score" value={form.body_symptoms_score} />
                  <ScoreSlider label="Behavioral Patterns" field="behavioral_patterns_score" value={form.behavioral_patterns_score} />
                  <ScoreSlider label="Life Functioning" field="life_functioning_score" value={form.life_functioning_score} />
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Root Cause Analysis */}
          {activeSection === 4 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Root Cause Analysis</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pattern Timeline</label>
                <textarea
                  value={form.root_cause_pattern_timeline}
                  onChange={(e) => updateField('root_cause_pattern_timeline', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="When did symptoms begin? What events or periods correlate?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Parental/Family Influence</label>
                <textarea
                  value={form.root_cause_parental_influence}
                  onChange={(e) => updateField('root_cause_parental_influence', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="How have family dynamics and parental patterns influenced current issues?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Core Patterns</label>
                <textarea
                  value={form.root_cause_core_patterns}
                  onChange={(e) => updateField('root_cause_core_patterns', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Identify core recurring patterns..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contributing Factors</label>
                <textarea
                  value={form.root_cause_contributing_factors}
                  onChange={(e) => updateField('root_cause_contributing_factors', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Other factors contributing to current condition..."
                />
              </div>
            </div>
          )}

          {/* Section 5: Clinical Summary */}
          {activeSection === 5 && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900 mb-4">Clinical Summary & Goals</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Clinical Condition Brief</label>
                <textarea
                  value={form.clinical_condition_brief}
                  onChange={(e) => updateField('clinical_condition_brief', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Brief clinical summary of the client's condition..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapist Focus Areas</label>
                <textarea
                  value={form.therapist_focus}
                  onChange={(e) => updateField('therapist_focus', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Areas the therapist will focus on..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Therapy Goals</label>
                <textarea
                  value={form.therapy_goal}
                  onChange={(e) => updateField('therapy_goal', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Goals for therapy outcomes..."
                />
              </div>

              {/* Score Summary */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-3">Assessment Summary</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between"><span>Nervous System:</span><span className="font-medium">{form.nervous_system_score}/10</span></div>
                  <div className="flex justify-between"><span>Emotional State:</span><span className="font-medium">{form.emotional_state_score}/10</span></div>
                  <div className="flex justify-between"><span>Cognitive Patterns:</span><span className="font-medium">{form.cognitive_patterns_score}/10</span></div>
                  <div className="flex justify-between"><span>Body Symptoms:</span><span className="font-medium">{form.body_symptoms_score}/10</span></div>
                  <div className="flex justify-between"><span>Behavioral Patterns:</span><span className="font-medium">{form.behavioral_patterns_score}/10</span></div>
                  <div className="flex justify-between"><span>Life Functioning:</span><span className="font-medium">{form.life_functioning_score}/10</span></div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between font-semibold">
                  <span>Wellbeing Score:</span>
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
            Cancel
          </button>
          <div className="flex gap-3">
            {activeSection > 0 && (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection - 1)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
            {activeSection < sections.length - 1 ? (
              <button
                type="button"
                onClick={() => setActiveSection(activeSection + 1)}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
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
    </div>
  );
}
