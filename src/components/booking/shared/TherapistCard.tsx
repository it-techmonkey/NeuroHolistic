"use client";

import Image from "next/image";

type TherapistCardProps = {
  therapist: {
    id: string;
    slug: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
  selected: boolean;
  onSelect: () => void;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TherapistCard({
  therapist,
  selected,
  onSelect,
}: TherapistCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all
        ${selected
          ? "border-[#2B2F55] bg-[#2B2F55]/[0.04]"
          : "border-slate-200 bg-white hover:border-slate-300"
        }
      `}
    >
      {therapist.avatarUrl ? (
        <Image
          src={therapist.avatarUrl}
          alt={therapist.name}
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
          {getInitials(therapist.name)}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-800">
          {therapist.name}
        </p>
        <p className="truncate text-sm text-slate-500">
          {therapist.role}
        </p>
      </div>

      <div
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors
          ${selected
            ? "border-[#2B2F55] bg-[#2B2F55]"
            : "border-slate-300"
          }
        `}
      >
        {selected && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5L4.5 7.5L8 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  );
}
