'use client';

interface AssessmentInsightCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
  color?: 'primary' | 'secondary' | 'warning' | 'info';
}

export default function AssessmentInsightCard({
  title,
  value,
  description,
  icon,
  highlight = false,
  color = 'primary',
}: AssessmentInsightCardProps) {
  const colorClasses = {
    primary: 'border-primary-200 bg-primary-50',
    secondary: 'border-secondary-200 bg-secondary-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const textColorClasses = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    warning: 'text-amber-700',
    info: 'text-blue-700',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all ${
        highlight ? `${colorClasses[color]} ring-2 ring-offset-2 ring-${color}-300` : 'border-neutral-200 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        {icon && <div className="mt-1 flex-shrink-0">{icon}</div>}
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-600">{title}</p>
          <p className={`text-lg font-bold mt-1 ${highlight ? textColorClasses[color] : 'text-neutral-900'}`}>
            {value}
          </p>
          {description && <p className="text-xs text-neutral-600 mt-2">{description}</p>}
        </div>
      </div>
    </div>
  );
}
