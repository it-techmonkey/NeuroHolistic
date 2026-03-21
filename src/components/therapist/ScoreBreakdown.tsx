'use client';

interface ScoreBreakdownProps {
  scores: {
    nervous_system_score: number;
    emotional_pattern_score: number;
    family_imprint_score: number;
    incident_load_score: number;
    body_symptom_score: number;
    current_stress_score: number;
  };
}

export default function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const domains = [
    { label: 'Nervous System', value: scores.nervous_system_score ?? 0, color: 'from-blue-500' },
    { label: 'Emotional Patterns', value: scores.emotional_pattern_score ?? 0, color: 'from-purple-500' },
    { label: 'Family Imprint', value: scores.family_imprint_score ?? 0, color: 'from-pink-500' },
    { label: 'Incident Load', value: scores.incident_load_score ?? 0, color: 'from-orange-500' },
    { label: 'Body Symptoms', value: scores.body_symptom_score ?? 0, color: 'from-rose-500' },
    { label: 'Current Stress', value: scores.current_stress_score ?? 0, color: 'from-amber-500' },
  ];

  return (
    <div className="space-y-4">
      {domains.map((domain) => (
        <div key={domain.label} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-neutral-700">{domain.label}</span>
            <span className="text-sm font-semibold text-neutral-900">{domain.value.toFixed(1)}</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${domain.color} to-opacity-60 transition-all duration-500`}
              style={{ width: `${Math.min(domain.value, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
