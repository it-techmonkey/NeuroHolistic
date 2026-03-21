'use client';

import Link from 'next/link';

interface AssessmentResult {
  nervousSystemType: string;
  overallScore: number;
  primaryWound: string;
}

interface NextStepsProps {
  result: AssessmentResult;
}

export function NextStepsSection({ result }: NextStepsProps) {
  const getContextualSteps = () => {
    const steps = [];

    // Initial steps for everyone
    steps.push({
      number: 1,
      title: 'Reflect on Your Results',
      description:
        'Take time to sit with this information. Your nervous system may need a few days to process these insights.',
      icon: '🧘',
      color: 'bg-blue-50 border-blue-200',
    });

    steps.push({
      number: 2,
      title: 'Explore Our Resources',
      description:
        'Visit our Method page to understand the NeuroHolistic approach, and explore which programs resonate with you.',
      icon: '📚',
      color: 'bg-violet-50 border-violet-200',
      link: '/method',
    });

    // Contextual next steps
    if (result.overallScore > 60) {
      steps.push({
        number: 3,
        title: 'Consider Professional Support',
        description:
          'With more significant activation patterns, working with a qualified practitioner can accelerate your healing journey.',
        icon: '🤝',
        color: 'bg-amber-50 border-amber-200',
        link: '/contact',
      });
    }

    if (result.nervousSystemType === 'hyper') {
      steps.push({
        number: 3,
        title: 'Start with Regulation Practices',
        description:
          'Begin with simple nervous system regulation exercises. Our Corporate Wellbeing programs are excellent entry points.',
        icon: '✨',
        color: 'bg-emerald-50 border-emerald-200',
        link: '/corporate-wellbeing',
      });
    } else if (result.nervousSystemType === 'hypo') {
      steps.push({
        number: 3,
        title: 'Gentle Re-activation Work',
        description:
          'Our Retreats offer ideal immersive environments for gradual reconnection and re-activation in a supported setting.',
        icon: '🌱',
        color: 'bg-emerald-50 border-emerald-200',
        link: '/retreats',
      });
    } else {
      steps.push({
        number: 3,
        title: 'Choose Your Path',
        description:
          'Our Academy offers comprehensive training, or our Retreats provide intensive immersive experiences.',
        icon: '🛤️',
        color: 'bg-emerald-50 border-emerald-200',
      });
    }

    steps.push({
      number: steps.length + 1,
      title: 'Build Your Practice',
      description:
        'Nervous system healing is a practice, not a destination. Consistency matters more than intensity.',
      icon: '🌿',
      color: 'bg-pink-50 border-pink-200',
    });

    return steps;
  };

  const steps = getContextualSteps();

  return (
    <div className="space-y-6">
      {/* Timeline of steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className={`border rounded-lg p-5 ${step.color}`}>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-current">
                  <span className="text-lg">{step.icon}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Step {step.number}
                    </p>
                    <h4 className="text-lg font-semibold text-slate-900 mt-1">{step.title}</h4>
                  </div>
                </div>
                <p className="text-slate-700 mt-2 leading-relaxed">{step.description}</p>

                {step.link && (
                  <div className="mt-3">
                    <Link
                      href={step.link}
                      className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm"
                    >
                      Learn more
                      <svg
                        className="w-4 h-4"
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
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Encouragement message */}
      <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg p-6">
        <h4 className="font-semibold text-slate-900 mb-3">A Few Words on Your Journey</h4>
        <p className="text-slate-700 leading-relaxed mb-3">
          This assessment is not a diagnosis or a permanent label—it's a snapshot of where your
          nervous system is right now. Every pattern you see in these results has developed for a
          good reason: to keep you safe.
        </p>
        <p className="text-slate-700 leading-relaxed mb-3">
          The patterns can shift. With the right support, understanding, and time, your nervous
          system can learn new ways of being. Healing isn't linear, but it is possible.
        </p>
        <p className="text-slate-700 font-semibold">
          We're here to support you every step of the way.
        </p>
      </div>

      {/* FAQ section */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-4">Common Questions</h4>
        <div className="space-y-4">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 hover:text-slate-700">
              <span>What do these scores mean for my daily life?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </summary>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Your scores reflect patterns in how your nervous system is currently responding to
              stress and challenge. Higher scores suggest your system is working harder to keep you
              safe. These patterns show up in daily life through symptoms like anxiety, tension,
              difficulty focusing, or emotional numbness—depending on your individual pattern.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 hover:text-slate-700">
              <span>Can these patterns change?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </summary>
            <p className="mt-3 text-slate-700 leading-relaxed">
              Absolutely. Your nervous system has neuroplasticity—the ability to learn, adapt,
              and change. With consistent practice, supportive relationships, and appropriate
              therapeutic work, all of these patterns can shift. Change takes time and patience,
              but it's very possible.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 hover:text-slate-700">
              <span>Should I be worried about my scores?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </summary>
            <p className="mt-3 text-slate-700 leading-relaxed">
              These scores are meant to provide insight and direction, not to cause worry. Many
              people carry these patterns—they're incredibly common responses to stress,
              overwhelm, and difficult experiences. Recognizing them is the first step toward
              working with them.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-slate-900 hover:text-slate-700">
              <span>Is this a replacement for therapy or medical care?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </summary>
            <p className="mt-3 text-slate-700 leading-relaxed">
              No. This assessment is educational and complementary. If you're working with a
              therapist or healthcare provider, please share this information with them. It works
              best as part of a comprehensive approach to your wellbeing that may include
              professional support.
            </p>
          </details>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="bg-white border-2 border-violet-200 rounded-lg p-6 text-center">
        <p className="text-slate-700 mb-4">
          Have questions about your results or need personalized guidance?
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-semibold transition-colors"
        >
          Get in Touch
        </Link>
      </div>
    </div>
  );
}
