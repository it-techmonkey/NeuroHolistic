"use client";

import { motion } from "framer-motion";

const FORMATS = [
  "Executive workshops",
  "Team development sessions",
  "Leadership programs",
  "Organizational wellbeing seminars",
];

export default function CorporateProgramFormats() {
  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          
          {/* ── Heading Column (Spans 5) ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <span className="mb-4 block font-mono text-[11px] uppercase tracking-widest text-[#6366F1]">
              Section 05
            </span>
            <h2 className="text-[34px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[46px]">
              Program <br/>
              <span className="italic text-[#64748B] font-normal">Formats.</span>
            </h2>
          </motion.div>

          {/* ── Content Column (Spans 7) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7 lg:pt-8"
          >
            <p className="mb-8 text-[17px] leading-[1.8] text-[#475569]">
              Corporate programs can be delivered through:
            </p>
            <ul className="space-y-4 border-t border-[#E2E8F0]">
              {FORMATS.map((format, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 border-b border-[#E2E8F0] py-5 text-[17px] text-[#475569]"
                >
                  <span className="text-[#6366F1]">•</span>
                  <span>{format}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[16px] leading-[1.8] text-[#64748B]">
              Programs can be adapted to the needs of each organization.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
