"use client";

import { motion } from "framer-motion";

const EXPERIENCES = [
  {
    title: "Deep Nervous System Regulation",
    description:
      "Guided practices to restore balance and coherence within the autonomic nervous system, creating a foundation for lasting change.",
    icon: "◆",
  },
  {
    title: "Guided Transformational Processes",
    description:
      "Structured sessions that move through the five-phase architecture of the NeuroHolistic Method™ in a held container.",
    icon: "◇",
  },
  {
    title: "Group Reflection & Integration",
    description:
      "Shared circles and dialogue that support integration of new patterns and collective learning.",
    icon: "○",
  },
  {
    title: "Nature-Based Restoration",
    description:
      "Time in nature to support regulation, reflection, and connection to the body and environment.",
    icon: "△",
  },
];

export default function RetreatExperience() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-3"
          >

          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[800px] text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]"
          >
            What you will <span className="italic text-[#64748B] font-normal">experience.</span>
          </motion.h2>
        </div>

        {/* ── Architectural Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
          {EXPERIENCES.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`group flex flex-col p-8 md:p-10 border-b border-[#E2E8F0] ${
                i % 4 !== 3 ? "lg:border-r" : ""
              } ${
                i % 2 !== 1 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
              } lg:last:border-r-0 transition-colors hover:bg-[#FAFBFF]`}
            >
              {/* Monospaced Index */}
              <div className="mb-10 flex items-center justify-between">
                <span className="font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">
                  0{i + 1}
                </span>
                <span className="text-[20px] text-[#6366F1] opacity-40 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
              </div>

              <h3 className="mb-4 text-[20px] font-semibold tracking-tight text-[#0F172A]">
                {item.title}
              </h3>
              
              <p className="text-[15px] leading-[1.7] text-[#64748B]">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}