'use client';

import { GoalsData } from '../types';

interface StepGoalsProps {
  data: GoalsData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepGoals({ data, errors, onChange }: StepGoalsProps) {
  return (
    <div className="space-y-6">
      {/* Primary Goals */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What are your primary goals for this journey? (required)
        </label>
        <textarea
          value={data.primaryGoals}
          onChange={(e) => onChange('primaryGoals', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={4}
          placeholder="Describe what you hope to achieve..."
        />
        {errors['goals.primaryGoals'] && (
          <p className="text-red-600 text-sm mt-1">{errors['goals.primaryGoals']}</p>
        )}
      </div>

      {/* Desired Outcomes */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What would success look like for you? (required)
        </label>
        <textarea
          value={data.desiredOutcomes}
          onChange={(e) => onChange('desiredOutcomes', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={4}
          placeholder="Describe your ideal outcome..."
        />
        {errors['goals.desiredOutcomes'] && (
          <p className="text-red-600 text-sm mt-1">{errors['goals.desiredOutcomes']}</p>
        )}
      </div>

      {/* Previous Professional Support */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Have you received professional support before?
        </label>
        <div className="space-y-3">
          {[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unsure', label: 'Unsure' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="previousTherapy"
                value={option.value}
                checked={data.previousTherapy === option.value}
                onChange={(e) => onChange('previousTherapy', e.target.value)}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <span className="ml-3 text-slate-700 cursor-pointer">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Conditional: If yes to therapy */}
      {data.previousTherapy === 'yes' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe that experience
          </label>
          <textarea
            value={data.therapyDetails}
            onChange={(e) => onChange('therapyDetails', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="What type of support? What was helpful? What wasn't?"
          />
        </div>
      )}

      {/* Expectations */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What are your expectations for this program? (optional)
        </label>
        <textarea
          value={data.expectations}
          onChange={(e) => onChange('expectations', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="What do you hope will be different?"
        />
      </div>

      {/* Commitment Level */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          How committed are you to your transformation journey?
        </label>
        <div className="space-y-3">
          {[
            { value: 'very_committed', label: 'Very committed - I\'m ready to do the work' },
            { value: 'committed', label: 'Committed - I want to make changes' },
            { value: 'somewhat', label: 'Somewhat committed - I\'m exploring options' },
            { value: 'unsure', label: 'Unsure - I\'m still considering' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="commitment"
                value={option.value}
                checked={data.commitmentLevel === option.value}
                onChange={(e) => onChange('commitmentLevel', e.target.value)}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <span className="ml-3 text-slate-700 cursor-pointer">{option.label}</span>
            </label>
          ))}
        </div>
        {errors['goals.commitmentLevel'] && (
          <p className="text-red-600 text-sm mt-2">{errors['goals.commitmentLevel']}</p>
        )}
      </div>
    </div>
  );
}
