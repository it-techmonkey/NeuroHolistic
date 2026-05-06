"use client";

import { motion, Variants } from "framer-motion";
import Image from "next/image";
import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodVision() {
  const { t } = useLang();
  const mp = t.methodPage;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.21, 1, 0.36, 1] },
    },
  };

  return (
    <section className="bg-white py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Using a 12-column grid for precise control */}
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-12 lg:items-start lg:gap-x-12">

          {/* ── Imagery (5 Columns) ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative lg:col-span-5 order-2 lg:order-1"
          >
            {/* Aspect ratio changed to 4/5 to match the vertical height of 3 paragraphs */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 shadow-2xl shadow-slate-200/50">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                alt={mp.visionTitle}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 500px"
              />
              {/* Soft overlay for depth */}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-3xl" />
            </div>
            
            {/* Decorative element to "anchor" the image */}
            <div className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-slate-50" />
          </motion.div>

          {/* ── Narrative Content (6 Columns + 1 Column Gutter) ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-6 lg:col-start-7 flex flex-col justify-center order-1 lg:order-2"
          >
            <div className="border-l border-slate-100 pl-8 lg:pl-10">
              {/* Eyebrow text adds professional hierarchy */}
              
              <motion.h2
                variants={itemVariants}
                className="mb-8 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:leading-[1.1]"
              >
                {mp.visionTitle}
              </motion.h2>

              <div className="space-y-7">
                <motion.p
                  variants={itemVariants}
                  className="text-lg leading-relaxed text-slate-600 font-light"
                >
                  {mp.visionParagraph1}
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="text-lg leading-relaxed text-slate-600 font-light"
                >
                  {mp.visionParagraph2}
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="text-lg leading-relaxed text-slate-600 font-light"
                >
                  {mp.visionParagraph3}
                </motion.p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
