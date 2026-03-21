'use client';

import { PresentingConditionData } from '../types';

interface StepPresentingConditionProps {
  data: PresentingConditionData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepPresentingCondition({
  data,
  errors,
  onChange,
}: StepPresentingConditionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">
          What is your primary reason for seeking holistic support?
        </label>
        <div className="space-y-3">
          {[
            { value: 'stress', label: 'Stress and Anxiety' },
            { value: 'trauma', label: 'Past Trauma or PTSD' },
            { value: 'wellness', label: 'General Wellness and Prevention' },
            { value: 'relationships', label: 'Relationship Challenges' },
            { value: 'health', label: 'Chronic Health Issues' },
            { value: 'performance', label: 'Performance Optimization' },
            { value: 'other', label: 'Other' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="primaryReason"
                value={option.value}
                checked={data.primaryReason === option.value}
                onChange={(e) => onChange('primaryReason', e.target.value)}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <span className="ml-3 text-slate-700 cursor-pointer">{option.label}</span>
            </label>
          ))}
        </div>
        {errors['presentingCondition.primaryReason'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['presentingCondition.primaryReason']}
          </p>
        )}
      </div>

      {/* Conditional: Show details textarea if "other" selected */}
      {data.primaryReason === 'other' && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe your primary reason
          </label>
          <textarea
            value={data.otherReason}
            onChange={(e) => onChange('otherReason', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={4}
            placeholder="Describe what brought you here..."
          />
        </div>
      )}

      {/* Duration of Issue */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-4">
          How long have you been experiencing this?
        </label>
        <div className="space-y-3">
          {[
            { value: 'less_than_3_months', label: 'Less than 3 months' },
            { value: '3_to_6_months', label: '3 to 6 months' },
            { value: '6_months_to_1_year', label: '6 months to 1 year' },
            { value: '1_to_3_years', label: '1 to 3 years' },
            { value: 'more_than_3_years', label: 'More than 3 years' },
          ].map((option) => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="duration"
                value={option.value}
                checked={data.duration === option.value}
                onChange={(e) => onChange('duration', e.target.value)}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <span className="ml-3 text-slate-700 cursor-pointer">{option.label}</span>
            </label>
          ))}
        </div>
        {errors['presentingCondition.duration'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['presentingCondition.duration']}
          </p>
        )}
      </div>

      {/* Current Impact */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How is this affecting your daily life? (optional)
        </label>
        <textarea
          value={data.currentImpact}
          onChange={(e) => onChange('currentImpact', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={4}
          placeholder="Describe the impact on your work, relationships, health, etc."
        />
      </div>
    </div>
  );
}
