'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import ScrollToTop from "@/components/ScrollToTop";
import { useLang } from "@/lib/translations/LanguageContext";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isArabic } = useLang();
  const isBookingFlow =
    pathname === '/consultation/book' ||
    pathname?.startsWith('/booking/paid-program-booking');

  const isDashboardRoute =
    pathname === '/dashboard' ||
    pathname?.startsWith('/dashboard/') ||
    pathname === '/admin' ||
    pathname?.startsWith('/admin/') ||
    pathname === '/therapist' ||
    pathname?.startsWith('/therapist/');

  const isPublicPage = !(
    pathname?.startsWith('/auth/') ||
    isDashboardRoute ||
    pathname?.startsWith('/book/') ||
    pathname === '/book' ||
    pathname?.startsWith('/booking/') ||
    pathname === '/booking' ||
    pathname?.startsWith('/api/')
  );

  return (
    <>
      <ScrollToTop />
      {isPublicPage && !isBookingFlow && <Navbar />}
      {isBookingFlow && (
        <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-[#0B1028]/95 backdrop-blur-md pt-safe">
          <div className="mx-auto max-w-[1200px] h-16 px-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-white">
              <Image src="/images/logo.svg" alt="NeuroHolistic" width={26} height={22} unoptimized />
              <span className="text-sm font-semibold tracking-wide">NeuroHolistic</span>
            </Link>
            <Link href="/" className="text-xs font-medium text-white/80 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </header>
      )}
      {isPublicPage ? (
        <main
          dir={isArabic ? "rtl" : "ltr"}
          lang={isArabic ? "ar" : "en"}
          className={`${isArabic ? "arabic-text font-arabic" : ""} ${isBookingFlow ? "scroll-pt-16" : ""}`}
        >
          {children}
        </main>
      ) : (
        <main className={isBookingFlow ? "scroll-pt-16" : ""}>{children}</main>
      )}
      {isPublicPage && !isBookingFlow && <Footer />}
      {!isDashboardRoute && <FloatingWhatsAppButton />}
    </>
  );
}
