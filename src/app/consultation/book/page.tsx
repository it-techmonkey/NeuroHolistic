'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FreeConsultationForm from '@/components/booking/FreeConsultationForm';

function BookConsultationWithQuery() {
  const searchParams = useSearchParams();
  const therapist = searchParams.get('therapist')?.trim() || undefined;
  return <FreeConsultationForm mode="page" preselectTherapistIdOrSlug={therapist} />;
}

export default function BookConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0B1028] pt-20 sm:pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    }>
      <BookConsultationWithQuery />
    </Suspense>
  );
}
