'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import BookNowButton from '@/components/booking/BookNowButton';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center justify-center w-18 h-18 rounded-full bg-emerald-50 border-2 border-emerald-200">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Program Confirmed!
          </h1>
          <p className="text-slate-500 text-sm mb-8">
            Your NeuroHolistic program has been successfully confirmed. You can now schedule
            your sessions through the calendar.
          </p>

          {/* Next Steps */}
          <div className="bg-slate-50 rounded-xl p-5 mb-8 text-left">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              What happens next
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                Program confirmation email sent to you
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</span>
                Your sessions are ready to schedule
              </li>
              <li className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">→</span>
                Choose your therapist, date &amp; time below
              </li>
            </ul>
            {reference && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Reference</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{reference}</p>
              </div>
            )}
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <BookNowButton
              bookingType="program"
              className="block w-full py-3.5 rounded-xl bg-[#2B2F55] text-white font-semibold text-[15px] hover:bg-[#3d4270] transition-all active:scale-[0.98]"
            >
              Schedule Your Session
            </BookNowButton>
            <Link
              href="/dashboard"
              className="block w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-all"
            >
              Go to Dashboard
            </Link>
          </div>

          <p className="mt-6 text-xs text-slate-400">
            Need help?{' '}
            <a href="mailto:support@neuroholistic.com" className="text-[#2B2F55] hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
