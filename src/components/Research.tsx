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

  return (
    <section className="w-full bg-white py-12 md:py-16 lg:py-10">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-left"
          >
            <motion.div variants={itemVariants} className="mb-8 flex items-center justify-center gap-3">


            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="mb-8 text-[36px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[44px]"
            >
              {t.research.heading}
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="mb-6 text-[16px] leading-[1.8] text-[#475569]"
            >
              {t.research.paragraph1}
            </motion.p>

            <motion.p
              variants={itemVariants}
              className="mb-12 text-[16px] leading-[1.8] text-[#475569]"
            >
              {t.research.paragraph2}
            </motion.p>

            <motion.div variants={itemVariants} className="flex justify-start">
              <Link
                href="/research"
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-semibold uppercase tracking-widest text-[#0F172A] transition-colors hover:border-[#6366F1] hover:text-[#6366F1]"
              >
                {t.research.exploreMore}
              </Link>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="relative h-[320px] md:h-[420px] rounded-2xl overflow-hidden border border-slate-200"
          >
            <Image
              src="/images/pages/test-tube.png"
              alt="Research and systems development"
              fill
              unoptimized
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
