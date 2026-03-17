"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookNowButton from "@/components/booking/BookNowButton";

const NAV_LINKS = [
  { href: "/method", label: "Method" },
  {
    href: "/events",
    label: "Events & Retreats",
    children: [
      { href: "/events", label: "Events" },
      { href: "/retreats", label: "Retreats" },
    ],
  },
  { href: "/academy", label: "The Academy" },
  { href: "/corporate-wellbeing", label: "Corporate Wellbeing" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
] as const;

const UTILITY_LINKS = [
  { href: "/book", label: "Book a Session" },
  { href: "/academy", label: "Apply to Academy" },
  { href: "/faqs", label: "FAQ" },
] as const;

const LOGIN_LINKS = [
  { href: "/therapist", label: "Therapist" },
  { href: "/customer", label: "Customer" },
] as const;

function UtilityIcon({ path, className = "" }: { path: string; className?: string }) {
  return (
    <svg className={`h-3.5 w-3.5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isLightPage = pathname?.startsWith("/team/") && pathname !== "/team";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [mobileOpen]);

  const isDarkText = isLightPage && !scrolled && !mobileOpen;

  const getContainerStyle = () => {
    if (mobileOpen) return "border-white/10 bg-[rgba(8,12,32,0.95)] backdrop-blur-[20px]";
    if (scrolled) {
      if (isLightPage) return "border-slate-200/50 bg-white/70 backdrop-blur-[20px] shadow-sm";
      return "border-white/10 bg-[rgba(8,12,32,0.5)] backdrop-blur-[20px] shadow-lg";
    }
    if (isLightPage) return "border-transparent bg-transparent";
    return "border-white/5 bg-white/5 backdrop-blur-[16px]";
  };

  const textColor = (scrolled && isLightPage) || isDarkText ? "text-slate-900" : "text-white";
  const iconColor = (scrolled && isLightPage) || isDarkText ? "text-slate-500" : "text-white/60";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <div className="max-w-[1200px] mx-auto">
        <div className={`rounded-2xl border px-4 md:px-6 transition-all duration-500 ease-out ${getContainerStyle()}`}>
          
          {/* ── Desktop Utility Bar ── */}
          <div className={`hidden lg:flex items-center justify-end overflow-hidden text-[12px] transition-all duration-500 ${
              scrolled ? "max-h-0 opacity-0 -translate-y-2" : "h-10 max-h-10 border-b border-white/10 opacity-100"
            }`}
          >
            {/* ... Desktop Utility Content ... */}
            <div className={`flex items-center gap-4 ${textColor} opacity-70`}>
                <button className="inline-flex items-center gap-1.5 hover:opacity-100">
                    <UtilityIcon path="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.4 2.2 2.4 13.8 0 18M12 3c-2.4 2.2-2.4 13.8 0 18" className={iconColor} />
                    EN / العربية
                </button>
                <span className="opacity-20">•</span>
                <Link href="/faqs" className="hover:opacity-100">FAQ</Link>
                <span className="opacity-20">•</span>
                <div className="flex gap-1.5">
                    <span className="opacity-50">Log In:</span>
                    <Link href="/therapist" className="hover:underline">Therapist</Link>
                    <span className="opacity-30">/</span>
                    <Link href="/customer" className="hover:underline">Customer</Link>
                </div>
            </div>
          </div>

          {/* ── Main Nav ── */}
          <div className={`flex items-center justify-between gap-4 transition-all duration-500 ${scrolled ? "h-16" : "h-[64px]"}`}>
            <Link href="/" className={`font-bold text-lg tracking-tight transition-colors ${textColor}`}>
              NeuroHolistic
            </Link>

<nav className="hidden xl:flex items-center justify-center gap-8 flex-1">
  {NAV_LINKS.map((item) => {
    const hasChildren = "children" in item;
    const isOpen = openDropdown === item.label;

    // We use your existing 'scrolled' and 'isLightPage' logic to define the dropdown's look
    const dropdownBg = (scrolled && isLightPage) 
      ? "bg-white/80 border-slate-200/60 shadow-lg text-slate-900" 
      : "bg-[rgba(8,12,32,0.8)] border-white/10 shadow-2xl text-white";

    const dropdownHover = (scrolled && isLightPage)
      ? "hover:bg-slate-100/80 text-slate-600 hover:text-slate-900"
      : "hover:bg-white/10 text-white/60 hover:text-white";

    return (
      <div
        key={item.label}
        className="relative py-4"
        onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
        onMouseLeave={() => setOpenDropdown(null)}
      >
        <Link
          href={item.href}
          className={`text-[13px] font-medium transition-all duration-300 flex items-center gap-1.5 ${textColor} ${
            isOpen ? "opacity-100" : "opacity-70 hover:opacity-100"
          }`}
        >
          {item.label}
          {hasChildren && (
            <svg 
              className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'opacity-40'}`} 
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            >
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Link>

        {/* ── Adaptive Dropdown ── */}
        {hasChildren && isOpen && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 pt-1 w-44 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className={`overflow-hidden rounded-xl border backdrop-blur-[20px] p-1.5 ${dropdownBg}`}>
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className={`block px-4 py-2 text-[12px] font-medium rounded-lg transition-all duration-200 ${dropdownHover}`}
                >
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  })}
</nav>
            <div className="flex items-center gap-3">
              <BookNowButton className={`hidden sm:inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                textColor === "text-white" ? 'bg-white text-[#0F172A]' : 'bg-[#0F172A] text-white'
              }`}>
                Begin Your Reset
              </BookNowButton>
              <button onClick={() => setMobileOpen(!mobileOpen)} className={`xl:hidden p-2 transition-colors ${textColor}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE MENU (REFINED) ── */}
      {mobileOpen && (
        <div className="xl:hidden mt-3 max-w-[1200px] mx-auto rounded-2xl bg-[#0F172A]/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-0 overflow-hidden">
          <div className="max-h-[80vh] overflow-y-auto p-6">
            
            {/* 1. Language & Utility Header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <button className="text-[12px] font-mono tracking-widest text-white/50 uppercase">
                EN // العربية
              </button>
              <Link href="/faqs" className="text-[11px] font-mono tracking-widest text-white/40 uppercase">
                FAQ Support
              </Link>
            </div>

            {/* 2. Primary Navigation (Smaller Typography) */}
            <nav className="flex flex-col gap-5">
              {NAV_LINKS.map((item) => (
                <div key={item.label} className="flex flex-col gap-2">
                  <Link 
                    href={item.href} 
                    onClick={() => setMobileOpen(false)} 
                    className="text-[17px] font-medium text-white/90 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                  {"children" in item && (
                    <div className="flex flex-col gap-2.5 pl-4 border-l border-white/10 my-1">
                      {item.children.map(child => (
                        <Link 
                            key={child.href} 
                            href={child.href} 
                            onClick={() => setMobileOpen(false)} 
                            className="text-[14px] text-white/50 hover:text-indigo-400"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* 3. Utility & Auth Section (Secondary Navbar Items) */}
            <div className="mt-10 pt-8 border-t border-white/5 flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                 <Link href="/therapist" className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Portal</span>
                    <span className="text-[13px] text-white">Therapist</span>
                 </Link>
                 <Link href="/customer" className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[9px] font-mono tracking-widest text-white/30 uppercase">Portal</span>
                    <span className="text-[13px] text-white">Customer</span>
                 </Link>
              </div>

              <div className="space-y-4">
                <Link href="/book" className="flex items-center gap-3 text-white/70 text-[14px]">
                  <UtilityIcon path="M8 7V3m8 4V3M4 11h16" className="text-white/30" />
                  Book a Session
                </Link>
                <Link href="/academy" className="flex items-center gap-3 text-white/70 text-[14px]">
                  <UtilityIcon path="M12 4l8 4-8 4-8-4 8-4z" className="text-white/30" />
                  Apply to Academy
                </Link>
              </div>
            </div>

            {/* 4. Action Button */}
            <div className="mt-10">
              <BookNowButton className="w-full h-14 rounded-xl bg-white text-[#0F172A] font-bold text-[14px] shadow-xl">
                Begin Your Reset
              </BookNowButton>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}