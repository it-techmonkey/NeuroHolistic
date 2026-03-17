"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PHASES = [
  { label: "Instruction", title: "Guided Method Sessions", description: "Deep dives into the NeuroHolistic Method™ led by certified practitioners." },
  { label: "Integration", title: "Group Reflection Circles", description: "Shared spaces to process emerging patterns and collective insights." },
  { label: "Somatic", title: "Nature-Based Restoration", description: "Time held in natural environments to support nervous system regulation." },
  { label: "Autonomy", title: "Individual Reflection", description: "Dedicated space for personal silence, journaling, and self-integration." },
];

export default function RetreatFormat() {
  return (
    <section className="bg-white py-24 md:py-32 lg:py-40 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Left Column: Editorial Text (Spans 5) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="h-px w-6 bg-[#6366F1]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#6366F1]">
                The Architecture
              </span>
            </div>

            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
              How the experience <br/>
              <span className="italic text-[#64748B] font-normal">is structured.</span>
            </h2>

            <p className="mb-12 text-[17px] leading-[1.8] text-[#475569]">
              Our retreats are designed as immersive containers. We move beyond daily distractions to engage deeply with the transformational process through a precise balance of structure and space.
            </p>

            {/* Architectural List (Replaces Bullets) */}
            <div className="flex flex-col border-t border-[#E2E8F0]">
              {PHASES.map((item, i) => (
                <div key={item.title} className="group border-b border-[#E2E8F0] py-6 transition-colors hover:bg-[#FAFBFF]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8] mb-1 block">
                        {item.label} // 0{i + 1}
                      </span>
                      <h4 className="text-[17px] font-semibold text-[#0F172A]">{item.title}</h4>
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-[#E2E8F0] mt-4 group-hover:bg-[#6366F1] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ── Right Column: Framed Image (Spans 7) ── */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
              {/* Internal Framing Effect */}
              <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1470240731273-7821a6e5206f?w=1400&q=80"
                  alt="Nature and restoration"
                  fill
                  className="object-cover grayscale-[15%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
              
              {/* External Museum Caption */}
              <div className="mt-6 flex items-center justify-between px-2">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-[#94A3B8]">
                  Context // Environment
                </span>
                <span className="text-[13px] text-[#64748B] italic">
                  Biophilic Integration
                </span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}