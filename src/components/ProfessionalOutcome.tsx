"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ProfessionalOutcome() {
  const { t, isUrdu } = useLang();
  const po = t.professionalOutcome;

  return (
    <section className="bg-[#0F172A] py-16 md:py-20 lg:py-24 relative overflow-hidden">
      {/* ── Abstract Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial glow */}
        <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_60%)] blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(61,90,255,0.08)_0%,transparent_60%)] blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        {/* Decorative circles */}
        <div className="absolute top-[15%] right-[20%] h-32 w-32 rounded-full border border-white/[0.04]" />
        <div className="absolute bottom-[25%] right-[15%] h-48 w-48 rounded-full border border-white/[0.03]" />
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
                {po.heading1} <br className="hidden md:block" />
                {po.heading2} <span className="italic text-slate-400 font-normal">{po.heading3}</span>
              </h2>

              <div className="max-w-[600px] border-l border-white/10 pl-8 space-y-6">
                <p className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-slate-300`}>
                  {po.mainDescription}
                </p>
                <p className={`text-[15px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-slate-500 italic`}>
                  {po.note}
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
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{po.practitionerTitle}</span>
                  <span className="text-[13px] font-bold text-white uppercase tracking-wider">{po.designation}</span>
                </div>
                
                <div className="h-px w-full bg-white/10" />

                <div className="flex flex-col gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">{po.authoredBy}</span>
                  <span className="text-[13px] font-medium text-slate-300">{po.boardName}</span>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8B8BFF]" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-white">{po.accreditation}</span>
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