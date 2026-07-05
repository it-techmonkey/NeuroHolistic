"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/translations/LanguageContext";

/* ─── Data ───────────────────────────────────────────────────────────────── */

// 3 original + 5 new = 8 total (shown 3 per page)
const REVIEW_VIDEO_IDS = [
  "p2Jkd8jzEcE",   // original 1
  "5QNC8cCo4hY",   // original 2
  "GtuinW2sDGU",   // original 3
  "x-NSML6xcZQ",  // new Short 1
  "y8gU1iBTogM",  // new Short 2
  "eToZSMUufnI",  // new 3
  "cyGJVcDc1bc",  // new 4
  "EaJBSGlGhm8",  // new 5
  "VfL87QN3Wes",  // new 6
];

const YT_CHANNEL = "https://www.youtube.com/channel/UCnONxQoFETCBOBEteFO1i4Q";
const PAGE_SIZE = 3;

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function YouTubeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function VideoEmbed({ videoId }: { videoId: string }) {
  const src = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172A] shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)]">
      <div className="relative aspect-video w-full">
        <iframe
          title="YouTube video review"
          src={src}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

/* ─── Navigation arrow buttons ───────────────────────────────────────────── */

function NavBtn({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous videos" : "Next videos"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm transition-all duration-200 hover:border-[#CBD5E1] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${direction === "prev" ? "rotate-180" : ""}`}
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    </button>
  );
}

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  heading: string;
  subtitle: string;
};

/* ─── Main ───────────────────────────────────────────────────────────────── */

export default function ClientReviewVideos({ heading, subtitle }: Props) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(REVIEW_VIDEO_IDS.length / PAGE_SIZE);
  const visibleIds = REVIEW_VIDEO_IDS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  /* ── Swipe support (mobile) ── */
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) setPage((p) => Math.min(p + 1, totalPages - 1)); // swipe left  → next
    else           setPage((p) => Math.max(p - 1, 0));               // swipe right → prev
    touchStartX.current = null;
  };

  return (
    <div className="mt-16 border-t border-[#EEF2F6] pt-16 md:mt-20 md:pt-20">
      {/* Heading */}
      <div className="mb-10 text-center md:mb-12">
        <h3 className="text-[24px] font-semibold tracking-tight text-[#0F172A] md:text-[30px]">{heading}</h3>
        <p className="mx-auto mt-4 max-w-[560px] text-[16px] leading-[1.7] text-[#475569] md:text-[17px]">{subtitle}</p>
      </div>

      {/* Navigation row — dir=ltr keeps arrows on the right in Arabic RTL */}
      <div dir="ltr" className="mb-6 flex items-center justify-between">
        <p className="text-[14px] text-[#94A3B8]">
          {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, REVIEW_VIDEO_IDS.length)} of {REVIEW_VIDEO_IDS.length} videos
        </p>
        <div className="flex gap-3">
          <NavBtn
            direction="prev"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
          />
          <NavBtn
            direction="next"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page === totalPages - 1}
          />
        </div>
      </div>

      {/* Video grid — dir=ltr keeps order identical in Arabic RTL mode */}
      <div
        dir="ltr"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {visibleIds.map((id) => (
          <VideoEmbed key={id} videoId={id} />
        ))}
      </div>
    </div>
  );
}
