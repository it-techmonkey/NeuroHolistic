"use client";

import { motion } from "framer-motion";

const SCIENTIFIC_PILLARS = [
  { tag: "Positive Psychology" },
  { tag: "Neuroscience & Neuroplasticity" },
  { tag: "Epigenetic Regulation" },
  { tag: "Nervous System Science" },
  { tag: "Consciousness" },
  { tag: "Complex Human Systems" },
];

export default function MethodScientificFoundations() {
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
            Scientific & <br className="hidden md:block" />
            Theoretical <span className="italic font-light text-slate-400">Foundations</span>
          </h2>
        </motion.div>

        {/* Main Content Grid - Using items-center for perfect visual balance */}
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:items-center">
          
          {/* Left Column: The Full Narrative (Unbroken) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="space-y-6 text-[17px] leading-[1.8] text-slate-600">
              <p>
                The NeuroHolistic Method™ is grounded in contemporary scientific understanding of how the human system regulates, adapts, and transforms. Its theoretical foundation integrates insights from neuroscience, psychoneuroimmunology, and epigenetic regulation to understand how thoughts, emotions, and physiological states interact to shape human experience.
              </p>
              <p>
                Central to the method is the principle of neuroplasticity, the brain’s ability to reorganize neural pathways in response to experience and meaningful emotional activation. Research on predictive coding, interoception, and autonomic regulation shows that the brain continuously interprets internal and external signals, shaping perception, emotional responses, and behavior patterns.
              </p>
              <p>
                The NeuroHolistic Method™ works within this biological reality by activating neural and physiological processes that allow the system to reorganize itself. Through carefully structured therapeutic interaction, including sensory-evocative language, emotional processing, and relational resonance, new patterns of perception and regulation can emerge, supporting deep and lasting transformation.
              </p>
              <p>
                The method also considers emerging perspectives on human bioenergetic processes and systemic coherence, recognizing that human transformation occurs through the dynamic interaction of neural, biochemical, emotional, and energetic dimensions of the living system.
              </p>
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
                {SCIENTIFIC_PILLARS.map((pillar, i) => (
                  <div 
                    key={pillar.tag}
                    className="group flex items-center py-5 transition-colors hover:bg-white"
                  >
                    <span className="w-10 shrink-0 font-mono text-[11px] tracking-tighter text-slate-400">
                      0{i + 1}
                    </span>
                    <h3 className="text-lg font-light tracking-tight text-slate-900">
                      {pillar.tag}
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