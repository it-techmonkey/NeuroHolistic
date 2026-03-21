'use client';

import { ParentsDynamicData } from '../types';

interface StepParentsDynamicProps {
  data: ParentsDynamicData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepParentsDynamic({
  data,
  errors,
  onChange,
}: StepParentsDynamicProps) {
  const renderScale = (key: string, label: string) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            onClick={() => onChange(key, value)}
            className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
              data[key as keyof ParentsDynamicData] === value
                ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
      {errors[`parentsDynamic.${key}`] && (
        <p className="text-red-600 text-sm mt-1">
          {errors[`parentsDynamic.${key}`]}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-slate-700">
          These questions explore the dynamics within your family of origin. The scale helps us
          understand the emotional climate you grew up in.
        </p>
      </div>

      {/* Emotional Closeness */}
      {renderScale(
        'emotionalCloseness',
        'How emotionally close were your parents to each other? (1 = Very distant, 5 = Very close)'
      )}

      {/* Conflict Level */}
      {renderScale(
        'conflictLevel',
        'How much conflict did you witness between your parents? (1 = Never, 5 = Very frequently)'
      )}

      {/* Emotional Availability */}
      {renderScale(
        'emotionalAvailability',
        'How emotionally available were your parents? (1 = Not available, 5 = Very available)'
      )}
    </div>
  );
}
