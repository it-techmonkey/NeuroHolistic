"use client";

import { motion } from "framer-motion";
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
          {retreats.map((retreat, i) => (
            <motion.div
              key={retreat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="overflow-hidden rounded-[24px] border border-[#E2E8F0]"
            >
              <RetreatInlineDetail retreat={retreat} locale={locale} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
