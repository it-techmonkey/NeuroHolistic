"use client";

import { motion } from "framer-motion";

const ACCREDITATIONS = [
  { 
    name: "Complementary Medical Association", 
    abbr: "CMA", 
    status: "Full Member Provider",
    id: "REG-8820"
  },
  { 
    name: "CPD Certification Service", 
    abbr: "CPD", 
    status: "Accredited Excellence",
    id: "UK-CPD-21"
  },
];

export default function Accreditation() {
  return (
    <section className="bg-white py-24 md:py-32 border-t border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Editorial Header ── */}
        <div className="mb-16 text-center">

          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] font-light leading-tight tracking-tight text-[#0F172A] md:text-[44px]"
          >
            Accreditation & Professional <span className="italic text-[#64748B] font-normal">recognition.</span>
          </motion.h2>
        </div>

        {/* ── The Seal Matrix ── */}
        <div className="mx-auto max-w-4xl border border-[#E2E8F0]">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {ACCREDITATIONS.map((item, i) => (
              <motion.div
                key={item.abbr}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`group flex flex-col p-10 transition-colors hover:bg-[#FAFBFF] ${
                  i === 0 ? "md:border-r border-[#E2E8F0]" : ""
                } ${
                  i < 2 ? "border-b md:border-b-0 border-[#E2E8F0]" : ""
                }`}
              >
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#CBD5E1]">
                    ID // {item.id}
                  </span>
                  <div className="h-2 w-2 rounded-full bg-[#E2E8F0] group-hover:bg-[#6366F1] transition-colors" />
                </div>

                <h3 className="mb-2 text-[18px] font-semibold text-[#0F172A]">
                  {item.name}
                </h3>
                
                <div className="mt-4 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">
                    {item.abbr} Certified
                  </span>
                  <span className="text-[13px] text-[#64748B]">
                    {item.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Subtext Footer ── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8] max-w-xl mx-auto leading-relaxed">
            The curriculum is issued by the NeuroHolistic Institute Board of Standards 
            and audited by international professional bodies.
          </p>
        </motion.div>

      </div>
    </section>
  );
}