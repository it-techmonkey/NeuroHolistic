"use client";

import { useMemo } from "react";
import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";
import { useLang } from "@/lib/translations/LanguageContext";

export default function Footer() {
  const { t, isUrdu } = useLang();

  const NAV_INDEX = useMemo(() => [
    { label: t.footer.home, href: "/" },
    { label: t.footer.theMethod, href: "/method" },
    { label: t.footer.theAcademy, href: "/academy" },
    { label: t.footer.research, href: "/research" },
    { label: t.footer.about, href: "/about" },
  ], [t]);

  const PROGRAM_INDEX = useMemo(() => [
    { label: t.footer.privateSessions, href: "/programs/private" },
    { label: t.footer.groupPrograms, href: "/programs" },
    { label: t.footer.retreats, href: "/retreats" },
    { label: t.footer.corporateStrategy, href: "/corporate-wellbeing" },
    { label: t.footer.bookAConsultation, href: "/consultation/book" },
    { label: t.footer.applyToAcademy, href: "/academy" },
  ], [t]);

  return (
    <footer className="bg-[#0B0F2B] border-t border-white/5 pt-24 pb-12">
      <div className="max-w-[1280px] mx-auto px-6 md:px-12">
        
        {/* ── Main Registry Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-6 border-b border-white/5 pb-16">
          
          {/* Identity Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <Link href="/" className="text-[22px] font-bold text-white tracking-tighter">
                NeuroHolistic<span className="italic font-light opacity-40">.</span>
              </Link>
              <div className={`mt-8 max-w-[340px] ${isUrdu ? 'border-r border-white/10 pr-6' : 'border-l border-white/10 pl-6'}`}>
                <p className={`text-[15px] text-slate-400 font-light ${isUrdu ? 'leading-[2]' : 'leading-[1.7]'}`}>
                  {t.footer.description}
                </p>
              </div>
            </div>

            <div className="mt-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4 block">
                {t.footer.inquiry}
              </span>
              <BookNowButton className="inline-flex h-12 items-center justify-center border border-white/20 bg-transparent px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-[#0B0F2B]">
                {t.footer.beginYourReset}
              </BookNowButton>
            </div>
          </div>

          {/* Navigation Index */}
          <div className="lg:col-span-2 lg:col-start-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-8 block">
              {t.footer.index01}
            </span>
            <ul className="space-y-4">
              {NAV_INDEX.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Index */}
          <div className="lg:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-8 block">
              {t.footer.registry02}
            </span>
            <ul className="space-y-4">
              {PROGRAM_INDEX.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[14px] text-slate-400 hover:text-white transition-colors duration-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Index */}
          <div className="lg:col-span-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-8 block">
              {t.footer.contact03}
            </span>
            <div className="flex flex-col gap-6">
              <a href="mailto:info@neuroholistic.com" className="text-[14px] text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-1 w-fit">
                info@neuroholistic.com
              </a>
              <p className="text-[11px] font-mono tracking-widest text-slate-600 uppercase">
                {t.footer.remoteGlobal} <br />
                {t.footer.dubaiLondon}
              </p>
            </div>
          </div>
        </div>

        {/* ── Sub-Footer Metadata ── */}
        <div className="mt-12 flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-600">
              © {new Date().getFullYear()} NeuroHolistic Institute
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-700">
              {t.footer.copyrightYear} // {t.footer.regNumber}
            </span>
          </div>

          <div className="flex gap-10">
            <Link href="/privacy" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              {t.footer.privacyProtocol}
            </Link>
            <Link href="/terms" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              {t.footer.termsOfService}
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
