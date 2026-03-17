"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Research() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
  };

  const researchAreas = [
    "Neuroscience & Neuroplasticity",
    "Mind-Body Interaction",
    "Practice-Based Clinical Inquiry",
  ];

  return (
    <section className="w-full bg-white py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-8">
          
          {/* ── Left Column: Editorial Text (Spans 5 cols) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-5"
          >
            <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
              <div className="h-px w-6 bg-[#CBD5E1]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#64748B]">
                Institute Research
              </p>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[36px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[44px]"
            >
              Advancing the science of <br className="hidden lg:block" />
              <span className="italic text-[#64748B]">human transformation.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mb-12 text-[16px] leading-[1.8] text-[#475569]"
            >
              The NeuroHolistic Institute develops interdisciplinary research across neuroscience, psychology, and applied practice to better understand how meaningful, sustainable transformation unfolds in real human systems.
            </motion.p>

            {/* Architectural List (Replaces "AI-style" pills) */}
            <motion.div variants={itemVariants} className="mb-12">
              <ul className="border-t border-[#E2E8F0]">
                {researchAreas.map((item, i) => (
                  <li 
                    key={item}
                    className="flex items-center justify-between border-b border-[#E2E8F0] py-4 text-[14px] text-[#475569]"
                  >
                    <span>{item}</span>
                    <span className="font-mono text-[11px] text-[#94A3B8]">0{i + 1}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Editorial Link (Replaces bulky button) */}
            <motion.div variants={itemVariants}>
              <Link
                href="/research"
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-semibold uppercase tracking-widest text-[#0F172A] transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                Explore Publications
                <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* ── Right Column: Imagery (Spans 6 cols, skips 1 col for whitespace) ── */}
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(10% 0 0 0)" }}
            whileInView={{ opacity: 1, clipPath: "inset(0% 0 0 0)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] as const }}
            className="lg:col-span-6 lg:col-start-7"
          >
            <Link href="/research" className="group block w-full cursor-pointer">
              {/* Sharp, unrounded image container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F1F5F9] md:aspect-[16/11]">
                <img
                  src="https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1400&q=80"
                  alt="Scientific research and analysis"
                  className="absolute inset-0 h-full w-full object-cover grayscale-[25%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                />
              </div>
              
              {/* External Museum-Style Caption */}
              <div className="mt-5 flex items-start justify-between border-t border-[#E2E8F0] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#64748B]">
                  Current Focus
                </p>
                <p className="text-right text-[14px] text-[#0F172A]">
                  Systemic Baseline Regulation <br />
                  <span className="text-[13px] text-[#64748B]">Q3 — 2024</span>
                </p>
              </div>
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}