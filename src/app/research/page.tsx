"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import PageHero from "@/components/ui/PageHero";
import { useLang } from "@/lib/translations/LanguageContext";

export default function ResearchPage() {
  const { t, isUrdu } = useLang();
  const rp = t.researchPage;
  const RESEARCH_FOCUS = rp.focusAreas;
  const SYMBOLS = ["◆", "◇", "○", "△"];

  return (
    <div className="w-full bg-white">
      <PageHero
        eyebrow={rp.eyebrow}
        title={
          <>
            {rp.heroTitle1} <br />
            <span className="text-white/60 font-normal">{rp.heroTitle2}</span>
          </>
        }
        description={rp.heroDescription}
        imageSrc="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&q=80"
        imageAlt="Neuroscience research environment"
        metaTags={[]}
        primaryAction={{ label: rp.inquireCollaboration, href: "mailto:info@neuroholistic.com" }}
      />

      {/* ── Section 01: Research Vision (Editorial Spread) ── */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12 lg:gap-24">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-6"
            >
              <h2 className="mb-8 text-[36px] font-light leading-[1.1] tracking-tight text-[#0F172A] md:text-[52px]">
                {rp.visionTitle1} <br />
                <span className="italic text-[#64748B] font-normal">{rp.visionTitle2}</span>
              </h2>
              <div className={`space-y-8 ${isUrdu ? 'border-r pr-8' : 'border-l pl-8'} border-[#E2E8F0]`}>
                <p className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
                  {rp.visionParagraph1}
                </p>
                <p className={`text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
                  {rp.visionParagraph2}
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:col-span-6"
            >
              <div className="group relative w-full bg-[#FAFBFF] p-4 border border-[#F1F5F9]">
                <div className="relative aspect-[16/11] w-full overflow-hidden transition-all duration-1000">
                  <Image
                    src="/images/pages/emergent-human-scan.png"
                    alt="Scientific data visualization"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Section 02: Focus Areas (Registry Matrix) ── */}
      <section className="bg-[#FAFBFF] py-12 md:py-16 lg:py-20 border-y border-[#E2E8F0]">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="mb-10">
            <h2 className="mt-6 text-[34px] font-light tracking-tight text-[#0F172A] md:text-[48px]">{rp.areasOfInquiry} <span className="italic text-[#64748B]">{rp.areasOfInquiry2}</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-[#E2E8F0]">
            {RESEARCH_FOCUS.map((item: { step: string; label: string; title: string; description: string }, i: number) => (
              <div key={item.title} className="group border-b border-[#E2E8F0] p-10 transition-colors hover:bg-white lg:border-r last:lg:border-r-0">
                <div className="mb-12 flex items-center justify-between">
                  <span className="font-mono text-[12px] text-[#CBD5E1] group-hover:text-[#6366F1] transition-colors">[ {item.step} ]</span>
                  <span className="text-[18px] text-[#6366F1] opacity-30 group-hover:opacity-100 transition-opacity">{SYMBOLS[i]}</span>
                </div>
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#94A3B8]">{item.label}</span>
                <h3 className="mb-4 text-[19px] font-semibold text-[#0F172A] leading-snug">{item.title}</h3>
                <p className={`text-[15px] ${isUrdu ? 'leading-[2]' : 'leading-[1.7]'} text-[#64748B]`}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 03: Practice & Collaboration (Asymmetrical Dossier) ── */}
      <section className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
            <div className={`${isUrdu ? 'border-r pr-10' : 'border-l pl-10'}`}>
              <h3 className="text-[28px] font-light tracking-tight text-[#0F172A] md:text-[36px]">
                {rp.understandingTitle1} <br/><span className="italic text-[#64748B]">{rp.understandingTitle2}</span>
              </h3>
              <div className={`mt-6 flex flex-col gap-4 text-[16px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#4B5563]`}>
                <p>{rp.understandingParagraph1}</p>
                <p>{rp.understandingParagraph2}</p>
              </div>
            </div>
            <div className={`${isUrdu ? 'border-r pr-10' : 'border-l pl-10'} lg:mt-20`}>
              <h3 className="text-[28px] font-light tracking-tight text-[#0F172A] md:text-[36px]">
                {rp.collaborationTitle1} <br/><span className="italic text-[#64748B]">{rp.collaborationTitle2}</span>
              </h3>
              <p className={`mt-6 text-[16px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#4B5563]`}>
                {rp.collaborationParagraph}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 04: Publications (Dark Capstone) ── */}
      <section className="bg-[#0F172A] py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-[32px] font-light text-white md:text-[44px]"
          >
            {rp.publicationsTitle1} <br/>& <span className="italic text-slate-400">{rp.publicationsTitle2}</span>
          </motion.h3>

          <div className="mt-16 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {rp.publicationCategories.map((pub: string, i: number) => (
              <motion.div
                key={pub}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="group text-center"
              >
                <span className="block font-mono text-[48px] md:text-[64px] font-light leading-none text-white/10 group-hover:text-[#6366F1]/40 transition-colors duration-500">
                  0{i + 1}
                </span>
                <div className="mx-auto mt-4 h-px w-8 bg-white/10 group-hover:bg-[#6366F1]/50 group-hover:w-12 transition-all duration-500" />
                <span className="mt-4 block text-[13px] md:text-[14px] font-semibold uppercase tracking-[0.15em] text-white/70 group-hover:text-white transition-colors duration-300">
                  {pub}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 05: Final Inquiry (Clean CTA) ── */}
      <section className="py-12 md:py-16 border-t border-[#E2E8F0]">
        <div className="mx-auto max-w-[800px] px-6 text-center">
          <h2 className="mt-6 text-[32px] font-light tracking-tight text-[#0F172A] md:text-[42px]">
            {rp.inquireTitle1} <span className="italic text-[#64748B]">{rp.inquireTitle2}</span>
          </h2>
          <p className={`mt-8 text-[17px] ${isUrdu ? 'leading-[2]' : 'leading-[1.8]'} text-[#475569]`}>
            {rp.inquireDescription}
          </p>
          <Link
            href="mailto:info@neuroholistic.com"
            className="mt-12 inline-flex h-14 items-center justify-center bg-[#0F172A] px-10 text-[13px] font-bold uppercase tracking-[0.2em] text-white transition-all hover:bg-[#1E293B]"
          >
            {rp.contactInstitute}
          </Link>
        </div>
      </section>
    </div>
  );
}
