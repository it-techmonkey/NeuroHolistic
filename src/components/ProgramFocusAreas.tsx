"use client";

import { motion } from "framer-motion";

const FOCUS_AREAS = [
  {
    title: "Mental Clarity & Cognitive Performance",
    description:
      "Supporting focus, decision-making, and psychological flexibility through systemic neuro-logic.",
    icon: "◆",
  },
  {
    title: "Stress Regulation & Resilience",
    description:
      "Helping individuals regulate pressure and recover from mental overload by stabilizing the autonomic system.",
    icon: "◇",
  },
  {
    title: "Leadership Awareness",
    description:
      "Developing self-awareness and emotional intelligence in leadership roles to foster coherent team dynamics.",
    icon: "○",
  },
  {
    title: "Organizational Culture",
    description:
      "Strengthening communication, psychological safety, and collaboration via collective regulation.",
    icon: "△",
  },
];

export default function ProgramFocusAreas() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6 flex items-center gap-4"
          >
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[800px] text-[34px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]"
          >
            Strategic program <span className="italic text-[#64748B] font-normal">focus areas.</span>
          </motion.h2>
        </div>

        {/* ── The Registry Matrix ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
          {FOCUS_AREAS.map((item, i) => (
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
              {/* Monospaced Index & Marker */}
              <div className="mb-12 flex items-center justify-between">
                <span className="font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">
                  [ 0{i + 1} ]
                </span>
                <span className="text-[20px] text-[#6366F1] opacity-40 group-hover:opacity-100 transition-opacity">
                  {item.icon}
                </span>
              </div>

              <h3 className="mb-4 text-[19px] font-semibold tracking-tight text-[#0F172A] leading-snug">
                {item.title}
              </h3>
              
              <p className="text-[15px] leading-[1.7] text-[#64748B]">
                {item.description}
              </p>

              {/* Bottom Metadata detail (Small Atelier touch) */}
              <div className="mt-auto pt-8">
                <div className="h-px w-6 bg-[#F1F5F9] transition-all group-hover:w-full group-hover:bg-[#6366F1]" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}