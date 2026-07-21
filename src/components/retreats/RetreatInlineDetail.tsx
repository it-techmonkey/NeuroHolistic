"use client";

import { motion } from "framer-motion";
import type { RetreatItem } from "./types";
import { ar } from "@/lib/translations/ar";
import { useLang } from "@/lib/translations/LanguageContext";
import RetreatWaitlistButton from "./RetreatWaitlistButton";

interface Props {
  retreat: RetreatItem;
  locale: "en" | "ar";
}

export default function RetreatInlineDetail({ retreat, locale }: Props) {
  const { t, isArabic } = useLang();
  const D = isArabic ? ar.retreatsDetail : t.retreatsDetail;
  const copy = retreat.locales[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="border-t border-[#E2E8F0] p-4 pt-8 md:p-6 md:pt-10">
        <h3 className="text-[28px] font-semibold leading-tight text-[#0F172A] md:text-[36px]" dir={dir}>
          {copy.title}
        </h3>

        {copy.subtitle && (
          <p className="mt-3 text-[15px] font-medium uppercase tracking-widest text-[#6366F1]" dir={dir}>
            {copy.subtitle}
          </p>
        )}

        {copy.hook && (
          <p className="mt-6 text-[17px] italic leading-[1.8] text-[#334155]" dir={dir}>
            {copy.hook}
          </p>
        )}

        {copy.description.split("\n\n").map((para, i) => (
          <p key={i} className="mt-6 text-[16px] leading-[1.8] text-[#475569]" dir={dir}>
            {para}
          </p>
        ))}

        <div className="mt-10 grid gap-4 rounded-[14px] border border-[#E2E8F0] bg-white p-6 md:grid-cols-2">
          <p className="text-[15px] text-[#334155]">
            <strong>{D.detailDateLabel}</strong> {copy.date}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{D.detailDurationLabel}</strong> {copy.duration ?? D.detailDurationTbd}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{D.detailLocationLabel}</strong> {copy.location}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{D.detailCapacityLabel}</strong>{" "}
            {retreat.capacity ? `${retreat.capacity} ${D.detailCapacityParticipants}` : D.detailCapacityTbd}
          </p>
        </div>

        {copy.closingLine && (
          <p className="mt-10 text-[17px] font-medium italic leading-[1.8] text-[#0F172A]" dir={dir}>
            {copy.closingLine}
          </p>
        )}

        {copy.ctaLabel && retreat.isWaitlistOnly && (
          <div className="mt-8 flex" dir={dir}>
            <RetreatWaitlistButton
              retreatId={retreat.slug ?? retreat.id}
              retreatTitle={copy.title}
              ctaLabel={copy.ctaLabel}
              locale={locale}
              className="inline-flex h-14 items-center justify-center rounded-full bg-[#0F172A] px-10 text-[14px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B]"
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
