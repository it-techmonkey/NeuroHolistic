'use client';

interface RecommendationCardProps {
  phaseLabel: string;
  description: string;
}

export function RecommendationCard({
  phaseLabel,
  description,
}: RecommendationCardProps) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-6">
      <div className="flex gap-4">
        <div className="flex-shrink-0">
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-500 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">{phaseLabel}</h3>
          <p className="mt-2 text-slate-700 leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  );
}
