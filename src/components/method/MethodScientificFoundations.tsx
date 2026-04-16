"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function MethodScientificFoundations() {
  const { t } = useLang();
  const mp = t.methodPage;

  return (
    <section className="bg-[#FAFBFF] py-24 lg:py-32 border-y border-slate-200/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* Header - Stays centered or left-aligned above the grid */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 lg:mb-15"
        >
          <h2 className="text-4xl font-medium tracking-tight text-slate-900 md:text-5xl lg:text-6xl leading-[1.1]">
            {mp.scientificFoundationsTitle}
          </h2>
        </motion.div>

        {/* Main Content Grid - Using items-center for perfect visual balance */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-start">
          
          {/* Left Column: The Full Narrative (Unbroken) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="space-y-6 text-[17px] leading-[1.8] text-slate-600">
              <p>{mp.scientificFoundationsParagraph1}</p>
              <p>{mp.scientificFoundationsParagraph2}</p>
              <p>{mp.scientificFoundationsParagraph3}</p>
              <p>{mp.scientificFoundationsParagraph4}</p>
            </div>
          </motion.div>

          {/* Right Column: The Pillars */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-4 lg:col-start-9"
          >
            <div className="relative">
              {/* Decorative vertical line to "anchor" the list to the text */}
              <div className="absolute -left-8 top-0 bottom-0 w-px bg-slate-200 hidden lg:block" />
              
              <div className="divide-y divide-slate-100 border-y border-slate-100">
                {mp.scientificPillars.map((pillar: string, i: number) => (
                  <div 
                    key={pillar}
                    className="group flex items-center py-5 transition-colors hover:bg-white"
                  >
                    <span className="w-10 shrink-0 font-mono text-[11px] tracking-tighter text-slate-400">
                      0{i + 1}
                    </span>
                    <h3 className="text-lg font-light tracking-tight text-slate-900">
                      {pillar}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
