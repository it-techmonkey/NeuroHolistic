"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";
import ClientReviewVideos from "@/components/ClientReviewVideos";

/* ─── Clean UI Icons ─────────────────────────────────────────────────────── */

function QuoteIcon() {
  return (
    <svg className="h-8 w-8 text-[#E2E8F0]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      className={`h-4 w-4 ${filled ? "fill-[#F59E0B] text-[#F59E0B]" : "fill-transparent text-[#CBD5E1]"}`}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

/* ─── Data ───────────────────────────────────────────────────────────────── */

const TESTIMONIALS = [
  /* — Real testimonials — */
  {
    text: "I suffered from insomnia for 15 years during which I tried many kinds of therapies and medications. I was about to lose hope, but I met Dr. Fawzia. Now I sleep like a baby.",
    name: "A. J",
    role: "UN Employee",
    rating: 5,
    avatar: "AJ",
    outcome: "",
    location: "Beirut, Lebanon",
  },
  {
    text: "I suffered from severe panic attacks for three years. They affected every aspect of my life. The NeuroHolistic Method™ completely changed my life, my panic attacks disappeared completely, and I became calmer, stronger, and finally able to enjoy life again.",
    name: "Basma A",
    role: "House Wife",
    rating: 5,
    avatar: "BA",
    outcome: "",
    location: "Dubai, UAE",
  },
  {
    text: "After being turned down by multiple institutions due to the complexity and rarity of my cancer case, I refused to believe there was no solution. Then I found Dr. Fawzia and the NeuroHolistic Method™. What I experienced transformed not only my condition, but my entire life.",
    name: "S. T",
    role: "Clinic Manager",
    rating: 5,
    avatar: "ST",
    outcome: "",
    location: "Dubai, UAE",
  },
  {
    text: "Everyone thought I lived a glamorous life. No one knew how miserable I truly was inside — emotionally numb, disconnected, and dissociated from life. Dr. Fawzia helped me reconnect with myself, love myself again, and finally feel alive. Today, I am living the happiest chapter of my life.",
    name: "V. D",
    role: "Entrepreneur",
    rating: 5,
    avatar: "VD",
    outcome: "",
    location: "Pristina, Kosovo",
  },
  {
    text: "I used to look at happily married women and wonder how they did it. Deep inside, I never believed that kind of happiness could happen to me. Thanks to Dr. Fawzia, today I am happily married, deeply fulfilled, and blessed with my beautiful son.",
    name: "Y. Y",
    role: "Dentist",
    rating: 5,
    avatar: "YY",
    outcome: "",
    location: "Trabzon, Turkey",
  },
  {
    text: "For years, I lived with pain in every part of my body. I was constantly sick, emotionally exhausted, deeply dissatisfied, and disconnected from my husband, my children, and myself. Through the NeuroHolistic Method™ and Dr. Fawzia's guidance, I healed in ways I never imagined possible. Today, I feel healthy, peaceful, connected, and genuinely happy with my life and my family again.",
    name: "S. B",
    role: "Architect",
    rating: 5,
    avatar: "SB",
    outcome: "",
    location: "Paris, France",
  },
  {
    text: "I was drowning in debt, overwhelmed by pressure, fear, and constant failure. I had lost confidence in myself. Through the NeuroHolistic Method™ and Dr. Fawzia's guidance, everything began to change from within. Now, I lead a successful business, live with clarity and confidence, and have built a life I once thought was impossible.",
    name: "H. K",
    role: "Entrepreneur",
    rating: 5,
    avatar: "HK",
    outcome: "",
    location: "Florida, USA",
  },
];

const PAGE_SIZE = 3;

/* ─── Sub-Components ─────────────────────────────────────────────────────── */

function StarRating({ stars }: { stars: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, index) => (
          <StarIcon key={index} filled={index < stars} />
        ))}
      </div>
    </div>
  );
}

function TestimonialCard({
  text,
  name,
  role,
  rating,
  avatar,
  outcome,
  location,
}: (typeof TESTIMONIALS)[0]) {
  const badge = outcome || location;
  return (
    <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] border border-[#E2E8F0] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-15px_rgba(15,23,42,0.08)]">
      <div className="p-6 md:p-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <QuoteIcon />
          {badge && (
            <span className="inline-flex items-center rounded-full bg-[#F1F5F9] px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-[#475569] transition-colors group-hover:bg-[#EEF2FF] group-hover:text-[#6366F1]">
              {badge}
            </span>
          )}
        </div>

        <StarRating stars={rating} />

        <blockquote className="mt-3 text-[16px] leading-[1.75] text-[#334155]">
          "{text}"
        </blockquote>
      </div>

      <div className="mt-auto border-t border-[#F1F5F9] bg-[#FAFBFF] px-6 py-5 transition-colors group-hover:bg-white md:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-[14px] font-medium tracking-wide text-white shadow-sm">
            {avatar}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-[#0F172A]">{name}</p>
            <p className="text-[14px] text-[#64748B]">{role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Nav button ─────────────────────────────────────────────────────────── */

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
      aria-label={direction === "prev" ? "Previous testimonials" : "Next testimonials"}
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

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function Testimonials() {
  const { t } = useLang();
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(TESTIMONIALS.length / PAGE_SIZE);
  const visible = TESTIMONIALS.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  /* ── Swipe support (mobile) ── */
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 40) return; // ignore tiny taps
    if (delta > 0) setPage((p) => Math.min(p + 1, totalPages - 1)); // swipe left  → next
    else           setPage((p) => Math.max(p - 1, 0));               // swipe right → prev
    touchStartX.current = null;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="w-full bg-white pt-4 pb-8 md:pt-6 md:pb-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-[1200px] px-6 md:px-12"
      >
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center md:mb-8">
          <motion.div variants={itemVariants} className="mb-5" />

          <motion.h2
            variants={itemVariants}
            className="mb-4 max-w-[700px] text-[32px] font-semibold leading-[1.4] tracking-tight text-[#0F172A] md:text-[42px]"
          >
            {t.testimonials.heading}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="max-w-[600px] text-[17px] leading-[2] text-[#475569]"
          >
            {t.testimonials.subtitle}
          </motion.p>
        </div>

        {/* Navigation row — dir=ltr keeps arrows on the right in Arabic RTL */}
        <motion.div variants={itemVariants} dir="ltr" className="mb-6 flex items-center justify-between">
          {/* Page indicator */}
          <p className="text-[14px] text-[#94A3B8]">
            {page * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE + PAGE_SIZE, TESTIMONIALS.length)} of {TESTIMONIALS.length} reviews
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
        </motion.div>

        {/* Testimonials Grid — dir=ltr keeps card order identical in Arabic RTL mode */}
        <motion.div
          key={page}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          dir="ltr"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-4 touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {visible.map((testimonial) => (
            <motion.div key={testimonial.name} variants={itemVariants} className="h-full">
              <TestimonialCard {...testimonial} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants}>
          <ClientReviewVideos
            heading={t.testimonials.videoReviewsHeading}
            subtitle={t.testimonials.videoReviewsSubtitle}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}