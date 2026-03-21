'use client';

import { SiblingsData } from '../types';

interface StepSiblingsProps {
  data: SiblingsData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepSiblings({ data, errors, onChange }: StepSiblingsProps) {
  return (
    <div className="space-y-6">
      {/* Number of Siblings */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          How many siblings do you have?
        </label>
        <input
          type="number"
          min="0"
          value={data.numberOfSiblings}
          onChange={(e) => onChange('numberOfSiblings', parseInt(e.target.value) || 0)}
          className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {errors['siblings.numberOfSiblings'] && (
          <p className="text-red-600 text-sm mt-1">{errors['siblings.numberOfSiblings']}</p>
        )}
      </div>

      {/* Birth Order */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What is your birth order?
        </label>
        <select
          value={data.birthOrder}
          onChange={(e) => onChange('birthOrder', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select</option>
          <option value="oldest">Oldest</option>
          <option value="middle">Middle</option>
          <option value="youngest">Youngest</option>
          <option value="only">Only child</option>
        </select>
        {errors['siblings.birthOrder'] && (
          <p className="text-red-600 text-sm mt-1">{errors['siblings.birthOrder']}</p>
        )}
      </div>

      {/* Sibling Relationships */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Describe your relationships with your siblings (optional)
        </label>
        <textarea
          value={data.siblingRelationships}
          onChange={(e) => onChange('siblingRelationships', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Describe the dynamics and relationships..."
        />
      </div>

      {/* Family Roles */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          What role did you play in your family? (optional)
        </label>
        <textarea
          value={data.familyRole}
          onChange={(e) => onChange('familyRole', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="e.g., peacemaker, achiever, caregiver, etc."
        />
      </div>
    </div>
  );
}
