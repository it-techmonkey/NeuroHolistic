"use client";

import Link from "next/link";
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

function UtilityIcon({ path }: { path: string }) {
  return (
    <svg className="h-3.5 w-3.5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={path} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <div className="max-w-[1200px] mx-auto">
        <div
          className={`rounded-2xl border border-white/15 px-4 md:px-6 transition-all duration-300 ${
            scrolled || mobileOpen
              ? "bg-[rgba(11,15,43,0.74)] backdrop-blur-xl"
              : "bg-[rgba(255,255,255,0.08)] backdrop-blur-[12px]"
          }`}
        >
          <div
            className={`hidden lg:flex items-center justify-end overflow-hidden text-[12px] transition-all duration-300 ${
              scrolled ? "max-h-0 border-b-0 opacity-0" : "h-10 max-h-10 border-b border-white/10 opacity-100"
            }`}
          >
            <div className="flex items-center gap-4 text-white/72">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
                aria-label="Language selector"
              >
                <UtilityIcon path="M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.4 2.2 2.4 13.8 0 18M12 3c-2.4 2.2-2.4 13.8 0 18" />
                EN / العربية
              </button>
              <span className="text-white/30">•</span>

              <BookNowButton className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                <UtilityIcon path="M8 7V3m8 4V3M4 11h16M6 5h12a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z" />
                Book a Session
              </BookNowButton>
              <span className="text-white/30">•</span>

              <Link href={UTILITY_LINKS[1].href} className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                <UtilityIcon path="M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z" />
                {UTILITY_LINKS[1].label}
              </Link>
              <span className="text-white/30">•</span>

              <span className="inline-flex items-center gap-1.5 text-white/72">
                <UtilityIcon path="M12 12a4 4 0 100-8 4 4 0 000 8zm0 2c-4.4 0-8 2-8 4.5V21h16v-2.5c0-2.5-3.6-4.5-8-4.5z" />
                Log In
              </span>
              <Link href={LOGIN_LINKS[0].href} className="transition-colors hover:text-white">
                {LOGIN_LINKS[0].label}
              </Link>
              <span className="text-white/40">/</span>
              <Link href={LOGIN_LINKS[1].href} className="transition-colors hover:text-white">
                {LOGIN_LINKS[1].label}
              </Link>
              <span className="text-white/30">•</span>
              <Link href={UTILITY_LINKS[2].href} className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
                <UtilityIcon path="M12 18h.01M9.1 9a3 3 0 115.2 2c-.7.7-1.3 1.2-1.3 2.4" />
                {UTILITY_LINKS[2].label}
              </Link>
            </div>
          </div>

          <div className={`flex items-center justify-between gap-4 ${scrolled ? "h-16" : "h-[62px]"}`}>
            <Link
              href="/"
              className="font-semibold text-base md:text-lg text-white/95 tracking-tight flex-shrink-0"
              aria-label="NeuroHolistic - Home"
            >
              NeuroHolistic
            </Link>

            <nav className="hidden xl:flex items-center justify-center gap-6 flex-1">
              {NAV_LINKS.map((item) =>
                "children" in item ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(item.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      type="button"
                      className="text-sm font-medium text-white/80 hover:text-white transition-colors inline-flex items-center gap-1"
                      onClick={() =>
                        setOpenDropdown((prev) => (prev === item.label ? null : item.label))
                      }
                    >
                      {item.label}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {openDropdown === item.label && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3">
                        <div className="min-w-[170px] rounded-xl border border-white/15 bg-[rgba(11,15,43,0.86)] backdrop-blur-xl p-2 shadow-xl">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className="block rounded-lg px-3 py-2 text-sm text-white/85 hover:bg-white/10 hover:text-white"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )
              )}
            </nav>

            <div className="flex items-center gap-3">
              <BookNowButton className="hidden sm:inline-flex items-center justify-center rounded-[10px] bg-white text-[#111] px-[18px] py-[10px] text-sm font-semibold transition-all hover:scale-[1.02]">
                Book Now
              </BookNowButton>
              <button
                type="button"
                aria-label="Toggle menu"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="xl:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="xl:hidden mt-3 max-w-[1200px] mx-auto rounded-2xl bg-[rgba(11,15,43,0.82)] backdrop-blur-xl border border-white/15 shadow-xl">
          <nav className="p-4 flex flex-col gap-1">
            {NAV_LINKS.map((item) =>
              "children" in item ? (
                <div key={item.label} className="py-1 px-2">
                  <p className="px-2 py-2 text-white/90 font-medium">{item.label}</p>
                  <div className="pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 px-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-white/85 hover:bg-white/10 hover:text-white font-medium"
                >
                  {item.label}
                </Link>
              )
            )}

            <div className="mt-2 border-t border-white/10 pt-3 px-2 text-sm text-white/75 space-y-2">
              <p>EN / العربية</p>
              <Link href="/academy" onClick={() => setMobileOpen(false)} className="block hover:text-white">
                Apply to Academy
              </Link>
              <BookNowButton onClick={() => setMobileOpen(false)} className="block hover:text-white">
                Book a Session
              </BookNowButton>
              <p className="text-white/60">Log In</p>
              <div className="pl-3 space-y-1">
                {LOGIN_LINKS.map((loginLink) => (
                  <Link
                    key={loginLink.href}
                    href={loginLink.href}
                    onClick={() => setMobileOpen(false)}
                    className="block hover:text-white"
                  >
                    {loginLink.label}
                  </Link>
                ))}
              </div>
              <Link href="/faqs" onClick={() => setMobileOpen(false)} className="block hover:text-white">
                FAQ
              </Link>
            </div>

            <BookNowButton
              onClick={() => setMobileOpen(false)}
              className="mt-3 py-3 rounded-[10px] bg-white text-[#111] font-semibold text-center hover:bg-slate-100 transition-colors"
            >
              Book Now
            </BookNowButton>
          </nav>
        </div>
      )}
    </header>
  );
}
