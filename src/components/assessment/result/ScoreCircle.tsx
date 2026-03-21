'use client';

interface ScoreCircleProps {
  score: number; // 0-100
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreCircle({ score, label, size = 'lg' }: ScoreCircleProps) {
  const radius = size === 'lg' ? 60 : size === 'md' ? 45 : 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-40 h-40',
    lg: 'w-56 h-56',
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
  };

  // Color based on score
  let color = '#10b981'; // emerald (good)
  if (score >= 60) color = '#f97316'; // orange (high)
  if (score >= 80) color = '#ef4444'; // red (very high)

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={size === 'lg' ? 240 : size === 'md' ? 180 : 140}
          height={size === 'lg' ? 240 : size === 'md' ? 180 : 140}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>

        {/* Score text */}
        <div className="absolute flex flex-col items-center">
          <span className={`font-bold ${textSizes[size]}`} style={{ color }}>
            {Math.round(score)}
          </span>
          <span className="text-xs text-slate-500 mt-1">out of 100</span>
        </div>
      </div>

      {/* Label */}
      <h3 className="text-center font-semibold text-slate-900">{label}</h3>
    </div>
  );
}
