"use client";

import { useState, useRef } from "react";
import { useLang } from "@/lib/translations/LanguageContext";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const REVIEW_VIDEO_IDS = ["p2Jkd8jzEcE", "5QNC8cCo4hY", "GtuinW2sDGU"] as const;

const YT_CHANNEL = "https://www.youtube.com/channel/UCnONxQoFETCBOBEteFO1i4Q";

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function YouTubeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* Standard YouTube landscape embed — unchanged style */
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

/* 4th card — same outer card size as the YouTube cards but video is portrait 3:4 centred inside */
function LocalVideoCard({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Clicking the overlay starts playback and removes the overlay */
  const handleOverlayClick = () => {
    if (!videoRef.current) return;
    videoRef.current.play();
  };

  return (
    /* Outer wrapper matches YouTube card dimensions: landscape aspect-video container */
    <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#0F172A] shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)]">
      <div className="relative aspect-video w-full flex items-center justify-center">

        {/* Portrait 3:4 video centred inside the landscape card */}
        <div
          className="relative h-full"
          style={{ aspectRatio: "3 / 4" }}
        >
          {/* Video — always has native controls so pause/scrub works naturally */}
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            preload="metadata"
            controls
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
          >
            <source src={src} type="video/mp4" />
          </video>

          {/* Red YouTube-style play overlay — covers video only while paused.
              pointer-events:none is removed so clicking it triggers play.
              Once playing, overlay is gone so native controls are fully usable. */}
          {!playing && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/25 cursor-pointer transition-colors hover:bg-black/10"
              onClick={handleOverlayClick}
            >
              <svg viewBox="0 0 68 48" className="w-16 h-auto drop-shadow-lg" aria-hidden="true">
                <path d="M66.52 7.74A8.55 8.55 0 0 0 60.52 1.7C55.22 0 34 0 34 0S12.78 0 7.48 1.7A8.55 8.55 0 0 0 1.48 7.74C0 13.12 0 24 0 24s0 10.88 1.48 16.26A8.55 8.55 0 0 0 7.48 46.3C12.78 48 34 48 34 48s21.22 0 26.52-1.7a8.55 8.55 0 0 0 6-6.04C68 34.88 68 24 68 24s0-10.88-1.48-16.26z" fill="#FF0000"/>
                <path d="M27 34l18-10L27 14v20z" fill="#fff"/>
              </svg>
            </div>
          )}
        </div>

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

/* ─── All items in order ─────────────────────────────────────────────────── */

type VideoItem =
  | { kind: "yt"; id: string }
  | { kind: "local"; src: string };

const ALL_ITEMS: VideoItem[] = [
  ...REVIEW_VIDEO_IDS.map((id) => ({ kind: "yt" as const, id })),
  { kind: "local", src: "/Testimonial video.mp4" },
];

const PAGE_SIZE = 3; // videos visible at one time

/* ─── Props ──────────────────────────────────────────────────────────────── */

type Props = {
  heading: string;
  subtitle: string;
};

/* ─── Main ───────────────────────────────────────────────────────────────── */

export default function ClientReviewVideos({ heading, subtitle }: Props) {
  const { t } = useLang();
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(ALL_ITEMS.length / PAGE_SIZE);
  const visibleItems = ALL_ITEMS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

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

      {/* Navigation row */}
      <div className="mb-6 flex items-center justify-end gap-3">
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

      {/* Video grid — dir=ltr keeps order identical in Arabic RTL mode */}
      <div
        dir="ltr"
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7 touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {visibleItems.map((item, i) =>
          item.kind === "yt" ? (
            <VideoEmbed key={item.id} videoId={item.id} />
          ) : (
            <LocalVideoCard key={`local-${i}`} src={item.src} />
          )
        )}
      </div>

      {/* YouTube Channel button */}
      <div className="mt-10 flex justify-center">
        <a
          href={YT_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-[#0F172A] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.3)] transition-all duration-300 hover:bg-[#1E293B] hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.4)]"
        >
          <YouTubeIcon className="h-5 w-5 text-white" />
          {t.testimonials.watchMoreOnYouTube}
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
    </div>
  );
}
