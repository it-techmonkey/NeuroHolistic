'use client';

interface AssessmentResult {
  autonomicInflammation: number;
  somaticLowertone: number;
  traumaticMemory: number;
  emotionalDepth: number;
  presenceHere: number;
}

interface ResultDetailsTabsProps {
  result: AssessmentResult;
}

interface DimensionDetail {
  name: string;
  score: number;
  description: string;
  scoreInterpretation: string;
  healthyRange: string;
  suggestions: string[];
}

export function ResultDetailsTabs({ result }: ResultDetailsTabsProps) {
  const getDimensionDetails = (): DimensionDetail[] => {
    return [
      {
        name: 'Nervous System Activation',
        score: result.autonomicInflammation,
        description:
          'How much your autonomic nervous system is in a state of activation or "inflammation"—the degree to which your system is running hypervigilance patterns.',
        scoreInterpretation:
          result.autonomicInflammation < 30
            ? 'Your nervous system is running on relatively low activation. This suggests good baseline regulation.'
            : result.autonomicInflammation < 60
              ? 'Your nervous system shows moderate activation. You may experience this during stress or in certain situations.'
              : 'Your nervous system is carrying significant activation. Your system may be running constant vigilance patterns.',
        healthyRange: '0-30 indicates a well-regulated nervous system baseline.',
        suggestions:
          result.autonomicInflammation > 50
            ? [
                'Vagal toning exercises to activate your parasympathetic "calm" response',
                'Regular breathwork practices, especially slow exhales',
                'Gentle movement like tai chi, yoga,or slow walking',
                'Consistent sleep and nutrition routines to support regulation',
              ]
            : [
                'Continue practices that support your current baseline',
                'Build awareness of early signs of activation',
                'Develop grounding techniques for stressful periods',
              ],
      },
      {
        name: 'Physical Tension Patterns',
        score: result.somaticLowertone,
        description:
          'The degree to which your body is holding tension, bracing, or "lowertone"—physical manifestations of nervous system protective patterns.',
        scoreInterpretation:
          result.somaticLowertone < 30
            ? 'Your body shows good flexibility and ease. You have good somatic freedom.'
            : result.somaticLowertone < 60
              ? 'Your body carries moderate tension patterns. These may be noticeable in certain areas or situations.'
              : 'Your body is holding significant tension and protective patterns. This tension is Your system trying to protect you.',
        healthyRange: '0-30 indicates good somatic flexibility and ease.',
        suggestions:
          result.somaticLowertone > 50
            ? [
                'Somatic release work—progressive muscle relaxation or shaking',
                'Massage or bodywork to help release held patterns',
                'Dance or expressive movement',
                'Gradual stretching and myofascial release',
                'Cold water immersion or warm baths for nervous system reset',
              ]
            : [
                'Continue body-aware movement practices',
                'Regular stretching to maintain flexibility',
                'Notice where tension first appears so you can intervene early',
              ],
      },
      {
        name: 'Difficult Memory Processing',
        score: result.traumaticMemory,
        description:
          'The degree to which difficult or traumatic memories are still encoded in your nervous system and influencing your present responses.',
        scoreInterpretation:
          result.traumaticMemory < 30
            ? 'Your system shows good integration of past experiences. Difficult memories are processed.'
            : result.traumaticMemory < 60
              ? 'You carry some difficult memories that occasionally surface or influence responses.'
              : 'Your system has significant unprocessed difficult experiences that are actively affecting your nervous system responses.',
        healthyRange: '0-30 indicates well-processed and integrated past experiences.',
        suggestions:
          result.traumaticMemory > 50
            ? [
                'Professional trauma processing work (EMDR, somatic experiencing, etc.)',
                'Gradual exposure to safe reminders in supported environments',
                'Building nervous system capacity before processing deep material',
                'Working with skilled trauma-informed practitioners',
                'Narrative work—retelling your story in a safe container',
              ]
            : [
                'Continue any current healing work',
                'Gradual integration practices',
                'Journaling or other forms of expression',
              ],
      },
      {
        name: 'Emotional Capacity',
        score: result.emotionalDepth,
        description:
          'Your capacity to feel, access, and tolerate your emotional experience. The degree to which emotions are available to you.',
        scoreInterpretation:
          result.emotionalDepth < 40
            ? 'Your emotional experience feels somewhat distant. This is often a protective response to overwhelming emotions.'
            : result.emotionalDepth < 70
              ? 'You have good access to your emotional experience. Your capacity for feeling is intact.'
              : 'You show deep emotional sensitivity and richness. Your emotional capacity is significant.',
        healthyRange: '50-80 indicates good emotional availability with healthy boundaries.',
        suggestions:
          result.emotionalDepth < 40
            ? [
                'Gradual emotional reconnection work in safe relationships',
                'Art, music, or movement to access emotion nonverbally',
                'Building emotional safety before deepening emotional access',
                'Somatic practices to help emotions move through the body',
              ]
            : result.emotionalDepth > 75
              ? [
                'Practices for healthy emotional boundaries',
                'Supporting your sensitivity while maintaining resilience',
                'Channeling emotional depth into meaningful activities',
              ]
              : [
                'Continue with current emotional wellness practices',
                'Exploring your emotional landscape through journaling or therapy',
              ],
      },
      {
        name: 'Present Moment Awareness',
        score: result.presenceHere,
        description:
          'Your capacity to be present and grounded in the here-and-now, rather than being pulled into past memories or future worries.',
        scoreInterpretation:
          result.presenceHere < 40
            ? 'Your attention is often pulled toward the past or future. Being present feels difficult or unsafe.'
            : result.presenceHere < 70
              ? 'You have decent capacity to be present with good grounding potential in your system.'
              : 'You show strong capacity to be present and grounded. This is a significant strength.',
        healthyRange: '60+ indicates good grounding and present-moment awareness.',
        suggestions:
          result.presenceHere < 40
            ? [
                'Grounding exercises (5-4-3-2-1 sensory technique, cold water, etc.)',
                'Mindfulness practices starting with just 1-2 minutes',
                'Bilateral stimulation (left-right movements or sounds)',
                'Safe place visualization',
                'Building nervous system capacity before deep meditation',
              ]
            : [
                'Deepening meditation or mindfulness practice',
                'Body-scanning techniques',
                'Continued grounding during stress',
              ],
      },
    ];
  };

  const dimensions = getDimensionDetails();

  return (
    <div className="space-y-6">
      {dimensions.map((dimension) => (
        <div
          key={dimension.name}
          className="border border-slate-200 rounded-lg overflow-hidden"
        >
          {/* Header with score */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-slate-900">{dimension.name}</h4>
                <p className="text-sm text-slate-600 mt-1">{dimension.description}</p>
              </div>
              <div className="text-right ml-6 flex-shrink-0">
                <div className="text-3xl font-bold text-violet-600">{dimension.score}</div>
                <div className="text-xs text-slate-600 uppercase tracking-wide font-semibold mt-1">
                  Score
                </div>
              </div>
            </div>

            {/* Score visualization bar */}
            <div className="mt-3 space-y-1.5">
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-400 to-violet-600 h-2 rounded-full transition-all"
                  style={{ width: `${dimension.score}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Minimal</span>
                <span>Moderate</span>
                <span>Significant</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 space-y-4">
            {/* Score interpretation */}
            <div>
              <p className="text-sm font-medium text-slate-900 mb-1">Your Results</p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {dimension.scoreInterpretation}
              </p>
            </div>

            {/* Healthy range */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 uppercase tracking-wide mb-1">
                Healthy Range Context
              </p>
              <p className="text-sm text-blue-800">{dimension.healthyRange}</p>
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-sm font-medium text-slate-900 mb-2">
                Supportive Practices
              </p>
              <ul className="space-y-2">
                {dimension.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="text-violet-500 font-bold mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ))}

      {/* General guidance note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Important Note:</span> These detailed breakdowns
          describe patterns in your nervous system at this particular moment. None of these
          patterns are permanent or unchangeable. With appropriate support and practices, all
          areas of your nervous system functioning can shift and improve.
        </p>
      </div>
    </div>
  );
}
