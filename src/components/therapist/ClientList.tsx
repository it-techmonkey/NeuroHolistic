'use client';

import { useState, useMemo } from 'react';
import ClientCard from './ClientCard';

interface Assessment {
  id: string;
  email: string;
  overall_dysregulation_score: number;
  overall_severity_band: string;
  nervous_system_type: string;
  recommended_phase_primary: string;
  submitted_at: string;
}

interface ClientListProps {
  assessments: Assessment[];
  selectedEmail?: string;
  onSelectClient: (email: string) => void;
  isLoading?: boolean;
}

type SortOption = 'latest' | 'highest-score' | 'default';

export default function ClientList({
  assessments,
  selectedEmail,
  onSelectClient,
  isLoading = false,
}: ClientListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Sort assessments
  const sortedAssessments = useMemo(() => {
    const sorted = [...assessments];

    switch (sortBy) {
      case 'highest-score':
        return sorted.sort((a, b) => b.overall_dysregulation_score - a.overall_dysregulation_score);
      case 'latest':
        return sorted.sort(
          (a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime()
        );
      default:
        return sorted;
    }
  }, [assessments, sortBy]);

  // Add rankings
  const rankedAssessments = sortedAssessments.map((assessment, index) => ({
    ...assessment,
    rank: index + 1,
  }));

  // Count high-risk clients
  const highRiskCount = assessments.filter((a) => (a.overall_dysregulation_score ?? 0) > 70).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary-200 rounded-full animate-pulse" />
          <p className="text-neutral-600">Loading clients...</p>
        </div>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-600 mb-2">No assessments yet</p>
        <p className="text-xs text-neutral-500">Clients who complete assessments will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with stats and sort */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{assessments.length} Clients</h3>
          {highRiskCount > 0 && (
            <p className="text-sm text-rose-600 font-medium">⚠️ {highRiskCount} high-risk clients</p>
          )}
        </div>

        {/* Sort selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="px-3 py-1 text-sm border border-neutral-200 rounded-lg bg-white text-neutral-700 cursor-pointer hover:border-neutral-300"
        >
          <option value="latest">Latest First</option>
          <option value="highest-score">Highest Score</option>
        </select>
      </div>

      {/* Client list */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {rankedAssessments.map((assessment) => (
          <ClientCard
            key={assessment.id}
            email={assessment.email}
            overallScore={assessment.overall_dysregulation_score}
            severityBand={assessment.overall_severity_band}
            nervousSystemType={assessment.nervous_system_type}
            recommendedPhase={assessment.recommended_phase_primary}
            rank={assessment.rank}
            isSelected={selectedEmail === assessment.email}
            onSelect={() => onSelectClient(assessment.email)}
          />
        ))}
      </div>
    </div>
  );
}
