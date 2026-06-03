'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { useLang } from '@/lib/translations/LanguageContext';

function ZiinaSuccessContent() {
  const { isArabic } = useLang();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent_id');

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ${isArabic ? 'text-right' : 'text-center'}`}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle className="h-9 w-9 text-emerald-600" />
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          {isArabic ? 'تم استلام الدفع' : 'Payment Received'}
        </h1>
        <p className="mb-6 text-sm leading-6 text-slate-600">
          {isArabic
            ? 'نقوم الآن بتأكيد الدفع وتفعيل برنامجك. قد يستغرق ظهور البرنامج في لوحة التحكم لحظات قليلة.'
            : 'We are confirming your payment and activating your program. It may take a few moments to appear in your dashboard.'}
        </p>

        {paymentIntentId && (
          <div className="mb-6 rounded-xl bg-slate-50 p-4 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {isArabic ? 'مرجع الدفع' : 'Payment Reference'}
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-600">{paymentIntentId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard/client"
            className="block w-full rounded-xl bg-[#2B2F55] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#3d4270]"
          >
            {isArabic ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard'}
          </Link>
          <Link
            href="/booking/paid-program-booking"
            className="block w-full rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            {isArabic ? 'العودة إلى الدفع' : 'Back to Payment Options'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function ZiinaSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ZiinaSuccessContent />
    </Suspense>
  );
}
