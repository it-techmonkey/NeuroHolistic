'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLang } from "@/lib/translations/LanguageContext";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isUrdu } = useLang();

  const isPublicPage = !(
    pathname?.startsWith('/auth/') ||
    pathname?.startsWith('/dashboard/') ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/admin/') ||
    pathname === '/admin' ||
    pathname?.startsWith('/therapist/') ||
    pathname === '/therapist' ||
    pathname?.startsWith('/book/') ||
    pathname === '/book' ||
    pathname?.startsWith('/booking/') ||
    pathname === '/booking' ||
    pathname?.startsWith('/api/')
  );

  return (
    <>
      {isPublicPage && <Navbar />}
      {isPublicPage ? (
        <main
          dir={isUrdu ? "rtl" : "ltr"}
          lang={isUrdu ? "ar" : "en"}
          className={isUrdu ? "urdu-text font-urdu" : ""}
        >
          {children}
        </main>
      ) : (
        <main>{children}</main>
      )}
      {isPublicPage && <Footer />}
    </>
  );
}
