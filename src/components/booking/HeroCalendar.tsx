"use client";

import { useState, useMemo, useCallback } from "react";

type HeroCalendarProps = {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
};

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
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

export default function HeroCalendar({
  selectedDate,
  onSelect,
  minDate,
}: HeroCalendarProps) {
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 select-none backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={goToPrev}
          disabled={!canGoPrev}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Previous month"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <span className="text-sm font-medium text-white">
          {MONTHS[month]} {year}
        </span>

        <button
          type="button"
          onClick={goToNext}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-white/60 transition-colors hover:bg-white/10"
          aria-label="Next month"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-1">
        {DAYS.map((day, i) => (
          <div
            key={`${day}-${i}`}
            className="py-1 text-center text-[10px] font-medium text-white/40"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((cell, i) => {
          if (!cell) {
            return <div key={`empty-${i}`} className="h-8" />;
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
                relative flex h-8 w-full items-center justify-center rounded-lg text-xs transition-all
                ${isSelected
                  ? "bg-indigo-500 font-semibold text-white"
                  : isDisabled
                    ? "cursor-not-allowed text-white/20"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              {date.getDate()}
              {isToday && !isSelected && (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
