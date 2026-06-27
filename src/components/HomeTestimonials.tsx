"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

/* ─── Data ───────────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  {
    text: "I suffered from insomnia for 15 years during which I tried many kinds of therapies and medications. I was about to lose hope, but I met Dr. Fawzia. Now I sleep like a baby.",
    name: "A. J",
    profession: "UN Employee",
    location: "Beirut, Lebanon",
    initials: "AJ",
  },
  {
    text: "I suffered from severe panic attacks for three years. They affected every aspect of my life. The NeuroHolistic Method™ completely changed my life, my panic attacks disappeared completely, and I became calmer, stronger, and finally able to enjoy life again.",
    name: "Basma A",
    profession: "House Wife",
    location: "Dubai, UAE",
    initials: "BA",
  },
  {
    text: "After being turned down by multiple institutions due to the complexity and rarity of my cancer case, I refused to believe there was no solution. Then I found Dr. Fawzia and the NeuroHolistic Method™. What I experienced transformed not only my condition, but my entire life.",
    name: "S. T",
    profession: "Clinic Manager",
    location: "Dubai, UAE",
    initials: "ST",
  },
  {
    text: "Everyone thought I lived a glamorous life. No one knew how miserable I truly was inside — emotionally numb, disconnected, and dissociated from life. Dr. Fawzia helped me reconnect with myself, love myself again, and finally feel alive. Today, I am living the happiest chapter of my life.",
    name: "V. D",
    profession: "Entrepreneur",
    location: "Pristina, Kosovo",
    initials: "VD",
  },
  {
    text: "I used to look at happily married women and wonder how they did it. Deep inside, I never believed that kind of happiness could happen to me. Thanks to Dr. Fawzia, today I am happily married, deeply fulfilled, and blessed with my beautiful son.",
    name: "Y. Y",
    profession: "Dentist",
    location: "Trabzon, Turkey",
    initials: "YY",
  },
  {
    text: "For years, I lived with pain in every part of my body. I was constantly sick, emotionally exhausted, deeply dissatisfied, and disconnected from my husband, my children, and myself. Through the NeuroHolistic Method™ and Dr. Fawzia's guidance, I healed in ways I never imagined possible. Today, I feel healthy, peaceful, connected, and genuinely happy with my life and my family again.",
    name: "S. B",
    profession: "Architect",
    location: "Paris, France",
    initials: "SB",
  },
  {
    text: "I was drowning in debt, overwhelmed by pressure, fear, and constant failure. I had lost confidence in myself. Through the NeuroHolistic Method™ and Dr. Fawzia's guidance, everything began to change from within. Now, I lead a successful business, live with clarity and confidence, and have built a life I once thought was impossible.",
    name: "H. K",
    profession: "Entrepreneur",
    location: "Florida, USA",
    initials: "HK",
  },
];

/* ─── Marquee constants ──────────────────────────────────────────────────── */
// Cards are 340px wide — at 1440px viewport ~4 cards visible edge-to-edge
const CARD_W = 340;
const GAP = 16;
const LOOP_PX = TESTIMONIALS.length * (CARD_W + GAP); // 7 × 356 = 2492

const DOUBLED = [...TESTIMONIALS, ...TESTIMONIALS];

/* ─── Icons ──────────────────────────────────────────────────────────────── */

function VolumeOnIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

function VolumeOffIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/* ─── Video Section ──────────────────────────────────────────────────────── */

function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => { });
  }, []);

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <div className="flex flex-col items-center gap-5 px-6 md:px-12">

      {/* ── Video — centered ── */}
      <div className="relative w-full max-w-[440px]">
        {/* Mute / unmute — top-right */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/75"
        >
          {muted ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>

        <div
          className="overflow-hidden rounded-2xl bg-[#0F172A] shadow-[0_24px_60px_-16px_rgba(15,23,42,0.4)]"
          style={{ aspectRatio: "3 / 4" }}
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            autoPlay
            style={{ display: "block" }}
          >
            <source src="/Testimonial video.mp4" type="video/mp4" />
          </video>
        </div>
      </div>

      {/* ── Text + YouTube — centered below video, tight gap ── */}
      <div className="flex flex-col items-center text-center gap-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#6366F1]">
          Client Stories
        </p>

        {/* YouTube button */}
        <a
          id="home-testimonials-youtube-link"
          href="https://www.youtube.com/results?search_query=fawzia+yassmina"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full bg-[#1E293B] px-7 py-3.5 text-[14px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(15,23,42,0.25)] transition-all duration-300 hover:bg-[#0F172A] hover:shadow-[0_12px_32px_-6px_rgba(15,23,42,0.35)]"
        >
          <YouTubeIcon />
          Watch on YouTube
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

/* ─── Testimonial Card — dark #0B0F2B, 4:3 ratio ────────────────────────── */

function TestimonialCard({
  text,
  name,
  profession,
  location,
  initials,
}: (typeof TESTIMONIALS)[0]) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[16px] border border-[#1A2040] bg-[#0B0F2B] transition-all duration-300 hover:border-[#2A3460] hover:shadow-[0_12px_32px_-8px_rgba(11,15,43,0.5)]"
      style={{ height: "280px" }}
    >
      {/* Body */}
      <div className="flex flex-1 flex-col justify-start p-5">
        {/* Large decorative quote — top right, solid white */}
        <div className="mb-1 flex justify-end">
          <span
            className="select-none text-[52px] leading-none text-white"
            style={{ fontFamily: "Georgia, serif", lineHeight: 0.75 }}
            aria-hidden="true"
          >
            &ldquo;
          </span>
        </div>

        {/* Testimonial text — clamped to 4 lines so footer always shows */}
        <blockquote
          className="text-[14px] leading-[1.75] text-[#94A3B8]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 4,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          &ldquo;{text}&rdquo;
        </blockquote>
      </div>

      {/* Footer — always pinned to bottom */}
      <div className="flex items-center gap-3 border-t border-[#1A2040] bg-[#0D1230] px-5 py-4 pb-5">
        {/* Initials avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1E2A50] text-[12px] font-bold tracking-wide text-white ring-1 ring-white/20">
          {initials}
        </div>
        {/* Name / profession / location — all white, clear hierarchy */}
        <div className="min-w-0">
          <p className="truncate text-[13px] font-bold text-white">{name}</p>
          <p className="truncate text-[12px] font-medium text-white/85">{profession}</p>
          <p className="truncate text-[11px] text-white/65">{location}</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Continuous Marquee — true 100vw, cards bleed off screen edges ──────── */

function TestimonialsMarquee() {
  return (
    <>
      <style>{`
        @keyframes nh-marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-${LOOP_PX}px); }
        }
        .nh-marquee-track {
          animation: nh-marquee 60s linear infinite;
        }
        .nh-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/*
        Break out of parent max-w-[1200px] container using the negative-margin
        trick so the carousel spans 100vw and cards vanish at both screen edges.
      */}
      <div
        className="overflow-hidden py-3"
        style={{
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        <div
          className="nh-marquee-track flex items-stretch"
          style={{ gap: `${GAP}px`, width: `${LOOP_PX * 2}px` }}
        >
          {DOUBLED.map((t, i) => (
            <div key={i} style={{ width: `${CARD_W}px`, flexShrink: 0 }}>
              <TestimonialCard {...t} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* ─── Mobile Carousel — auto-scroll + native touch drag ─────────────────── */

/* Card width on mobile — slightly smaller to show ~1.3 cards at 375px */
const CARD_MOBILE_W = 280;
const GAP_MOBILE = 14;
/* Loop point = one full set of 7 cards */
const LOOP_MOBILE = TESTIMONIALS.length * (CARD_MOBILE_W + GAP_MOBILE);
/* Duplicate for seamless loop */
const DOUBLED_MOBILE = [...TESTIMONIALS, ...TESTIMONIALS];

function MobileCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const touching = useRef(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const tick = () => {
      if (!touching.current) {
        el.scrollLeft += 0.8; // ~48 px/s at 60 fps — comfortable reading pace
        /* Seamless loop: jump back when we've scrolled one full set */
        if (el.scrollLeft >= LOOP_MOBILE) {
          el.scrollLeft -= LOOP_MOBILE;
        }
      }
      rafId.current = requestAnimationFrame(tick);
    };

    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      /* Native scroll for touch drag; scrollbar hidden */
      className="scrollbar-hide flex overflow-x-auto"
      style={{
        gap: `${GAP_MOBILE}px`,
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingBottom: "8px",
      }}
      onTouchStart={() => { touching.current = true; }}
      onTouchEnd={() => { touching.current = false; }}
      onTouchCancel={() => { touching.current = false; }}
    >
      {DOUBLED_MOBILE.map((t, i) => (
        <div key={i} style={{ width: `${CARD_MOBILE_W}px`, flexShrink: 0 }}>
          <TestimonialCard {...t} />
        </div>
      ))}
    </div>
  );
}



export default function HomeTestimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="w-full overflow-hidden bg-white py-8 md:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1200px]"
      >
        {/* ── Section Header ── */}
        <motion.div
          variants={itemVariants}
          className="mb-10 flex flex-col items-center px-6 text-center md:px-12"
        >
          <h2 className="mb-3 max-w-[640px] text-[28px] font-semibold leading-[1.35] tracking-tight text-[#0F172A] md:text-[38px]">
            Stories of Real Transformation
          </h2>
          {/* <p className="max-w-[520px] text-[15px] leading-[1.8] text-[#475569]">
            Hear directly from those whose lives were changed by the NeuroHolistic Method™.
          </p> */}
        </motion.div>

        {/* ── Video Left + Text/YouTube Right ── */}
        <motion.div variants={itemVariants}>
          <VideoSection />
        </motion.div>

        {/* ── Testimonials heading ── */}
        <motion.div variants={itemVariants} className="mt-14">
          <div className="mb-7 flex flex-col items-center px-6 text-center md:px-12">
            <h3 className="text-[22px] font-semibold tracking-tight text-[#0F172A] md:text-[28px]">
              What Our Clients Say
            </h3>
          </div>
        </motion.div>
      </motion.div>

      {/*
        Desktop (md+): CSS marquee — full 100vw, cards bleed off both edges.
        Mobile: touch-draggable auto-scroll carousel — no layout change for desktop.
      */}
      <div className="hidden md:block">
        <TestimonialsMarquee />
      </div>
      <div className="block md:hidden">
        <MobileCarousel />
      </div>
    </section>
  );
}
