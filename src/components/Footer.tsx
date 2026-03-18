"use client";

import Link from "next/link";
import BookNowButton from "@/components/booking/BookNowButton";

const NAV_INDEX = [
  { label: "Home", href: "/" },
  { label: "The Method", href: "/method" },
  { label: "The Academy", href: "/academy" },
  { label: "Research", href: "/research" },
  { label: "About", href: "/about" },
];

const PROGRAM_INDEX = [
  { label: "Private Sessions", href: "/programs/private" },
  { label: "Group Programs", href: "/events" },
  { label: "Retreats", href: "/retreats" },
  { label: "Corporate Strategy", href: "/corporate-wellbeing" },
];

export default function Footer() {
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
              <div className="mt-8 max-w-[340px] border-l border-white/10 pl-6">
                <p className="text-[15px] leading-[1.7] text-slate-400 font-light">
                  The Institute is dedicated to restoring systemic balance through 
                  applied neuroscience and human systems logic.
                </p>
              </div>
            </div>

            <div className="mt-12">
              <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-4 block">
                Inquiry // Facilitation
              </span>
              <BookNowButton className="inline-flex h-12 items-center justify-center border border-white/20 bg-transparent px-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-all hover:bg-white hover:text-[#0B0F2B]">
                Begin Your Reset
              </BookNowButton>
            </div>
          </div>

          {/* Navigation Index */}
          <div className="lg:col-span-2 lg:col-start-7">
            <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-500 mb-8 block">
              Index // 01
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
              Registry // 02
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
              Contact // 03
            </span>
            <div className="flex flex-col gap-6">
              <a href="mailto:info@neuroholistic.com" className="text-[14px] text-slate-400 hover:text-white transition-colors border-b border-white/10 pb-1 w-fit">
                info@neuroholistic.com
              </a>
              <p className="text-[11px] font-mono tracking-widest text-slate-600 uppercase">
                Remote // Global <br />
                Dubai // London
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
              Board of Standards // Reg-88402
            </span>
          </div>

          <div className="flex gap-10">
            <Link href="/privacy" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Privacy Protocol
            </Link>
            <Link href="/terms" className="font-mono text-[10px] uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}