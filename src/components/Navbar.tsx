"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BookNowButton from "@/components/booking/BookNowButton";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import { useLang } from "@/lib/translations/LanguageContext";

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
  const { t, isUrdu, isArabic, toggleLang } = useLang();

  const isLightPage = pathname?.startsWith("/team/") && pathname !== "/team";

  const PRIMARY_LINKS = useMemo(() => [
    { href: "/method", label: t.navbar.method },
    { href: "/programs", label: t.navbar.programs },
    { href: "/research", label: t.navbar.research },
    {
      href: "/events",
      label: t.navbar.experience,
      children: [
        { href: "/events", label: t.navbar.events },
        { href: "/retreats", label: t.navbar.retreats },
        { href: "/corporate-wellbeing", label: t.navbar.corporateWellbeing },
      ],
    },
    { href: "/academy", label: t.navbar.academy },
    { href: "/resources", label: t.navbar.resources },
  ], [t]);

  const COMPANY_LINKS = useMemo(() => [
    { href: "/about", label: t.navbar.aboutUs },
    { href: "/team", label: t.navbar.team },
  ], [t]);

  // Optimized scroll handler using rAF for smoother performance
  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) return;
    
    scrollTimeoutRef.current = requestAnimationFrame(() => {
      const isScrolled = window.scrollY > 15;
      setScrolled(prev => prev === isScrolled ? prev : isScrolled);
      scrollTimeoutRef.current = undefined;
    }) as unknown as NodeJS.Timeout;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) cancelAnimationFrame(scrollTimeoutRef.current as unknown as number);
    };
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => { 
      document.body.style.overflow = ""; 
      document.body.style.touchAction = "";
    };
  }, [mobileOpen]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  const textColor = isLightPage ? "text-slate-900" : "text-white";
  const borderColor = isLightPage ? "border-slate-200/50" : "border-white/10";

  const getAdaptiveBg = () => {
    if (isLightPage) {
      return "bg-white/70 backdrop-blur-md";
    }
    return "bg-[#080C20]/80 backdrop-blur-md";
  };

  // Auth link classname helper
  const authLinkClass = (base: string) =>
    `${base} ${isLightPage ? 'text-slate-600 hover:bg-slate-50' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-3 sm:px-4 pt-3 sm:pt-4">
      <div className={`relative w-full max-w-[1200px] rounded-xl sm:rounded-[26px] border transition-colors duration-300 ease-out ${borderColor} ${getAdaptiveBg()}`}>
        
        {/* ── 1. Secondary Navbar (Utility) ── */}
        <div 
          className={`hidden md:flex items-center justify-between px-4 sm:px-6 md:px-8 text-[9px] sm:text-[10px] md:text-[11px] font-medium tracking-wide transition-[max-height,opacity,padding] duration-300 ease-out overflow-hidden ${
            scrolled ? "max-h-0 opacity-0 pointer-events-none" : "py-2 md:h-10 md:max-h-10 border-b opacity-100"
          } ${borderColor} ${textColor}`}
        >
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <button
              onClick={toggleLang}
              className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]"
            >
              {isArabic ? "EN" : "عربي"}
            </button>
            <Link href="/consultation/book" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">{t.navbar.bookConsultation}</Link>
            <Link href="/booking/paid-program-booking?mode=academy" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">{t.navbar.applyAcademy}</Link>
            <Link href="/faqs" className="hover:opacity-100 opacity-60 uppercase tracking-widest text-[8px] sm:text-[9px]">{t.navbar.faq}</Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0">
            {!isLoading && isAuthenticated ? (
              <>
                <Link href="/dashboard" className="opacity-60 hover:opacity-100 uppercase tracking-widest text-[8px] sm:text-[9px]">{t.navbar.dashboard}</Link>
                <span className="opacity-20">|</span>
                <button
                  onClick={handleLogout}
                  className="opacity-60 hover:opacity-100 uppercase tracking-widest text-[8px] sm:text-[9px]"
                >
                  {t.navbar.logout}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="opacity-60 hover:opacity-100">{t.navbar.therapistLogin}</Link>
                <span className="opacity-20">|</span>
                <Link href="/auth/login" className="opacity-60 hover:opacity-100">{t.navbar.clientLogin}</Link>
              </>
            )}
          </div>
        </div>

        {/* ── 2. Main Navbar ── */}
        <div className={`flex items-center justify-between px-3 sm:px-6 md:px-10 transition-[height] duration-300 ${scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"}`}>
          
          <Link href="/" className={`flex items-center gap-2 sm:gap-2.5 shrink-0 transition-colors ${textColor}`}>
            <Image src="/images/logo.svg" alt="NeuroHolistic" width={32} height={28} className="w-7 h-6 sm:w-8 sm:h-7" unoptimized />
            <span className="text-lg sm:text-xl font-bold tracking-tighter">
              NEURO<span className="font-light opacity-50">HOLISTIC</span>
            </span>
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
                          {'children' in item && (item as { children: { href: string; label: string }[] }).children.map((child) => (
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
                {t.navbar.aboutUs}
                <ChevronIcon isOpen={openDropdown === 'company'} />
              </button>
              <AnimatePresence>
                {openDropdown === 'company' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-[85%] ${isUrdu ? 'right-0' : 'left-0'} pt-3 w-48 z-[110]`}
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
                    className={`absolute top-full ${isUrdu ? 'right-0' : 'left-0'} mt-2 w-52 z-[110]`}
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
                          {isAuthenticated ? t.navbar.account : t.navbar.logins}
                        </div>
                        {isAuthenticated ? (
                          <button
                            onClick={handleLogout}
                            className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium w-full text-left`)}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            {t.navbar.logout}
                          </button>
                        ) : (
                          <>
                            <Link href="/auth/login" className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium`)}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v10a2 2 0 002 2h5m0-14h5a2 2 0 012 2v10a2 2 0 01-2 2m0 0V9m0 4v6m0-6l-7-3m7 3l7-3" /></svg>
                              {t.navbar.therapistLogin}
                            </Link>
                            <Link href="/auth/login" className={authLinkClass(`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors duration-200 text-[11px] font-medium`)}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {t.navbar.clientLogin}
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
              {t.navbar.bookNow}
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
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              transition={{ duration: 0.2 }} 
              className="fixed inset-0 z-[150] bg-black/60" 
              onClick={() => setMobileOpen(false)} 
            />
            <motion.div 
              initial={{ x: isUrdu ? "-100%" : "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: isUrdu ? "-100%" : "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className={`fixed top-0 ${isUrdu ? 'left-0' : 'right-0'} h-full w-[100%] sm:w-[90%] max-w-sm z-[160] shadow-2xl p-4 sm:p-6 flex flex-col will-change-transform ${isLightPage ? 'bg-white text-slate-900' : 'bg-[#080C20] text-white'}`}
            >
              <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <Image src="/images/logo.svg" alt="NeuroHolistic" width={28} height={24} className="w-6 h-5" unoptimized />
                <span className="font-bold tracking-tighter text-base sm:text-lg">NeuroHolistic</span>
              </div>
                <button onClick={() => setMobileOpen(false)} className={`p-1.5 rounded-lg transition-colors duration-200 ${isLightPage ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <nav className={`flex flex-col gap-5 overflow-y-auto flex-1 pb-4 ${isUrdu ? 'text-right' : ''}`}>
                {[...PRIMARY_LINKS, ...COMPANY_LINKS].map((item) => (
                  <div key={item.label}>
                    <Link href={item.href} onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'}`}>
                      {item.label}
                    </Link>
                    {'children' in item && item.children && (
                      <div className={`flex flex-col gap-2 mt-2 ${isUrdu ? 'mr-3' : 'ml-3'}`}>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className={`text-sm font-light py-2 px-3 rounded-lg transition-all duration-200 ${
                              isLightPage
                                ? 'text-slate-500 bg-slate-50 hover:bg-slate-100 hover:text-slate-700'
                                : 'text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <div className={`h-px w-full my-2 ${isLightPage ? 'bg-slate-200' : 'bg-white/10'}`} />

                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'} ${!isAuthenticated ? 'hidden' : ''}`}>
                  {t.navbar.dashboard}
                </Link>
                <Link href="/consultation/book" onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'}`}>
                  {t.navbar.bookConsultation}
                </Link>
                <Link href="/booking/paid-program-booking?mode=academy" onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'}`}>
                  {t.navbar.applyAcademy}
                </Link>
                <Link href="/faqs" onClick={() => setMobileOpen(false)} className={`text-lg sm:text-xl font-light py-2 transition-opacity duration-200 ${isLightPage ? 'hover:opacity-60' : 'hover:opacity-70'}`}>
                  {t.navbar.faq}
                </Link>
              </nav>

              <div className="mt-auto pt-8 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3 mb-6 text-center">
                  {isAuthenticated ? (
                    <button
                      onClick={() => { setMobileOpen(false); handleLogout(); }}
                      className={`col-span-3 py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}
                    >
                      {t.navbar.logout}
                    </button>
                  ) : (
                    <>
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        {t.navbar.therapistLogin}
                      </Link>
                      <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        {t.navbar.clientLogin}
                      </Link>
                      <a href={`mailto:${CONTACT_INFO.email}`} className={`py-2 rounded-lg font-medium text-[11px] transition-colors duration-200 ${isLightPage ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-white/5'}`}>
                        {t.navbar.contact}
                      </a>
                    </>
                  )}
                </div>
                <BookNowButton className={`w-full py-3 rounded-xl font-bold text-[12px] transition-all active:scale-95 ${
                  isLightPage ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white text-slate-900 hover:bg-slate-100'
                }`} onClick={() => setMobileOpen(false)}>
                  {t.navbar.beginYourReset}
                </BookNowButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
