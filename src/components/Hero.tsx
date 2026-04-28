"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import HeroBookingForm from "@/components/booking/HeroBookingForm";
import { CampaignBannerFigure } from "@/components/CampaignBanner";
import { useLang } from "@/lib/translations/LanguageContext";

/** Show framed banner first, then neural — loop. Crossfade duration (ms). */
const HERO_PHASE_BANNER_MS = 4500;
const HERO_PHASE_NEURAL_MS = 6500;
const HERO_VISUAL_CROSSFADE_S = 0.95;

export default function Hero() {
  const { t, isArabic } = useLang();

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-dvh w-full flex-col overflow-x-clip overflow-y-visible bg-[linear-gradient(135deg,#0B1028_0%,#0A132B_48%,#060710_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-120px] top-[8%] h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(152,170,255,0.18)_0%,rgba(6,7,16,0)_62%)] blur-[10px] sm:right-[-80px] sm:h-[420px] sm:w-[420px] md:right-[-40px] md:h-[520px] md:w-[520px]" />
        <div className="hero-noise-texture absolute inset-0 opacity-[0.045]" />
      </div>

      <div className="relative z-10 flex w-full flex-1 flex-col justify-center px-6 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-10">
        <div className="mx-auto grid w-full max-w-[1200px] items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 max-w-[650px] text-center lg:order-1 lg:text-left">
            <h1
              className={`${isArabic ? 'leading-[1.35] tracking-normal' : 'leading-[1.05] tracking-[-0.035em]'} text-[#EAF0FF]`}
              style={
                isArabic
                  ? { fontFamily: "var(--font-arabic), 'Tajawal', sans-serif" }
                  : { fontFamily: "var(--font-display), 'Quicksand', system-ui, sans-serif" }
              }
            >
              <span
                className={`block text-[26px] font-normal text-[#E2E9FF] sm:text-[44px] md:text-[66px] lg:text-[55px] ${isArabic ? 'font-arabic' : ''} ${isArabic ? '' : 'whitespace-nowrap'}`}
              >
                {t.hero.resetFromWithin}
              </span>
              <span
                className={`block text-[26px] text-white sm:text-[40px] md:text-[60px] lg:text-[55px] ${isArabic ? 'font-arabic' : ''} ${isArabic ? '' : 'whitespace-nowrap'}`}
              >
                {t.hero.transformYourLife}
              </span>
            </h1>
            <p className={`mt-6 mx-auto lg:mx-0 max-w-[50ch] text-[15px] sm:text-[16px] md:text-[18px] ${isArabic ? 'leading-[2]' : 'leading-[1.7]'} text-[#C3CBE8] lg:text-[17.5px]`}>
              {t.hero.designedForResults}
            </p>
            <HeroBookingForm />
          </div>

          <div className="relative order-1 flex justify-center lg:order-2 lg:justify-end">
            <HeroRotatingVisual />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function HeroRotatingVisual() {
  const [phase, setPhase] = useState<"banner" | "neural">("banner");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let cancelled = false;
    timersRef.current = [];

    const clearTimers = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const afterNeural = () => {
      const id = setTimeout(() => {
        if (cancelled) return;
        setPhase("banner");
        afterBanner();
      }, HERO_PHASE_NEURAL_MS);
      timersRef.current.push(id);
    };

    const afterBanner = () => {
      const id = setTimeout(() => {
        if (cancelled) return;
        setPhase("neural");
        afterNeural();
      }, HERO_PHASE_BANNER_MS);
      timersRef.current.push(id);
    };

    // Start on banner; first swap to neural after banner duration
    afterBanner();

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, []);

  const showBanner = phase === "banner";

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[min(96vw,640px)] lg:max-w-[min(640px,52vw)]">
      {/* Single aspect box — no layout shift; layers crossfade */}
      <div className="relative aspect-[2/1] w-full overflow-visible">
        <motion.div
          className="absolute inset-0 z-10 overflow-hidden rounded-2xl ring-1 ring-white/10 sm:rounded-3xl"
          initial={false}
          animate={{ opacity: showBanner ? 1 : 0 }}
          transition={{ duration: HERO_VISUAL_CROSSFADE_S, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: showBanner ? "auto" : "none" }}
        >
          <CampaignBannerFigure
            fillParent
            priority
            sizes="(max-width: 640px) 96vw, (max-width: 1024px) 72vw, 640px"
          />
        </motion.div>

        <motion.div
          className="absolute inset-0 z-20 flex items-center justify-center overflow-visible"
          initial={false}
          animate={{ opacity: showBanner ? 0 : 1 }}
          transition={{ duration: HERO_VISUAL_CROSSFADE_S, ease: [0.22, 1, 0.36, 1] }}
          style={{ pointerEvents: showBanner ? "none" : "auto" }}
        >
          <div className="relative flex h-[112%] w-[112%] max-h-none min-h-0 origin-center items-center justify-center sm:h-[118%] sm:w-[118%] md:h-[122%] md:w-[122%]">
            <NeuralGraphic compact />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Neural hero visual — optional `compact` fits inside shared 2:1 slot without frame. */
function NeuralGraphic({ compact }: { compact?: boolean }) {
  const { t } = useLang();

  return (
    <div
      className={
        compact
          ? "relative flex h-full min-h-0 w-full items-center justify-center overflow-visible"
          : "relative mx-auto flex aspect-square w-full max-h-[min(72vw,420px)] items-center justify-center sm:max-h-[min(70vw,460px)] lg:max-h-[480px]"
      }
    >
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.6, 0.35],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={
          compact
            ? "absolute h-[min(52%,240px)] w-[min(52%,240px)] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.22)_0%,rgba(148,80,255,0.16)_40%,rgba(6,7,16,0)_70%)] blur-[48px] sm:h-[min(58%,280px)] sm:w-[min(58%,280px)] sm:blur-[62px] md:blur-[78px]"
            : "absolute h-[min(42%,180px)] w-[min(42%,180px)] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.2)_0%,rgba(148,80,255,0.15)_40%,rgba(6,7,16,0)_70%)] blur-[40px] sm:h-[min(48%,220px)] sm:w-[min(48%,220px)] sm:blur-[55px] md:blur-[70px]"
        }
      />

      <svg
        className={
          compact
            ? "absolute h-full w-full max-h-full max-w-full min-h-0 min-w-0"
            : "absolute h-[95%] w-[95%] max-h-full max-w-full min-h-0 min-w-0"
        }
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="hero-goo" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>

        <g filter="url(#hero-goo)">
          {[...Array(6)].map((_, i) => (
            <motion.circle
              key={`blob-${i}`}
              cx="250"
              cy="250"
              r={(compact ? 46 : 42) + i * 5}
              fill="rgba(234,240,255,0.85)"
              animate={{
                x: [0, Math.sin(i * 1.5) * (compact ? 62 : 55), 0],
                y: [0, Math.cos(i * 1.5) * (compact ? 62 : 55), 0],
                scale: [1, 1.25, 0.9, 1],
              }}
              transition={{ duration: 8 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </g>

        <g className="opacity-15">
          <circle
            cx="250"
            cy="250"
            r={compact ? "210" : "195"}
            stroke="white"
            strokeWidth="0.5"
            strokeDasharray="6 12"
          />
          <motion.circle
            cx="250"
            cy="250"
            r={compact ? "210" : "195"}
            stroke="#94A3B8"
            strokeWidth="1"
            strokeDasharray="1 100"
            strokeLinecap="round"
            animate={{ rotate: 360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center" }}
          />
        </g>
      </svg>

      <div
        className={
          compact
            ? "absolute top-[3%] right-[1.5%] rounded-[14px] border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-md sm:top-[2%] sm:rounded-[16px] sm:p-2.5"
            : "absolute top-[4%] right-[2%] rounded-[12px] border border-white/10 bg-white/5 p-1.5 shadow-lg backdrop-blur-md sm:rounded-[14px] sm:p-2"
        }
      >
        <div className="flex items-center gap-1">
          <div className={`relative ${compact ? "h-2 w-2 sm:h-3 sm:w-3" : "h-1.5 w-1.5 sm:h-2.5 sm:w-2.5"}`}>
            <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-400 opacity-20" />
            <div className={`absolute rounded-full bg-cyan-300 ${compact ? "inset-1 h-1.5 w-1.5 sm:inset-1.5 sm:h-2 sm:w-2" : "inset-0.5 h-1 w-1"}`} />
          </div>
          <span
            className={`font-medium uppercase tracking-[0.15em] text-white/70 ${compact ? "text-[7px] sm:text-[10px]" : "text-[6px] sm:text-[9px]"}`}
          >
            {t.hero.status}
          </span>
        </div>
        <div
          className={`mt-0.5 font-light leading-tight text-white ${compact ? "text-[10px] sm:text-[12px]" : "text-[9px] sm:text-[11px]"}`}
        >
          {t.hero.systemRestored}
        </div>
      </div>

      <div
        className={
          compact
            ? "absolute bottom-[3%] left-[1.5%] rounded-[14px] border border-white/10 bg-white/5 p-2 shadow-lg backdrop-blur-md sm:bottom-[2%] sm:rounded-[16px] sm:p-3"
            : "absolute bottom-[4%] left-[2%] rounded-[12px] border border-white/10 bg-white/5 p-1.5 shadow-lg backdrop-blur-md sm:rounded-[14px] sm:p-2.5"
        }
      >
        <div
          className={`font-medium uppercase tracking-[0.15em] text-white/70 ${compact ? "mb-0.5 text-[7px] sm:mb-1 sm:text-[10px]" : "mb-0.5 text-[6px] sm:mb-1 sm:text-[9px]"}`}
        >
          {t.hero.neuralBalance}
        </div>
        <div className={`flex items-end gap-0.5 ${compact ? "h-3.5 gap-1 sm:h-5 sm:gap-1.5" : "h-3 sm:h-4 sm:gap-1"}`}>
          {[0.5, 0.8, 1, 0.7, 0.9, 0.6].map((h, i) => (
            <motion.div
              key={i}
              className={`rounded-t-[1px] bg-gradient-to-t from-blue-500/80 to-blue-400 ${compact ? "w-0.5 sm:w-1.5" : "w-0.5 sm:w-1"}`}
              animate={{ height: [`${h * 100}%`, `${(1 - h) * 100}%`, `${h * 100}%`] }}
              transition={{ duration: 2.2 + i * 0.25, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
