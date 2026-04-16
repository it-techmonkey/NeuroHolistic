"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { TeamProfile } from "./team-profiles";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ProfileDossier({ profile }: { profile: TeamProfile }) {
  const { t, isArabic } = useLang();
  const tp = t.teamPage;

  // Extract Dr/title and first name for button
  const nameParts = (isArabic ? profile.name.ar : profile.name.en).split(' ');
  const buttonLabel = isArabic 
    ? `احجز جلسة`
    : nameParts.length > 2 
      ? `Book with ${nameParts[0]} ${nameParts[1]}` 
      : `Book with ${nameParts[0]}`;

  const displayName = isArabic ? profile.name.ar : profile.name.en;
  const displayRole = isArabic ? profile.role.ar : profile.role.en;
  const displayParagraphs = isArabic ? profile.paragraphs.ar : profile.paragraphs.en;
  const displayTestimonials = isArabic ? profile.testimonials.ar : profile.testimonials.en;

  return (
    <article className="bg-white">
      {/* ── Top Spread ── */}
      <section className="py-20 md:py-32 lg:py-40">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 items-start gap-12 sm:gap-16 lg:grid-cols-12 lg:gap-24">
            
            {/* Column 01: The Portrait (Spans 5) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-5"
            >
              <div className="group relative w-full bg-white p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-white">
                  <Image 
                    src={profile.image} 
                    alt={displayName} 
                    fill 
                    unoptimized 
                    className={`object-cover ${profile.slug === "zekra-khayata" ? "object-[center_10%]" : "object-center"}`}
                    priority 
                  />
                </div>
              </div>
            </motion.div>

            {/* Column 02: The Credentials (Spans 7) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7"
            >
              <div className="mb-10 flex items-center gap-4">
                <span className="font-mono text-[11px] tracking-[0.4em] text-[#6366F1] uppercase">
                  {profile.slug === "fawzia-yassmina" ? tp.founder : ""}
                </span>
              </div>

              <h1 className="mb-6 text-[clamp(32px,10vw,64px)] font-light leading-[1.05] tracking-tight text-[#0F172A]">
                {displayName.split(' ').slice(0, -1).join(' ')} <br/>
                <span className="italic text-[#64748B] font-normal">{displayName.split(' ').pop()}</span>
              </h1>

              <p className="mb-10 max-w-[580px] text-[16px] font-medium leading-relaxed text-[#0F172A] sm:mb-12 sm:text-[18px]">
                {displayRole}
              </p>

              <div className="space-y-6 border-l border-[#E2E8F0] pl-5 sm:space-y-8 sm:pl-8">
                {displayParagraphs.map((p, i) => (
                  <p key={i} className="text-[15px] leading-[1.8] text-[#475569] sm:text-[17px]">
                    {p}
                  </p>
                ))}
              </div>

              {/* Book Options */}
              <div className="mt-12 flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/booking/paid-program-booking?therapist=${profile.slug}&entry=consultation`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#1E293B] hover:shadow-lg"
                >
                  {buttonLabel}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
                <Link
                  href={`/booking/paid-program-booking?therapist=${profile.slug}&entry=program`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0F172A] bg-white px-8 py-3.5 text-[15px] font-semibold text-[#0F172A] transition-all duration-300 hover:bg-[#F8FAFC]"
                >
                  {isArabic ? "احجز جلسة" : "Book a Session"}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Testimonials (Clean & Simple) ── */}
      <section className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-6 md:px-12">
          <div className="mb-12">
            <h2 className="text-[32px] font-medium leading-[1.2] text-[#0F172A] md:text-[42px]">
              {t.testimonials.heading}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2">
            {displayTestimonials.map((testimonial, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:p-8 hover:border-[#D1D5DB] transition-all duration-300">
                <p className="text-[16px] leading-[1.7] text-[#475569] md:text-[17px]">
                  &quot;{testimonial}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
