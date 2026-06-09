'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useLang } from '@/lib/translations/LanguageContext';

function ZiinaSuccessContent() {
  const { isArabic } = useLang();
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent_id');

  const [status, setStatus] = useState<'verifying' | 'confirmed' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!paymentIntentId) {
      setStatus('confirmed');
      return;
    }

    let attempts = 0;
    const maxAttempts = 5;

    async function verify() {
      attempts++;
      try {
        const res = await fetch('/api/ziina/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentIntentId }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('confirmed');
          setMessage(data.message || 'Program activated');
          return;
        }

        if (attempts < maxAttempts && (!res.ok || data.status === 'pending')) {
          setTimeout(verify, 3000);
          return;
        }

        setStatus('confirmed');
        setMessage(data.message || 'Payment received. Your program will appear shortly.');
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(verify, 3000);
          return;
        }
        setStatus('confirmed');
      }
    }

    verify();
  }, [paymentIntentId]);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ${isArabic ? 'text-right' : 'text-center'}`}>
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            {status === 'verifying' ? (
              <Loader2 className="h-9 w-9 text-indigo-600 animate-spin" />
            ) : status === 'error' ? (
              <AlertCircle className="h-9 w-9 text-amber-500" />
            ) : (
              <CheckCircle className="h-9 w-9 text-emerald-600" />
            )}
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold text-slate-900">
          {status === 'verifying'
            ? (isArabic ? 'جارٍ تأكيد الدفع...' : 'Confirming payment...')
            : (isArabic ? 'تم استلام الدفع' : 'Payment Received')}
        </h1>

        <p className="mb-6 text-sm leading-6 text-slate-600">
          {status === 'verifying'
            ? (isArabic ? 'نتحقق من الدفع وتفعيل برنامجك.' : 'Verifying your payment and activating your program.')
            : (isArabic
                ? 'تم تفعيل برنامجك. يمكنك الآن جدولة جلساتك من لوحة التحكم.'
                : 'Your program is activated. You can now schedule your sessions from the dashboard.')}
        </p>

        {message && status === 'confirmed' && (
          <p className="mb-4 text-xs text-slate-400">{message}</p>
        )}

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
