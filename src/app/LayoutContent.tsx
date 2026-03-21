'use client';

import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Hide navbar and footer on auth, dashboard, admin, therapist, booking, and consultation routes
  const hideNavbar = 
    pathname?.startsWith('/auth/') || 
    pathname?.startsWith('/dashboard/') || 
    pathname === '/dashboard' || 
    pathname?.startsWith('/admin/') ||
    pathname === '/admin' ||
    pathname?.startsWith('/therapist/') ||
    pathname === '/therapist' ||
    pathname?.startsWith('/consultation/') ||
    pathname === '/consultation' ||
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
