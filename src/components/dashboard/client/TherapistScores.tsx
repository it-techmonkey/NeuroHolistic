'use client';

import { Card } from '@/components/ui/Card';
import DomainScoreBar from '@/components/dashboard/shared/DomainScoreBar';

interface LatestAssessment {
  overallScore: number;
  nervousSystemScore: number;
  emotionalPatternScore: number;
  currentStressScore: number;
  therapistNotes: string | null;
  recommendations: string | null;
  createdAt: string;
}

interface TherapistScoresProps {
  averageScore: number | null;
  latestAssessment: LatestAssessment | null;
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function TherapistScores({ averageScore, latestAssessment }: TherapistScoresProps) {
  if (averageScore === null && !latestAssessment) {
    return (
      <Card className="p-6" border>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Therapist Assessment
        </h3>
        <p className="text-sm text-slate-400 text-center py-6">
          No assessments recorded yet.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6" border>
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        Therapist Assessment
      </h3>

      {averageScore !== null && (
        <div className="text-center py-2">
          <span className="text-5xl font-bold text-[#2B2F55] leading-none">{averageScore}</span>
          <p className="text-sm text-slate-500 mt-1">Average Score</p>
        </div>
      )}

      {latestAssessment && (
        <>
          <div className="flex items-center justify-between text-sm border-t border-slate-100 pt-4">
            <span className="text-slate-500">Latest Score</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">{latestAssessment.overallScore}</span>
              <span className="text-xs text-slate-400">{fmtDate(latestAssessment.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <DomainScoreBar label="Nervous System" value={latestAssessment.nervousSystemScore} />
            <DomainScoreBar label="Emotional State" value={latestAssessment.emotionalPatternScore} />
            <DomainScoreBar label="Current Stress" value={latestAssessment.currentStressScore} />
          </div>

          {(latestAssessment.therapistNotes || latestAssessment.recommendations) && (
            <div className="bg-slate-900 text-white rounded-xl p-4 space-y-2">
              {latestAssessment.therapistNotes && (
                <p className="text-sm leading-relaxed text-slate-200">
                  {latestAssessment.therapistNotes}
                </p>
              )}
              {latestAssessment.recommendations && (
                <p className="text-sm leading-relaxed text-slate-300">
                  {latestAssessment.recommendations}
                </p>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}
