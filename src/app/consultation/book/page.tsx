'use client';

import { Suspense } from 'react';
import FreeConsultationForm from '@/components/booking/FreeConsultationForm';

export default function BookConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1028] pt-28 sm:pt-32 md:pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    }>
      <FreeConsultationForm mode="page" />
    </Suspense>
  );
}
