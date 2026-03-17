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
    <section className="px-4 py-16 md:px-6 md:py-24">
      {/* The Rounded Floating Rectangle */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[32px] border border-[#E2E8F0]/60 bg-[#FAFBFF] py-20 shadow-[0_8px_40px_rgba(0,0,0,0.02)] md:rounded-[40px] md:py-32"
      >
        {/* Soft Inner Gradients (Replaced the harsh straight lines) */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(240,244,255,0.6)_100%)]" />
        <div className="pointer-events-none absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,139,255,0.08)_0%,transparent_70%)] blur-3xl" />

        <div className="relative z-10 mx-auto max-w-[1000px] px-6 md:px-12">
          
          {/* Header Area */}
          <div className="mx-auto max-w-[840px] text-center">
            <motion.div variants={itemVariants} className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-1.5 w-1.5 items-center justify-center rounded-full bg-[#8B8BFF] ring-4 ring-[#8B8BFF]/20" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
                Our Philosophy
              </p>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[32px] font-medium leading-[1.15] tracking-tight text-[#0B1028] md:text-[46px] lg:text-[52px]"
            >
              True transformation does not come from <span className="italic text-[#64748B]">managing symptoms.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mx-auto max-w-[680px] text-[17px] leading-[1.8] text-[#475569] md:text-[19px]"
            >
              It begins when the internal system returns to balance and coherence. The{" "}
              <strong className="font-semibold text-[#0B1028]">NeuroHolistic Method™</strong> restores alignment
              across your entire biological framework, creating the conditions for deep and lasting change.
            </motion.p>
          </div>

          {/* The 3 Pillars */}
          <motion.div
            variants={containerVariants}
            className="mx-auto mt-16 grid grid-cols-1 gap-5 md:mt-24 md:grid-cols-3"
          >
            <PillarCard
              number="01"
              title="Nervous System"
              desc="Down-regulating survival responses to establish a baseline of physical safety and physiological rest."
            />
            <PillarCard
              number="02"
              title="Cognitive Coherence"
              desc="Rewiring neural pathways to clear mental fog, sharp focus, and quiet hyper-vigilant thought loops."
            />
            <PillarCard
              number="03"
              title="Emotional Processing"
              desc="Releasing stored somatic tension to allow fluid emotional regulation without overwhelm."
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

// Sub-component for the sleek feature cards
function PillarCard({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
      }}
      // Changed from rounded-[24px] to rounded-[16px] for a cleaner rectangular look
      className="group relative overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.08)]"
    >
      <div className="absolute top-0 left-0 h-1 w-0 bg-gradient-to-r from-[#6366F1] to-[#8B8BFF] transition-all duration-500 group-hover:w-full" />
      
      <div className="mb-4 text-[13px] font-medium tracking-widest text-[#94A3B8]">
        {number}
      </div>
      <h3 className="mb-3 text-[19px] font-semibold text-[#0B1028]">
        {title}
      </h3>
      <p className="text-[15px] leading-[1.6] text-[#64748B]">
        {desc}
      </p>
    </motion.div>
  );
}