'use client';

import { MotherHistoryData } from '../types';
import { FIELD_OPTIONS } from '../constants';

interface StepMotherHistoryProps {
  data: MotherHistoryData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepMotherHistory({ data, errors, onChange }: StepMotherHistoryProps) {
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
          We're exploring your family history to understand potential generational patterns. This
          includes both emotional and physical health patterns.
        </p>
      </div>

      {/* Mother's Emotional Health */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Did your mother experience any of these? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.healthHistory.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('emotionalChallenges', toggleSelection(data.emotionalChallenges, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.emotionalChallenges.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['motherHistory.emotionalChallenges'] && (
          <p className="text-red-600 text-sm mt-2">
            {errors['motherHistory.emotionalChallenges']}
          </p>
        )}
      </div>

      {/* Conditional: Other emotional challenges */}
      {data.emotionalChallenges.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other emotional challenges
          </label>
          <textarea
            value={data.otherEmotionalChallenges}
            onChange={(e) => onChange('otherEmotionalChallenges', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe..."
          />
        </div>
      )}

      {/* Mother's Physical Health */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Did your mother experience any chronic health issues? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.physicalHealth.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('physicalHealth', toggleSelection(data.physicalHealth, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.physicalHealth.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: Other physical health */}
      {data.physicalHealth.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other physical health issues
          </label>
          <textarea
            value={data.otherPhysicalHealth}
            onChange={(e) => onChange('otherPhysicalHealth', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe..."
          />
        </div>
      )}

      {/* Mother's Relationships */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How would you describe your mother's relationship patterns? (optional)
        </label>
        <textarea
          value={data.relationshipPatterns}
          onChange={(e) => onChange('relationshipPatterns', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Describe patterns you noticed..."
        />
      </div>
    </div>
  );
}
