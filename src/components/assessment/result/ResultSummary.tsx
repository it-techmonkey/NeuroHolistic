'use client';

interface ResultSummaryProps {
  nervousSystemType: string;
  primaryWound: string;
  secondaryWound: string;
  originPeriod: string;
  overallScore: number;
}

export function ResultSummary({
  nervousSystemType,
  primaryWound,
  secondaryWound,
  originPeriod,
  overallScore,
}: ResultSummaryProps) {
  // Generate soft, client-friendly summary based on data
  const getSummaryText = (): string => {
    let text = '';

    // Overall stress level
    if (overallScore < 20) {
      text += 'Your system is showing healthy resilience and good foundational balance. ';
    } else if (overallScore < 40) {
      text +=
        'Your system is showing moderate levels of stress that deserve attention and care. ';
    } else if (overallScore < 60) {
      text +=
        'Your system is carrying a significant level of stress and protective patterning. ';
    } else if (overallScore < 80) {
      text +=
        'Your system is working hard to protect you and would benefit from dedicated support. ';
    } else {
      text +=
        'Your system is carrying a substantial protective load that deserves compassionate attention. ';
    }

    // Nervous system patterns
    if (nervousSystemType === 'hyper') {
      text +=
        'Your nervous system tends toward activation—you may experience racing thoughts, tension, or heightened alertness. ';
    } else if (nervousSystemType === 'hypo') {
      text +=
        'Your nervous system sometimes goes into a protective shutdown state—you may experience numbness, fatigue, or disconnection. ';
    } else if (nervousSystemType === 'mixed') {
      text +=
        'Your nervous system moves between activation and shutdown patterns depending on circumstances. ';
    }

    // Core themes
    text +=
      'The main areas affecting your well-being appear to be related to nervous system regulation and safety. ';

    if (primaryWound || secondaryWound) {
      text += 'This often connects to early patterns around ';
      const wounds = [];
      if (primaryWound && primaryWound !== 'unknown') {
        wounds.push(primaryWound);
      }
      if (secondaryWound && secondaryWound !== primaryWound && secondaryWound !== 'unknown') {
        wounds.push(secondaryWound);
      }
      if (wounds.length > 0) {
        text += wounds.join(' and ') + '. ';
      }
    }

    return text;
  };

  return (
    <div className="space-y-4">
      <p className="text-lg text-slate-700 leading-relaxed">{getSummaryText()}</p>

      {/* Key insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">
            Nervous System Pattern
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-2 capitalize">
            {nervousSystemType}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            {nervousSystemType === 'hyper' &&
              'Tendency toward activation and engagement'}
            {nervousSystemType === 'hypo' &&
              'Tendency toward slowing down and withdrawal'}
            {nervousSystemType === 'mixed' &&
              'Moving between activation and shutdown'}
            {nervousSystemType === 'regulated' &&
              'Generally balanced nervous system response'}
          </p>
        </div>

        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">
            Pattern Origin
          </p>
          <p className="text-lg font-semibold text-slate-900 mt-2 capitalize">
            {originPeriod === 'early_childhood'
              ? 'Early Childhood'
              : originPeriod === 'unknown'
                ? 'Unknown'
                : originPeriod}
          </p>
          <p className="text-sm text-slate-600 mt-1">
            These patterns often begin taking shape during this period
          </p>
        </div>
      </div>
    </div>
  );
}
