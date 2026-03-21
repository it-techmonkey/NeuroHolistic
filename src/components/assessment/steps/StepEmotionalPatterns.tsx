'use client';

import { EmotionalPatternsData } from '../types';
import { FIELD_OPTIONS } from '../constants';

interface StepEmotionalPatternsProps {
  data: EmotionalPatternsData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepEmotionalPatterns({
  data,
  errors,
  onChange,
}: StepEmotionalPatternsProps) {
  const toggleSelection = (arr: string[], value: string) => {
    if (arr.includes(value)) {
      return arr.filter((v) => v !== value);
    }
    return [...arr, value];
  };

  return (
    <div className="space-y-6">
      {/* Primary Emotions */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Which emotions do you experience most often? (Select all that apply)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FIELD_OPTIONS.emotions.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('primaryEmotions', toggleSelection(data.primaryEmotions, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                data.primaryEmotions.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['emotionalPatterns.primaryEmotions'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['emotionalPatterns.primaryEmotions']}
          </p>
        )}
      </div>

      {/* Emotional Triggers */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          What typically triggers these emotions? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.emotionalTriggers.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('triggers', toggleSelection(data.triggers, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.triggers.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['emotionalPatterns.triggers'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['emotionalPatterns.triggers']}
          </p>
        )}
      </div>

      {/* Conditional: Show trigger details if "other" selected */}
      {data.triggers.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other triggers
          </label>
          <textarea
            value={data.otherTriggers}
            onChange={(e) => onChange('otherTriggers', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe other triggers..."
          />
        </div>
      )}

      {/* Coping Strategies */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          What strategies do you currently use to cope? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.copingStrategies.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('copingStrategies', toggleSelection(data.copingStrategies, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.copingStrategies.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['emotionalPatterns.copingStrategies'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['emotionalPatterns.copingStrategies']}
          </p>
        )}
      </div>

      {/* Conditional: Show coping details if "other" selected */}
      {data.copingStrategies.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other coping strategies
          </label>
          <textarea
            value={data.otherCopingStrategies}
            onChange={(e) => onChange('otherCopingStrategies', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe other strategies..."
          />
        </div>
      )}

      {/* Effectiveness Rating */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How effective are your current coping strategies?
        </label>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onChange('copingEffectiveness', value)}
              className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                data.copingEffectiveness === value
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Not effective</span>
          <span>Very effective</span>
        </div>
      </div>
    </div>
  );
}
