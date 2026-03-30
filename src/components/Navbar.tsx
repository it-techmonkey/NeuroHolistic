"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookNowButton from "@/components/booking/BookNowButton";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";

const PRIMARY_LINKS = [
  { href: "/method", label: "Method" },
  { href: "/programs", label: "Programs" },
  { href: "/research", label: "Research" },
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
  { href: "/resources", label: "Resources" },
] as const;

const COMPANY_LINKS = [
  { href: "/about", label: "About Us" },
  { href: "/team", label: "Team" },
] as const;

const CONTACT_INFO = {
  email: "info@neuroholistic.com",
  phone: "+1 (555) 123-4567",
};

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg 
      className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'opacity-40'}`} 
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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const { isAuthenticated, isLoading } = useAuth();

  const isLightPage = pathname?.startsWith("/team/") && pathname !== "/team";

  // Throttled scroll handler
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    
    scrollTimeoutRef.current = setTimeout(() => {
      setScrolled(window.scrollY > 15);
      scrollTimeoutRef.current = undefined;
    }, 100);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const textColor = isLightPage ? "text-slate-900" : "text-white";
  const borderColor = isLightPage ? "border-slate-200/50" : "border-white/10";

  const getAdaptiveBg = () => {
    if (isLightPage) {
      return "bg-white/70 backdrop-blur-sm";
    }
    return "bg-[#080C20]/75 backdrop-blur-sm";
  };

  // Auth link classname helper
  const authLinkClass = (base: string) =>
    `${base} ${isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-4 pt-3 sm:pt-4">
      <div className={`relative w-full max-w-[1200px] rounded-xl sm:rounded-[26px] border transition-all duration-300 ease-out ${borderColor} ${getAdaptiveBg()}`}>
        
        {/* ── 1. Secondary Navbar (Utility) ── */}
        <div 
          className={`flex items-center justify-between px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] md:text-[11px] font-medium tracking-wide transition-all duration-300 ease-out overflow-hidden ${
            scrolled ? "max-h-0 opacity-0 pointer-events-none" : "py-2 md:h-10 md:max-h-10 border-b opacity-100"
          } ${borderColor} ${textColor}`}
        >
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <span className="opacity-60 whitespace-nowrap hidden sm:inline">EN / العربية</span>
            <Link href="/consultation/book" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">Book a Consultation</Link>
            <Link href="/academy" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">Apply to Academy</Link>
            <Link href="/faqs" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">FAQ</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            {!isLoading && isAuthenticated ? (
              <>
                <Link href="/dashboard" className="opacity-60 hover:opacity-100 uppercase tracking-widest text-[8px] sm:text-[9px]">Sign Up</Link>
                <span className="opacity-20">|</span>
                <button
                  onClick={handleLogout}
                  className="opacity-60 hover:opacity-100 uppercase tracking-widest text-[8px] sm:text-[9px]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="opacity-60 hover:opacity-100">Therapist Login</Link>
                <span className="opacity-20">|</span>
                <Link href="/auth/login" className="opacity-60 hover:opacity-100">Client Login</Link>
              </>
            )}
          </div>
        </div>

        {/* ── 2. Main Navbar ── */}
        <div className={`flex items-center justify-between px-3 sm:px-6 md:px-10 transition-all duration-300 ${scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"}`}>
          
          <Link href="/" className={`text-lg sm:text-xl font-bold tracking-tighter shrink-0 transition-colors ${textColor}`}>
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
                    className={`px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-medium transition-opacity duration-200 rounded-full flex items-center gap-1.5 ${textColor} ${
                      pathname === item.href ? "opacity-100" : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.label}
                    {hasChildren && <ChevronIcon isOpen={isOpen} />}
                  </Link>

                  <AnimatePresence>
                    {hasChildren && isOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[85%] left-1/2 -translate-x-1/2 pt-3 w-48 z-[110]"
                      >
                        <div className={`rounded-xl border p-2 shadow-lg backdrop-blur-sm ${isLightPage ? 'bg-white/90 border-slate-50' : 'bg-[#080C20]/90 border-white/5'}`}>
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-3 py-2 text-[12px] font-medium rounded-lg transition-colors duration-200 ${
                                isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
              <button className={`px-3 sm:px-4 py-2 text-[12px] sm:text-[13px] font-medium opacity-60 hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center gap-1.5 ${textColor}`}>
                About
                <ChevronIcon isOpen={openDropdown === 'company'} />
              </button>
              <AnimatePresence>
                {openDropdown === 'company' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-[85%] right-0 pt-3 w-48 z-[110]"
                  >
                    <div className={`rounded-xl border p-2 shadow-lg backdrop-blur-sm ${isLightPage ? 'bg-white/90 border-slate-50' : 'bg-[#080C20]/90 border-white/5'}`}>
                      {COMPANY_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className={`block px-3 py-2 text-[12px] font-medium rounded-lg transition-colors duration-200 ${
                          isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:flex items-center">
              <button
                onClick={() => setContactOpen(!contactOpen)}
                className={`p-2 rounded-full transition-opacity duration-200 hover:opacity-70 ${textColor}`}
              >
                <svg className="w-4 sm:w-5 h-4 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              <AnimatePresence>
                {contactOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 w-52 z-[110]"
                  >
                    <div className={`rounded-xl border p-3 shadow-lg backdrop-blur-sm ${isLightPage ? 'bg-white/90 border-slate-50' : 'bg-[#080C20]/90 border-white/5'}`}>
                      <a href={`mailto:${CONTACT_INFO.email}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-[12px] font-medium ${isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {CONTACT_INFO.email}
                      </a>
                      <a href={`tel:${CONTACT_INFO.phone}`} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-[12px] font-medium mt-1 ${isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {CONTACT_INFO.phone}
                      </a>
                      <div className="border-t border-white/10 my-2 pt-2">
                        <div className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider ${isLightPage ? 'text-slate-600' : 'text-slate-500'}`}>
                          {isAuthenticated ? 'Account' : 'Logins'}
                        </div>
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium w-full text-left`)}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            Logout
                          </button>
                        ) : (
                          <>
                            <Link href="/auth/login" className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium`)}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0-14h5a2 2 0 012 2v10a2 2 0 01-2 2m0 0V9m0 4v6m0-6l-7-3m7 3l7-3" /></svg>
                              Therapist Login
                            </Link>
                            <Link href="/auth/login" className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium`)}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              Client Login
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <BookNowButton className={`hidden md:flex px-4 sm:px-5 py-2 rounded-xl text-[12px] sm:text-[13px] font-bold transition-all active:scale-95 ${
              isLightPage ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'
            }`}>
              Book Now
            </BookNowButton>

            <button onClick={() => setMobileOpen(!mobileOpen)} className={`lg:hidden p-1.5 transition-colors duration-200 ${textColor} hover:opacity-70 rounded-lg`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Mobile Menu Overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className={`fixed top-0 right-0 h-full w-[100%] sm:w-[90%] max-w-sm z-[160] shadow-2xl p-4 sm:p-6 flex flex-col ${isLightPage ? 'bg-white text-slate-900' : 'bg-[#080C20] text-white'}`}
            >
              <div className="flex justify-between items-center mb-8">
                <span className="font-bold tracking-tighter text-base sm:text-lg uppercase">NH</span>
                <button onClick={() => setMobileOpen(false)} className={`p-1.5 rounded-lg transition-colors duration-200 ${isLightPage ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <nav className="flex flex-col gap-4 overflow-y-auto flex-1">
                {[...PRIMARY_LINKS, ...COMPANY_LINKS].map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'}`}>
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                  {isAuthenticated ? (
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className={`col-span-3 py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        Therapist
                      </Link>
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        Client Login
                      </Link>
                      <a href={`mailto:${CONTACT_INFO.email}`} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        Contact
                      </a>
                    </>
                  )}
                </div>
                <BookNowButton className={`w-full py-3 rounded-xl font-bold text-[12px] transition-all active:scale-95 ${
                  isLightPage ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'
                }`} onClick={() => setMobileOpen(false)}>
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