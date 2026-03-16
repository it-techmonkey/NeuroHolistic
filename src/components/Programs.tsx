"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
    title: "Private",
    description:
      "A personalized transformational journey tailored to your unique history, patterns, and goals. Through one-on-one sessions, the NeuroHolistic Method™ is applied with precision to restore systemic balance and support deep, lasting change.",
    cta: "Explore Private Sessions →",
    href: "/programs/private",
  },
  {
    id: "group",
    Icon: GroupIcon,
    title: "Group Program",
    description:
      "A structured transformational experience conducted within a guided group setting. Participants move through the NeuroHolistic Method™ together, benefiting from shared insight, collective momentum, and a supportive environment for integration.",
    cta: "Explore the Group Program →",
    href: "/programs/group",
  },
];

/* ─── Ease curve ─────────────────────────────────────────────────────────── */
const ease = [0.22, 1, 0.36, 1] as const;

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
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay: index * 0.14, ease }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group"
      style={{ transition: "box-shadow 0.3s ease" }}
    >
      {/* Glass card */}
      <div
        className="relative h-full flex flex-col rounded-[20px] overflow-hidden"
        style={{
          padding: "40px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "border-color 0.3s ease, box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(139,139,255,0.22)";
          el.style.boxShadow =
            "0 24px 60px -12px rgba(107,107,255,0.18), 0 0 0 1px rgba(139,139,255,0.12)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(255,255,255,0.08)";
          el.style.boxShadow = "none";
        }}
      >
        {/* Radial glow top-left on hover */}
        <div
          className="absolute inset-0 rounded-[20px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "radial-gradient(ellipse at 20% -10%, rgba(139,139,255,0.13) 0%, transparent 55%)",
          }}
        />

        {/* Icon pill */}
        <div
          className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-[12px] text-white"
          style={{
            background: "linear-gradient(135deg, #8B8BFF 0%, #6B6BFF 100%)",
            boxShadow: "0 0 16px rgba(139,139,255,0.35)",
            transition: "box-shadow 0.3s ease",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 30px rgba(139,139,255,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow =
              "0 0 16px rgba(139,139,255,0.35)";
          }}
        >
          <Icon />
        </div>

        {/* Title */}
        <h3
          className="relative z-10 text-white font-semibold tracking-tight"
          style={{ fontSize: "22px", marginTop: "20px" }}
        >
          {program.title}
        </h3>

        {/* Description */}
        <p
          className="relative z-10 leading-relaxed flex-1"
          style={{
            fontSize: "16px",
            color: "#C7C9E0",
            marginTop: "16px",
            marginBottom: "24px",
            lineHeight: "1.7",
          }}
        >
          {program.description}
        </p>

        {/* CTA button */}
        <Link
          href={program.href}
          className="relative z-10 self-start inline-flex items-center gap-2 text-white text-sm font-medium rounded-[10px]"
          style={{
            padding: "12px 20px",
            border: "1px solid rgba(255,255,255,0.20)",
            transition: "background 0.25s ease, border-color 0.25s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "rgba(255,255,255,0.08)";
            el.style.borderColor = "rgba(255,255,255,0.32)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLElement;
            el.style.background = "transparent";
            el.style.borderColor = "rgba(255,255,255,0.20)";
          }}
        >
          {program.cta}
        </Link>
      </div>
    </motion.div>
  );
}

/* ─── Main section ───────────────────────────────────────────────────────── */

export default function Programs() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.25 });

  return (
    <section
      ref={ref}
      style={{
        background: "linear-gradient(180deg, #0B0F2B 0%, #11174A 100%)",
        padding: "120px 0",
      }}
    >
      <div className="mx-auto px-6 md:px-10" style={{ maxWidth: "1200px" }}>

        {/* ── Section header ── */}
        <div className="flex flex-col items-center text-center" style={{ marginBottom: "64px" }}>

          {/* Label line */}
          <motion.div
            className="flex items-center gap-4 mb-5"
            initial={{ opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease }}
          >
            <span
              style={{
                display: "block",
                width: "40px",
                height: "1px",
                background: "linear-gradient(to right, transparent, rgba(139,139,255,0.5))",
              }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#8B8BFF",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Programs
            </span>
            <span
              style={{
                display: "block",
                width: "40px",
                height: "1px",
                background: "linear-gradient(to left, transparent, rgba(139,139,255,0.5))",
              }}
            />
          </motion.div>

          {/* Title */}
          <motion.h2
            className="text-white font-semibold tracking-tight"
            style={{ fontSize: "clamp(34px, 5vw, 48px)" }}
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.1, ease }}
          >
            Choose Your Path
          </motion.h2>
        </div>

        {/* ── Cards ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "40px" }}
        >
          {PROGRAMS.map((program, i) => (
            <ProgramCard key={program.id} program={program} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
