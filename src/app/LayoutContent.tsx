'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const hideNavbar = 
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
    pathname === '/booking';
    
  const hideFooter = hideNavbar;

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      {!hideFooter && <Footer />}
    </>
  );
}
