"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const PHASES = [
  { number: "01", title: "Release", desc: "Releasing accumulated emotional and physiological tension to shift out of chronic stress.", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80" },
  { number: "02", title: "Repatterning", desc: "Reorganizing deep neural patterns that have kept the system locked in old adaptations.", img: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80" },
  { number: "03", title: "Integration", desc: "Stabilizing new neural pathways so that regulation becomes the default state.", img: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80" },
  { number: "04", title: "Regulation", desc: "Strengthening the nervous system's capacity for self-regulation and resilience.", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" },
  { number: "05", title: "Expansion", desc: "Embedding transformation into identity, supporting the expansion of human potential.", img: "/images/dummy-user.svg" },
];

export default function FivePhaseArchitecture() {
  return (
    <section className="bg-white py-24 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mb-20 max-w-[800px]">
          <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">The Framework</span>
          <h2 className="text-[36px] font-medium leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
            The Five-Phase Architecture of the NeuroHolis&c
Method™
          </h2>
        </div>

        <div className="flex flex-col gap-12 md:flex-row md:gap-6 lg:gap-8">
          {PHASES.map((phase, i) => (
            <motion.div 
              key={phase.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              viewport={{ once: true }}
              className="flex-1 group"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[20px] bg-[#F1F5F9] mb-6">
                <Image src={phase.img} alt={phase.title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[12px] font-bold text-[#0F172A]">
                  {phase.number}
                </div>
              </div>
              <h3 className="text-[20px] font-semibold text-[#0F172A] mb-2">{phase.title}</h3>
              <p className="text-[14px] leading-[1.6] text-[#475569]">{phase.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}