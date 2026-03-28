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
                className="object-cover transition-all duration-700 group-hover:scale-105"
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
                  The NeuroHolistic Method™ emerged from a long exploration of the deeper mechanisms that shape human experience. Over years of therapeutic work and observation, it became increasingly clear that many human challenges cannot be understood through isolated symptoms alone. They arise from complex interactions between the nervous system, cognition, emotional memory, and deeper layers of human awareness.
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="text-[16px] leading-relaxed text-slate-500"
                >
                  Traditional approaches often address these dimensions separately. The vision behind the NeuroHolistic Method™ was to create a structured framework capable of working with the human system as an integrated whole, restoring coherence across its different levels while supporting meaningful and lasting transformation.
                </motion.p>

                <motion.p
                  variants={itemVariants}
                  className="text-[16px] leading-relaxed text-slate-500"
                >
                  By bringing together insights from neuroscience, psychology, and systemic approaches to human development, the method offers a pathway that not only helps resolve inner struggles but also expands the individual's capacity for awareness, resilience, and conscious living.
                </motion.p>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}