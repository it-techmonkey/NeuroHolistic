'use client';

import { useEffect, useMemo, useState } from 'react';

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
  baselineScores: ScoreData; // Free consultation / baseline assessment
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

/** Lower scores = better wellbeing. Recovery delta = previous − current (positive ⇒ improvement). */
function getRecoveryIndicator(previous: number, current: number) {
  const recovery = previous - current;
  if (recovery > 0) {
    return {
      value: recovery,
      display: `+${recovery}`,
      color: 'text-green-700',
      bg: 'bg-green-100',
      isImprovement: true,
    };
  }
  if (recovery < 0) {
    return {
      value: Math.abs(recovery),
      display: `${recovery}`,
      color: 'text-amber-700',
      bg: 'bg-amber-100',
      isImprovement: false,
    };
  }
  return {
    value: 0,
    display: '0',
    color: 'text-slate-600',
    bg: 'bg-slate-100',
    isImprovement: false,
  };
}

export default function ProgressComparison({ baselineScores, sessionScores }: ProgressComparisonProps) {
  const sortedSessions = useMemo(
    () => [...sessionScores].sort((a, b) => a.sessionNumber - b.sessionNumber),
    [sessionScores]
  );

  const [selectedSession, setSelectedSession] = useState<number | null>(
    sortedSessions.length > 0 ? sortedSessions[sortedSessions.length - 1].sessionNumber : null
  );

  useEffect(() => {
    if (sortedSessions.length === 0) return;
    const lastN = sortedSessions[sortedSessions.length - 1].sessionNumber;
    setSelectedSession((prev) =>
      prev !== null && sessionScores.some((s) => s.sessionNumber === prev) ? prev : lastN
    );
  }, [sortedSessions, sessionScores]);

  // Session 1 → free consultation baseline; later sessions → previous numbered session, or nearest earlier session, else baseline
  const getComparisonReference = (sessionNumber: number): ScoreData & { label: string } => {
    if (sessionNumber === 1) {
      return { ...baselineScores, label: 'Free consultation (baseline)' };
    }
    const directPrev = sessionScores.find((s) => s.sessionNumber === sessionNumber - 1);
    if (directPrev) {
      return { ...directPrev, label: `Session ${sessionNumber - 1}` };
    }
    const earlier = sortedSessions.filter((s) => s.sessionNumber < sessionNumber);
    const fallback = earlier.length ? earlier[earlier.length - 1] : null;
    if (fallback) {
      return { ...fallback, label: `Session ${fallback.sessionNumber}` };
    }
    return { ...baselineScores, label: 'Free consultation (baseline)' };
  };

  const selectedSessionData = sessionScores.find((s) => s.sessionNumber === selectedSession);
  const comparisonRef = selectedSession ? getComparisonReference(selectedSession) : null;

  const calculateRollingProgress = () => {
    if (sortedSessions.length === 0) return null;

    let previous: ScoreData & { label: string } = {
      ...baselineScores,
      label: 'Free consultation',
    };
    const rows: Array<{
      sessionNumber: number;
      comparisonLabel: string;
      recovery: number;
      currentScore: number;
    }> = [];

    for (const session of sortedSessions) {
      const recovery = previous.goal_readiness - session.goal_readiness;
      rows.push({
        sessionNumber: session.sessionNumber,
        comparisonLabel: previous.label,
        recovery,
        currentScore: session.goal_readiness,
      });
      previous = { ...session, label: `Session ${session.sessionNumber}` };
    }

    return rows;
  };

  const rollingProgress = calculateRollingProgress();

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-lg font-semibold text-slate-900">Session progress (rolling comparison)</h3>
        <p className="text-sm text-slate-500 mt-1">
          Each session is compared to the previous step: Session 1 vs your free consultation report; later sessions vs the
          prior session. Lower scores mean improved wellbeing — a positive change is points of recovery (previous score minus
          current score).
        </p>

        {sortedSessions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {sortedSessions.map((s) => {
              const ref = getComparisonReference(s.sessionNumber);
              return (
                <button
                  key={s.sessionNumber}
                  type="button"
                  onClick={() => setSelectedSession(s.sessionNumber)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSession === s.sessionNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Session {s.sessionNumber}{' '}
                  <span className="text-xs opacity-80">(vs {ref.label})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedSessionData && comparisonRef ? (
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-3 px-4 font-medium text-slate-700 rounded-tl-lg">Domain</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-500">{comparisonRef.label}</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700">Session {selectedSession}</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-700 rounded-tr-lg">Recovery / change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCORE_DOMAINS.map((domain) => {
                  const prevVal = comparisonRef[domain];
                  const currVal = selectedSessionData[domain];
                  const ind = getRecoveryIndicator(prevVal, currVal);

                  return (
                    <tr key={domain} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 text-slate-700">{SCORE_LABELS[domain]}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {prevVal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-medium ${
                            ind.isImprovement ? 'bg-green-100 text-green-800' : ind.value === 0 ? 'bg-slate-100 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {currVal}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${ind.bg} ${ind.color}`}>
                          {ind.display}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-50 font-semibold">
                  <td className="py-3 px-4 text-slate-900">Total wellbeing</td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-bold">
                      {comparisonRef.goal_readiness}/60
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const ind = getRecoveryIndicator(comparisonRef.goal_readiness, selectedSessionData.goal_readiness);
                      return (
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full font-bold ${
                            ind.isImprovement ? 'bg-green-100 text-green-800' : ind.value === 0 ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {selectedSessionData.goal_readiness}/60
                        </span>
                      );
                    })()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const ind = getRecoveryIndicator(comparisonRef.goal_readiness, selectedSessionData.goal_readiness);
                      return (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${ind.bg} ${ind.color}`}>
                          {ind.display}
                          {ind.isImprovement ? ' recovery' : ind.value !== 0 ? ' higher' : ''}
                        </span>
                      );
                    })()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {(() => {
            const ind = getRecoveryIndicator(comparisonRef.goal_readiness, selectedSessionData.goal_readiness);
            return (
              <div
                className={`mt-6 p-4 rounded-lg border ${
                  ind.isImprovement ? 'bg-green-50 border-green-200' : ind.value === 0 ? 'bg-slate-50 border-slate-200' : 'bg-amber-50 border-amber-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    ind.isImprovement ? 'text-green-900' : ind.value === 0 ? 'text-slate-800' : 'text-amber-900'
                  }`}
                >
                  {ind.isImprovement
                    ? `Session ${selectedSession} is ${ind.value} points lower than ${comparisonRef.label} (${comparisonRef.goal_readiness}/60 → ${selectedSessionData.goal_readiness}/60). Lower scores indicate improved wellbeing — that is ${ind.value} points of recovery.`
                    : ind.value === 0
                    ? `Session ${selectedSession} matches ${comparisonRef.label} on total wellbeing (${selectedSessionData.goal_readiness}/60).`
                    : `Session ${selectedSession} is ${ind.value} points higher than ${comparisonRef.label}. Scores moved away from the recovery direction; consider reviewing the treatment focus.`}
                </p>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-500">
          <p>No session data available yet.</p>
          <p className="text-sm mt-1">Complete a session and fill out the development form to see progress.</p>
        </div>
      )}

      {rollingProgress && rollingProgress.length > 0 && (
        <div className="border-t border-slate-200 p-6">
          <h4 className="font-medium text-slate-900 mb-2">Rolling progress timeline</h4>
          <p className="text-xs text-slate-500 mb-4">
            Each row compares that session to the step in “Compared to” (Session 1 vs free consultation; Session 2 vs Session 1;
            etc.). A positive change is recovery (points dropped toward better wellbeing).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left py-2 px-3 font-medium text-slate-700">Session</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-500">Compared to</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Score</th>
                  <th className="text-center py-2 px-3 font-medium text-slate-700">Change (recovery)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rollingProgress.map((item) => (
                  <tr key={item.sessionNumber} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-medium text-slate-900">Session {item.sessionNumber}</td>
                    <td className="py-2 px-3 text-center text-slate-500">{item.comparisonLabel}</td>
                    <td className="py-2 px-3 text-center font-medium text-indigo-600">{item.currentScore}/60</td>
                    <td
                      className={`py-2 px-3 text-center font-medium ${
                        item.recovery > 0 ? 'text-green-600' : item.recovery < 0 ? 'text-amber-600' : 'text-slate-500'
                      }`}
                    >
                      {item.recovery > 0 ? '+' : ''}
                      {item.recovery}
                      {item.recovery > 0 && ' recovery'}
                      {item.recovery < 0 && ' (higher)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-medium text-indigo-900">Overall change from free consultation to latest session</span>
              <span className="text-lg font-bold text-indigo-600">
                {(() => {
                  const lastSession = sortedSessions[sortedSessions.length - 1];
                  const totalRecovery = baselineScores.goal_readiness - lastSession.goal_readiness;
                  return `${totalRecovery > 0 ? '+' : ''}${totalRecovery} pts (${baselineScores.goal_readiness}/60 → ${lastSession.goal_readiness}/60)`;
                })()}
              </span>
            </div>
            <p className="text-xs text-indigo-700/80 mt-2">
              Positive total = lower score at latest session than at consultation (improved wellbeing on this scale).
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
