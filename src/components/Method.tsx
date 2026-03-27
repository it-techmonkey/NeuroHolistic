"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

export default function MethodHero() {
  return (
    <section className="relative w-full bg-[#FAFBFF] py-16 md:py-20">
      {/* Subtle Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(240,244,255,0.6)_100%)]" />
      <div className="pointer-events-none absolute top-0 left-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-20">
          
          {/* Left Column: Sticky Context (Takes up 5 columns) */}
          <div className="lg:sticky lg:top-32 lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
            >


              <h1 className="mb-3 text-[36px] font-medium leading-[1.15] tracking-tight text-[#0B1028] md:text-[48px] lg:text-[52px]">
                The NeuroHolistic Method™ <br className="hidden md:block" />
              </h1>

              <p className="mb-6 text-[14px] leading-[1.6] text-[#64748B] md:text-[15px]">
                A Five-Phase Architecture for Systemic Transformation
              </p>

              <p className="mb-10 text-[17px] leading-[1.8] text-[#475569] md:text-[18px]">
                The NeuroHolistic Method™ unfolds through five structured phases of transformation, from releasing accumulated stress patterns to stabilizing new neural, emotional, and cognitive pathways.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/method"
                  className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0B1028] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(11,16,40,0.15)]"
                >
                  Explore the Method
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Right Column: The 5 Phases Timeline (Takes up 7 columns) */}
          <div className="relative lg:col-span-7 lg:pl-10">
            {/* The vertical timeline connector */}
            <div className="absolute left-[39px] top-10 bottom-10 hidden w-px bg-gradient-to-b from-[#E2E8F0] via-[#CBD5E1] to-transparent md:block lg:left-[79px]" />

            <div className="flex flex-col gap-6 md:gap-10">
              {phases.map((phase, i) => (
                <PhaseCard key={i} phase={phase} index={i} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// Data Array for the phases
const phases = [
  {
    label: "Release",
    desc: "Discharging the Symptoms",
    details: "Releasing accumulated emotional charge from the body to restore nervous system balance.",
  },
  {
    label: "Subconscious Liberation",
    desc: "Removing the Root Cause",
    details: "Dissolving the subconscious patterns and programming which created the symptoms.",
  },
  {
    label: "Neural Expansion",
    desc: "Breaking the loop",
    details: "Freeing and expanding neural pathways to move beyond fixed responses and limitations.",
  },
  {
    label: "Targeted Transformation",
    desc: "Creating the new state",
    details: "Designing and reinforcing neural pathways aligned with the desired state and identity.",
  },
  {
    label: "Integration & Stabilization",
    desc: "Stabilizing the transformation",
    details: "Anchoring the transformation into a stable, embodied way of being.",
  },
];

// Sub-component for individual phase cards
function PhaseCard({ phase, index }: { phase: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
      className="relative flex flex-col items-start gap-6 md:flex-row md:items-stretch"
    >
      {/* Node / Number Indicator */}
      <div className="relative z-10 flex items-center justify-center bg-[#FAFBFF] py-2 md:w-[80px]">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-[2px] border-[#E2E8F0] bg-white font-mono text-[14px] font-semibold text-[#64748B] shadow-sm transition-colors duration-500 group-hover:border-[#6366F1] group-hover:text-[#6366F1]">
          0{index + 1}
        </div>
      </div>

      {/* Content Card (Using the matching 16px rounding from the Philosophy section) */}
      <div className="group flex-1 rounded-[16px] border border-[#E2E8F0] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_12px_32px_-10px_rgba(99,102,241,0.08)] md:p-8">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-[20px] font-semibold text-[#0B1028] md:text-[22px]">
            {phase.label}
          </h3>
          <span className="rounded-md bg-[#F1F5F9] px-3 py-1 text-[12px] font-medium tracking-wide text-[#64748B]">
            {phase.desc}
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-[1.6] text-[#475569]">
          {phase.details}
        </p>
      </div>
    </motion.div>
  );
}