'use client';
import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingDown, TrendingUp, Activity, Brain, Heart, Stethoscope, Shield, Award, Calendar, FileText, BarChart3 } from 'lucide-react';

export default function Progress({ assessments, devForms = [] }: { assessments: any[]; devForms?: any[] }) {
  const [activeReport, setActiveReport] = useState<'timeline' | 'comparison'>('timeline');
  const [selectedComparison, setSelectedComparison] = useState<number>(0);

  const baseline = assessments.find((a: any) => a.is_baseline);
  const latest = assessments[assessments.length - 1];
  const firstScore = baseline?.goal_readiness_score || assessments[0]?.goal_readiness_score || 0;
  const lastScore = latest?.goal_readiness_score || 0;
  const improvement = firstScore - lastScore;

  // Build unified timeline data
  const buildTimelineData = () => {
    const timeline: Array<{
      date: string;
      score: number;
      label: string;
      type: 'baseline' | 'assessment' | 'session';
      data: any;
    }> = [];

    if (baseline) {
      timeline.push({
        date: baseline.assessed_at || baseline.created_at,
        score: baseline.goal_readiness_score || 0,
        label: 'Baseline (Free Consult)',
        type: 'baseline',
        data: baseline
      });
    }

    assessments.filter((a: any) => !a.is_baseline).forEach((a: any) => {
      timeline.push({
        date: a.assessed_at || a.created_at,
        score: a.goal_readiness_score || 0,
        label: 'Assessment',
        type: 'assessment',
        data: a
      });
    });

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

    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return timeline;
  };

  const timelineData = buildTimelineData();

  // Build comparison pairs
  const buildComparisons = () => {
    const comparisons: Array<{
      label: string;
      from: { label: string; score: number; data: any };
      to: { label: string; score: number; data: any };
      improvement: number;
    }> = [];

    if (baseline && devForms.length > 0) {
      const firstDevForm = devForms[0];
      const firstScore = (firstDevForm.nervous_system_score || 0) + (firstDevForm.emotional_state_score || 0) +
        (firstDevForm.cognitive_patterns_score || 0) + (firstDevForm.body_symptoms_score || 0) +
        (firstDevForm.behavioral_patterns_score || 0) + (firstDevForm.life_functioning_score || 0);
      
      comparisons.push({
        label: 'Baseline → Session 1',
        from: { label: 'Baseline', score: baseline.goal_readiness_score || 0, data: baseline },
        to: { label: 'Session 1', score: firstScore, data: firstDevForm },
        improvement: (baseline.goal_readiness_score || 0) - firstScore
      });
    }

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

  if (!assessments || assessments.length === 0) {
    return (
      <div className="text-center py-16 border border-slate-200 rounded-xl">
        <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700">No Progress Data Available</h3>
        <p className="text-slate-500 mt-2">Your progress reports will appear once assessments are completed.</p>
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

      {/* Progress Timeline Chart */}
      {timelineData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
            Progress Timeline (Baseline → Sessions)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData.map(d => ({
                date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: d.score,
                label: d.label,
                fill: d.type === 'baseline' ? '#F59E0B' : d.type === 'session' ? '#10B981' : '#6366F1'
              }))} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', padding: '8px 12px' }}
                  formatter={(value: any, name: any, props: any) => [`${value}/60`, props.payload.label]}
                  labelStyle={{ color: '#1E293B', fontWeight: 600 }}
                />
                <Line type="monotone" dataKey="score" stroke="#6366F1" strokeWidth={2} dot={{ fill: '#6366F1', strokeWidth: 2, r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
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
      )}

      {/* Session Comparison View */}
      {activeReport === 'comparison' && comparisons.length > 0 && (
        <div className="space-y-6">
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

          {comparisons.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
              <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Complete at least one session to see comparisons</p>
            </div>
          )}
        </div>
      )}

      {/* Timeline View - Latest Assessment */}
      {activeReport === 'timeline' && latest && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Latest Assessment</h3>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-500">
              <span>{new Date(latest.assessed_at || latest.created_at).toLocaleDateString()}</span>
              {latest.is_baseline && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">Baseline</span>}
            </div>
          </div>

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
                  <span className="text-sm text-slate-700">{metric.label}</span>
                  <span className="text-sm font-medium text-slate-900">{latest[metric.key] || 0}/10</span>
                </div>
              ))}
              <div className="flex items-center justify-between py-3 bg-slate-50 rounded-lg px-3 mt-4">
                <span className="text-sm font-semibold text-slate-900">Goal Readiness</span>
                <span className="text-sm font-bold text-indigo-600">{latest.goal_readiness_score || 0}/60</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
