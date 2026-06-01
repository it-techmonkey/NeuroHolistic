'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle } from 'lucide-react';
import { useLang } from '@/lib/translations/LanguageContext';

function ZiinaFailureContent() {
  const { isArabic } = useLang();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent_id');

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ${isArabic ? 'text-right' : 'text-center'}`}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-9 w-9 text-red-600" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          {isArabic ? 'لم يكتمل الدفع' : 'Payment Not Completed'}
        </h1>
        <p className="mb-6 text-sm leading-6 text-slate-600">
          {isArabic
            ? 'لم يتم تأكيد الدفع. يمكنك المحاولة مرة أخرى أو التواصل معنا إذا تم خصم المبلغ.'
            : 'Your payment was not confirmed. You can try again, or contact us if your card was charged.'}
        </p>

        {paymentIntentId && (
          <div className="mb-6 rounded-xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isArabic ? 'مرجع الدفع' : 'Payment Reference'}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600">{paymentIntentId}</p>
          </div>
        )}

        <Link
          href="/booking/paid-program-booking"
          className="block w-full rounded-xl bg-[#2B2F55] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3d4270]"
        >
          {isArabic ? 'المحاولة مرة أخرى' : 'Try Again'}
        </Link>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function ZiinaFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ZiinaFailureContent />
    </Suspense>
  );
}
