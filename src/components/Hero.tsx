"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import HeroBookingForm from "@/components/booking/HeroBookingForm";
import { useLang } from "@/lib/translations/LanguageContext";

const HERO_VIDEO_SRC = "/hero-section-video.mp4";

/** How long the photo + text hero stays fully visible before the video slides back over it. */
const CONTENT_DISPLAY_MS = 3800;
/** How long the slide itself takes, in seconds (framer-motion transitions use seconds). */
const SLIDE_SECONDS = 0.9;
const SLIDE_EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Hero() {
  const { t, isArabic } = useLang();
  const h = t.hero;
  const prefersReducedMotion = useReducedMotion();

  // Default (from translations)
  let eyebrowLines = h.eyebrow.split("\n");
  let titleText = h.title;
  let taglineLines = h.tagline.split("\n");

  // Override with exact client-provided Arabic strings while preserving
  // the original structure, sizes and classes used for the English hero.
  if (isArabic) {
    // Client-provided Arabic text: "هناك شكلاً آخراً للوجود" and "معهد نيوروهوليستيك"
    eyebrowLines = ["هناك", "شكلاً آخراً"];
    titleText = "للوجود" as typeof h.title; // big heading text (keeps same h1 sizing)
    // Put the client-provided organisation name on the second tagline line
    taglineLines = ["", "معهد نيوروهوليستيك"];
  }

  // Use a dedicated Arabic hero image only for the Arabic version of the homepage.
  const heroImageSrc = isArabic
    ? "/images/pages/arabic version home page img.jpg"
    : "/images/pages/hero-img-main.webp";

  // The video is a slide-over panel that covers the photo+text hero below it.
  // `videoVisible` is the panel's position: true = covering the hero, false =
  // slid up out of the way. `videoBroken` permanently disables the whole
  // cycle (autoplay refused, file failed to load) and just leaves the
  // ordinary photo hero on screen — never leave the visitor staring at a
  // frozen or blank panel.
  const [videoVisible, setVideoVisible] = useState(!prefersReducedMotion);
  const [videoBroken, setVideoBroken] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Nothing here is guaranteed to line up with the actual visible screen: the
  // fixed navbar's spacer stacks under this section's own min-h-dvh (so the
  // hero can overshoot the first screen before any scroll happens), and a
  // short landscape phone can force the text taller still. `position: fixed`
  // sidesteps all of that — it is always relative to the true viewport, no
  // exceptions — and this observer keeps the buttons from floating over
  // whatever section comes after the hero once it's scrolled past.
  const [heroInView, setHeroInView] = useState(true);
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting), {
      threshold: 0.2,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const showVideoEnabled = !prefersReducedMotion && !videoBroken;

  useEffect(() => {
    return () => {
      if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    };
  }, []);

  // Someone who has asked their OS to reduce motion never gets the
  // auto-playing slideshow — they get the same static hero everyone else
  // reaches at the end of a cycle, permanently.
  useEffect(() => {
    if (prefersReducedMotion) setVideoVisible(false);
  }, [prefersReducedMotion]);

  // Manual navigation and the automatic cycle both end up here, so an arrow
  // click and the timer never fight each other — whichever fires last wins
  // cleanly instead of stacking a second pending transition on top.
  const goToVideo = useCallback(() => {
    if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => setVideoBroken(true));
    }
    setVideoVisible(true);
  }, []);

  const goToContent = useCallback(() => {
    if (cycleTimeoutRef.current) clearTimeout(cycleTimeoutRef.current);
    videoRef.current?.pause();
    setVideoVisible(false);
  }, []);

  const handleVideoEnded = useCallback(() => {
    goToContent();
  }, [goToContent]);

  // Fires once the slide animation itself finishes — whether that slide was
  // triggered automatically or by an arrow click. Used (rather than timing
  // off `onEnded`) so the hero is guaranteed to sit fully still and visible
  // for the whole display window, instead of counting the ~0.9s slide as
  // part of it.
  const handleSlideComplete = useCallback(() => {
    if (videoVisible) return; // just finished bringing the video back, nothing to schedule
    cycleTimeoutRef.current = setTimeout(goToVideo, CONTENT_DISPLAY_MS);
  }, [videoVisible, goToVideo]);

  // `autoPlay` alone is not a guarantee — some browsers refuse it. Without
  // this, a refusal would leave the panel frozen on the poster frame forever,
  // since nothing ever fires `ended` to start the cycle. A rejection here
  // falls back to the plain photo hero instead of a stuck black panel.
  useEffect(() => {
    if (!showVideoEnabled) return;
    videoRef.current?.play().catch(() => setVideoBroken(true));
  }, [showVideoEnabled]);

  // Pause the video while the tab is in the background rather than let it
  // keep decoding frames nobody can see, and pick the cycle back up on return.
  useEffect(() => {
    if (!showVideoEnabled) return;
    const handleVisibility = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.visibilityState === "hidden") {
        video.pause();
      } else if (videoVisible) {
        video.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [showVideoEnabled, videoVisible]);

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-dvh w-full items-center overflow-hidden bg-[#050608]"
    >
      <div className="absolute inset-0">
        <Image
          src={heroImageSrc}
          alt="A figure walking toward sunrise through a coastal cave"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,3,10,0.96)_0%,rgba(0,3,10,0.92)_31%,rgba(0,3,10,0.54)_55%,rgba(0,3,10,0.16)_76%,rgba(0,3,10,0.28)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#050608] to-transparent" />
      </div>

      <div className="relative z-10 w-full px-6 pb-14 pt-32 sm:px-10 sm:pb-16 sm:pt-32 md:px-[92px] lg:pt-36">
        <div className="flex min-h-[calc(100dvh-10rem)] max-md:min-h-0 w-full items-center">
          <div
            className="flex max-w-[650px] flex-col items-start text-left"
            style={{ fontFamily: "var(--font-hero-copy), 'Montserrat', system-ui, sans-serif" }}
          >
            <p className="text-[19px] font-normal uppercase tracking-[5] leading-[1.55] text-[#D3AB79] sm:text-[23px] md:text-[27px]">
              {eyebrowLines[0]}
              <br />
              {eyebrowLines[1]}
            </p>
            <h1
              className="mt-8 text-[50px] uppercase text-[#D3AB79] sm:mt-9 sm:text-[70px] md:text-[86px] lg:text-[90px]"
              style={{
                fontFamily: "var(--font-display), 'Lato', sans-serif",
                fontWeight: 700,
                letterSpacing: 0,
                lineHeight: 0.92,
              }}
            >
              {titleText}
            </h1>
            <div className="mt-10 h-px w-[72px] bg-[#D3AB79] sm:mt-11" />
            <p className="mt-7 text-[18px] font-normal uppercase leading-[1.6] tracking-[5] !text-[#D3AB79] sm:text-[21px] md:text-[23px]">
              {taglineLines[0]}
              <br />
              <span className="text-white">{taglineLines[1]}</span>
            </p>
            <div className="mt-5">
              <HeroBookingForm />
            </div>
          </div>
        </div>
      </div>

      {/*
        The video sits on its own full-bleed panel above the photo hero and
        slides sideways to reveal it, then slides back to cover it again — a
        panel sliding on the horizontal axis, not a crossfade and not the
        vertical slide this replaced.
        Once slid past the section's own `overflow-hidden`, the panel is
        fully clipped and out of the way, so it never blocks clicks on the
        booking form beneath it.
      */}
      {showVideoEnabled && (
        <motion.div
          className="absolute inset-0 z-20 bg-[#050608]"
          initial={false}
          animate={{ x: videoVisible ? "0%" : "-100%" }}
          transition={{ duration: SLIDE_SECONDS, ease: SLIDE_EASE }}
          onAnimationComplete={handleSlideComplete}
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            src={HERO_VIDEO_SRC}
            poster={heroImageSrc}
            muted
            autoPlay
            playsInline
            preload="auto"
            disablePictureInPicture
            onEnded={handleVideoEnded}
            onError={() => setVideoBroken(true)}
            className="object-cover object-center"
            // globals.css has a blanket `video { max-width: 100%; height: auto }`
            // reset for stray, unstyled <video> tags elsewhere in the app. It
            // isn't wrapped in a Tailwind @layer, and unlayered CSS always
            // wins over layered utility classes regardless of specificity —
            // so `h-full w-full` here was silently losing to it, collapsing
            // this video to its native 16:9 box instead of filling the hero.
            // An inline style beats any stylesheet rule, layered or not.
            style={{ width: "100%", height: "100%", maxWidth: "none" }}
          />
          {/* Same darkening as the photo layer, so the transition never has a brightness jump. */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,3,10,0.55)_0%,rgba(0,3,10,0.4)_31%,rgba(0,3,10,0.22)_55%,rgba(0,3,10,0.08)_76%,rgba(0,3,10,0.14)_100%)]" />
        </motion.div>
      )}

      {/*
        Manual navigation, always Left = video / Right = the photo hero
        regardless of which one is currently showing. Clicking the side
        already on screen still does something useful — Left replays the
        video from the start, Right gives the photo hero another full
        display window — rather than doing nothing.
      */}
      {/*
        Deliberately centered at the bottom on every screen size, rather than
        the more usual bottom-right corner — the site's WhatsApp bubble
        (FloatingWhatsAppButton) lives fixed in that corner on every page, and
        a right-aligned pair here would sit on top of it from tablet width up.

        `position: fixed` rather than anchored to this section, because this
        section's own rendered height is not reliably the viewport's: Navbar
        renders `fixed` over a spacer div (Navbar.tsx) that this section's
        min-h-dvh sits below, so the two stack and the section overshoots the
        first screen by the spacer's height before any scroll happens. A
        short viewport — a phone turned sideways — can additionally force the
        hero's own text taller than min-h-dvh, pushing it further still.
        Fixed positioning is always relative to the true viewport regardless
        of any of that. The `heroInView` gate (an IntersectionObserver on the
        section, below) is what stops it from being fixed permanently —
        without it these would float over every section on the page once the
        visitor scrolled past the hero.
      */}
      {showVideoEnabled && heroInView && (
        <div className="fixed inset-x-0 bottom-6 z-30 flex justify-center gap-3 sm:bottom-8">
          <button
            type="button"
            onClick={goToVideo}
            aria-label={videoVisible ? "Replay video" : "Show video"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3AB79] sm:h-12 sm:w-12"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={goToContent}
            aria-label={videoVisible ? "Skip to hero" : "Show hero"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D3AB79] sm:h-12 sm:w-12"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      )}
    </motion.section>
  );
}
