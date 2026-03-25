'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBookingModal } from '@/components/booking/BookingModal';

export default function BookPage() {
  const router = useRouter();
  const { openBookingModal } = useBookingModal();
  
  useEffect(() => {
    // Open booking modal automatically
    openBookingModal('consultation');
  }, [openBookingModal]);
  
  // Redirect back to home when modal closes
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-slate-500">Opening booking form...</p>
      </div>
    </main>
  );
}
