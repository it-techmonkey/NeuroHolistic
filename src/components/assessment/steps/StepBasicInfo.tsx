'use client';

import { BasicInfoData } from '../types';
import { FIELD_OPTIONS } from '../constants';

interface StepBasicInfoProps {
  data: BasicInfoData;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
}

export function StepBasicInfo({ data, errors, onChange }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName}
            onChange={(e) => onChange('firstName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="John"
          />
          {errors['basicInfo.firstName'] && (
            <p className="text-red-600 text-sm mt-1">{errors['basicInfo.firstName']}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Doe"
          />
          {errors['basicInfo.lastName'] && (
            <p className="text-red-600 text-sm mt-1">{errors['basicInfo.lastName']}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="john@example.com"
          />
          {errors['basicInfo.email'] && (
            <p className="text-red-600 text-sm mt-1">{errors['basicInfo.email']}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Phone (optional)
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Date of Birth
          </label>
          <input
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => onChange('dateOfBirth', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {errors['basicInfo.dateOfBirth'] && (
            <p className="text-red-600 text-sm mt-1">{errors['basicInfo.dateOfBirth']}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Gender
          </label>
          <select
            value={data.gender}
            onChange={(e) => onChange('gender', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select gender</option>
            {FIELD_OPTIONS.gender.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors['basicInfo.gender'] && (
            <p className="text-red-600 text-sm mt-1">{errors['basicInfo.gender']}</p>
          )}
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Location (optional)
        </label>
        <input
          type="text"
          value={data.location}
          onChange={(e) => onChange('location', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}
