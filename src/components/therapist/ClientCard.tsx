'use client';

interface ClientCardProps {
  email: string;
  overallScore: number;
  severityBand: string;
  nervousSystemType: string;
  recommendedPhase: string;
  rank?: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

/**
 * Determine color theme based on severity band
 */
function getSeverityColor(band: string): string {
  switch (band?.toLowerCase()) {
    case 'very high':
      return 'bg-rose-50 border-rose-200 hover:border-rose-300';
    case 'high':
      return 'bg-orange-50 border-orange-200 hover:border-orange-300';
    case 'significant':
      return 'bg-amber-50 border-amber-200 hover:border-amber-300';
    case 'moderate':
      return 'bg-blue-50 border-blue-200 hover:border-blue-300';
    default:
      return 'bg-green-50 border-green-200 hover:border-green-300';
  }
}

/**
 * Get severity badge color
 */
function getSeverityBadgeColor(band: string): string {
  switch (band?.toLowerCase()) {
    case 'very high':
      return 'bg-rose-200 text-rose-900';
    case 'high':
      return 'bg-orange-200 text-orange-900';
    case 'significant':
      return 'bg-amber-200 text-amber-900';
    case 'moderate':
      return 'bg-blue-200 text-blue-900';
    default:
      return 'bg-green-200 text-green-900';
  }
}

/**
 * Get nervous system type label
 */
function getNervousSystemLabel(type: string): string {
  switch (type?.toLowerCase()) {
    case 'hyper':
      return 'Hyperaroused';
    case 'hypo':
      return 'Hypoaroused';
    case 'mixed':
      return 'Mixed State';
    case 'regulated':
      return 'Regulated';
    default:
      return type || 'Unknown';
  }
}

export default function ClientCard({
  email,
  overallScore,
  severityBand,
  nervousSystemType,
  recommendedPhase,
  rank,
  isSelected = false,
  onSelect,
}: ClientCardProps) {
  const isHighRisk = overallScore > 70;

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
        isSelected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-300 ring-offset-1' : getSeverityColor(severityBand)
      } hover:shadow-md`}
    >
      {/* Rank Badge */}
      {rank && rank <= 3 && (
        <div className="inline-block mb-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded">
          #{rank} {rank === 1 ? '🔴' : rank === 2 ? '🟠' : '🟡'}
        </div>
      )}

      {/* High Risk Indicator */}
      {isHighRisk && (
        <div className="inline-block ml-2 px-2 py-1 bg-rose-100 text-rose-700 text-xs font-semibold rounded">
          High Risk
        </div>
      )}

      <div className="mt-3">
        {/* Email */}
        <p className="text-sm font-semibold text-neutral-900 truncate">{email}</p>

        {/* Main Metrics */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Overall Score */}
          <div>
            <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Overall Score</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">{(overallScore ?? 0).toFixed(1)}</p>
          </div>

          {/* Severity Band */}
          <div>
            <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Severity</p>
            <p className={`text-xs font-bold mt-1 px-2 py-1 rounded inline-block ${getSeverityBadgeColor(severityBand)}`}>
              {severityBand}
            </p>
          </div>
        </div>

        {/* Nervous System Type */}
        <div className="mt-3">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Nervous System</p>
          <p className="text-sm font-semibold text-neutral-800 mt-1">{getNervousSystemLabel(nervousSystemType)}</p>
        </div>

        {/* Recommended Phase */}
        <div className="mt-3">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-wide">Recommended Phase</p>
          <p className="text-sm font-semibold text-primary-700 mt-1">{recommendedPhase}</p>
        </div>
      </div>
    </button>
  );
}
