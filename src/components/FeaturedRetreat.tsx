"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ContentLocale, FeaturedRetreatData } from "./retreats/types";
import { useContentLocale } from "./retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";

interface FeaturedRetreatProps {
  retreat: FeaturedRetreatData;
}

function FeaturedTitle({ title, locale }: { title: string; locale: ContentLocale }) {
  if (locale === "ar") {
    return (
      <h2 className="mb-8 text-[36px] font-light leading-[1.15] tracking-tight text-[#0F172A] md:text-[48px]" dir="rtl">
        {title}
      </h2>
    );
  }
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return (
      <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[48px]">
        {title}
      </h2>
    );
  }
  return (
    <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[48px]">
      {words.slice(0, -1).join(" ")} <br />
      <span className="font-normal italic text-[#64748B]">{words[words.length - 1]}</span>
    </h2>
  );
}

export default function FeaturedRetreat({ retreat }: FeaturedRetreatProps) {
  const locale = useContentLocale();
  const copy = retreat.locales[locale];
  const { t, isArabic } = useLang();
  const L = isArabic ? ar.retreatsListing : t.retreatsListing;

  const detailsHref = retreat.slug ? `/retreats/${retreat.slug}` : `/retreats?id=${retreat.id}`;

  return (
    <div className="relative w-full border-b border-[#E2E8F0] py-24 md:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7"
          >
            <div className="group relative aspect-[16/10] w-full overflow-hidden bg-[#F8FAFC]">
              <Image
                src={retreat.image}
                alt={copy.title}
                fill
                className="object-cover grayscale-[20%] transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0"
                sizes="(max-width: 1024px) 100vw, 60vw"
                priority
              />
              <div className="pointer-events-none absolute inset-4 border border-white/20" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            <FeaturedTitle title={copy.title} locale={locale} />

            <p className="mb-12 text-[17px] leading-[1.8] text-[#475569]">{copy.description}</p>

            <div className="mb-12 space-y-6 border-t border-[#F1F5F9] pt-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.time}</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">{copy.date}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.duration}</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">{copy.duration ?? "—"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.capacity}</span>
                  <span className="text-[15px] font-medium text-[#0F172A]">
                    {retreat.capacity} {L.participantsLabel}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.status}</span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">{L.registrationOpen}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href={detailsHref}
                className="inline-flex h-14 items-center justify-center bg-[#0F172A] px-10 text-[13px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B]"
              >
                {L.registerNow}
              </Link>
              <Link
                href={detailsHref}
                className="group inline-flex items-center gap-2 border-b border-[#0F172A] pb-1 text-[13px] font-bold uppercase tracking-widest text-[#0F172A]"
              >
                {L.viewDetails}
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
