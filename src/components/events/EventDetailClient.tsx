"use client";

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { EventItem } from "@/components/events/types";
import { useContentLocale } from "@/components/retreats/locale";
import { useLang } from "@/lib/translations/LanguageContext";
import { ar } from "@/lib/translations/ar";
import MobileBackButton from "@/components/MobileBackButton";
import EventRegisterButton from "@/components/events/EventRegisterButton";
import EventPaymentButton from "@/components/events/EventPaymentButton";
import EventPaymentBanner from "@/components/events/EventPaymentBanner";

interface Props {
  event: EventItem;
}

export default function EventDetailClient({ event }: Props) {
  const locale = useContentLocale();
  const { t, isArabic } = useLang();
  const E = isArabic ? ar.eventsListing : t.eventsListing;
  const copy = event.locales[locale];
  const backLabel = isArabic ? "العودة للفعاليات" : E.backToEvents;

  return (
    <section className="bg-white pb-24 pt-36 md:pb-28 md:pt-44">
      <div className="mx-auto max-w-[1000px] px-6 md:px-10">
        {/* Desktop back link */}
        <Link href="/events" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#6366F1] hover:text-[#4F46E5]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {E.backToEvents}
        </Link>
        {/* Mobile back button */}
        <MobileBackButton href="/events" label={backLabel} />

        <Suspense fallback={null}>
          <EventPaymentBanner locale={locale} />
        </Suspense>

        <div className="mt-6 overflow-hidden rounded-[18px] border border-[#E2E8F0]">
          <div className="relative h-[280px] w-full md:h-[420px]">
            <Image src={event.image} alt={copy.title} fill className="object-cover" priority />
          </div>
        </div>

        <h1
          className="mt-8 text-[34px] font-semibold leading-tight text-[#0F172A] md:text-[44px]"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {copy.title}
        </h1>

        {copy.subtitle && (
          <p
            className="mt-3 text-[16px] font-medium uppercase tracking-widest text-[#6366F1]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {copy.subtitle}
          </p>
        )}

        {copy.hook && (
          <p
            className="mt-6 text-[19px] italic leading-[1.8] text-[#334155]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {copy.hook}
          </p>
        )}

        {copy.description.split("\n\n").map((para, i) => (
          <p key={i} className="mt-6 text-[17px] leading-[1.8] text-[#475569]" dir={locale === "ar" ? "rtl" : "ltr"}>
            {para}
          </p>
        ))}

        <div className="mt-10 grid gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:grid-cols-2">
          <p className="text-[15px] text-[#334155]">
            <strong>{E.detailDateLabel}</strong> {copy.date}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{E.detailTimeLabel}</strong> {copy.time ?? E.detailTimeTbd}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{E.detailLocationLabel}</strong> {copy.location}
          </p>
          <p className="text-[15px] text-[#334155]">
            <strong>{E.detailTypeLabel}</strong> {copy.typeLabel}
          </p>
          {copy.price && (
            <p className="text-[15px] text-[#334155] md:col-span-2">
              <strong>{locale === "ar" ? "السعر:" : "Price:"}</strong> {copy.price}
            </p>
          )}
        </div>

        {copy.sections && copy.sections.length > 0 && (
          <div className="mt-12 flex flex-col gap-10" dir={locale === "ar" ? "rtl" : "ltr"}>
            {copy.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-[22px] font-semibold text-[#0F172A] md:text-[26px]">{section.heading}</h2>
                {section.intro && <p className="mt-3 text-[16px] text-[#475569]">{section.intro}</p>}
                <ul className="mt-4 flex flex-col gap-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3 text-[15px] leading-relaxed text-[#334155]">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6366F1]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {copy.closingLine && (
          <p
            className="mt-12 text-[19px] font-medium italic leading-[1.8] text-[#0F172A]"
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {copy.closingLine}
          </p>
        )}

        {copy.ctaLabel && (
          <div className="mt-10 flex" dir={locale === "ar" ? "rtl" : "ltr"}>
            {event.isPaid ? (
              <EventPaymentButton
                eventId={event.slug ?? event.id}
                eventTitle={copy.title}
                ctaLabel={copy.ctaLabel}
                locale={locale}
                sessionDates={event.sessionDates}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#0F172A] px-10 text-[14px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B]"
              />
            ) : (
              <EventRegisterButton
                eventId={event.slug ?? event.id}
                eventTitle={copy.title}
                ctaLabel={copy.ctaLabel}
                locale={locale}
                className="inline-flex h-14 items-center justify-center rounded-full bg-[#0F172A] px-10 text-[14px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B]"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
