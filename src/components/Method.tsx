"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";
import { useMemo } from "react";
import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodHero() {
  const { t, isUrdu } = useLang();
  const phases = useMemo(() => t.method.phases, [t]);

  return (
    <section className="relative w-full bg-[#FAFBFF] py-16 md:py-20">
      {/* Subtle Background Elements */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(240,244,255,0.6)_100%)]" />
      <div className="pointer-events-none absolute top-0 right-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,transparent_70%)] blur-3xl" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <h1 className="mb-3 text-[36px] font-medium leading-[1.4] tracking-tight text-[#0B1028] md:text-[48px] lg:text-[52px]">
              {t.method.heading}
            </h1>
            <p className={`mb-6 text-[14px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#64748B] md:text-[15px]`}>
              {t.method.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/method"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0B1028] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(11,16,40,0.15)]"
              >
                {t.method.exploreMethod}
                <span className={`transition-transform duration-300 ${isUrdu ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} rtl-flip`}>{isUrdu ? '←' : '→'}</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Horizontal 5 Phases */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {phases.map((phase, i) => (
            <PhaseCard key={i} phase={phase} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}

// Sub-component for individual phase cards — horizontal compact cards
function PhaseCard({ phase, index }: { phase: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] as const }}
      className="group rounded-[16px] border border-[#E2E8F0] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-[0_12px_32px_-10px_rgba(99,102,241,0.08)]"
    >
      {/* Phase number */}
      <div className="flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-[#E2E8F0] bg-white font-mono text-[13px] font-semibold text-[#64748B] shadow-sm mb-4 transition-colors duration-500 group-hover:border-[#6366F1] group-hover:text-[#6366F1]">
        0{index + 1}
      </div>

      <h3 className="text-[17px] font-semibold text-[#0B1028] mb-1 leading-tight">
        {phase.label}
      </h3>
      <span className="inline-block rounded-md bg-[#F1F5F9] px-2 py-0.5 text-[11px] font-medium tracking-wide text-[#64748B] mb-3 italic">
        {phase.desc}
      </span>
      <p className="text-[13px] leading-[1.5] text-[#475569]">
        {phase.details}
      </p>
    </motion.div>
  );
}