"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const PRIMARY_LINKS = [
  { href: "/method", label: "Method" },
  { href: "/programs", label: "Programs" },
  {
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
  { href: "/contact", label: "Contact Us" },
] as const;

const UTILITY_LINKS = [
  { href: "/book", label: "Book a Session" },
  { href: "/academy/apply", label: "Apply to Academy" },
  { href: "/login", label: "Log In" },
  { href: "/therapist", label: "Therapist" },
  { href: "/customer", label: "Customer" },
  { href: "/faqs", label: "FAQs" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
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

  const headerBg =
    scrolled || mobileOpen
      ? "bg-slate-900/95 backdrop-blur-xl shadow-lg border-b border-white/5"
      : "bg-transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
    >
      {/* Utility bar */}
      <div className="hidden lg:block border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-end gap-6 h-9 text-sm">
            <button
              type="button"
              className="text-slate-300 hover:text-white transition-colors"
              aria-label="Language"
            >
              العربية / EN
            </button>
            {UTILITY_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  scrolled ? "text-slate-300 hover:text-white" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/"
            className="font-semibold text-lg text-white transition-colors flex-shrink-0"
            aria-label="NeuroHolistic - Home"
          >
            NeuroHolistic
          </Link>

          <nav className="hidden xl:flex items-center gap-6">
            {PRIMARY_LINKS.map((item) =>
              "children" in item ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    type="button"
                    className={`text-sm font-medium transition-colors flex items-center gap-1 ${
                      scrolled ? "text-slate-300 hover:text-white" : "text-white/90 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-0 pt-2">
                      <div className="rounded-lg bg-slate-800/98 backdrop-blur border border-white/10 py-2 min-w-[160px] shadow-xl">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
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
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? "text-slate-300 hover:text-white" : "text-white/90 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-all shadow-lg shadow-indigo-500/20"
            >
              Book a Session
            </Link>
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden absolute top-full left-0 right-0 bg-slate-900/98 backdrop-blur-xl border-b border-white/5 shadow-xl max-h-[85vh] overflow-y-auto">
          <nav className="px-4 py-6 flex flex-col gap-1">
            {PRIMARY_LINKS.map((item) =>
              "children" in item ? (
                <div key={item.label}>
                  <p className="py-2 px-4 text-slate-400 text-sm font-medium">{item.label}</p>
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-3 pl-8 pr-4 rounded-lg text-slate-200 hover:bg-white/5 hover:text-white font-medium block"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-slate-200 hover:bg-white/5 hover:text-white font-medium"
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="border-t border-white/10 my-4" />
            <p className="py-2 px-4 text-slate-400 text-sm font-medium">Quick links</p>
            {UTILITY_LINKS.slice(0, 4).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 rounded-lg text-slate-200 hover:bg-white/5 hover:text-white font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setMobileOpen(false)}
              className="mt-4 mx-4 py-3 rounded-xl bg-white text-slate-900 font-semibold text-center hover:bg-slate-100 transition-colors"
            >
              Book a Session
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
