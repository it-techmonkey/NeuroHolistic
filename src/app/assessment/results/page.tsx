'use client';

import { AssessmentResults } from '@/components/assessment/result';

// Sample assessment result for demonstration purposes
const sampleResult = {
  id: 'sample-001',
  nervousSystemType: 'hyper' as const,
  primaryWound: 'abandonment',
  secondaryWound: 'shame',
  originPeriod: 'early_childhood',
  overallScore: 68,
  autonomicInflammation: 72,
  somaticLowertone: 65,
  traumaticMemory: 58,
  emotionalDepth: 62,
  presenceHere: 45,
  timestamp: new Date(),
};

export default function ResultsPage() {
  const handleRetake = () => {
    // Navigate back to assessment
    window.location.href = '/assessment';
  };

  return (
    <AssessmentResults
      result={sampleResult}
      onRetake={handleRetake}
    />
  );
}
