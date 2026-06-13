"use client";

import Image from "next/image";
import Link from "next/link";
import type { RetreatItem } from "@/components/retreats/types";
import { useContentLocale } from "@/components/retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";
import MobileBackButton from "@/components/MobileBackButton";

interface Props {
  retreat: RetreatItem;
}

export default function RetreatDetailClient({ retreat }: Props) {
  const locale = useContentLocale();
  const { t, isArabic } = useLang();
  const D = isArabic ? ar.retreatsDetail : t.retreatsDetail;
  const copy = retreat.locales[locale];
  const backLabel = isArabic ? "العودة للاعتكافات" : D.backToRetreats;

  return (
    <section className="bg-white pb-24 pt-36 md:pb-28 md:pt-44">
      <div className="mx-auto max-w-[1000px] px-6 md:px-10">
        {/* Desktop back link */}
        <Link href="/retreats" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {D.backToRetreats}
        </Link>
        {/* Mobile back button */}
        <MobileBackButton href="/retreats" label={backLabel} />

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E2E8F0]">
          <div className="relative h-[280px] w-full md:h-[420px]">
            <Image src={retreat.image} alt={copy.title} fill className="object-cover" priority />
          </div>
        </div>

        <h1
          className="mt-8 text-[34px] font-semibold leading-tight text-[#0F172A] md:text-[44px]"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {copy.title}
        </h1>

        <p className="mt-6 text-[17px] leading-[1.8] text-[#475569]" dir={locale === "ar" ? "rtl" : "ltr"}>
          {copy.description}
        </p>

        <div className="mt-10 grid gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:grid-cols-2">
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
      </div>
    </section>
  );
}
