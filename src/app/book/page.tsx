'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingModal } from '@/components/booking/BookingModal';
import { useLang } from '@/lib/translations/LanguageContext';

export default function BookPage() {
  const router = useRouter();
  const { openBookingModal } = useBookingModal();
  const { isArabic } = useLang();
  
  useEffect(() => {
    // Open booking modal automatically
    openBookingModal('consultation');
  }, [openBookingModal]);
  
  // Redirect back to home when modal closes
  return (
    <main dir={isArabic ? 'rtl' : 'ltr'} className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500">{isArabic ? 'جارٍ فتح نموذج الحجز...' : 'Opening booking form...'}</p>
      </div>
    </main>
  );
}
