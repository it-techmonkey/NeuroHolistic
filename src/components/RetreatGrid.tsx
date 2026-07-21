"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import type { RetreatItem } from "./retreats/types";
import { useContentLocale } from "./retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";
import RetreatInlineDetail from "./retreats/RetreatInlineDetail";

interface RetreatGridProps {
  retreats: RetreatItem[];
}

export default function RetreatGrid({ retreats }: RetreatGridProps) {
  const locale = useContentLocale();
  const { t, isArabic } = useLang();
  const L = isArabic ? ar.retreatsListing : t.retreatsListing;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (retreats.length === 0) return null;

  return (
    <section className="border-t border-[#E2E8F0] bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 border-b border-[#E2E8F0] pb-10 lg:flex-row lg:items-end">
          <div dir={locale === "ar" ? "rtl" : "ltr"}>
            <h2 className="text-[34px] font-light leading-tight tracking-tight text-[#0F172A] md:text-[44px]">
              {L.upcomingLine1} <span className="italic text-[#64748B]">{L.upcomingLine2}</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {retreats.map((retreat, i) => {
            const copy = retreat.locales[locale];
            const isExpanded = expandedId === retreat.id;

            const toggleExpanded = () => setExpandedId((prev) => (prev === retreat.id ? null : retreat.id));

            return (
              <motion.div
                key={retreat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`overflow-hidden rounded-[24px] border transition-colors ${
                  isExpanded ? "border-[#6366F1]/40 bg-[#FAFBFF]" : "border-[#E2E8F0] hover:border-[#6366F1]/30"
                }`}
              >
                <div
                  className={`grid grid-cols-1 items-stretch gap-8 p-4 md:grid-cols-2 md:gap-10 md:p-6 ${
                    isArabic ? "rtl-grid-reverse" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={toggleExpanded}
                    aria-expanded={isExpanded}
                    className="group relative block aspect-[16/11] w-full overflow-hidden rounded-[16px] bg-[#F8FAFC] text-left"
                  >
                    <Image
                      src={retreat.image}
                      alt={copy.title}
                      fill
                      className="object-cover grayscale-[20%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      sizes="(max-width: 768px) 100vw, 480px"
                    />
                  </button>

                  <div className="flex flex-col justify-center" dir={locale === "ar" ? "rtl" : "ltr"}>
                    <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">{copy.date}</span>

                    <h3 className="mb-3 text-[24px] font-semibold tracking-tight text-[#0F172A] md:text-[28px]">
                      {copy.title}
                    </h3>

                    <div className="mb-5 flex flex-col gap-1 border-l border-[#E2E8F0] pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.locationLabel}</span>
                      <span className="text-[14px] text-[#475569]">{copy.location}</span>
                    </div>

                    <p className="mb-8 text-[15px] leading-relaxed text-[#64748B]">
                      {copy.cardDescription ?? copy.description}
                    </p>

                    <button
                      type="button"
                      onClick={toggleExpanded}
                      aria-expanded={isExpanded}
                      className={`group inline-flex h-14 w-fit items-center justify-center gap-2 rounded-full px-10 text-[13px] font-bold uppercase tracking-widest transition-all ${
                        isExpanded
                          ? "bg-white text-[#0F172A] border border-[#0F172A]"
                          : "bg-[#0F172A] text-white hover:bg-[#1E293B]"
                      }`}
                    >
                      <span>{isExpanded ? L.hideDetails : L.viewRegistration}</span>
                      <span
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-90" : "group-hover:translate-x-1"}`}
                      >
                        {isExpanded ? "↓" : "→"}
                      </span>
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && <RetreatInlineDetail retreat={retreat} locale={locale} />}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
