'use client';

interface DomainScore {
  name: string;
  score: number; // 0-100
  description?: string;
}

interface DomainBarsProps {
  domains: DomainScore[];
}

export function DomainBars({ domains }: DomainBarsProps) {
  const getBarColor = (score: number): string => {
    if (score < 20) return 'bg-emerald-500';
    if (score < 40) return 'bg-emerald-400';
    if (score < 60) return 'bg-amber-400';
    if (score < 80) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (score: number): string => {
    if (score < 20) return 'Mild';
    if (score < 40) return 'Moderate';
    if (score < 60) return 'Significant';
    if (score < 80) return 'High';
    return 'Very High';
  };

  return (
    <div className="space-y-6">
      {domains.map((domain, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900">{domain.name}</h4>
              {domain.description && (
                <p className="text-sm text-slate-600 mt-1">{domain.description}</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-2xl font-bold text-slate-900">
                {Math.round(domain.score)}
              </span>
              <p className="text-xs text-slate-500">{getSeverityLabel(domain.score)}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getBarColor(domain.score)} rounded-full transition-all duration-500`}
              style={{ width: `${domain.score}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
