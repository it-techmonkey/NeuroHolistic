'use client';
import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Brain, Heart, Stethoscope, Shield, Award, Calendar, FileText } from 'lucide-react';

export default function Progress({ assessments, devForms = [] }: { assessments: any[]; devForms?: any[] }) {
  const [activeReport, setActiveReport] = useState<'assessment' | 'development'>('assessment');

  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-16 border border-slate-200 rounded-xl">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No Progress Data Available</h3>
        <p className="text-slate-500 mt-2">Your progress reports will appear once assessments are completed.</p>
      </div>
    );
  }

  const baseline = assessments.find((a: any) => a.is_baseline);
  const latest = assessments[assessments.length - 1];
  const firstScore = baseline?.goal_readiness_score || assessments[0]?.goal_readiness_score || 0;
  const lastScore = latest?.goal_readiness_score || 0;
  // Note: goal_readiness_score is a symptom severity score (0=optimal, 60=severe)
  // Lower scores = improvement, so we calculate firstScore - lastScore for positive improvement
  const improvement = firstScore - lastScore;

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
          <Activity className="w-4 h-4" /> Session Development
        </button>
      </div>

      {/* Assessment Report */}
      {activeReport === 'assessment' && (
        <div className="space-y-6">
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

          {/* Progress Chart */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Progress Timeline</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={assessments.map((a, i) => ({
                  date: new Date(a.assessed_at || a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                  score: a.goal_readiness_score || 0,
                  label: a.is_baseline ? 'Baseline' : `Assessment ${i}`
                }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 60]} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px 12px' }}
                    formatter={(value: any) => [`${value}/60`, 'Score']}
                    labelStyle={{ color: '#1E293B', fontWeight: 600 }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} fill="#EEF2FF" dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Current Assessment Report */}
          {latest && (
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="border-b border-slate-200 p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Latest Assessment</h3>
                <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
                  <span>{new Date(latest.assessed_at || latest.created_at).toLocaleDateString()}</span>
                  {latest.is_baseline && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Baseline</span>}
                </div>
              </div>

              {/* Clinical Summary */}
              {(latest.clinical_condition_brief || latest.therapist_focus || latest.therapy_goal) && (
                <div className="p-6 border-b border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Clinical Summary</h4>
                  <div className="space-y-3">
                    {latest.clinical_condition_brief && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Condition Brief</p>
                        <p className="text-sm text-slate-700">{latest.clinical_condition_brief}</p>
                      </div>
                    )}
                    {latest.therapist_focus && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Therapist Focus</p>
                        <p className="text-sm text-slate-700">{latest.therapist_focus}</p>
                      </div>
                    )}
                    {latest.therapy_goal && (
                      <div>
                        <p className="text-xs text-slate-500 uppercase mb-1">Therapy Goal</p>
                        <p className="text-sm text-slate-700">{latest.therapy_goal}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Scores */}
              <div className="p-6">
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Assessment Scores</h4>
                <div className="space-y-3">
                  {[
                    { label: 'Stress & Anxiety', key: 'nervous_system_score' },
                    { label: 'Emotional Balance', key: 'emotional_state_score' },
                    { label: 'Thought Patterns', key: 'cognitive_patterns_score' },
                    { label: 'Physical Wellbeing', key: 'body_symptoms_score' },
                    { label: 'Habits & Behaviors', key: 'behavioral_patterns_score' },
                    { label: 'Daily Life', key: 'life_functioning_score' },
                  ].map(metric => (
                    <div key={metric.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm text-slate-700">☐ {metric.label}</span>
                      <span className="text-sm font-medium text-slate-900">{latest[metric.key] || 0}/10</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 bg-slate-50 rounded-lg px-3 mt-4">
                    <span className="text-sm font-semibold text-slate-900">☐ Goal Readiness</span>
                    <span className="text-sm font-bold text-indigo-600">{latest.goal_readiness_score || 0}/60</span>
                  </div>
                </div>
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
              {/* Summary Stats */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Development Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 uppercase">Avg Pre-Session Energy</p>
                    <p className="text-2xl font-bold text-slate-700 mt-1">
                      {(devForms.reduce((sum: number, f: any) => sum + (f.pre_session_energy || 0), 0) / devForms.length).toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-600 uppercase">Avg Post-Session Energy</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">
                      {(devForms.reduce((sum: number, f: any) => sum + (f.post_session_energy || 0), 0) / devForms.length).toFixed(1)}/10
                    </p>
                  </div>
                  <div className="text-center p-4 bg-indigo-50 rounded-lg">
                    <p className="text-xs text-indigo-600 uppercase">Sessions Tracked</p>
                    <p className="text-2xl font-bold text-indigo-700 mt-1">{devForms.length}</p>
                  </div>
                </div>
              </div>

              {/* Session Forms */}
              {devForms.slice().reverse().map((form: any, idx: number) => (
                <div key={form.id || idx} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <div className="border-b border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-slate-900">Session #{form.session_number || devForms.length - idx}</h4>
                      <span className="text-sm text-slate-500">{new Date(form.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Section 5: Integration Notes */}
                  <div className="p-4 border-b border-slate-100">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      5. Integration Notes & Recommendations
                    </h5>
                    <p className="text-xs text-slate-400 mb-2">(What you should do until next session)</p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg">
                      {form.integration_notes || 'No integration notes provided'}
                    </p>
                  </div>

                  {/* Progress Tracking */}
                  <div className="p-4">
                    <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      7. Progress Tracking
                    </h5>
                    <div className="space-y-2">
                      {[
                        { label: 'Stress & Anxiety', key: 'nervous_system_score' },
                        { label: 'Emotional Balance', key: 'emotional_state_score' },
                        { label: 'Thought Patterns', key: 'cognitive_patterns_score' },
                        { label: 'Physical Wellbeing', key: 'body_symptoms_score' },
                        { label: 'Habits & Behaviors', key: 'behavioral_patterns_score' },
                        { label: 'Daily Life', key: 'life_functioning_score' },
                      ].map(metric => (
                        <div key={metric.key} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-600">☐ {metric.label}</span>
                          <span className="text-sm font-medium text-slate-900">{form[metric.key] || 0}/10</span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-2 bg-slate-50 rounded-lg px-3 mt-3">
                        <span className="text-sm font-semibold text-slate-900">☐ Goal Readiness</span>
                        <span className="text-sm font-bold text-indigo-600">{form.goal_readiness_score || 0}/60</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-center py-16 border border-slate-200 rounded-xl">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700">No Development Forms Available</h3>
              <p className="text-slate-500 mt-2">Session development forms will appear after completing session forms.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
