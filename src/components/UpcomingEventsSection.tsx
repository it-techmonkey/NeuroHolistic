"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import type { EventItem } from "./events/types";

/* ─── Filter Logic (Keeping your existing logic) ─────────────────────────── */
function extractDateOptions(events: EventItem[]) {
  const seen = new Set<string>();
  const options = [{ value: "all", label: "جميع التواريخ" }];
  for (const e of events) {
    const match = e.date.match(/(أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|يناير|فبراير|مارس)\s+\d{4}/);
    if (match) {
      const month = match[1];
      const year = e.date.match(/\d{4}/)?.[0] || "";
      const key = `${month} ${year}`;
      if (key && !seen.has(key)) {
        seen.add(key);
        options.push({ value: key, label: key });
      }
    }
  }
  return options;
}

export default function UpcomingEventsSection({ events }: { events: EventItem[] }) {
  const [filters, setFilters] = useState({ type: "all", date: "all" });

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (filters.type !== "all" && e.type !== filters.type) return false;
      if (filters.date !== "all") {
        const month = e.date.match(/(أبريل|مايو|يونيو|يوليو|أغسطس|سبتمبر|أكتوبر|نوفمبر|ديسمبر|يناير|فبراير|مارس)/)?.[1] || "";
        const year = e.date.match(/\d{4}/)?.[0] || "";
        if (`${month} ${year}` !== filters.date) return false;
      }
      return true;
    });
  }, [events, filters]);

  const dateOptions = useMemo(() => extractDateOptions(events), [events]);

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        
        {/* ── Architectural Header ── */}
        <header className="mb-16 flex flex-col items-start justify-between gap-12 border-b border-[#E2E8F0] pb-12 lg:flex-row lg:items-end">
          <div className="max-w-[600px]">
            <div className="mb-6 flex items-center gap-4">

            </div>
            <h2 className="text-[42px] font-light leading-[1.05] tracking-tight text-[#0F172A] md:text-[56px]">
              الفعاليات <span className="italic text-[#64748B]">القادمة</span>
            </h2>
          </div>

          {/* Minimalist Filters (No bubbles, just hairlines) */}
          <div className="flex flex-wrap gap-8">
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">النوع</span>
              <select 
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="bg-transparent text-[14px] font-semibold text-[#0F172A] outline-none cursor-pointer border-b border-[#E2E8F0] pb-1 hover:border-[#0F172A] transition-colors"
              >
                <option value="all">الكل</option>
                <option value="ورشة عمل">ورش العمل</option>
                <option value="رحلة">الرحلات</option>
                <option value="جلسة عبر الإنترنت">الجلسات الحية</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">الجدول الزمني</span>
              <select 
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="bg-transparent text-[14px] font-semibold text-[#0F172A] outline-none cursor-pointer border-b border-[#E2E8F0] pb-1 hover:border-[#0F172A] transition-colors"
              >
                {dateOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </header>

        {/* ── The Dossier List ── */}
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              filtered.map((event, i) => (
                <EventRow key={event.id} event={event} index={i} />
              ))
            ) : (
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="py-20 text-center font-mono text-[13px] text-[#94A3B8]"
              >
                [ لا توجد نتائج ضمن الفلاتر الحالية ]
              </motion.p>
            )}
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
}

/* ─── Individual Event Row (Non-AI Card) ────────────────────────────────── */

function EventRow({ event, index }: { event: EventItem; index: number }) {
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
        
        {/* Index & Category */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[12px] text-[#94A3B8]">0{index + 1}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#6366F1]">
              {event.type}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div className="md:col-span-5">
          <h3 className="mb-4 text-[24px] font-semibold tracking-tight text-[#0F172A] md:text-[28px]">
            {event.title}
          </h3>
          <p className="max-w-[400px] text-[15px] leading-relaxed text-[#64748B]">
            {event.description}
          </p>
        </div>

        {/* Meta Info */}
        <div className="md:col-span-3">
          <div className="flex flex-col gap-1 border-l border-[#E2E8F0] pl-6">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">التاريخ // الموقع</span>
            <span className="text-[15px] font-medium text-[#0F172A]">{event.date}</span>
            <span className="text-[14px] text-[#64748B]">{event.location}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center md:col-span-2 md:justify-end">
          <Link
            href={detailsHref}
            className="inline-flex h-12 items-center justify-center border border-[#0F172A] px-6 text-[13px] font-bold uppercase tracking-widest text-[#0F172A] transition-all hover:bg-[#0F172A] hover:text-white"
          >
            سجّل الآن
          </Link>
        </div>
        
      </div>
    </motion.div>
  );
}