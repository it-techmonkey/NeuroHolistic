"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function ScientificFoundation() {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="relative w-full bg-white py-16 md:py-20 overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto max-w-[1200px] px-6 md:px-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="text-left">
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-[36px] font-semibold leading-[1.15] tracking-tight text-[#0F172A] md:text-[42px]"
          >
            Scientific <span className="italic text-[#64748B]">Foundation</span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mb-5 text-[16px] leading-[1.8] text-[#475569]"
          >
            The NeuroHolistic Method™ integrates insights from several scientific disciplines that explore how human systems regulate, adapt, and transform. These include contemporary neuroscience, research on neuroplasticity and epigenetic expression, and emerging perspectives on the role of bioenergetic processes in human functioning.
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mb-10 text-[16px] leading-[1.8] text-[#475569]"
          >
            The method also draws inspiration from modern physics concepts that highlight the interconnected and dynamic nature of complex systems, providing a broader framework for understanding human potential and transformation.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Link
              href="/research"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#0F172A] px-8 text-[14.5px] font-medium text-white transition-all hover:bg-[#1E293B] hover:shadow-[0_8px_20px_rgba(15,23,42,0.15)]"
            >
              Explore More
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>
          </div>
          <motion.div variants={itemVariants} className="relative h-[320px] md:h-[420px] rounded-2xl overflow-hidden border border-slate-200">
            <Image
              src="https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=1400&q=80"
              alt="Scientific foundation"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}