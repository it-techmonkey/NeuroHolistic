"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PHASES = [
  { 
    number: "01", 
    title: "Release", 
    desc: "Releasing accumulated emotional and physiological tension within the nervous system. The system shifts from chronic stress toward safety and responsiveness.", 
    img: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2071&auto=format&fit=crop" 
  },
  { 
    number: "02", 
    title: "Developmental Repatterning", 
    desc: "Updating outdated internal models by reorganizing deep imprints related to attachment, safety, and self-perception formed in early development.", 
    img: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2070&auto=format&fit=crop" 
  },
  { 
    number: "03", 
    title: "Neuroplastic Rewiring", 
    desc: "Restructuring neural and cognitive patterns through the brain's natural capacity for adaptation, forming new pathways for regulation and behavior.", 
    img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?q=80&w=2070&auto=format&fit=crop" 
  },
  { 
    number: "04", 
    title: "Targeted Transformation", 
    desc: "Intentionally applying increased internal coherence to specific areas such as relationships, health, or personal direction for meaningful change.", 
    img: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop" 
  },
  { 
    number: "05", 
    title: "Integration & Stabilization", 
    desc: "Consolidating transformation so new patterns become sustainable. The system learns to maintain coherence and flexibility independently.", 
    img: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=2070&auto=format&fit=crop" 
  },
];

export default function FivePhaseArchitecture() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6">
        
        {/* Compact Header */}
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
            The Five-Phase Architecture
          </h2>
          <p className="mt-4 text-slate-500 text-[15px] max-w-2xl mx-auto">
            A systematic framework designed to facilitate lasting human change through neural and systemic reorganization.
          </p>
        </div>

        {/* Sequential Vertical Layout */}
        <div className="space-y-24 md:space-y-32">
          {PHASES.map((phase, i) => {
            const isEven = i % 2 === 1;
            
            return (
              <div 
                key={phase.number}
                className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${isEven ? 'lg:flex-row-reverse' : ''}`}
              >
                {/* Image Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="w-full lg:w-1/2"
                >
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group">
                    <Image 
                      src={phase.img} 
                      alt={phase.title} 
                      fill 
                      priority={i === 0}
                      className="object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-105" 
                    />
                  </div>
                </motion.div>

                {/* Text Section */}
                <div className="w-full lg:w-1/2">
                  <div className="space-y-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                      Phase {phase.number}
                    </span>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                      {phase.title}
                    </h3>
                    <p className="text-[16px] text-slate-500 leading-relaxed font-normal">
                      {phase.desc}
                    </p>
                    <div className="h-0.5 w-8 bg-slate-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-10 md:p-16 rounded-3xl bg-slate-900 text-center text-white"
        >
          <h4 className="text-2xl md:text-3xl font-bold mb-4">Begin Your Consultation</h4>
          <p className="text-slate-400 max-w-md mx-auto mb-8 text-[15px]">
            Work with specialized practitioners trained to guide you through the NeuroHolistic framework.
          </p>
          <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-100 transition-colors active:scale-95">
            Book a Session
          </button>
        </motion.div>
      </div>
    </section>
  );
}