"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { RetreatItem } from "./retreats/types";
import { useContentLocale } from "./retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";

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

        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {retreats.map((retreat, i) => {
            const copy = retreat.locales[locale];
            const href = retreat.slug ? `/retreats/${retreat.slug}` : `/retreats?id=${retreat.id}`;

            return (
              <motion.div
                key={retreat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="group flex flex-col"
              >
                <Link
                  href={href}
                  className="relative mb-8 block aspect-[16/10] overflow-hidden border border-[#F1F5F9] bg-[#FAFBFF] p-2 transition-all group-hover:border-[#6366F1]"
                >
                  <div className="relative h-full w-full overflow-hidden bg-slate-200">
                    <Image
                      src={retreat.image}
                      alt={copy.title}
                      fill
                      className="object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </Link>

                <div className="flex flex-1 flex-col" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-mono text-[12px] text-[#CBD5E1]">0{i + 1}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#6366F1]">{copy.date}</span>
                  </div>

                  <h3 className="mb-3 text-[22px] font-semibold tracking-tight text-[#0F172A]">{copy.title}</h3>

                  <div className="mb-6 flex flex-col gap-1 border-l border-[#E2E8F0] pl-4 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-4">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{L.locationLabel}</span>
                    <span className="text-[14px] text-[#475569]">{copy.location}</span>
                  </div>

                  <p className="mb-8 line-clamp-2 text-[15px] leading-relaxed text-[#64748B]">{copy.description}</p>

                  <Link
                    href={href}
                    className="group mt-auto inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-[#0F172A]"
                  >
                    <span className="border-b border-transparent pb-0.5 transition-all group-hover:border-[#0F172A]">{L.viewRegistration}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
