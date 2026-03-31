"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ProfessionalOutcome() {
  return (
    <section className="bg-[#0F172A] py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* ── Background Detail ── */}
      <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
        <Image
          src="/images/dummy-user.svg"
          alt="Practitioner Training"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/80 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* ── Content Column ── */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >

              <h2 className="mb-10 text-[32px] font-light leading-[1.15] tracking-tight text-white md:text-[48px] lg:text-[56px]">
                Certified NeuroHolistic <br className="hidden md:block" />
                Applied Psychology <span className="italic text-slate-400 font-normal">Practitioner</span>
              </h2>

              <div className="max-w-[600px] border-l border-white/10 pl-8 space-y-6">
                <p className="text-[17px] leading-[1.8] text-slate-300">
                  Graduates are prepared to operate within clinical, emotional regulation, and wellbeing contexts, applying the integrative logic of the NeuroHolistic Method™ with systemic precision.
                </p>
                <p className="text-[15px] leading-[1.8] text-slate-500 italic">
                  Maintenance of professional boundaries and ethical standards is a mandatory prerequisite for the active use of the designation.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Status Detail Column ── */}
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full max-w-[320px] bg-white/[0.03] backdrop-blur-md border border-white/10 p-8"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Practitioner Title</span>
                  <span className="text-[13px] font-bold text-white uppercase tracking-wider">CNAP-P Designation</span>
                </div>
                
                <div className="h-px w-full bg-white/10" />

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Authored by</span>
                  <span className="text-[13px] font-medium text-slate-300">The NeuroHolistic Institute Board of Standards</span>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8B8BFF]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">Full Accreditation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}