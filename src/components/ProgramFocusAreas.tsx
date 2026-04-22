"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ProgramFocusAreas() {
  const { t } = useLang();
  const cw = t.corporateWellbeing;
  const items = cw.focusItems;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="max-w-[800px] text-[34px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]"
          >
            {cw.focusTitleMain}
            <span className="italic font-normal text-[#64748B]">{cw.focusTitleAccent}</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 border-t border-[#E2E8F0] md:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`group flex flex-col border-b border-[#E2E8F0] p-8 md:p-10 ${
                i % 4 !== 3 ? "lg:border-r" : ""
              } ${
                i % 2 !== 1 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
              } lg:last:border-r-0 transition-colors hover:bg-[#FAFBFF]`}
            >
              <div className="mb-12 flex items-center justify-between">
                <span className="font-mono text-[12px] text-[#CBD5E1] transition-colors group-hover:text-[#6366F1]">
                  [ 0{i + 1} ]
                </span>
                <span className="text-[20px] text-[#6366F1] opacity-40 transition-opacity group-hover:opacity-100">
                  {["◆", "◇", "○", "△"][i]}
                </span>
              </div>

              <h3 className="mb-4 text-[19px] font-semibold leading-snug tracking-tight text-[#0F172A]">
                {item.title}
              </h3>

              <p className="text-[15px] leading-[1.7] text-[#64748B]">{item.description}</p>

              <div className="mt-auto pt-8">
                <div className="h-px w-6 bg-[#F1F5F9] transition-all group-hover:w-full group-hover:bg-[#6366F1]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
