"use client";

import { motion } from "framer-motion";
import Link from "next/link";

/* ─── Data Array (Must be defined in the same file) ───────────────────────── */

const AREAS = [
  {
    title: "Health",
    description:
      "When the nervous system returns to balance, the body shifts out of chronic stress and into regulation.",
    icon: "◆",
    href: "/programs#health",
  },
  {
    title: "Mind",
    description:
      "As neural patterns reorganize, mental clarity increases and emotional reactivity decreases.",
    icon: "◇",
    href: "/programs#mind",
  },
  {
    title: "Relationships",
    description:
      "Internal coherence changes how we relate to others—communication and connection deepen.",
    icon: "○",
    href: "/programs#relationships",
  },
  {
    title: "Human Potential",
    description:
      "When internal systems align, energy becomes available for creativity, purpose, and growth.",
    icon: "△",
    href: "/programs#potential",
  },
];

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function MethodTransformationAreas() {
  return (
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* Editorial Header */}
        <div className="mb-20 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center justify-center gap-3"
          >
            <div className="h-px w-6 bg-[#CBD5E1]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#64748B]">
              Outcomes
            </span>
            <div className="h-px w-6 bg-[#CBD5E1]" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-[800px] text-[34px] font-medium leading-[1.15] text-[#0F172A] md:text-[48px]"
          >
            Where transformation <span className="italic text-[#64748B]">takes shape.</span>
          </motion.h2>
        </div>

        {/* Opening paragraph */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mx-auto max-w-[840px] mb-12 text-[15.5px] leading-[1.8] text-[#475569] text-center"
        >
          When internal systems return to balance and coherence, change begins to appear across multiple dimensions of life. As the nervous system stabilizes and perception reorganizes, individuals often experience shifts not only in how they feel internally, but also in how they think, relate to others, and engage with the world.
        </motion.p>

        {/* The Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {AREAS.map((area, i) => (
            <motion.div
              key={area.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link 
                href={area.href} 
                className="group flex h-full flex-col justify-between rounded-[24px] border border-[#E2E8F0] bg-white p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#6366F1] hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.08)]"
              >
                <div>
                  <span className="mb-8 block text-[28px] text-[#6366F1] transition-transform duration-500 group-hover:scale-110">
                    {area.icon}
                  </span>
                  <h3 className="mb-3 text-[20px] font-semibold tracking-tight text-[#0F172A]">
                    {area.title}
                  </h3>
                  <p className="text-[15px] leading-[1.7] text-[#475569]">
                    {area.description}
                  </p>
                </div>

                <div className="mt-10 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#0F172A]">
                  <span className="relative">
                    Explore
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#0F172A] transition-all duration-300 group-hover:w-full" />
                  </span>
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}