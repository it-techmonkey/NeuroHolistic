"use client";

import { motion } from "framer-motion";
import { useLang } from "@/lib/translations/LanguageContext";

export default function OrganizationalImpact() {
  const { t } = useLang();
  const cw = t.corporateWellbeing;
  const impacts = cw.impactItems;

  return (
    <section className="border-t border-white/5 bg-[#0F172A] py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[34px] font-light leading-[1.1] tracking-tight text-white md:text-[52px]"
            >
              {cw.impactTitleLine1} <br />
              <span className="font-normal italic text-slate-400">{cw.impactTitleAccent}</span>
            </motion.h2>
          </div>
          <div className="flex items-end lg:col-span-5" />
        </div>

        <div className="grid grid-cols-1 border-t border-white/10 md:grid-cols-2 lg:grid-cols-3">
          {impacts.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className={`group flex flex-col border-b border-white/10 p-8 md:p-10 ${
                (i + 1) % 3 !== 0 ? "lg:border-r" : ""
              } ${
                (i + 1) % 2 !== 0 ? "md:border-r lg:border-r" : "md:border-r-0 lg:border-r"
              } lg:last:border-r-0 transition-colors hover:bg-white/[0.02]`}
            >
              <div className="mb-12">
                <span className="font-mono text-[12px] text-white/20 transition-colors group-hover:text-[#8B8BFF]">
                  [ 0{i + 1} ]
                </span>
              </div>

              <h3 className="mb-4 text-[20px] font-semibold leading-snug tracking-tight text-white">{item.title}</h3>

              <p className="text-[15px] leading-[1.7] text-slate-400">{item.description}</p>

              <div className="mt-auto pt-10">
                <div className="h-px w-6 bg-white/10 transition-all group-hover:w-full group-hover:bg-[#8B8BFF]" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
