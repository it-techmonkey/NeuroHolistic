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
    <section className="w-full bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[900px] px-6 md:px-12">
        <div className="text-center">
          
          {/* ── Centered Editorial Text ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className=""
          >
            <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center gap-3">


            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[36px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[44px]"
            >
              Research & Systems <br className="hidden lg:block" />
              <span className="italic text-[#64748B]">Development.</span>
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mb-6 text-[16px] leading-[1.8] text-[#475569]"
            >
              At the NeuroHolistic Institute™, our work extends beyond clinical practice. We are committed to advancing the understanding of human transformation through ongoing research and the development of integrative frameworks that bring together neuroscience, psychology, and systemic approaches to human potential.
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mb-12 text-[16px] leading-[1.8] text-[#475569]"
            >
              Through observation, case studies, and continuous refinement of the NeuroHolistic Method™, we aim to contribute to a deeper understanding of how internal systems can be restored to coherence and support meaningful, lasting change.
            </motion.p>

            <motion.div variants={itemVariants} className="flex justify-center">
              <Link
                href="/research"
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-semibold uppercase tracking-widest text-[#0F172A] transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                Explore More
                <span className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}