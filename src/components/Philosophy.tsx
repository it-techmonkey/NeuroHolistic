"use client";

import { motion, Variants } from "framer-motion";

export default function Philosophy() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    // Outer section provides padding so the inner rounded container can "float"
    <section className="px-4 py-8 md:px-6 md:py-12">
      {/* The Rounded Floating Rectangle */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] border border-[#E2E8F0]/60 bg-[#FAFBFF] py-16 shadow-[0_8px_40px_rgba(0,0,0,0.02)] md:rounded-[40px] md:py-20"
      >
        {/* Soft Inner Gradients (Replaced the harsh straight lines) */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(240,244,255,0.6)_100%)]" />
        <div className="pointer-events-none absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,139,255,0.08)_0%,transparent_70%)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1000px] px-6 md:px-8">
          
          {/* Header Area */}
          <div className="mx-auto max-w-[840px] text-center">
            <motion.h2
              variants={itemVariants}
              className="mb-6 text-[32px] font-medium leading-[1.15] tracking-tight text-[#0B1028] md:text-[46px] lg:text-[52px]"
            >
              True transformation does not come from <span className="italic text-[#64748B]">managing symptoms.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-[680px] text-[16px] leading-[1.7] text-[#475569] md:text-[17px]"
            >
              It begins when the internal system returns to balance and coherence.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-[680px] text-[16px] leading-[1.7] text-[#475569] md:text-[17px] mt-3"
            >
              The <strong className="font-semibold text-[#0B1028]">NeuroHolistic Method™</strong> restores alignment across the nervous system, cognition, and emotional processes, creating the conditions for deep and lasting transformation.
            </motion.p>
          </div>

        </div>
      </motion.div>
    </section>
  );
}