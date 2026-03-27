'use client';

import { useState } from 'react';

interface ScoreData {
  nervous_system: number;
  emotional_state: number;
  cognitive_patterns: number;
  body_symptoms: number;
  behavioral_patterns: number;
  life_functioning: number;
  goal_readiness: number;
}

interface SessionScore extends ScoreData {
  sessionNumber: number;
  date: string;
}

interface ProgressComparisonProps {
  baselineScores: ScoreData; // Consultation assessment scores
  sessionScores: SessionScore[];
}

const SCORE_LABELS: Record<string, string> = {
  nervous_system: 'Nervous System',
  emotional_state: 'Emotional State',
  cognitive_patterns: 'Cognitive Patterns',
  body_symptoms: 'Body Symptoms',
  behavioral_patterns: 'Behavioral Patterns',
  life_functioning: 'Life Functioning',
};

const SCORE_DOMAINS = [
  'nervous_system',
  'emotional_state',
  'cognitive_patterns',
  'body_symptoms',
  'behavioral_patterns',
  'life_functioning',
] as const;

export default function ProgressComparison({ baselineScores, sessionScores }: ProgressComparisonProps) {
  const [selectedSession, setSelectedSession] = useState<number | null>(
    sessionScores.length > 0 ? sessionScores[sessionScores.length - 1].sessionNumber : null
  );

  // Find the comparison baseline for a given session
  // Session 1 compares against consultation baseline
  // Session 2+ compares against previous session
  const getComparisonBaseline = (sessionNumber: number): ScoreData & { label: string } => {
    if (sessionNumber === 1) {
      return { ...baselineScores, label: 'Baseline (Consultation)' };
    }
    const previousSession = sessionScores.find(s => s.sessionNumber === sessionNumber - 1);
    if (previousSession) {
      return { ...previousSession, label: `Session ${sessionNumber - 1}` };
    }
    return { ...baselineScores, label: 'Baseline (Consultation)' };
  };

  const selectedSessionData = sessionScores.find(s => s.sessionNumber === selectedSession);
  const comparisonBaseline = selectedSession ? getComparisonBaseline(selectedSession) : null;

  const getChangeIndicator = (baseline: number, current: number) => {
    const change = current - baseline;
    if (change > 0) return { value: change, label: '+', color: 'text-green-600', bg: 'bg-green-100' };
    if (change < 0) return { value: Math.abs(change), label: '-', color: 'text-red-600', bg: 'bg-red-100' };
    return { value: 0, label: '=', color: 'text-slate-500', bg: 'bg-slate-100' };
  };

  // Calculate cumulative progress from baseline
  const calculateCumulativeProgress = () => {
    if (sessionScores.length === 0) return null;
    
    const sortedSessions = [...sessionScores].sort((a, b) => a.sessionNumber - b.sessionNumber);
    let currentBaseline = baselineScores;
    const progressData: Array<{
      sessionNumber: number;
      comparisonLabel: string;
      change: number;
      currentScore: number;
    }> = [];

    for (const session of sortedSessions) {
      const change = session.goal_readiness - currentBaseline.goal_readiness;
      progressData.push({
        sessionNumber: session.sessionNumber,
        comparisonLabel: session.sessionNumber === 1 ? 'Baseline' : `Session ${session.sessionNumber - 1}`,
        change,
        currentScore: session.goal_readiness,
      });
      // For next iteration, the baseline becomes this session
      currentBaseline = session;
    }

    return progressData;
  };

  const cumulativeProgress = calculateCumulativeProgress();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Session Progress (Rolling Comparison)</h3>
        <p className="text-sm text-slate-500 mt-1">
          Each session is compared against the previous one. Session 1 uses the consultation baseline.
        </p>

        {/* Session Selector */}
        {sessionScores.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSession(1)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSession === 1
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Session 1 <span className="text-xs opacity-70">(vs Baseline)</span>
            </button>
            {sessionScores.filter(s => s.sessionNumber > 1).map((session) => (
              <button
                key={session.sessionNumber}
                onClick={() => setSelectedSession(session.sessionNumber)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSession === session.sessionNumber
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Session {session.sessionNumber} <span className="text-xs opacity-70">(vs S{session.sessionNumber - 1})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedSessionData && comparisonBaseline ? (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 rounded-tl-lg">Domain</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">
                    {comparisonBaseline.label}
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700">
                    Session {selectedSession}
                  </th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 rounded-tr-lg">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCORE_DOMAINS.map((domain) => {
                  const baseline = comparisonBaseline[domain];
                  const current = selectedSessionData[domain];
                  const change = getChangeIndicator(baseline, current);

                  return (
                    <tr key={domain} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-700">{SCORE_LABELS[domain]}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {baseline}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${change.bg} ${change.color} font-medium`}>
                          {current}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${change.bg} ${change.color}`}>
                          {change.label}{change.value}
                          {change.value > 0 && ' ↑'}
                          {change.value < 0 && ' ↓'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-semibold">
                  <td className="py-3 px-4 text-slate-900">Total Wellbeing</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold">
                      {comparisonBaseline.goal_readiness}/60
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center justify-center px-3 py-1 rounded-full ${
                      (selectedSessionData.goal_readiness - comparisonBaseline.goal_readiness) > 0 ? 'bg-green-100 text-green-700' :
                      (selectedSessionData.goal_readiness - comparisonBaseline.goal_readiness) < 0 ? 'bg-red-100 text-red-700' :
                      'bg-slate-200 text-slate-700'
                    } font-bold`}>
                      {selectedSessionData.goal_readiness}/60
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const totalChange = selectedSessionData.goal_readiness - comparisonBaseline.goal_readiness;
                      return (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
                          totalChange > 0 ? 'bg-green-100 text-green-700' :
                          totalChange < 0 ? 'bg-red-100 text-red-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {totalChange > 0 ? '+' : ''}{totalChange}
                          {totalChange > 0 && ' ↑'}
                          {totalChange < 0 && ' ↓'}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Progress Summary */}
          {(() => {
            const totalChange = selectedSessionData.goal_readiness - comparisonBaseline.goal_readiness;
            return (
              <div className={`mt-6 p-4 rounded-lg border ${
                totalChange > 0 ? 'bg-green-50 border-green-200' :
                totalChange < 0 ? 'bg-amber-50 border-amber-200' :
                'bg-slate-50 border-slate-200'
              }`}>
                <p className={`text-sm font-medium ${
                  totalChange > 0 ? 'text-green-800' :
                  totalChange < 0 ? 'text-amber-800' :
                  'text-slate-800'
                }`}>
                  {totalChange > 0
                    ? `Session ${selectedSession} shows improvement of ${totalChange} points compared to ${comparisonBaseline.label}.`
                    : totalChange < 0
                    ? `Session ${selectedSession} is ${Math.abs(totalChange)} points below ${comparisonBaseline.label}. Review treatment approach.`
                    : `Session ${selectedSession} is maintaining ${comparisonBaseline.label} levels.`}
                </p>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          <p>No session data available yet.</p>
          <p className="text-sm mt-1">Complete a session and fill out the Development Form to see progress.</p>
        </div>
      )}

      {/* Cumulative Progress Timeline */}
      {cumulativeProgress && cumulativeProgress.length > 0 && (
        <div className="border-t border-slate-200 p-6">
          <h4 className="font-medium text-slate-900 mb-4">Cumulative Progress Timeline</h4>
          <p className="text-xs text-slate-500 mb-4">
            Each session compared to the previous one. Cumulative shows overall progress from baseline.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-2 px-3 font-medium text-slate-700">Session</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-500">Compared To</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Score</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cumulativeProgress.map((item) => (
                  <tr key={item.sessionNumber} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-900">Session {item.sessionNumber}</td>
                    <td className="py-2 px-3 text-center text-slate-500">{item.comparisonLabel}</td>
                    <td className="py-2 px-3 text-center font-medium text-indigo-600">{item.currentScore}/60</td>
                    <td className={`py-2 px-3 text-center font-medium ${
                      item.change > 0 ? 'text-green-600' : item.change < 0 ? 'text-red-600' : 'text-slate-500'
                    }`}>
                      {item.change > 0 ? '+' : ''}{item.change}
                      {item.change > 0 && ' ↑'}
                      {item.change < 0 && ' ↓'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Overall Progress from Baseline */}
          {cumulativeProgress.length > 0 && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-indigo-900">Overall Progress from Baseline</span>
                <span className="text-lg font-bold text-indigo-600">
                  {(() => {
                    const lastSession = sessionScores[sessionScores.length - 1];
                    const totalChange = lastSession.goal_readiness - baselineScores.goal_readiness;
                    return `${totalChange > 0 ? '+' : ''}${totalChange} points (${baselineScores.goal_readiness} → ${lastSession.goal_readiness})`;
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
