"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/lib/translations/LanguageContext";

export default function Research() {
  const { t, isUrdu } = useLang();

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
    "Epigenetic Expression",
    "Practice-Based Clinical Inquiry",
  ];

  return (
    <section className="w-full bg-white py-16 md:py-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        {/* Centered Heading */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <motion.h2
            variants={itemVariants}
            className="mb-8 text-[36px] font-light leading-[1.4] tracking-tight text-[#0F172A] md:text-[44px]"
          >
            {t.research.heading}
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[700px] mb-6 text-[16px] leading-[2] text-[#475569]"
          >
            {t.research.paragraph1}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[700px] mb-10 text-[16px] leading-[2] text-[#475569]"
          >
            {t.research.paragraph2}
          </motion.p>
        </motion.div>

        {/* Centered Research Areas Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-[900px] mb-12"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {researchAreas.map((area, i) => (
              <div key={area} className="text-center">
                <span className="font-mono text-[10px] text-[#CBD5E1] block mb-2">0{i + 1}</span>
                <span className="text-[13px] font-semibold text-[#0F172A] leading-snug">{area}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Centered CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Link
            href="/research"
            className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-semibold uppercase tracking-widest text-[#0F172A] transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
          >
            {t.research.exploreMore}
            <span className={`transition-transform duration-300 ${isUrdu ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1'} rtl-flip`}>{isUrdu ? '←' : '→'}</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
