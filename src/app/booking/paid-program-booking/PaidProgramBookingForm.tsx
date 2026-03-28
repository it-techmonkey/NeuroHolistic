'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard, Users, User, ArrowLeft } from 'lucide-react';

// Pricing constants
const PRIVATE_FULL_PROGRAM_AED = 7700;
const PRIVATE_PER_SESSION_AED = 800;
const GROUP_FULL_PROGRAM_AED = 4500;
const GROUP_PER_SESSION_AED = 500;

type ProgramType = 'private' | 'group';
type PaymentOption = 'full' | 'per_session';

interface PaidProgramBookingFormProps {
  userEmail: string;
  userName: string;
}

export default function PaidProgramBookingForm({ userEmail, userName }: PaidProgramBookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'program_type' | 'payment'>('program_type');
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(null);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleProgramTypeSelect = (type: ProgramType) => {
    setSelectedProgramType(type);
    setStep('payment');
  };

  const handleBackToProgramType = () => {
    setStep('program_type');
    setSelectedPaymentOption(null);
  };

  const getPrice = (type: ProgramType, option: PaymentOption) => {
    if (type === 'private') {
      return option === 'full' ? PRIVATE_FULL_PROGRAM_AED : PRIVATE_PER_SESSION_AED;
    }
    return option === 'full' ? GROUP_FULL_PROGRAM_AED : GROUP_PER_SESSION_AED;
  };

  const handlePayment = async (option: PaymentOption) => {
    if (!selectedProgramType) return;
    
    setSelectedPaymentOption(option);
    setProcessing(true);

    try {
      const res = await fetch('/api/bookings/purchase-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: option === 'full' 
            ? (selectedProgramType === 'private' ? 'private' : 'group_full')
            : (selectedProgramType === 'private' ? 'session_by_session' : 'group_session'),
          programType: selectedProgramType,
          amount: getPrice(selectedProgramType, option),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to process');
      }

      setSuccess(true);
      
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
        <h3 className="text-xl font-bold text-green-800 mb-2">Booking Confirmed!</h3>
        <p className="text-green-600 text-sm mb-4">
          Your {selectedProgramType === 'private' ? 'Private' : 'Group'} Program has been confirmed.
          {selectedPaymentOption === 'full' ? ' Full program' : ' Session-by-session'} payment selected.
        </p>
        <p className="text-green-500 text-xs">Redirecting to schedule your first session...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Demo Mode Notice */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg text-center">
        <p className="text-amber-800 text-sm font-medium">
          Demo Mode — Payment integration is in progress
        </p>
        <p className="text-amber-600 text-xs mt-1">
          Click "Proceed" to continue without actual payment
        </p>
      </div>

      {/* Step 1: Program Type Selection */}
      {step === 'program_type' && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Program Type</h2>
            <p className="text-slate-500 text-sm">
              Choose between a personalized 1-on-1 experience or a collaborative group setting.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Private Program Option */}
            <button
              onClick={() => handleProgramTypeSelect('private')}
              className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col text-left transition-all hover:shadow-lg hover:border-indigo-300 ${
                selectedProgramType === 'private' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500 rounded-t-2xl" />
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
                <User className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="mb-1">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Personalized
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Private Program</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                One-on-one sessions with your dedicated therapist. Fully personalized
                approach tailored to your unique needs and goals.
              </p>
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">7,700</span>
                  <span className="text-slate-500 text-sm">AED</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">10 sessions · Full program</p>
              </div>
            </button>

            {/* Group Program Option */}
            <button
              onClick={() => handleProgramTypeSelect('group')}
              className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col text-left transition-all hover:shadow-lg hover:border-emerald-300 ${
                selectedProgramType === 'group' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
              }`}
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 rounded-t-2xl" />
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-5">
                <Users className="w-7 h-7 text-emerald-600" />
              </div>
              <div className="mb-1">
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Collaborative
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Group Program</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                Join a supportive group of peers on the same journey. Benefit from
                shared experiences while receiving expert guidance.
              </p>
              <div className="border-t border-slate-100 pt-4 mt-auto">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900">4,500</span>
                  <span className="text-slate-500 text-sm">AED</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">10 sessions · Full program</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Options */}
      {step === 'payment' && selectedProgramType && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={handleBackToProgramType}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to program type</span>
          </button>

          {/* Selected Program Summary */}
          <div className={`rounded-xl p-4 border ${
            selectedProgramType === 'private' 
              ? 'bg-indigo-50 border-indigo-200' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                selectedProgramType === 'private' ? 'bg-indigo-100' : 'bg-emerald-100'
              }`}>
                {selectedProgramType === 'private' ? (
                  <User className="w-5 h-5 text-indigo-600" />
                ) : (
                  <Users className="w-5 h-5 text-emerald-600" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {selectedProgramType === 'private' ? 'Private Program' : 'Group Program'}
                </p>
                <p className="text-sm text-slate-500">10 sessions included</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Payment Option</h2>
            <p className="text-slate-500 text-sm">
              Select how you'd like to pay for your {selectedProgramType === 'private' ? 'Private' : 'Group'} Program.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Program Payment */}
            <div className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col relative overflow-hidden transition-all ${
              selectedPaymentOption === 'full' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}>
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                selectedProgramType === 'private' ? 'bg-indigo-500' : 'bg-emerald-500'
              }`} />
              <div className="mb-1">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  selectedProgramType === 'private' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  Best Value
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Full Program Payment</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                Pay for all 10 sessions upfront and save. Commit to your complete
                transformation journey.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  {getPrice(selectedProgramType, 'full').toLocaleString()}
                </span>
                <span className="text-slate-500 text-base ml-1">AED</span>
                <p className="text-slate-500 text-sm mt-1">
                  10 sessions · {Math.round(getPrice(selectedProgramType, 'full') / 10).toLocaleString()} AED / session
                </p>
              </div>
              <button
                onClick={() => handlePayment('full')}
                disabled={processing}
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  selectedProgramType === 'private'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {processing && selectedPaymentOption === 'full' ? (
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

            {/* Per Session Payment */}
            <div className={`bg-white rounded-2xl border-2 shadow-md p-8 flex flex-col transition-all ${
              selectedPaymentOption === 'per_session' ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}>
              <div className="mb-1">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  Flexible
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Pay Session by Session</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                Pay for each session individually. Flexibility to continue at your
                own pace without upfront commitment.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  {getPrice(selectedProgramType, 'per_session').toLocaleString()}
                </span>
                <span className="text-slate-500 text-base ml-1">AED</span>
                <p className="text-slate-500 text-sm mt-1">per session</p>
              </div>
              <button
                onClick={() => handlePayment('per_session')}
                disabled={processing}
                className="w-full py-3.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-[15px] hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                {processing && selectedPaymentOption === 'per_session' ? (
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
      )}
    </div>
  );
}
