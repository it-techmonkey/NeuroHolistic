interface StatusBadgeProps {
  status: 'confirmed' | 'completed' | 'cancelled' | 'scheduled' | 'no_show' | 'pending';
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<StatusBadgeProps['status'], string> = {
  confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  cancelled: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  no_show: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  pending: 'bg-slate-100 text-slate-500 ring-slate-400/20',
};

const STATUS_LABELS: Record<StatusBadgeProps['status'], string> = {
  confirmed: 'Confirmed',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  pending: 'Pending',
};

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ring-1 ring-inset ${STATUS_STYLES[status]} ${sizeClass}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
