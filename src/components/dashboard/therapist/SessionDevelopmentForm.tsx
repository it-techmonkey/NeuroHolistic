'use client';

import { useState, useEffect } from 'react';

interface SessionDevelopmentFormProps {
  sessionId: string;
  clientId: string;
  therapistId: string;
  sessionNumber: number;
  sessionDate: string;
  existingForm?: any;
  // Comparison baseline - either the consultation assessment (for session 1)
  // or the previous session's development form (for session 2+)
  comparisonBaseline?: {
    nervous_system_score: number;
    emotional_state_score: number;
    cognitive_patterns_score: number;
    body_symptoms_score: number;
    behavioral_patterns_score: number;
    life_functioning_score: number;
    goal_readiness_score: number;
    source: 'assessment' | 'session'; // Indicates if baseline is from assessment or previous session
    sessionNumber?: number; // If source is 'session', which session
  } | null;
  onClose: () => void;
  onSave: (form: any) => void;
}

const TECHNIQUE_OPTIONS = [
  'Timeline',
  'Control Room',
  'Hypnoses Womb',
  'Hypnoses Birth',
  'Hypnoses 1',
  'Hypnoses 2',
  'Hypnoses 3',
  'Hypnoses 4',
  'Hypnoses 5',
  'Neural Shock',
  'Cognition Expansion',
  'Void Expansion',
  'Creation',
  'Flow',
  'Cutting Cord',
  'Grounding',
  'Environmental Breathing',
  'Clearing',
];

const SPECIFIABLE_TECHNIQUES = ['Targeted Therapy', 'Scanning'];

const SCORE_LABELS: Record<number, string> = {
  0: 'None',
  1: 'Minimal',
  2: 'Very Low',
  3: 'Low',
  4: 'Mild',
  5: 'Moderate',
  6: 'Moderate-High',
  7: 'High',
  8: 'Very High',
  9: 'Severe',
  10: 'Extreme',
};

export default function SessionDevelopmentForm({
  sessionId,
  clientId,
  therapistId,
  sessionNumber,
  sessionDate,
  existingForm,
  comparisonBaseline,
  onClose,
  onSave,
}: SessionDevelopmentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'pre' | 'session' | 'post' | 'scores' | 'notes'>('pre');

  const [form, setForm] = useState({
    previous_session_improvements: existingForm?.previous_session_improvements ?? '',
    previous_session_challenges: existingForm?.previous_session_challenges ?? '',
    pre_session_symptoms: existingForm?.pre_session_symptoms ?? [],
    pre_session_intensity: existingForm?.pre_session_intensity ?? 5,
    pre_session_mood: existingForm?.pre_session_mood ?? 5,
    techniques_used: existingForm?.techniques_used ?? [],
    targeted_therapy_specify: existingForm?.targeted_therapy_specify ?? '',
    scanning_specify: existingForm?.scanning_specify ?? '',
    key_interventions: existingForm?.key_interventions ?? '',
    breakthroughs_resistance: existingForm?.breakthroughs_resistance ?? '',
    post_session_symptoms: existingForm?.post_session_symptoms ?? [],
    post_session_intensity: existingForm?.post_session_intensity ?? 5,
    post_session_mood: existingForm?.post_session_mood ?? 5,
    shift_observed: existingForm?.shift_observed ?? '',
    client_feedback: existingForm?.client_feedback ?? '',
    integration_notes: existingForm?.integration_notes ?? '',
    therapist_internal_notes: existingForm?.therapist_internal_notes ?? '',
    nervous_system_score: existingForm?.nervous_system_score ?? 0,
    emotional_state_score: existingForm?.emotional_state_score ?? 0,
    cognitive_patterns_score: existingForm?.cognitive_patterns_score ?? 0,
    body_symptoms_score: existingForm?.body_symptoms_score ?? 0,
    behavioral_patterns_score: existingForm?.behavioral_patterns_score ?? 0,
    life_functioning_score: existingForm?.life_functioning_score ?? 0,
  });

  // Update form when existingForm changes (e.g., after fetching)
  useEffect(() => {
    if (existingForm) {
      setForm({
        previous_session_improvements: existingForm.previous_session_improvements ?? '',
        previous_session_challenges: existingForm.previous_session_challenges ?? '',
        pre_session_symptoms: existingForm.pre_session_symptoms ?? [],
        pre_session_intensity: existingForm.pre_session_intensity ?? 5,
        pre_session_mood: existingForm.pre_session_mood ?? 5,
        techniques_used: existingForm.techniques_used ?? [],
        targeted_therapy_specify: existingForm.targeted_therapy_specify ?? '',
        scanning_specify: existingForm.scanning_specify ?? '',
        key_interventions: existingForm.key_interventions ?? '',
        breakthroughs_resistance: existingForm.breakthroughs_resistance ?? '',
        post_session_symptoms: existingForm.post_session_symptoms ?? [],
        post_session_intensity: existingForm.post_session_intensity ?? 5,
        post_session_mood: existingForm.post_session_mood ?? 5,
        shift_observed: existingForm.shift_observed ?? '',
        client_feedback: existingForm.client_feedback ?? '',
        integration_notes: existingForm.integration_notes ?? '',
        therapist_internal_notes: existingForm.therapist_internal_notes ?? '',
        nervous_system_score: existingForm.nervous_system_score ?? 0,
        emotional_state_score: existingForm.emotional_state_score ?? 0,
        cognitive_patterns_score: existingForm.cognitive_patterns_score ?? 0,
        body_symptoms_score: existingForm.body_symptoms_score ?? 0,
        behavioral_patterns_score: existingForm.behavioral_patterns_score ?? 0,
        life_functioning_score: existingForm.life_functioning_score ?? 0,
      });
    }
  }, [existingForm]);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const toggleTechnique = (technique: string) => {
    setForm(prev => ({
      ...prev,
      techniques_used: prev.techniques_used.includes(technique)
        ? prev.techniques_used.filter((t: string) => t !== technique)
        : [...prev.techniques_used, technique],
    }));
  };

  const goalReadinessScore = form.nervous_system_score + form.emotional_state_score +
    form.cognitive_patterns_score + form.body_symptoms_score +
    form.behavioral_patterns_score + form.life_functioning_score;

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        sessionId,
        clientId,
        therapistId,
        data: {
          session_number: sessionNumber,
          session_date: sessionDate,
          ...form,
          submitted_at: new Date().toISOString(),
        },
      };

      const res = await fetch('/api/assessments/session-development', {
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
        throw new Error(data.error || 'Failed to save form');
      }

      onSave(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const IntensitySlider = ({ label, field, value }: { label: string; field: string; value: number }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-bold text-amber-600">{value}/10</span>
      </div>
      <input
        type="range"
        min="0"
        max="10"
        value={value}
        onChange={(e) => updateField(field, parseInt(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
      />
    </div>
  );

  const tabs = [
    { id: 'pre', label: 'Pre-Session' },
    { id: 'session', label: 'Session' },
    { id: 'post', label: 'Post-Session' },
    { id: 'scores', label: 'Scores' },
    { id: 'notes', label: 'Notes' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-900">Session Development Form</h2>
                {existingForm && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                    Viewing Existing
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">Session {sessionNumber} — {sessionDate}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500">Goal Readiness</p>
              <p className="text-2xl font-bold text-indigo-600">{goalReadinessScore}/60</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
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

          {/* Pre-Session Tab */}
          {activeTab === 'pre' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Pre-Session Assessment</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Previous Session Improvements
                </label>
                <textarea
                  value={form.previous_session_improvements}
                  onChange={(e) => updateField('previous_session_improvements', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="What improvements were observed since the last session?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Previous Session Challenges
                </label>
                <textarea
                  value={form.previous_session_challenges}
                  onChange={(e) => updateField('previous_session_challenges', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="What challenges remain from the previous session?"
                />
              </div>

              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.pre_session_symptoms.length > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pre-Session Symptoms (describe what client reported)
                  </label>
                  <input
                    type="text"
                    value={form.pre_session_symptoms.join(', ')}
                    onChange={(e) => updateField('pre_session_symptoms', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Anxiety, tension, fatigue (comma-separated)"
                  />
                </div>
                {form.pre_session_symptoms.length > 0 && (
                  <div className="px-4 pb-4 border-t border-amber-100 pt-4">
                    <IntensitySlider
                      label="Pre-Session Symptom Intensity"
                      field="pre_session_intensity"
                      value={form.pre_session_intensity}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Session Tab */}
          {activeTab === 'session' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Session Procedure</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Techniques Used</label>
                <div className="grid grid-cols-2 gap-2">
                  {TECHNIQUE_OPTIONS.map(technique => (
                    <button
                      key={technique}
                      type="button"
                      onClick={() => toggleTechnique(technique)}
                      className={`text-left px-3 py-2 rounded border text-sm transition-colors ${
                        form.techniques_used.includes(technique)
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {form.techniques_used.includes(technique) ? '✓ ' : ''}{technique}
                    </button>
                  ))}
                </div>

                {/* Specifiable techniques with text inputs */}
                <div className="mt-4 space-y-3">
                  {SPECIFIABLE_TECHNIQUES.map(technique => {
                    const isActive = form.techniques_used.includes(technique);
                    const specifyField = technique === 'Targeted Therapy' ? 'targeted_therapy_specify' : 'scanning_specify';
                    return (
                      <div key={technique} className={`rounded-lg border p-3 transition-colors ${isActive ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white'}`}>
                        <button
                          type="button"
                          onClick={() => toggleTechnique(technique)}
                          className={`text-left text-sm font-medium transition-colors ${
                            isActive ? 'text-indigo-800' : 'text-slate-700 hover:text-slate-900'
                          }`}
                        >
                          {isActive ? '✓ ' : ''}{technique}
                        </button>
                        {isActive && (
                          <input
                            type="text"
                            value={form[specifyField]}
                            onChange={(e) => updateField(specifyField, e.target.value)}
                            className="w-full mt-2 border border-indigo-200 rounded px-3 py-1.5 text-sm bg-white"
                            placeholder={`Specify ${technique.toLowerCase()} details...`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Breakthroughs / Resistance</label>
                <textarea
                  value={form.breakthroughs_resistance}
                  onChange={(e) => updateField('breakthroughs_resistance', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Note any breakthroughs or resistance encountered..."
                />
              </div>
            </div>
          )}

          {/* Post-Session Tab */}
          {activeTab === 'post' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Post-Session Assessment</h3>

              <div className={`border rounded-lg overflow-hidden transition-colors ${
                form.post_session_symptoms.length > 0 ? 'border-green-200 bg-green-50/30' : 'border-slate-200'
              }`}>
                <div className="p-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Post-Session Symptoms (describe what client reported)
                  </label>
                  <input
                    type="text"
                    value={form.post_session_symptoms.join(', ')}
                    onChange={(e) => updateField('post_session_symptoms', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Reduced anxiety, lighter (comma-separated)"
                  />
                </div>
                {form.post_session_symptoms.length > 0 && (
                  <div className="px-4 pb-4 border-t border-green-100 pt-4">
                    <IntensitySlider
                      label="Post-Session Symptom Intensity"
                      field="post_session_intensity"
                      value={form.post_session_intensity}
                    />
                  </div>
                )}
              </div>

              {/* Intensity Change Indicator */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Intensity Change:</span>
                  <span className={`text-lg font-bold ${
                    form.post_session_intensity < form.pre_session_intensity
                      ? 'text-green-600'
                      : form.post_session_intensity > form.pre_session_intensity
                      ? 'text-red-600'
                      : 'text-slate-600'
                  }`}>
                    {form.pre_session_intensity - form.post_session_intensity > 0 ? '+' : ''}
                    {form.pre_session_intensity - form.post_session_intensity}
                    {form.post_session_intensity < form.pre_session_intensity && ' (Improved)'}
                    {form.post_session_intensity > form.pre_session_intensity && ' (Worsened)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shift Observed</label>
                <textarea
                  value={form.shift_observed}
                  onChange={(e) => updateField('shift_observed', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="What shifts were observed during/after the session?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Client Feedback</label>
                <textarea
                  value={form.client_feedback}
                  onChange={(e) => updateField('client_feedback', e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Direct feedback from the client..."
                />
              </div>
            </div>
          )}

          {/* Scores Tab */}
          {activeTab === 'scores' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Progress Tracking (0-10)</h3>
              <p className="text-sm text-slate-500">Rate each domain based on session observations.</p>

              <div className="space-y-4">
                <ScoreSlider label="Nervous System" field="nervous_system_score" value={form.nervous_system_score} />
                <ScoreSlider label="Emotional" field="emotional_state_score" value={form.emotional_state_score} />
                <ScoreSlider label="Cognitive" field="cognitive_patterns_score" value={form.cognitive_patterns_score} />
                <ScoreSlider label="Physical" field="body_symptoms_score" value={form.body_symptoms_score} />
                <ScoreSlider label="Behavioral" field="behavioral_patterns_score" value={form.behavioral_patterns_score} />
                <ScoreSlider label="Life Functioning" field="life_functioning_score" value={form.life_functioning_score} />
              </div>

              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-indigo-900">Goal Readiness:</span>
                  <span className="text-2xl font-bold text-indigo-600">{goalReadinessScore}/60</span>
                </div>
              </div>

              {/* Previous Session Comparison */}
              {comparisonBaseline && (
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <h4 className="font-medium text-slate-900 mb-4 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${comparisonBaseline.source === 'assessment' ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                    {comparisonBaseline.source === 'assessment'
                      ? 'Baseline Assessment Comparison'
                      : `Previous Session (Session ${comparisonBaseline.sessionNumber || '?'}) Comparison`}
                  </h4>
                  <div className={`rounded-lg p-3 mb-4 ${
                    comparisonBaseline.source === 'assessment'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-emerald-50 border border-emerald-200'
                  }`}>
                    <p className={`text-xs ${comparisonBaseline.source === 'assessment' ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {comparisonBaseline.source === 'assessment'
                        ? `Comparing Session ${sessionNumber} against your initial baseline assessment from the consultation.`
                        : `Comparing Session ${sessionNumber} against Session ${comparisonBaseline.sessionNumber || 'your previous session'} to track progress.`}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="text-left py-2 px-3 font-medium text-slate-700">Domain</th>
                          <th className="text-center py-2 px-3 font-medium text-slate-500">
                            {comparisonBaseline.source === 'assessment' ? 'Baseline' : `Session ${comparisonBaseline.sessionNumber || '?'}`}
                          </th>
                          <th className="text-center py-2 px-3 font-medium text-slate-700">Session {sessionNumber}</th>
                          <th className="text-center py-2 px-3 font-medium text-slate-700">Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {[
                          { label: 'Nervous System', baseline: comparisonBaseline.nervous_system_score ?? 0, current: form.nervous_system_score },
                          { label: 'Emotional', baseline: comparisonBaseline.emotional_state_score ?? 0, current: form.emotional_state_score },
                          { label: 'Cognitive', baseline: comparisonBaseline.cognitive_patterns_score ?? 0, current: form.cognitive_patterns_score },
                          { label: 'Physical', baseline: comparisonBaseline.body_symptoms_score ?? 0, current: form.body_symptoms_score },
                          { label: 'Behavioral', baseline: comparisonBaseline.behavioral_patterns_score ?? 0, current: form.behavioral_patterns_score },
                          { label: 'Life Functioning', baseline: comparisonBaseline.life_functioning_score ?? 0, current: form.life_functioning_score },
                        ].map((row) => {
                          const change = row.current - row.baseline;
                          return (
                            <tr key={row.label} className="hover:bg-slate-100/50">
                              <td className="py-2 px-3 text-slate-700">{row.label}</td>
                              <td className="py-2 px-3 text-center text-slate-500">{row.baseline}/10</td>
                              <td className="py-2 px-3 text-center font-medium text-slate-900">{row.current}/10</td>
                              <td className={`py-2 px-3 text-center font-medium ${
                                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-slate-500'
                              }`}>
                                {change > 0 ? '+' : ''}{change}
                                {change > 0 && <span className="text-xs ml-1">(Improved)</span>}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-100 font-semibold">
                          <td className="py-2 px-3 text-slate-900">Goal Readiness</td>
                          <td className="py-2 px-3 text-center text-slate-600">{comparisonBaseline.goal_readiness_score ?? 0}/60</td>
                          <td className="py-2 px-3 text-center text-indigo-600">{goalReadinessScore}/60</td>
                          <td className={`py-2 px-3 text-center ${
                            (goalReadinessScore - (comparisonBaseline.goal_readiness_score ?? 0)) > 0 ? 'text-green-600' :
                            (goalReadinessScore - (comparisonBaseline.goal_readiness_score ?? 0)) < 0 ? 'text-red-600' : 'text-slate-500'
                          }`}>
                            {goalReadinessScore - (comparisonBaseline.goal_readiness_score ?? 0) > 0 ? '+' : ''}
                            {goalReadinessScore - (comparisonBaseline.goal_readiness_score ?? 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Progress Summary */}
                  <div className={`mt-4 p-4 rounded-lg border ${
                    goalReadinessScore > comparisonBaseline.goal_readiness_score
                      ? 'bg-green-50 border-green-200'
                      : goalReadinessScore < comparisonBaseline.goal_readiness_score
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      goalReadinessScore > comparisonBaseline.goal_readiness_score
                        ? 'text-green-800'
                        : goalReadinessScore < comparisonBaseline.goal_readiness_score
                        ? 'text-amber-800'
                        : 'text-slate-800'
                    }`}>
                      {goalReadinessScore > comparisonBaseline.goal_readiness_score
                        ? `Client shows improvement of ${goalReadinessScore - comparisonBaseline.goal_readiness_score} points compared to ${comparisonBaseline.source === 'assessment' ? 'baseline' : `Session ${comparisonBaseline.sessionNumber}`}.`
                        : goalReadinessScore < comparisonBaseline.goal_readiness_score
                        ? `Client's goal readiness score is ${comparisonBaseline.goal_readiness_score - goalReadinessScore} points below ${comparisonBaseline.source === 'assessment' ? 'baseline' : `Session ${comparisonBaseline.sessionNumber}`}. Consider reviewing treatment approach.`
                        : `Client is maintaining ${comparisonBaseline.source === 'assessment' ? 'baseline' : `Session ${comparisonBaseline.sessionNumber}`} levels.`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h3 className="font-medium text-slate-900">Clinical Notes</h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Integration Notes <span className="text-xs text-slate-400">(visible to client)</span>
                </label>
                <textarea
                  value={form.integration_notes}
                  onChange={(e) => updateField('integration_notes', e.target.value)}
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="Notes for the client to integrate between sessions..."
                />
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <label className="block text-sm font-medium text-amber-800 mb-1">
                  Therapist Internal Notes <span className="text-xs">(NOT visible to client)</span>
                </label>
                <textarea
                  value={form.therapist_internal_notes}
                  onChange={(e) => updateField('therapist_internal_notes', e.target.value)}
                  rows={5}
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white mt-2"
                  placeholder="Private clinical notes — these will never be shared with the client..."
                />
                <p className="text-xs text-amber-700 mt-2">
                  These notes are protected by RLS and only accessible by therapists and admins.
                </p>
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
            {activeTab !== 'pre' && (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) - 1]?.id || 'pre')}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Previous
              </button>
            )}
            {activeTab !== 'notes' ? (
              <button
                type="button"
                onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.id === activeTab) + 1]?.id || 'notes')}
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
                {loading ? 'Saving...' : existingForm ? 'Update Form' : 'Submit Form'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
