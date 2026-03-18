"use client";

import { motion } from "framer-motion";

const SCIENTIFIC_PILLARS = [
  {
    tag: "Neuroscience",
    label: "Neural Mapping",
    description: "Studying the brain's structural and functional changes during systemic transformation."
  },
  {
    tag: "Neuroplasticity",
    label: "Adaptive Rewiring",
    description: "Utilizing the nervous system's ability to reorganize itself by forming new neural connections."
  },
  {
    tag: "Epigenetic Regulation",
    label: "Biological Expression",
    description: "Understanding how environmental and internal shifts influence how genes are expressed."
  },
  {
    tag: "Autonomic Science",
    label: "Systemic Regulation",
    description: "Managing the balance between the sympathetic and parasympathetic nervous systems."
  },
];

export default function MethodScientificFoundations() {
  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-20">
          
          {/* Header Column */}
          <div className="lg:col-span-5">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
  
              <h2 className="mb-8 text-[34px] font-medium leading-[1.15] tracking-tight text-[#0F172A] md:text-[46px]">
                Scientific & <br/>Theoretical <span className="italic text-[#64748B]">foundations.</span>
              </h2>
              <p className="text-[17px] leading-[1.8] text-[#475569] md:text-[18px]">
                The NeuroHolistic Method™ is grounded in contemporary psychoneuroimmunology and autonomic science, integrating these disciplines into a coherent framework for human regulation.
              </p>
            </motion.div>
          </div>

          {/* Pillars Column */}
          <div className="lg:col-span-7">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 border-t border-[#E2E8F0]"
            >
              {SCIENTIFIC_PILLARS.map((pillar, i) => (
                <div 
                  key={pillar.tag}
                  className="group grid grid-cols-1 gap-4 border-b border-[#E2E8F0] py-8 md:grid-cols-2 md:items-start lg:py-10"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[11px] text-[#94A3B8] mb-2">0{i + 1}</span>
                    <h3 className="text-[18px] font-semibold text-[#0F172A]">{pillar.tag}</h3>
                    <p className="text-[13px] font-medium uppercase tracking-wider text-[#6366F1]">
                      {pillar.label}
                    </p>
                  </div>
                  <p className="text-[15px] leading-[1.7] text-[#64748B] md:pt-6">
                    {pillar.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}