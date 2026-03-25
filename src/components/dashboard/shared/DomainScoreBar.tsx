interface DomainScoreBarProps {
  label: string;
  value: number;
  maxValue?: number;
}

export default function DomainScoreBar({ label, value, maxValue = 100 }: DomainScoreBarProps) {
  const pct = Math.min(Math.round((value / maxValue) * 100), 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
