'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
import { redirectToZiinaCheckout } from '@/lib/payments/client';
import Link from 'next/link';

const FULL_PROGRAM_AED = 7700;
const PER_SESSION_AED = 800;

// Ziina amount in the smallest currency unit (fils): 1 AED = 100 fils
const FULL_PROGRAM_AMOUNT = FULL_PROGRAM_AED * 100;
const PER_SESSION_AMOUNT = PER_SESSION_AED * 100;

export default function PaymentOptionsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<'full' | 'session' | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect unauthenticated users (runs once after loading finishes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login?next=/booking/payment-options');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2B2F55] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Verifying your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Show nothing while the redirect effect fires
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  async function handlePayment(type: 'full' | 'session') {
    setLoading(type);
    setError(null);
    try {
      const firstName = (user?.user_metadata?.first_name as string | undefined) || '';
      const lastName = (user?.user_metadata?.last_name as string | undefined) || '';
      const fullName = `${firstName} ${lastName}`.trim() || user?.email || '';

      if (type === 'full') {
        await redirectToZiinaCheckout({
          amount: FULL_PROGRAM_AMOUNT,
          description: 'NeuroHolistic Full Program — 10 Sessions',
          customerEmail: user?.email,
          customerName: fullName,
          sessionCount: 10,
        });
      } else {
        await redirectToZiinaCheckout({
          amount: PER_SESSION_AMOUNT,
          description: 'NeuroHolistic Single Session',
          customerEmail: user?.email,
          customerName: fullName,
          sessionCount: 1,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-3">
            NeuroHolistic Program
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Choose Your Payment Option
          </h1>
          <p className="text-slate-500 text-[16px] max-w-md mx-auto leading-relaxed">
            The NeuroHolistic program consists of{' '}
            <strong className="text-slate-700">10 sessions</strong>. Choose the option
            that suits you best.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* Option 1 — Full Program */}
          <div className="bg-white rounded-2xl border-2 border-[#2B2F55] shadow-xl p-6 md:p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2B2F55] to-[#6366F1]" />
            <div className="mb-1">
              <span className="inline-block px-3 py-1 bg-[#2B2F55]/10 text-[#2B2F55] text-xs font-bold rounded-full uppercase tracking-wider">
                Best Value
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">Full Program Payment</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Book the full program of 10 sessions and pay in advance. Get the complete
              transformation journey at the best rate.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-[#2B2F55]">7,700</span>
              <span className="text-slate-500 text-base ml-1">AED</span>
              <p className="text-slate-400 text-sm mt-1">10 sessions · 770 AED / session</p>
            </div>
            <button
              onClick={() => handlePayment('full')}
              disabled={!!loading}
              className="w-full py-3.5 rounded-xl bg-[#2B2F55] text-white font-semibold text-[15px] hover:bg-[#3d4270] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading === 'full' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                'Pay Full Program'
              )}
            </button>
          </div>

          {/* Option 2 — Per Session */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 md:p-8 flex flex-col">
            <div className="mb-1">
              <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
                Flexible
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">Pay Session by Session</h2>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              Book and pay one session at a time. Flexibility to continue at your own pace
              without a full commitment upfront.
            </p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-800">800</span>
              <span className="text-slate-500 text-base ml-1">AED</span>
              <p className="text-slate-400 text-sm mt-1">per session</p>
            </div>
            <button
              onClick={() => handlePayment('session')}
              disabled={!!loading}
              className="w-full py-3.5 rounded-xl border-2 border-[#2B2F55] text-[#2B2F55] font-semibold text-[15px] hover:bg-[#2B2F55] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading === 'session' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#2B2F55] border-t-transparent rounded-full animate-spin" />
                  Redirecting…
                </span>
              ) : (
                'Book a Session'
              )}
            </button>
          </div>
        </div>

        {/* Assistance */}
        <div className="mt-10 p-6 bg-white rounded-2xl border border-slate-100 text-center">
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong className="text-slate-800">Need assistance?</strong> If you need any
            help with booking or payment, please{' '}
            <a
              href="mailto:support@neuroholistic.com"
              className="text-[#2B2F55] font-semibold hover:underline"
            >
              contact the Admin
            </a>
            , who will assist you with the process.
          </p>
        </div>
      </div>
    </div>
  );
}
