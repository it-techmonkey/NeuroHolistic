"use client";

type TimeSlotGridProps = {
  slots: Array<{ value: string; display: string }>;
  selectedTime: string;
  availableSlots: string[];
  onSelect: (time: string) => void;
  loading?: boolean;
};

function SkeletonSlot() {
  return (
    <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
  );
}

export default function TimeSlotGrid({
  slots,
  selectedTime,
  availableSlots,
  onSelect,
  loading = false,
}: TimeSlotGridProps) {
  if (loading) {
    return (
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonSlot key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        No time slots available for this date.
      </p>
    );
  }

  const availableSet = new Set(availableSlots);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">
          Available times
        </p>
        <span className="text-xs text-slate-400">(UAE)</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {slots.map((slot) => {
          const isAvailable = availableSet.has(slot.value);
          const isSelected = slot.value === selectedTime;

          return (
            <button
              key={slot.value}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(slot.value)}
              className={`
                rounded-xl px-2 py-2.5 text-sm font-medium transition-colors
                ${isSelected
                  ? "bg-[#2B2F55] text-white"
                  : isAvailable
                    ? "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    : "cursor-not-allowed border border-slate-100 bg-slate-50 text-slate-300 line-through"
                }
              `}
            >
              {slot.display}
            </button>
          );
        })}
      </div>
    </div>
  );
}
