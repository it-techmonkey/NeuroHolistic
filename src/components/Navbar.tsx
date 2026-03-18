"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookNowButton from "@/components/booking/BookNowButton";

const PRIMARY_LINKS = [
  { href: "/method", label: "Method" },
  { href: "/programs", label: "Programs" },
  {
    href: "/events",
    label: "Experience",
    children: [
      { href: "/events", label: "Events" },
      { href: "/retreats", label: "Retreats" },
      { href: "/corporate-wellbeing", label: "Corporate Wellbeing" },
    ],
  },
  { href: "/academy", label: "Academy" },
] as const;

const COMPANY_LINKS = [
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
] as const;

const CONTACT_INFO = {
  email: "info@neuroholistic.com",
  phone: "+1 (555) 123-4567",
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'opacity-40'}`} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const [contactOpen, setContactOpen] = useState(false);
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isLightPage = pathname?.startsWith("/team/") && pathname !== "/team";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [mobileOpen]);

  const textColor = isLightPage ? "text-slate-900" : "text-white";
  const borderColor = isLightPage ? "border-slate-200/50" : "border-white/10";

  const getAdaptiveBg = () => {
    if (isLightPage) {
      return "bg-white/70 backdrop-blur-xl shadow-sm";
    }
    return "bg-[#080C20]/75 backdrop-blur-xl shadow-lg";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-4">
      <div className={`relative w-full max-w-[1200px] rounded-[26px] border transition-all duration-500 ease-in-out ${borderColor} ${getAdaptiveBg()}`}>
        
        {/* ── 1. Secondary Navbar (Utility) ── */}
        <div 
          className={`flex items-center justify-between px-6 md:px-8 text-[10px] md:text-[11px] font-medium tracking-wide transition-all duration-500 ease-in-out overflow-hidden ${
            scrolled ? "max-h-0 opacity-0 pointer-events-none" : "py-2 md:h-10 md:max-h-10 border-b opacity-100"
          } ${borderColor} ${textColor}`}
        >
          <div className="flex items-center gap-4 md:gap-6">
            <span className="opacity-60 whitespace-nowrap">EN / العربية</span>
            <Link href="/faqs" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[9px]">FAQ</Link>
          </div>
          <div className="flex items-center gap-3 md:gap-4 shrink-0">
            <Link href="/therapist" className="opacity-60 hover:opacity-100">Therapist</Link>
            <span className="opacity-20">|</span>
            <Link href="/customer" className="opacity-60 hover:opacity-100">Client</Link>
          </div>
        </div>

        {/* ── 2. Main Navbar ── */}
        <div className={`flex items-center justify-between px-6 md:px-10 transition-all duration-500 ${scrolled ? "h-16" : "h-20"}`}>
          
          <Link href="/" className={`text-xl font-bold tracking-tighter shrink-0 transition-colors ${textColor}`}>
            NEURO<span className="font-light opacity-50">HOLISTIC</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {PRIMARY_LINKS.map((item) => {
              const hasChildren = "children" in item;
              const isOpen = openDropdown === item.label;

              return (
                <div 
                  key={item.label} 
                  className="relative h-full flex items-center"
                  onMouseEnter={() => hasChildren && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-[13px] font-medium transition-all rounded-full flex items-center gap-1.5 ${textColor} ${
                      pathname === item.href ? "opacity-100" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.label}
                    {hasChildren && <ChevronIcon isOpen={isOpen} />}
                  </Link>

                  <AnimatePresence>
                    {hasChildren && isOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                        className="absolute top-[85%] left-1/2 -translate-x-1/2 pt-4 w-52 z-[110]"
                      >
                        <div className={`rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${isLightPage ? 'bg-white/95 border-slate-100' : 'bg-[#080C20]/95 border-white/10'}`}>
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-3 text-[12px] font-medium rounded-xl transition-colors ${
                                isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            <div 
              className="relative h-full flex items-center" 
              onMouseEnter={() => setOpenDropdown('company')} 
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <button className={`px-4 py-2 text-[13px] font-medium opacity-60 hover:opacity-100 transition-all rounded-full flex items-center gap-1.5 ${textColor}`}>
                Company
                <ChevronIcon isOpen={openDropdown === 'company'} />
              </button>
              <AnimatePresence>
                {openDropdown === 'company' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-[85%] right-0 pt-4 w-48 z-[110]">
                    <div className={`rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl ${isLightPage ? 'bg-white/95 border-slate-100' : 'bg-[#080C20]/95 border-white/10'}`}>
                      {COMPANY_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className={`block px-4 py-3 text-[12px] font-medium rounded-xl transition-colors ${
                          isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex items-center">
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className={`p-2 rounded-full transition-all hover:bg-white/10 ${textColor}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <AnimatePresence>
                {contactOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full right-0 mt-2 w-56 z-[110]"
                  >
                    <div className={`rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl ${isLightPage ? 'bg-white/95 border-slate-100' : 'bg-[#080C20]/95 border-white/10'}`}>
                      <a href={`mailto:${CONTACT_INFO.email}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-[13px] font-medium ${isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span>Email Us</span>
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <BookNowButton className={`hidden md:flex rounded-full px-6 py-2.5 text-[13px] font-bold transition-all active:scale-95 shadow-lg ${
              isLightPage ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
            }`}>
              Book Now
            </BookNowButton>

            <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-2 transition-colors ${textColor} hover:bg-white/5 rounded-full`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 right-0 h-full w-[85%] max-w-[380px] z-[160] shadow-2xl p-8 flex flex-col ${isLightPage ? 'bg-white text-slate-900' : 'bg-[#080C20] text-white'}`}
            >
              <div className="flex justify-between items-center mb-12">
                <span className="font-bold tracking-tighter text-lg uppercase">NEUROHOLISTIC</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6" /></svg>
                </button>
              </div>

              <nav className="flex flex-col gap-6 overflow-y-auto">
                {[...PRIMARY_LINKS, ...COMPANY_LINKS].map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className="text-2xl font-light">
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Link href="/therapist" className="text-sm opacity-60">Therapist</Link>
                  <Link href="/customer" className="text-sm opacity-60">Portal</Link>
                  <a href={`mailto:${CONTACT_INFO.email}`} className="text-sm opacity-60">Contact</a>
                </div>
                <BookNowButton className="w-full py-4 rounded-2xl bg-white text-[#080C20] font-bold text-center shadow-lg active:scale-95 transition-transform" onClick={() => setMobileOpen(false)}>
                  Begin Your Reset
                </BookNowButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}