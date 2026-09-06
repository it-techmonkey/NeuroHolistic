"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MOCK_EVENTS } from "@/components/events/events-data";
import { useContentLocale } from "@/components/retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";

/**
 * Featured live events on the Academy page — events flagged with
 * `showOnAcademyPage` in events-data.ts (currently the Quantum Leap
 * experience, hosted by Dr. Fawzia Yassmina).
 */
export default function AcademyUpcomingEvents() {
  const locale = useContentLocale();
  const { isArabic } = useLang();
  const events = MOCK_EVENTS.filter((e) => e.showOnAcademyPage);

  if (events.length === 0) return null;

  return (
    <section className="w-full bg-white px-4 py-16 md:px-6 md:py-24">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as const }}
          className="mb-12 max-w-[600px]"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          <span className="font-mono text-[11px] uppercase tracking-widest text-[#6366F1]">
            {isArabic ? "فعالية مباشرة قادمة" : "Upcoming Live Event"}
          </span>
          <h2 className="mt-3 text-[32px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[42px]">
            {isArabic ? "من نفس المنهج الذي تُدرَّس منه الأكاديمية" : "From the same method the Academy teaches"}
          </h2>
        </motion.div>

        <div className="flex flex-col gap-8 md:flex-row">
          {events.map((event, i) => {
            const copy = event.locales[locale];
            const href = `/events/${event.slug ?? event.id}`;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const }}
                className="group flex flex-1 flex-col overflow-hidden rounded-[24px] border border-[#E2E8F0] transition-shadow hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
              >
                <div className="relative h-[220px] w-full overflow-hidden">
                  <Image
                    src={event.image}
                    alt={copy.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-8" dir={locale === "ar" ? "rtl" : "ltr"}>
                  <span className="mb-3 text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">
                    {copy.typeLabel}
                  </span>
                  <h3 className="mb-3 text-[22px] font-semibold leading-tight text-[#0F172A] md:text-[26px]">
                    {copy.title}
                  </h3>
                  <p className="mb-6 flex-1 text-[15px] leading-relaxed text-[#64748B]">
                    {copy.cardDescription ?? copy.description}
                  </p>

                  <div className="mb-6 flex flex-col gap-1 border-t border-[#E2E8F0] pt-4">
                    <span className="text-[14px] font-medium text-[#0F172A]">{copy.date}</span>
                    {copy.price && <span className="text-[14px] text-[#64748B]">{copy.price}</span>}
                  </div>

                  <Link
                    href={href}
                    className="inline-flex h-12 items-center justify-center self-start rounded-full border border-[#0F172A] px-8 text-[13px] font-bold uppercase tracking-widest text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
                  >
                    {copy.ctaLabel ?? (isArabic ? "اعرف المزيد" : "Learn More")}
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
