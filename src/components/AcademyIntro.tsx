"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AcademyIntro() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Column 01: The Vision (Spans 5) ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
              The first generation of <br/>
              <span className="italic text-[#64748B] font-normal">NeuroHolistic practitioners.</span>
            </h2>

            <div className="space-y-8">
              <p className="text-[17px] leading-[1.8] text-[#475569] md:text-[18px]">
                The NeuroHolistic Academy exists to train practitioners who integrate neuroscience, psychology, and systemic human development into a coherent framework for applied practice. 
              </p>
              
              <div className="h-px w-12 bg-[#E2E8F0]" />

              <p className="text-[16px] leading-[1.8] text-[#64748B]">
                Practitioners trained through the academy are among the first professionals applying this integrative framework—working in applied psychology, emotional regulation, and wellbeing contexts with a method grounded in science and human systems thinking.
              </p>
            </div>

            {/* Architectural Meta-info
            <div className="mt-12 flex flex-col gap-4 border-t border-[#F1F5F9] pt-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Foundation</span>
                <span className="text-[12px] font-semibold text-[#0F172A]">Clinical Excellence</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">Standard</span>
                <span className="text-[12px] font-semibold text-[#0F172A]">Ethical Integrity</span>
              </div>
            </div> */}
          </motion.div>

          {/* ── Column 02: Cinematic Imagery (Spans 7) ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 lg:pt-12"
          >
            <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
              {/* Internal Image Frame - Sharp edges */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 md:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                  alt="Academy Training Session"
                  fill
                  className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}