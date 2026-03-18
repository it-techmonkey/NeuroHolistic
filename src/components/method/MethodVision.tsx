"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function MethodVision() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <section className="bg-white py-20 border-t border-slate-50">
      <div className="mx-auto max-w-[1100px] px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          
          {/* ── Imagery ── */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-2 lg:order-1"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 border border-slate-200 shadow-sm group">
              <Image
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                alt="The Vision Behind the Method"
                fill
                priority
                className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 550px"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* ── Narrative Content ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2"
          >
            <div className="max-w-lg lg:pl-6">
              <motion.h2
                variants={itemVariants}
                className="mb-6 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl"
              >
                The Vision Behind the Method
              </motion.h2>

              <div className="space-y-5">
                <motion.p
                  variants={itemVariants}
                  className="text-[16px] leading-relaxed text-slate-500"
                >
                  The NeuroHolistic Method™ emerged from years of therapeutic work and careful observation of the deeper mechanisms that shape human experience. 
                </motion.p>
                
                <motion.p
                  variants={itemVariants}
                  className="text-[16px] leading-relaxed text-slate-500"
                >
                  It reflects a vision of transformation that goes beyond symptom management—one that restores the internal system to balance and coherence, creating the conditions for lasting change.
                </motion.p>
              </div>

              <motion.div variants={itemVariants} className="mt-10">
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-slate-900 transition-colors hover:text-indigo-600"
                >
                  Read Full Story
                  <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}