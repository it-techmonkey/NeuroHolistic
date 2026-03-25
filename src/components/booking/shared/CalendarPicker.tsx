"use client";

import { useState, useMemo, useCallback } from "react";

type CalendarPickerProps = {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function CalendarPicker({
  selectedDate,
  onSelect,
  minDate,
}: CalendarPickerProps) {
  const today = useMemo(() => stripTime(new Date()), []);
  const effectiveMin = useMemo(() => (minDate ? stripTime(minDate) : today), [minDate, today]);

  const [viewMonth, setViewMonth] = useState(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: Date; inMonth: boolean } | null> = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), inMonth: true });
    }

    return days;
  }, [year, month]);

  const canGoPrev = useMemo(() => {
    const prevMonthEnd = new Date(year, month, 0);
    return prevMonthEnd >= effectiveMin;
  }, [year, month, effectiveMin]);

  const goToPrev = useCallback(() => {
    if (canGoPrev) {
      setViewMonth(new Date(year, month - 1, 1));
    }
  }, [canGoPrev, year, month]);

  const goToNext = useCallback(() => {
    setViewMonth(new Date(year, month + 1, 1));
  }, [year, month]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 select-none">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-sm font-semibold tracking-wide text-slate-800">
          {MONTHS[month]} {year}
        </span>

        <button
          type="button"
          onClick={goToNext}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
          aria-label="Next month"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-xs font-medium text-slate-400"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} />;
          }

          const { date } = cell;
          const isDisabled = date < effectiveMin;
          const isSelected = selectedDate !== null && isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelect(date)}
              className={`
                relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors
                ${isSelected
                  ? "bg-[#2B2F55] font-semibold text-white"
                  : isDisabled
                    ? "cursor-not-allowed text-slate-300"
                    : "text-slate-700 hover:bg-slate-100"
                }
              `}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#2B2F55]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
