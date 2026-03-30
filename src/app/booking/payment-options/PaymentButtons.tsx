'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard } from 'lucide-react';

const FULL_PROGRAM_AED = 7700;
const PER_SESSION_AED = 800;

interface PaymentButtonsProps {
  userEmail: string;
  userName: string;
}

export default function PaymentButtons({ userEmail, userName }: PaymentButtonsProps) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<'full' | 'per_session' | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePayment = async (plan: 'full' | 'per_session') => {
    setSelectedPlan(plan);
    setProcessing(true);

    try {
      // Call API to create program (demo - no actual payment)
      const res = await fetch('/api/bookings/purchase-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: plan === 'full' ? 'private' : 'session_by_session',
          amount: plan === 'full' ? FULL_PROGRAM_AED : PER_SESSION_AED,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process');
      }

      setSuccess(true);
      
      // Redirect to schedule session after 2 seconds
      setTimeout(() => {
        router.push('/booking/schedule-session');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
      setProcessing(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600 text-sm mb-4">
          Your {selectedPlan === 'full' ? 'full program' : 'session'} has been confirmed.
        </p>
        <p className="text-green-500 text-xs">Redirecting to schedule your first session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Mode Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
        <p className="text-amber-800 text-sm font-medium">
          Demo Mode — Payment integration is in progress
        </p>
        <p className="text-amber-600 text-xs mt-1">
          Click "Proceed" to continue without actual payment
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1 — Full Program */}
        <div className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col relative overflow-hidden transition-all ${
          selectedPlan === 'full' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
          <div className="mb-1">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Best Value
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">Full Payment</h2>
          <p className="text-slate-500 text-sm mb-6 flex-1">
            Book the full program of 10 sessions and pay in advance. Get the complete
            transformation journey at the best rate.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-900">7,700</span>
            <span className="text-slate-500 text-base ml-1">AED</span>
            <p className="text-slate-500 text-sm mt-1">10 sessions · 770 AED / session</p>
          </div>
          <button
            onClick={() => handlePayment('full')}
            disabled={processing}
            className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            {processing && selectedPlan === 'full' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
              </>
            )}
          </button>
        </div>

        {/* Option 2 — Per Session */}
        <div className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col transition-all ${
          selectedPlan === 'per_session' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
        }`}>
          <div className="mb-1">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Flexible
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2">Pay Session by Session</h2>
          <p className="text-slate-500 text-sm mb-6 flex-1">
            Book and pay one session at a time. Flexibility to continue at your own pace
            without a full commitment upfront.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-900">800</span>
            <span className="text-slate-500 text-base ml-1">AED</span>
            <p className="text-slate-500 text-sm mt-1">per session</p>
          </div>
          <button
            onClick={() => handlePayment('per_session')}
            disabled={processing}
            className="w-full py-3.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-[15px] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
          >
            {processing && selectedPlan === 'per_session' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}