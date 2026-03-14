"use client";

import Link from "next/link";
import { useState } from "react";
import Button from "./ui/Button";

const PRIMARY_LINKS = [
  { href: "/", label: "Home" },
  { href: "/method", label: "Method" },
  {
    label: "Programs",
    children: [
      { href: "/sessions", label: "Individual Sessions" },
      { href: "/programs", label: "Programs" },
      { href: "/corporate", label: "Corporate Wellbeing" },
    ],
  },
  { href: "/academy", label: "Academy" },
  { href: "/events", label: "Events & Retreats" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
] as const;

export default function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-200 shadow-sm">
      {/* Utility Bar */}
      <div className="hidden md:block bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-end gap-6 h-9 text-sm">
          <button className="text-neutral-600 hover:text-primary-700 transition">
            🌐 EN / العربية
          </button>
          <Link href="/login" className="text-neutral-600 hover:text-primary-700 transition">
            Log In
          </Link>
          <Link href="/faqs" className="text-neutral-600 hover:text-primary-700 transition">
            FAQs
          </Link>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-hero-main flex items-center justify-center text-white font-bold text-lg">
              NH
            </div>
            <span className="font-semibold text-neutral-900 hidden sm:inline">
              NeuroHolistic
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((link) => (
              <div key={link.label} className="relative group">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === link.label ? null : link.label
                    )
                  }
                  className="px-3 py-2 rounded-lg text-neutral-700 hover:text-primary-700 hover:bg-primary-50 transition text-sm font-medium"
                >
                  {link.label}
                  {"children" in link && (
                    <span className="ml-1 text-xs">▼</span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {"children" in link && (
                  <div className="hidden group-hover:block absolute left-0 mt-0 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg py-2 z-50">
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-neutral-700 hover:text-primary-700 hover:bg-primary-50 transition"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="outline" size="sm">
              Apply Academy
            </Button>
            <Button size="sm">
              Book Session
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white">
            <nav className="px-4 py-4 space-y-2">
              {PRIMARY_LINKS.map((link) => (
                <div key={link.label}>
                  {"children" in link ? (
                    <div>
                      <p className="px-3 py-2 text-sm font-semibold text-neutral-900">
                        {link.label}
                      </p>
                      <div className="pl-4 space-y-1">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block px-3 py-2 text-sm text-neutral-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className="block px-3 py-2 text-sm text-neutral-700 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition font-medium"
                    >
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-neutral-200 space-y-2">
                <Button fullWidth variant="outline" size="sm">
                  Apply Academy
                </Button>
                <Button fullWidth size="sm">
                  Book Session
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
