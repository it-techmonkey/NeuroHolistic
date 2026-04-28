"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function CorporateProgramFormats() {
  const { t } = useLang();
  const cw = t.corporateWellbeing;
  const formats = cw.programFormatList;

  return (
    <section className="border-y border-[#E2E8F0] bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="h-fit lg:sticky lg:top-32 lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-[34px] font-medium leading-[1.1] tracking-tight text-[#0F172A] md:text-[46px]">
                {cw.programFormatTitleMain}
                <span className="italic text-[#64748B]">{cw.programFormatTitleAccent}</span>
              </h2>
              <p className="mt-6 text-[16px] leading-[1.8] text-[#475569]">{cw.programFormatIntro}</p>
            </motion.div>
          </div>
          <div className="lg:col-span-7">
            <ul className="border-t border-[#E2E8F0]">
              {formats.map((format, i) => (
                <motion.li
                  key={format}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center justify-between border-b border-[#E2E8F0] py-6 text-[18px] text-[#475569] md:py-8 md:text-[20px]"
                >
                  <span>{format}</span>
                  <span className="font-mono text-[14px] text-[#6366F1]">0{i + 1}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
