"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { TeamProfile } from "./team-profiles";

export default function ProfileDossier({ profile }: { profile: TeamProfile }) {
  // Extract Dr/title and first name for button
  const nameParts = profile.name.split(' ');
  const buttonLabel = nameParts.length > 2 
    ? `Book with ${nameParts[0]} ${nameParts[1]}` 
    : `Book with ${profile.name.split(' ')[0]}`;

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
              <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 grayscale-[15%] transition-all duration-1000 group-hover:grayscale-0">
                  <Image src={profile.image} alt={profile.name} fill className="object-cover" priority />
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
                  Profile // {profile.slug === "dr-fawzia-yassmina" ? "Registry 01" : "Practitioner"}
                </span>
              </div>

              <h1 className="mb-6 text-[clamp(32px,10vw,64px)] font-light leading-[1.05] tracking-tight text-[#0F172A]">
                {profile.name.split(' ').slice(0, -1).join(' ')} <br/>
                <span className="italic text-[#64748B] font-normal">{profile.name.split(' ').pop()}</span>
              </h1>

              <p className="mb-10 max-w-[580px] text-[16px] font-medium leading-relaxed text-[#0F172A] sm:mb-12 sm:text-[18px]">
                {profile.role}
              </p>

              <div className="space-y-6 border-l border-[#E2E8F0] pl-5 sm:space-y-8 sm:pl-8">
                {profile.paragraphs.map((p, i) => (
                  <p key={i} className="text-[15px] leading-[1.8] text-[#475569] sm:text-[17px]">
                    {p}
                  </p>
                ))}
              </div>

              {/* Book Button */}
              <div className="mt-12">
                <Link
                  href="/book"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0F172A] px-8 py-3.5 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#1E293B] hover:shadow-lg"
                >
                  {buttonLabel}
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
              Client Reflections
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:gap-10 md:grid-cols-2">
            {profile.testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border border-[#E2E8F0] bg-[#FAFBFF] p-6 md:p-8 hover:border-[#D1D5DB] transition-all duration-300">
                <p className="text-[16px] leading-[1.7] text-[#475569] md:text-[17px]">
                  "{t}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}