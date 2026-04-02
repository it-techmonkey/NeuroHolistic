"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function TrainingStructure() {
  const { t, isUrdu } = useLang();
  const MODULES = t.trainingStructure.modules;

  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16 max-w-[800px]">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[34px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[48px]"
          >
            {t.trainingStructure.heading1} <br className="hidden md:block" />
            <span className="italic text-[#64748B] font-normal">{t.trainingStructure.heading2}</span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className={`mt-8 text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569] max-w-[600px]`}
          >
            {t.trainingStructure.subtitle}
          </motion.p>
        </div>

        {/* ── Architectural Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
          {MODULES.map((module: { step: string; label: string; title: string; description: string }, i: number) => (
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
              
              <p className={`text-[15px] ${isUrdu ? 'leading-[2]' : 'leading-[1.7]'} text-[#64748B]`}>
                {module.description}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}