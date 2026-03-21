'use client';

import Link from 'next/link';

interface ProgramRecommendation {
  title: string;
  description: string;
  href: string;
  relevance: 'primary' | 'secondary' | 'supportive';
  whyRelevant: string[];
}

interface RecommendedProgramsProps {
  nervousSystemType: string;
  overallScore: number;
}

export function RecommendedPrograms({
  nervousSystemType,
  overallScore,
}: RecommendedProgramsProps) {
  // Determine recommended programs based on assessment results
  const getRecommendations = (): ProgramRecommendation[] => {
    const recommendations: ProgramRecommendation[] = [];

    // Everyone benefits from the foundational method
    recommendations.push({
      title: 'NeuroHolistic Training Intensive',
      description:
        'Our core comprehensive training in nervous system regulation and somatic healing',
      href: '/academy',
      relevance: 'primary',
      whyRelevant: [
        'Foundational training for nervous system awareness',
        'Builds capacity for sustainable change',
        'Suitable for all nervous system patterns',
      ],
    });

    // Hyperactivated systems benefit from specific programs
    if (nervousSystemType === 'hyper') {
      recommendations.push({
        title: 'Corporate Wellbeing Programs',
        description:
          'Tailored for high-activation work environments. Focused on nervous system regulation and sustainable resilience.',
        href: '/corporate-wellbeing',
        relevance: 'primary',
        whyRelevant: [
          'Helps regulate an overactive nervous system',
          'Work-specific stress management',
          'Sustainable activation management',
        ],
      });

      recommendations.push({
        title: 'NeuroHolistic Retreats',
        description:
          'Restorative retreat experiences designed for deep nervous system reset and integration.',
        href: '/retreats',
        relevance: 'secondary',
        whyRelevant: [
          'Provides extended immersion for nervous system regulation',
          'Safe environment for pattern changes',
          'Intensive nervous system restoration',
        ],
      });
    }

    // Hypoactivated systems benefit from different support
    if (nervousSystemType === 'hypo') {
      recommendations.push({
        title: 'NeuroHolistic Retreats',
        description:
          'Restorative retreat experiences designed for gentle nervous system activation and reconnection.',
        href: '/retreats',
        relevance: 'primary',
        whyRelevant: [
          'Safe space for nervous system re-activation',
          'Rebuilds capacity for presence and engagement',
          'Supported integration of protective patterns',
        ],
      });

      recommendations.push({
        title: 'Specialized Research Programs',
        description:
          'Evidence-based approaches for nervous system hypoarousal and dissociation patterns.',
        href: '/research',
        relevance: 'secondary',
        whyRelevant: [
          'Cutting-edge understanding of hypoarousal',
          'Research-informed intervention approaches',
          'Advanced nervous system reconnection methods',
        ],
      });
    }

    // Higher stress scores get additional support
    if (overallScore > 60) {
      recommendations.push({
        title: 'One-on-One Support',
        description:
          'Personalized NeuroHolistic support tailored to your unique nervous system and history.',
        href: '/contact',
        relevance: 'supportive',
        whyRelevant: [
          'Customized approach to your specific patterns',
          'Individual attention for complex presentations',
          'Personalized pacing and support',
        ],
      });
    }

    return recommendations;
  };

  const recommendations = getRecommendations();

  const primaryRecommendations = recommendations.filter(
    (r) => r.relevance === 'primary'
  );
  const secondaryRecommendations = recommendations.filter(
    (r) => r.relevance === 'secondary'
  );
  const supportiveRecommendations = recommendations.filter(
    (r) => r.relevance === 'supportive'
  );

  return (
    <div className="space-y-8">
      {/* Primary recommendations */}
      {primaryRecommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-violet-600 rounded-full" />
            <h3 className="text-lg font-semibold text-slate-900">
              Recommended for You
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {primaryRecommendations.map((program) => (
              <ProgramCard key={program.title} program={program} />
            ))}
          </div>
        </div>
      )}

      {/* Secondary recommendations */}
      {secondaryRecommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-slate-400 rounded-full" />
            <h3 className="text-lg font-semibold text-slate-900">
              Supporting Programs
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {secondaryRecommendations.map((program) => (
              <ProgramCard key={program.title} program={program} />
            ))}
          </div>
        </div>
      )}

      {/* Supportive recommendations */}
      {supportiveRecommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <h3 className="text-lg font-semibold text-slate-900">
              Additional Support
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {supportiveRecommendations.map((program) => (
              <ProgramCard key={program.title} program={program} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramCard({ program }: { program: ProgramRecommendation }) {
  return (
    <Link href={program.href}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-slate-900">{program.title}</h4>
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        <p className="text-sm text-slate-600 mb-3">{program.description}</p>

        {program.whyRelevant && (
          <div className="text-xs text-slate-500 space-y-1">
            {program.whyRelevant.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
