'use client';
import { useState, useMemo } from 'react';
import {
  FileText, TrendingUp, TrendingDown, BarChart3, Activity
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

export default function Progress({ assessments, devForms = [] }: { assessments: any[]; devForms?: any[] }) {
  const [activeReport, setActiveReport] = useState<'timeline' | 'comparison'>('timeline');
  const [selectedComparison, setSelectedComparison] = useState<number>(0);

  const baseline = assessments.find((a: any) => a.is_baseline);

  // Build unified timeline data combining assessments and dev forms
  const buildTimelineData = () => {
    const timeline: Array<{
      date: string;
      score: number;
      label: string;
      type: 'baseline' | 'session';
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

    // Add development forms with their scores
    devForms.forEach((f: any) => {
      const totalScore = (f.nervous_system_score || 0) + (f.emotional_state_score || 0) +
        (f.cognitive_patterns_score || 0) + (f.body_symptoms_score || 0) +
        (f.behavioral_patterns_score || 0) + (f.life_functioning_score || 0);
      const sessionDate = f.session_date || f.created_at;
      
      timeline.push({
        date: sessionDate,
        score: totalScore,
        label: new Date(sessionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
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
      const firstDevFormScore = (firstDevForm.nervous_system_score || 0) + (firstDevForm.emotional_state_score || 0) +
        (firstDevForm.cognitive_patterns_score || 0) + (firstDevForm.body_symptoms_score || 0) +
        (firstDevForm.behavioral_patterns_score || 0) + (firstDevForm.life_functioning_score || 0);
      
      comparisons.push({
        label: 'Baseline → Session 1',
        from: { label: 'Baseline (Free Consult)', score: baseline.goal_readiness_score || 0, data: baseline },
        to: { label: `Session 1`, score: firstDevFormScore, data: firstDevForm },
        improvement: (baseline.goal_readiness_score || 0) - firstDevFormScore
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
                      label: 'Dysregulation Level',
                      data: timelineData.map(d => d.score),
                      borderColor: '#6366F1',
                      backgroundColor: '#EEF2FF',
                      fill: true,
                      tension: 0.4,
                      pointBackgroundColor: timelineData.map(d => 
                        d.type === 'baseline' ? '#F59E0B' : '#10B981'
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
