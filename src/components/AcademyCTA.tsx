"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function AcademyCTA() {
  return (
    <section className="w-full bg-[#FAFBFF] px-4 py-24 md:px-6 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] bg-[#0F172A] md:rounded-[40px]"
      >
        {/* ── Subtle Architectural Background ── */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="cta-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cta-grid)" />
          </svg>
        </div>
        
        {/* Soft Inner Glow */}
        <div className="pointer-events-none absolute left-0 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_70%)] blur-3xl" />

        <div className="relative z-10 px-8 py-20 md:px-16 md:py-28 lg:px-24">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-20">
            
            {/* Left Column: The Hook (Spans 7 Cols) */}
            <div className="lg:col-span-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-px w-6 bg-[#8B8BFF]" />
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#8B8BFF]">
                  The NeuroHolistic Academy™
                </span>
              </div>

              <h2 className="text-[36px] font-medium leading-[1.15] tracking-tight text-white md:text-[48px] lg:text-[56px]">
                Master the Method. <br />
                <span className="italic text-[#94A3B8]">Shape the future.</span>
              </h2>
            </div>

            {/* Right Column: Context & Action (Spans 5 Cols) */}
            <div className="flex flex-col items-start lg:col-span-5">
              <p className="mb-10 text-[17px] leading-[1.7] text-[#94A3B8] md:text-[18px]">
                Join an elite community of certified practitioners. Train extensively in the NeuroHolistic Method™ and build a practice dedicated to deep, systemic human transformation.
              </p>

              <Link
                href="/academy/apply"
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-white px-8 text-[15px] font-medium text-[#0F172A] transition-all duration-300 hover:bg-[#EEF2FF] hover:shadow-[0_8px_24px_rgba(255,255,255,0.15)]"
              >
                Explore the Academy
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>

          </div>
        </div>
      </motion.div>
    </section>
  );
}