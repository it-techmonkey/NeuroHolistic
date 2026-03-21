'use client';

interface PersonalizedInsightsProps {
  autonomicInflammation: number;
  somaticLowertone: number;
  traumaticMemory: number;
  emotionalDepth: number;
  presenceHere: number;
  primaryWound: string;
  nervousSystemType: string;
}

export function PersonalizedInsights({
  autonomicInflammation,
  somaticLowertone,
  traumaticMemory,
  emotionalDepth,
  presenceHere,
  primaryWound,
  nervousSystemType,
}: PersonalizedInsightsProps) {
  const insights: Array<{
    category: string;
    insight: string;
    suggestion: string;
  }> = [];

  // Autonomic inflammation insights
  if (autonomicInflammation > 60) {
    insights.push({
      category: 'Nervous System Activation',
      insight: `Your nervous system is showing significant activation patterns. This can feel like constant
      readiness, racing thoughts, or physical tension. This isn't something to judge—it's your system's
      way of trying to keep you safe based on past experiences.`,
      suggestion:
        'Nervous system regulation practices can help teach your system that you are safe enough to rest.',
    });
  } else if (autonomicInflammation > 30) {
    insights.push({
      category: 'Nervous System Activation',
      insight:
        'Your nervous system carries moderate levels of activation. You may notice this in moments of stress or specific situations.',
      suggestion:
        'Grounding and regulation techniques can help you support your system when activation arises.',
    });
  } else {
    insights.push({
      category: 'Nervous System Activation',
      insight:
        'Your nervous system is showing good baseline regulation. This is a strong foundation to build from.',
      suggestion:
        'Maintaining practices that support your nervous system health will help sustain this balance.',
    });
  }

  // Somatic lowertone insights
  if (somaticLowertone > 60) {
    insights.push({
      category: 'Physical Holding Patterns',
      insight:
        'Your body is holding significant tension and protective patterns. This can show up as muscle tightness, fatigue, or a sense of heaviness.',
      suggestion:
        'Somatic release work and body-aware practices help your system recognize and release these protective patterns.',
    });
  } else if (somaticLowertone > 30) {
    insights.push({
      category: 'Physical Holding Patterns',
      insight: 'You carry moderate physical tension patterns in your body.',
      suggestion:
        'Gentle somatic awareness practices can help you gradually release these held patterns.',
    });
  } else {
    insights.push({
      category: 'Physical Holding Patterns',
      insight:
        'Your body is showing good flexibility and freedom from excessive tension patterns.',
      suggestion:
        'Body-awareness practices help maintain this ease and resilience.',
    });
  }

  // Traumatic memory insights
  if (traumaticMemory > 60) {
    insights.push({
      category: 'Difficult Memory Processing',
      insight:
        'Your system has encoded difficult memories that still influence your present experience. These memories may feel activated or intrusive at times.',
      suggestion:
        'Evidence-based trauma processing work can help integrate these experiences so they no longer run your nervous system.',
    });
  } else if (traumaticMemory > 30) {
    insights.push({
      category: 'Difficult Memory Processing',
      insight:
        'You carry some difficult memories that occasionally surface or influence your responses.',
      suggestion:
        'Gentle, gradual processing work helps your system complete the way it handled these experiences.',
    });
  } else {
    insights.push({
      category: 'Difficult Memory Processing',
      insight:
        'Your system is showing good integration of past experiences. Difficult memories are processed and not actively running your system.',
      suggestion:
        'Continue with practices that support psychological well-being and growth.',
    });
  }

  // Emotional depth insights
  if (emotionalDepth < 40) {
    insights.push({
      category: 'Emotional Connection',
      insight:
        'Your emotional experience may feel somewhat muted or distant. This can be a protective strategy when the system feels unsafe.',
      suggestion:
        'Gradually rebuilding emotional safety and connection happens best in supportive environments with skilled guidance.',
    });
  } else if (emotionalDepth < 70) {
    insights.push({
      category: 'Emotional Connection',
      insight:
        'You have good access to your emotional experience. Your richness of feeling shows your capacity for depth.',
      suggestion:
        'Practices that honor and integrate emotions support further growth and resilience.',
    });
  } else {
    insights.push({
      category: 'Emotional Connection',
      insight:
        'You show deep emotional capacity and sensitivity. This is a strength and gift, and also requires careful support.',
      suggestion:
        'Practices that help you honor your sensitivity while maintaining healthy boundaries are valuable.',
    });
  }

  // Presence insights
  if (presenceHere < 40) {
    insights.push({
      category: 'Present Moment Awareness',
      insight:
        'Your attention is often pulled toward the past or future. Being present can feel difficult or unsafe in your system.',
      suggestion:
        'Gradual grounding work helps your system recognize that it can be safe enough to be here now.',
    });
  } else if (presenceHere < 70) {
    insights.push({
      category: 'Present Moment Awareness',
      insight:
        'You have decent capacity to be present, though you may drift into past or future depending on circumstances.',
      suggestion:
        'Regular grounding practices strengthen your ability to stay present and resourced.',
    });
  } else {
    insights.push({
      category: 'Present Moment Awareness',
      insight:
        'You show strong capacity to be present and grounded in your body and surroundings.',
      suggestion:
        'This strength can deepen through continued embodied awareness practices.',
    });
  }

  // Add wound-specific insight if available
  if (primaryWound && primaryWound !== 'unknown') {
    insights.push({
      category: 'Core Pattern',
      insight: `Your assessment suggests core patterns connected to "${primaryWound}". These often shape how your nervous system responds to the world.`,
      suggestion:
        'Understanding this core pattern is the first step toward gentle, sustainable change. This pattern developed for good reason—to keep you safe. Learning to dialog with it compassionately opens new possibilities.',
    });
  }

  return (
    <div className="space-y-4">
      {insights.map((item, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-5 border border-slate-200"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-100">
                <svg
                  className="h-5 w-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 mb-2">{item.category}</h4>
              <p className="text-sm text-slate-700 mb-3 leading-relaxed">
                {item.insight}
              </p>
              <div className="bg-white rounded-lg p-3 border-l-2 border-violet-200">
                <p className="text-xs text-slate-600 font-medium uppercase tracking-wide mb-1">
                  Supportive direction
                </p>
                <p className="text-sm text-slate-700">{item.suggestion}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Summary message */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-6">
        <p className="text-sm text-blue-900 leading-relaxed">
          <span className="font-semibold">Remember:</span> These results describe patterns,
          not permanent traits. Your nervous system has remarkable capacity to learn, adapt,
          and heal. Every pattern you see here can shift with the right support and time.
        </p>
      </div>
    </div>
  );
}
