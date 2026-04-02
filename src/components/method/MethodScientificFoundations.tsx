"use client";

import { motion } from "framer-motion";

const SCIENTIFIC_PILLARS = [
  {
    tag: "Positive Psychology",
  },
  {
    tag: "Neuroscience & Neuroplasticity",
  },
  {
    tag: "Epigenetic Regulation",
  },
  {
    tag: "Nervous System Science",
  },
  {
    tag: "Consciousness",
  },
  {
    tag: "Complex Human Systems",
  },
];

export default function MethodScientificFoundations() {
  return (
    <section className="bg-[#FAFBFF] py-16 md:py-20 lg:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14 items-start">
          
          {/* Header Column */}
          <div className="lg:col-span-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
  
              <h2 className="mb-8 text-[34px] font-medium leading-[1.15] tracking-tight text-[#0F172A] md:text-[46px]">
                Scientific & <br/>Theoretical <span className="italic text-[#64748B]">Foundations</span>
              </h2>
              <p className="mb-4 text-[16px] leading-[1.8] text-[#475569]">
                The NeuroHolistic Method™ is grounded in contemporary scientific understanding of how the human system regulates, adapts, and transforms. Its theoretical foundation integrates insights from neuroscience, psychoneuroimmunology, and epigenetic regulation to understand how thoughts, emotions, and physiological states interact to shape human experience.
              </p>
              <p className="mb-4 text-[16px] leading-[1.8] text-[#475569]">
                Central to the method is the principle of neuroplasticity, the brain’s ability to reorganize neural pathways in response to experience and meaningful emotional activation. Research on predictive coding, interoception, and autonomic regulation shows that the brain continuously interprets internal and external signals, shaping perception, emotional responses, and behavior patterns.
              </p>
              <p className="mb-4 text-[16px] leading-[1.8] text-[#475569]">
                The NeuroHolistic Method™ works within this biological reality by activating neural and physiological processes that allow the system to reorganize itself. Through carefully structured therapeutic interaction, including sensory-evocative language, emotional processing, and relational resonance, new patterns of perception and regulation can emerge, supporting deep and lasting transformation.
              </p>
              <p className="text-[16px] leading-[1.8] text-[#475569]">
                The method also considers emerging perspectives on human bioenergetic processes and systemic coherence, recognizing that human transformation occurs through the dynamic interaction of neural, biochemical, emotional, and energetic dimensions of the living system.
              </p>
            </motion.div>
          </div>

          {/* Pillars Column */}
          <div className="lg:col-span-6 lg:pt-2">
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 border-t border-[#E2E8F0]"
            >
              {SCIENTIFIC_PILLARS.map((pillar, i) => (
                <div 
                  key={pillar.tag}
                  className="group flex items-center border-b border-[#E2E8F0] py-6 md:py-8"
                >
                  <span className="font-mono text-[13px] text-[#94A3B8] w-12 shrink-0">0{i + 1}</span>
                  <h3 className="text-[20px] md:text-[24px] font-light text-[#0F172A]">{pillar.tag}</h3>
                </div>
              ))}
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}