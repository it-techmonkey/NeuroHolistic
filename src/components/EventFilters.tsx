"use client";

import type { EventType } from "./events/types";

const TYPE_OPTIONS: { value: "all" | EventType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "Workshop", label: "Workshops" },
  { value: "Retreat", label: "Retreats" },
  { value: "Online Session", label: "Online Sessions" },
];

export interface EventFiltersState {
  type: "all" | EventType;
  date: string;
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFiltersChange: (f: EventFiltersState) => void;
  dateOptions: { value: string; label: string }[];
}

export default function EventFilters({
  filters,
  onFiltersChange,
  dateOptions,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onFiltersChange({ ...filters, type: opt.value })
            }
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filters.type === opt.value
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-primary-200 hover:text-primary-700"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="flex-shrink-0">
        <label htmlFor="event-date-filter" className="sr-only">
          Filter by date
        </label>
        <select
          id="event-date-filter"
          value={filters.date}
          onChange={(e) =>
            onFiltersChange({ ...filters, date: e.target.value })
          }
          className="px-4 py-2 rounded-xl border border-neutral-200 bg-white text-neutral-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {dateOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
