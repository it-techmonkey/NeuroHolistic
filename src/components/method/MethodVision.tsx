"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function MethodVision() {
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
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Imagery (Spans 7 Cols) ── */}
          {/* We place the image first on mobile, but move it to the right on desktop for visual flow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] as const }}
            className="order-2 lg:order-1 lg:col-span-7"
          >
            <div className="group relative w-full rounded-[2rem] bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
              {/* Internal Image Frame */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-[#F1F5F9]">
                <Image
                  src="/images/dummy-user.svg"
                  alt="Two people in a supportive environment"
                  fill
                  className="object-cover grayscale-[10%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              
              {/* Museum-style bottom caption */}
              <div className="mt-6 flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                  Clinical Setting
                </span>
                <span className="text-[13px] text-[#64748B] italic">
                  Restoring Systemic Balance
                </span>
              </div>
            </div>
          </motion.div>

          {/* ── Narrative Content (Spans 5 Cols) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2 lg:col-span-5"
          >
            <motion.div variants={itemVariants} className="mb-8 flex items-center gap-3">
              <div className="h-px w-6 bg-[#6366F1]" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6366F1]">
                The Origin
              </p>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[34px] font-medium leading-[1.15] tracking-tight text-[#0F172A] md:text-[46px]"
            >
              The Vision Behind <br/>the <span className="italic text-[#64748B]">Method.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mb-10 text-[17px] leading-[1.8] text-[#475569] md:text-[18px]"
            >
              The NeuroHolistic Method™ emerged from years of therapeutic work and careful observation of the deeper mechanisms that shape human experience. 
            </motion.p>
            
            <motion.p
              variants={itemVariants}
              className="mb-12 text-[17px] leading-[1.8] text-[#475569] md:text-[18px]"
            >
              It reflects a vision of transformation that goes beyond symptom management—one that restores the internal system to balance and coherence, creating the conditions for lasting change.
            </motion.p>

            <motion.div variants={itemVariants}>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-semibold uppercase tracking-widest text-[#0F172A] transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                Read Full Story
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}