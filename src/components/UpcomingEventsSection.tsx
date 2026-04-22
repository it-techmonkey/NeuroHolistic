"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { EventItem, EventTypeKey } from "./events/types";
import { useContentLocale } from "./retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";

export default function UpcomingEventsSection({ events }: { events: EventItem[] }) {
  const locale = useContentLocale();
  const { t, isArabic } = useLang();
  const E = isArabic ? ar.eventsListing : t.eventsListing;

  const [filters, setFilters] = useState<{ type: "all" | EventTypeKey; date: string }>({
    type: "all",
    date: "all",
  });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.type !== "all" && e.typeKey !== filters.type) return false;
      if (filters.date !== "all" && e.filterPeriod !== filters.date) return false;
      return true;
    });
  }, [events, filters]);

  const dateOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [{ value: "all", label: E.filterAllDates }];
    for (const ev of events) {
      if (!seen.has(ev.filterPeriod)) {
        seen.add(ev.filterPeriod);
        const label = E.periods[ev.filterPeriod as keyof typeof E.periods] ?? ev.filterPeriod;
        opts.push({ value: ev.filterPeriod, label });
      }
    }
    return opts;
  }, [events, E]);

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <header className="mb-16 flex flex-col items-start justify-between gap-12 border-b border-[#E2E8F0] pb-12 lg:flex-row lg:items-end">
          <div className="max-w-[600px]" dir={locale === "ar" ? "rtl" : "ltr"}>
            <h2 className="text-[42px] font-light leading-[1.05] tracking-tight text-[#0F172A] md:text-[56px]">
              {E.headingLine1} <span className="italic text-[#64748B]">{E.headingLine2}</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{E.filterType}</span>
              <select
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value as "all" | EventTypeKey,
                  }))
                }
                className="cursor-pointer border-b border-[#E2E8F0] bg-transparent pb-1 text-[14px] font-semibold text-[#0F172A] outline-none transition-colors hover:border-[#0F172A]"
              >
                <option value="all">{E.filterAllTypes}</option>
                <option value="workshop">{E.filterWorkshops}</option>
                <option value="retreat">{E.filterRetreats}</option>
                <option value="online">{E.filterLiveOnline}</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{E.filterSchedule}</span>
              <select
                onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                className="cursor-pointer border-b border-[#E2E8F0] bg-transparent pb-1 text-[14px] font-semibold text-[#0F172A] outline-none transition-colors hover:border-[#0F172A]"
              >
                {dateOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((event, i) => <EventRow key={event.id} event={event} index={i} locale={locale} labels={E} />)
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center font-mono text-[13px] text-[#94A3B8]"
              >
                {E.noResults}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function EventRow({
  event,
  index,
  locale,
  labels,
}: {
  event: EventItem;
  index: number;
  locale: "en" | "ar";
  labels: { dateLocationLabel: string; registerNow: string };
}) {
  const copy = event.locales[locale];
  const detailsHref = event.slug ? `/events/${event.slug}` : `/events/${event.id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative border-b border-[#E2E8F0] py-10 transition-colors hover:bg-[#FAFBFF] md:py-14"
    >
      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12 md:gap-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[12px] text-[#94A3B8]">0{index + 1}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">{copy.typeLabel}</span>
          </div>
        </div>

        <div className="md:col-span-5" dir={locale === "ar" ? "rtl" : "ltr"}>
          <h3 className="mb-4 text-[24px] font-semibold tracking-tight text-[#0F172A] md:text-[28px]">{copy.title}</h3>
          <p className="max-w-[400px] text-[15px] leading-relaxed text-[#64748B]">{copy.description}</p>
        </div>

        <div className="md:col-span-3" dir={locale === "ar" ? "rtl" : "ltr"}>
          <div className="flex flex-col gap-1 border-l border-[#E2E8F0] pl-6 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{labels.dateLocationLabel}</span>
            <span className="text-[15px] font-medium text-[#0F172A]">{copy.date}</span>
            <span className="text-[14px] text-[#64748B]">{copy.location}</span>
          </div>
        </div>

        <div className="flex items-center md:col-span-2 md:justify-end">
          <Link
            href={detailsHref}
            className="inline-flex h-12 items-center justify-center border border-[#0F172A] px-6 text-[13px] font-bold uppercase tracking-widest text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
          >
            {labels.registerNow}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
