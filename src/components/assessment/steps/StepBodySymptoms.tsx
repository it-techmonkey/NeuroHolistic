'use client';

import { BodySymptomsData } from '../types';
import { FIELD_OPTIONS } from '../constants';

interface StepBodySymptomsProps {
  data: BodySymptomsData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepBodySymptoms({
  data,
  errors,
  onChange,
}: StepBodySymptomsProps) {
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
          Your body often communicates what your mind is processing. Let's explore the physical
          sensations and symptoms you experience.
        </p>
      </div>

      {/* Body Symptoms */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Which physical symptoms do you commonly experience? (Select all that apply)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FIELD_OPTIONS.bodySymptoms.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange('symptoms', toggleSelection(data.symptoms, option.value))}
              className={`py-2 px-3 rounded-lg text-sm font-medium text-left transition-all ${
                data.symptoms.includes(option.value)
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        {errors['bodySymptoms.symptoms'] && (
          <p className="text-red-600 text-sm mt-2">{errors['bodySymptoms.symptoms']}</p>
        )}
      </div>

      {/* Conditional: Other symptoms */}
      {data.symptoms.includes('other') && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Please describe other physical symptoms
          </label>
          <textarea
            value={data.otherSymptoms}
            onChange={(e) => onChange('otherSymptoms', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={3}
            placeholder="Describe other symptoms..."
          />
        </div>
      )}

      {/* Pain or Discomfort */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Do you experience chronic pain or discomfort? If yes, where? (optional)
        </label>
        <textarea
          value={data.painDiscomfort}
          onChange={(e) => onChange('painDiscomfort', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Describe location and characteristics..."
        />
      </div>

      {/* Sleep Quality */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How would you describe your sleep quality?
        </label>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onChange('sleepQuality', value)}
              className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                data.sleepQuality === value
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

      {/* Energy Level */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How is your energy level typically?
        </label>
        <div className="flex justify-between gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => onChange('energyLevel', value)}
              className={`flex-1 py-2 px-2 rounded-lg font-medium text-sm transition-all ${
                data.energyLevel === value
                  ? 'bg-emerald-500 text-white ring-2 ring-emerald-600'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>Very low</span>
          <span>Very high</span>
        </div>
      </div>
    </div>
  );
}
