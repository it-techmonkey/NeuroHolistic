"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function GroupIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
      <path d="M18 14c2 0 4 1.3 4 4" />
    </svg>
  );
}

/* ─── Program data ───────────────────────────────────────────────────────── */

const PROGRAMS = [
  {
    id: "private",
    Icon: PersonIcon,
    title: "Private Program",
    description:
      "A personalized transformational journey.",
    cta: "Book a Consultation",
    href: "/programs",
  },
  {
    id: "group",
    Icon: GroupIcon,
    title: "Group Program",
    description:
      "A structured transformational experience conducted within a guided group setting.",
    cta: "Book a Consultation",
    href: "/programs",
  },
];

/* ─── Main section ───────────────────────────────────────────────────────── */

export default function Programs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative w-full bg-[#070913] py-24 overflow-hidden md:py-32">
      {/* Deep Background Illumination */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.05)_0%,transparent_70%)] blur-3xl" />

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-12"
      >
        {/* ── Section header ── */}
        <div className="mb-16 flex flex-col items-center text-center md:mb-24">
          <motion.div variants={itemVariants} className="mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#8B8BFF]/50" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B8BFF]">
              Offerings
            </span>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#8B8BFF]/50" />
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-[36px] font-medium leading-[1.15] tracking-tight text-white md:text-[46px]"
          >
            Programs
          </motion.h2>
        </div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          {PROGRAMS.map((program, i) => (
            <ProgramCard key={program.id} program={program} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Card component ─────────────────────────────────────────────────────── */

function ProgramCard({
  program,
  index,
}: {
  program: (typeof PROGRAMS)[number];
  index: number;
}) {
  const { Icon } = program;
  
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
      }}
      className="group relative flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0F1F] p-8 transition-all duration-500 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_32px_64px_-15px_rgba(99,102,241,0.12)] md:p-12"
    >
      {/* Top Gradient Highlight on Hover */}
      <div className="absolute left-0 top-0 h-1.5 w-full scale-x-0 bg-gradient-to-r from-[#6366F1] to-[#8B8BFF] transition-transform duration-500 group-hover:scale-x-100 origin-left" />

      {/* Subtle Inner Glow on Hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.06)_0%,transparent_50%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

      {/* Icon Pill */}
      <div className="relative z-10 mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-[#8B8BFF] transition-all duration-500 group-hover:bg-[#6366F1] group-hover:border-[#6366F1] group-hover:text-white group-hover:shadow-[0_0_24px_rgba(99,102,241,0.4)]">
        <Icon />
      </div>

      {/* Content */}
      <h3 className="relative z-10 mb-4 text-[26px] font-medium tracking-tight text-white">
        {program.title}
      </h3>
      
      <p className="relative z-10 mb-10 flex-1 text-[16px] leading-[1.7] text-[#94A3B8]">
        {program.description}
      </p>

      {/* CTA Button */}
      <Link
        href={program.href}
        className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3.5 text-[14.5px] font-medium text-white transition-all duration-300 group-hover:border-white group-hover:bg-white group-hover:text-[#0B1028]"
      >
        {program.cta}
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </Link>
    </motion.div>
  );
}