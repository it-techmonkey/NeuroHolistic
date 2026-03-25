import { Card } from '@/components/ui/Card';

interface ProgramProgressProps {
  totalSessions: number;
  completedSessions: number;
  remainingSessions: number;
  programType: 'private' | 'group' | null;
}

export default function ProgramProgress({
  totalSessions,
  completedSessions,
  remainingSessions,
  programType,
}: ProgramProgressProps) {
  const pct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const typeLabel =
    programType === 'private' ? 'Private' : programType === 'group' ? 'Group' : null;

  return (
    <Card className="p-6" border>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Program Progress
        </h3>
        {typeLabel && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
            {typeLabel}
          </span>
        )}
      </div>

      <div className="flex items-end gap-1 mb-4">
        <span className="text-4xl font-bold text-[#2B2F55] leading-none">{pct}%</span>
        <span className="text-sm text-slate-400 mb-0.5">complete</span>
      </div>

      <div className="h-3 bg-slate-200 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[#2B2F55] rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">
          <span className="font-semibold text-slate-900">{completedSessions}</span> of{' '}
          {totalSessions} sessions completed
        </span>
        <span className="text-slate-500">{remainingSessions} remaining</span>
      </div>
    </Card>
  );
}
