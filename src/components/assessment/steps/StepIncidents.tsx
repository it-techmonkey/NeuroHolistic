'use client';

import { IncidentsData } from '../types';

interface StepIncidentsProps {
  data: IncidentsData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepIncidents({ data, errors, onChange }: StepIncidentsProps) {
  return (
    <div className="space-y-6">
      <p className="text-slate-600">
        Please share details about significant incidents or experiences that may be impacting your
        current wellbeing. This helps us understand your journey and any patterns.
      </p>

      {/* Major Life Event */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Have you experienced any major life transitions or events? (optional)
        </label>
        <textarea
          value={data.majorLifeEvent}
          onChange={(e) => onChange('majorLifeEvent', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="e.g., loss, major change, achievement, etc."
        />
      </div>

      {/* Trauma or Difficult Experience */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Have you experienced trauma or particularly difficult experiences? (optional)
        </label>
        <textarea
          value={data.traumaExperience}
          onChange={(e) => onChange('traumaExperience', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Share what feels comfortable. You can describe impact rather than details."
        />
      </div>

      {/* Relationship Challenges */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Have you experienced significant relationship challenges? (optional)
        </label>
        <textarea
          value={data.relationshipChallenges}
          onChange={(e) => onChange('relationshipChallenges', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Describe the nature and impact of these challenges..."
        />
      </div>

      {/* Other Significant Incidents */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Other significant incidents or patterns you want to share (optional)
        </label>
        <textarea
          value={data.otherIncidents}
          onChange={(e) => onChange('otherIncidents', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
          placeholder="Any other experiences we should know about..."
        />
      </div>
    </div>
  );
}
