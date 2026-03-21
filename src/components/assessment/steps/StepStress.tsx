'use client';

import { StressData } from '../types';
import { FIELD_OPTIONS } from '../constants';

interface StepStressProps {
  data: StressData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepStress({ data, errors, onChange }: StepStressProps) {
  const toggleSelection = (arr: string[], value: string) => {
    if (arr.includes(value)) {
      return arr.filter((v) => v !== value);
    }
    return [...arr, value];
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-slate-700">
          Understanding your stress response patterns helps us identify which nervous system
          strategies will be most beneficial for you.
        </p>
      </div>

      {/* Stress Response Patterns */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          How do you typically respond to stress? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.stressResponses.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('responsePatterns', toggleSelection(data.responsePatterns, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.responsePatterns.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['stress.responsePatterns'] && (
          <p className="text-red-600 text-sm mt-2">{errors['stress.responsePatterns']}</p>
        )}
      </div>

      {/* Conditional: Other stress response */}
      {data.responsePatterns.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other stress responses
          </label>
          <textarea
            value={data.otherResponses}
            onChange={(e) => onChange('otherResponses', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe..."
          />
        </div>
      )}

      {/* Substance Use */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Do you use any substances to manage stress? (Select all that apply - optional)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.substanceUse.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('substanceUse', toggleSelection(data.substanceUse, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.substanceUse.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: Other substance */}
      {data.substanceUse.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe
          </label>
          <textarea
            value={data.otherSubstances}
            onChange={(e) => onChange('otherSubstances', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe..."
          />
        </div>
      )}

      {/* Current Support System */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How strong is your current support system?
        </label>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onChange('supportStrength', value)}
              className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                data.supportStrength === value
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Very weak</span>
          <span>Very strong</span>
        </div>
      </div>

      {/* Work/Life Balance */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How would you rate your work-life balance?
        </label>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onChange('workLifeBalance', value)}
              className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                data.workLifeBalance === value
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Very poor</span>
          <span>Excellent</span>
        </div>
      </div>
    </div>
  );
}
