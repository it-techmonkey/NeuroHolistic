'use client';

import { NervousSystemData } from '../types';

interface StepNervousSystemProps {
  data: NervousSystemData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepNervousSystem({
  data,
  errors,
  onChange,
}: StepNervousSystemProps) {
  const scaleQuestions = [
    {
      key: 'tonia_level',
      question: 'How would you describe your nervous system tone?',
      description: '(1 = Very low/sluggish, 5 = Very high/hyperactive)',
    },
    {
      key: 'activation_pattern',
      question: 'How easily does your nervous system become activated?',
      description: '(1 = Very difficult to activate, 5 = Very easily activated)',
    },
    {
      key: 'recovery_speed',
      question: 'How quickly do you recover from stressful situations?',
      description: '(1 = Very slowly, 5 = Very quickly)',
    },
    {
      key: 'freeze_response',
      question: 'How often do you experience a "freeze" response?',
      description: '(1 = Never, 5 = Very frequently)',
    },
    {
      key: 'fight_flight',
      question: 'How often do you experience fight or flight responses?',
      description: '(1 = Never, 5 = Very frequently)',
    },
  ];

  return (
    <div className="space-y-8">
      <p className="text-slate-600">
        Please rate each statement on a scale of 1–5, where 1 represents the left description
        and 5 represents the right description.
      </p>

      {scaleQuestions.map((q) => (
        <div key={q.key}>
          <label className="block text-sm font-medium text-slate-700 mb-2">{q.question}</label>
          <p className="text-xs text-slate-500 mb-3">{q.description}</p>

          <div className="flex justify-between items-center gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => onChange(q.key, value)}
                className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                  data[q.key as keyof NervousSystemData] === value
                    ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          {errors[`nervousSystem.${q.key}`] && (
            <p className="text-red-600 text-sm mt-2">
              {errors[`nervousSystem.${q.key}`]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
