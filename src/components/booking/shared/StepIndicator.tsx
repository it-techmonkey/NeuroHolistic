"use client";

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
};

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  const progress = totalSteps > 1
    ? ((currentStep - 1) / (totalSteps - 1)) * 100
    : 100;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">
          Step {currentStep} of {totalSteps}
        </span>
        {labels && labels[currentStep - 1] && (
          <span className="text-xs font-medium text-slate-600">
            {labels[currentStep - 1]}
          </span>
        )}
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#2B2F55] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {labels && labels.length > 1 && (
        <div className="mt-2 flex justify-between">
          {labels.map((label, i) => (
            <span
              key={label}
              className={`text-[11px] ${
                i + 1 <= currentStep
                  ? "font-medium text-slate-600"
                  : "text-slate-300"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
