"use client";

import { motion } from "framer-motion";

const SCIENTIFIC_PILLARS = [
  {
    tag: "Positive Psychology",
    label: "Wellbeing Science",
    description: "Understanding the conditions that enable individuals to thrive and reach their potential."
  },
  {
    tag: "Neuroscience & Neuroplasticity",
    label: "Adaptive Rewiring",
    description: "Exploring the brain's ability to reorganize neural pathways in response to meaningful experience."
  },
  {
    tag: "Epigenetic Regulation",
    label: "Biological Expression",
    description: "Understanding how environment and experience interact with biological systems over time."
  },
  {
    tag: "Nervous System Science",
    label: "Systemic Regulation",
    description: "Studying how the autonomic nervous system shapes perception, emotion, and behavior."
  },
  {
    tag: "Consciousness",
    label: "Awareness Studies",
    description: "Investigating the nature of human awareness and its role in transformation."
  },
  {
    tag: "Complex Human Systems",
    label: "Systemic Integration",
    description: "Understanding the dynamic interactions between neural, biochemical, emotional, and energetic dimensions."
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
                Scientific <br/>Foundations.
              </h2>
              <div className="space-y-5">
                <p className="text-[16px] leading-[1.8] text-[#475569]">
                  The NeuroHolistic Method™ is grounded in contemporary scientific understanding of how the human system regulates, adapts, and transforms. Its theoretical foundation integrates insights from neuroscience, psychoneuroimmunology, and epigenetic regulation to understand how thoughts, emotions, and physiological states interact to shape human experience.
                </p>
                <p className="text-[16px] leading-[1.8] text-[#475569]">
                  Central to the method is the principle of neuroplasticity, the brain's ability to reorganize neural pathways in response to experience and meaningful emotional activation. Research on predictive coding, interoception, and autonomic regulation shows that the brain continuously interprets internal and external signals, shaping perception, emotional responses, and behavior patterns.
                </p>
                <p className="text-[16px] leading-[1.8] text-[#475569]">
                  The NeuroHolistic Method™ works within this biological reality by activating neural and physiological processes that allow the system to reorganize itself. Through carefully structured therapeutic interaction, including sensory-evocative language, emotional processing, and relational resonance, new patterns of perception and regulation can emerge, supporting deep and lasting transformation.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Pillars Column */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p className="mb-8 text-[15px] italic text-[#64748B]">
                The method also considers emerging perspectives on human bioenergetic processes and systemic coherence, recognizing that human transformation occurs through the dynamic interaction of neural, biochemical, emotional, and energetic dimensions of the living system.
              </p>
              <div className="grid grid-cols-1 border-t border-[#E2E8F0]">
                {SCIENTIFIC_PILLARS.map((pillar, i) => (
                  <div
                    key={pillar.tag}
                    className="group grid grid-cols-1 gap-4 border-b border-[#E2E8F0] py-6 md:grid-cols-2 md:items-start lg:py-8"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[11px] text-[#94A3B8] mb-2">0{i + 1}</span>
                      <h3 className="text-[16px] font-semibold text-[#0F172A]">{pillar.tag}</h3>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-[#6366F1]">
                        {pillar.label}
                      </p>
                    </div>
                    <p className="text-[14px] leading-[1.7] text-[#64748B] md:pt-4">
                      {pillar.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}