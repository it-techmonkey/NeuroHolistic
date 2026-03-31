"use client";

import { motion } from "framer-motion";

export default function CorporateProgramFormats() {
  return (
    <section className="bg-white py-16 md:py-24 border-y border-[#E2E8F0]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-5 lg:sticky lg:top-32 h-fit">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[34px] font-medium leading-[1.1] tracking-tight text-[#0F172A] md:text-[46px]">
                Program <br/>
                <span className="italic text-[#64748B]">Formats</span>
              </h2>
              <p className="mt-6 text-[16px] leading-[1.8] text-[#475569]">
                Corporate programs can be delivered through various structured mediums, and can be adapted to the specific needs of each organization.
              </p>
            </motion.div>
          </div>
          <div className="lg:col-span-7">
            <ul className="border-t border-[#E2E8F0]">
              {[
                "Executive workshops",
                "Team development sessions",
                "Leadership programs",
                "Organizational wellbeing seminars"
              ].map((format, i) => (
                <motion.li 
                  key={format}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between border-b border-[#E2E8F0] py-6 md:py-8 text-[18px] md:text-[20px] text-[#475569]"
                >
                  <span>{format}</span>
                  <span className="text-[#6366F1] font-mono text-[14px]">0{i + 1}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
