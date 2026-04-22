"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from "@/lib/translations/LanguageContext";

export default function RetreatFormat() {
  const { t } = useLang();
  const rl = t.retreatsLanding;
  const phases = rl.formatItems;

  return (
    <section className="border-t border-[#E2E8F0] bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
              {rl.formatTitleLine1} <br />
              <span className="font-normal italic text-[#64748B]">{rl.formatTitleAccent}</span>
            </h2>

            <p className="mb-12 text-[17px] leading-[1.8] text-[#475569]">{rl.formatIntro}</p>

            <div className="flex flex-col border-t border-[#E2E8F0]">
              {phases.map((item, i) => (
                <div
                  key={item.title}
                  className="group border-b border-[#E2E8F0] py-6 transition-colors hover:bg-[#FAFBFF]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="mb-1 block font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">
                        {item.label} // 0{i + 1}
                      </span>
                      <h4 className="text-[17px] font-semibold text-[#0F172A]">{item.title}</h4>
                    </div>
                    <div className="mt-4 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E2E8F0] transition-colors group-hover:bg-[#6366F1]" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="group relative w-full border border-[#F1F5F9] bg-[#FAFBFF] p-4">
              <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[16/11]">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=1400&q=80"
                  alt={rl.retreatStructureImageAlt}
                  fill
                  className="object-cover grayscale-[15%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
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
