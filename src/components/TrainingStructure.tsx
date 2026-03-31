"use client";

import { motion } from "framer-motion";

const MODULES = [
  {
    step: "01",
    label: "Theory",
    title: "Foundations of Human Change",
    description:
      "Neuroscience, psychology, and epigenetic mechanisms of perception, behavior, and transformation.",
  },
  {
    step: "02",
    label: "Formation",
    title: "Practitioner Development",
    description:
      "Professional identity, ethics, communication, and responsibility in applied psychological work.",
  },
  {
    step: "03",
    label: "Logic",
    title: "Applied Psychology Practice",
    description:
      "Observation, pattern recognition, and structured intervention logic for human systems.",
  },
  {
    step: "04",
    label: "Mastery",
    title: "Method™ Application",
    description:
      "Learning the internal logic and ethical application of the five-phase NeuroHolistic protocol.",
  },
];

export default function TrainingStructure() {
  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16 max-w-[800px]">
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
            className="text-[34px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[48px]"
          >
            <span className="block text-[14px] font-mono tracking-[0.2em] text-[#6366F1] uppercase mb-4">The Program</span>
            NeuroHolistic Applied <br className="hidden md:block" />
            <span className="italic text-[#64748B] font-normal">Psychology Mastery</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-[17px] leading-[1.8] text-[#475569] max-w-[600px]"
          >
            An advanced professional training program that combines scientific foundations, practitioner formation, and supervised practice to prepare you for ethical, effective applied work.
          </motion.p>
        </div>

        {/* ── Architectural Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
          {MODULES.map((module, i) => (
            <motion.div
              key={module.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`group flex flex-col p-8 md:p-10 border-b border-[#E2E8F0] ${
                i % 4 !== 3 ? "lg:border-r" : ""
              } ${
                i % 2 !== 1 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
              } lg:last:border-r-0 transition-colors hover:bg-white`}
            >
              {/* Step Marker */}
              <div className="mb-12 flex flex-col gap-2">
                <span className="font-mono text-[11px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">
                  [ {module.step} ]
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#94A3B8]">
                  {module.label}
                </span>
              </div>

              <h3 className="mb-4 text-[19px] font-semibold tracking-tight text-[#0F172A] leading-snug">
                {module.title}
              </h3>
              
              <p className="text-[15px] leading-[1.7] text-[#64748B]">
                {module.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}