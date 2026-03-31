"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AcademyIntro() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24 font-sans antialiased selection:bg-[#2B2F55]/10">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Column 01: The Vision ── */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5"
          >
            <motion.p 
              className="mb-6 text-[12px] font-bold uppercase tracking-[0.3em] text-slate-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              The Academy
            </motion.p>
            
            <h2 className="mb-10 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
              The first generation of <br/>
              <span className="italic text-slate-500 font-normal">NeuroHolistic practitioners</span>
            </h2>

            <div className="space-y-8">
              <p className="text-[17px] leading-[1.8] text-slate-600 md:text-[18px]">
                The NeuroHolistic Method™ introduces a new integrative framework for understanding and facilitating human transformation.
              </p>
              
              <div className="h-px w-12 bg-slate-200" />

              <div className="space-y-6 text-[16px] leading-[1.8] text-slate-500">
                <p>
                  Practitioners trained through the Academy are among the first professionals to apply this approach in practice, integrating insights from neuroscience, psychology, and systemic human development.
                </p>

                <p>
                  NeuroHolistic therapists represent a new generation of practitioners working at the intersection of science, awareness, and transformative human work.
                </p>
              </div>


            </div> 
          </motion.div>

          {/* ── Column 02: Cinematic Imagery ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 lg:pt-12"
          >
            <div className="group relative w-full rounded-[24px] border border-slate-200 bg-gradient-to-br from-white via-[#FAFBFF] to-[#F1F5F9] p-3 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-all duration-500 hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] md:p-4">
              <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/60" />
              {/* Internal Image Frame */}
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-[#F8FAFC] md:aspect-[16/10]">
                <Image
                  src="/images/team/team.png"
                  alt="Academy Training Session"
                  fill
                  unoptimized
                  className="object-contain object-bottom bg-[#F8FAFC] p-2 transition-transform duration-700 group-hover:scale-[1.02] md:p-4"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/8 via-transparent to-white/20" />
              </div>
            </div>
            
          </motion.div>

        </div>
      </div>
    </section>
  );
}