'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard, Users, User, ArrowLeft, Stethoscope } from 'lucide-react';
import {
  type ProgramType,
  type PaymentOption,
  getPrice,
  getZiinaLink,
  getPerSessionFromFull,
  isDrFawzia,
} from '@/lib/payments/pricing';

interface PaidProgramBookingFormProps {
  userEmail: string;
  userName: string;
  isAuthenticated?: boolean;
}

interface TherapistInfo {
  name: string;
  slug?: string;
}

export default function PaidProgramBookingForm({ userEmail, userName, isAuthenticated = true }: PaidProgramBookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') as ProgramType | null;
  const [step, setStep] = useState<'program_type' | 'payment' | 'details'>(
    preselectedType === 'private' || preselectedType === 'group' ? 'payment' : 'program_type'
  );
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(
    preselectedType === 'private' || preselectedType === 'group' ? preselectedType : null
  );
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [loadingTherapist, setLoadingTherapist] = useState(true);
  const [hasActiveProgram, setHasActiveProgram] = useState(false);
  
  // Inline signup form data (for unauthenticated users)
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [pendingPaymentOption, setPendingPaymentOption] = useState<PaymentOption | null>(null);

  // Fetch assigned therapist and check active program on mount
  useEffect(() => {
    async function fetchTherapist() {
      try {
        if (isAuthenticated) {
          const res = await fetch('/api/client/assigned-therapist');
          if (res.ok) {
            const data = await res.json();
            if (data.therapist) {
              setTherapist(data.therapist);
            }
          }
          // Check for active program
          const progRes = await fetch('/api/users/check-program');
          if (progRes.ok) {
            const progData = await progRes.json();
            setHasActiveProgram(progData.hasProgram ?? false);
          }
        }
      } catch (err) {
        console.error('Failed to fetch therapist:', err);
      } finally {
        setLoadingTherapist(false);
      }
    }

    // Check if user returned from Ziina with pending payment
    const pendingPayment = sessionStorage.getItem('pendingPayment');
    if (pendingPayment) {
      const payment = JSON.parse(pendingPayment);
      setSelectedProgramType(payment.programType);
      setSelectedPaymentOption(payment.option);
      setShowConfirmPayment(true);
    }

    fetchTherapist();
  }, [isAuthenticated]);

  const isFawzia = isDrFawzia(therapist?.name, therapist?.slug);
  const [showConfirmPayment, setShowConfirmPayment] = useState(false);
  const [confirmingPayment, setConfirmingPayment] = useState(false);

  const handleProgramTypeSelect = (type: ProgramType) => {
    setSelectedProgramType(type);
    setStep('payment');
  };

  const handleBackToProgramType = () => {
    setStep('program_type');
    setSelectedPaymentOption(null);
  };

  const getPriceForDisplay = (type: ProgramType, option: PaymentOption) => {
    return getPrice(type, option, therapist?.name, therapist?.slug);
  };

  const handlePayment = async (option: PaymentOption) => {
    if (!selectedProgramType) return;

    // If not authenticated, show details step first
    if (!isAuthenticated) {
      setPendingPaymentOption(option);
      setStep('details');
      return;
    }

    setSelectedPaymentOption(option);

    // Get the Ziina link and redirect directly
    const ziinaLink = getZiinaLink(selectedProgramType, option, therapist?.name, therapist?.slug);
    
    // Store payment context for confirmation
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      programType: selectedProgramType,
      option,
      amount: getPriceForDisplay(selectedProgramType, option),
      therapistName: therapist?.name,
    }));

    // Open Ziina in a new tab so user stays on this page
    window.open(ziinaLink, '_blank');
    
    // Show the confirm payment screen immediately
    setShowConfirmPayment(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedProgramType) return;
    
    setConfirmingPayment(true);
    
    try {
      // Create the program in our system
      const res = await fetch('/api/bookings/purchase-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPaymentOption === 'full'
            ? (selectedProgramType === 'private' ? 'private' : 'group_full')
            : (selectedProgramType === 'private' ? 'session_by_session' : 'group_session'),
          programType: selectedProgramType,
          amount: getPriceForDisplay(selectedProgramType, selectedPaymentOption || 'full') * 100,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to activate program');
      }

      sessionStorage.removeItem('pendingPayment');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/booking/schedule-session');
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to activate program');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800 mb-2">Program Activated!</h3>
        <p className="text-green-600 text-sm mb-4">
          Your {selectedProgramType === 'private' ? 'Private' : 'Group'} Program has been activated.
          Your therapist will verify the payment and schedule your sessions.
        </p>
        <p className="text-green-500 text-xs">Redirecting to schedule your first session...</p>
      </div>
    );
  }

  // Show active program guard
  if (hasActiveProgram && isAuthenticated) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">You Already Have an Active Program</h3>
        <p className="text-indigo-600 text-sm mb-6">
          You already have an active program. Visit your dashboard to manage sessions and track progress.
        </p>
        <button
          onClick={() => router.push('/dashboard/client')}
          className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Show payment confirmation after returning from Ziina
  if (showConfirmPayment) {
    return (
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-indigo-900 mb-2">Complete Your Payment</h3>
          <p className="text-indigo-600 text-sm mb-4">
            You've been redirected to Ziina to complete your payment for the{' '}
            {selectedProgramType === 'private' ? 'Private' : 'Group'} Program.
          </p>
          <p className="text-slate-600 text-sm mb-6">
            Amount: <strong>{getPriceForDisplay(selectedProgramType || 'private', selectedPaymentOption || 'full').toLocaleString()} AED</strong>
          </p>
        </div>

        {therapist && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Your Therapist</p>
                <p className="text-lg font-semibold text-indigo-800">{therapist.name}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Once you've completed the payment on Ziina, click the button below to activate your program.
            Your therapist will verify the payment separately.
          </p>
        </div>

        <button
          onClick={handleConfirmPayment}
          disabled={confirmingPayment}
          className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          {confirmingPayment ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Activating...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              I've Completed the Payment
            </>
          )}
        </button>

        <button
          onClick={() => {
            sessionStorage.removeItem('pendingPayment');
            setShowConfirmPayment(false);
            setSelectedProgramType(null);
            setSelectedPaymentOption(null);
          }}
          className="w-full py-3 text-slate-600 hover:text-slate-800 text-sm font-medium"
        >
          Cancel and go back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Loading therapist info */}
      {loadingTherapist && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
          <span className="text-sm text-slate-500">Loading your therapist info...</span>
        </div>
      )}

      {/* Assigned Therapist Info */}
      {therapist && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">Your Assigned Therapist</p>
              <p className="text-lg font-semibold text-indigo-800">{therapist.name}</p>
              {isFawzia && (
                <p className="text-xs text-indigo-600 mt-0.5">Premium Specialist</p>
              )}
            </div>
          </div>
        </div>
      )}



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
                  <span className="text-2xl font-bold text-slate-900">
                    {getPriceForDisplay('private', 'full').toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-sm">AED</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  10 sessions · {getPerSessionFromFull(getPriceForDisplay('private', 'full'))} AED/session
                </p>
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
                  <span className="text-2xl font-bold text-slate-900">
                    {getPriceForDisplay('group', 'full').toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-sm">AED</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  10 sessions · {getPerSessionFromFull(getPriceForDisplay('group', 'full'))} AED/session
                </p>
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
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">Full Payment</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                Pay for all 10 sessions upfront and save. Commit to your complete
                transformation journey.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  {getPriceForDisplay(selectedProgramType, 'full').toLocaleString()}
                </span>
                <span className="text-slate-500 text-base ml-1">AED</span>
                <p className="text-slate-500 text-sm mt-1">
                  10 sessions · {getPerSessionFromFull(getPriceForDisplay(selectedProgramType, 'full'))} AED / session
                </p>
              </div>
              <button
                onClick={() => handlePayment('full')}
                className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                  selectedProgramType === 'private'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Payment
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
                  {getPriceForDisplay(selectedProgramType, 'per_session').toLocaleString()}
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

      {/* Step 3: User Details (unauthenticated users only) */}
      {step === 'details' && selectedProgramType && pendingPaymentOption && (
        <div className="space-y-6">
          {/* Back Button */}
          <button
            onClick={() => setStep('payment')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to pricing</span>
          </button>

          {/* Summary */}
          <div className={`rounded-xl p-4 border ${
            selectedProgramType === 'private' 
              ? 'bg-indigo-50 border-indigo-200' 
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex items-center justify-between">
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
                    {selectedProgramType === 'private' ? 'Private' : 'Group'} Program
                  </p>
                  <p className="text-sm text-slate-500">
                    {pendingPaymentOption === 'full' ? 'Full payment' : 'Per session'}
                  </p>
                </div>
              </div>
              <p className="text-xl font-bold text-slate-900">
                {getPriceForDisplay(selectedProgramType, pendingPaymentOption).toLocaleString()} AED
              </p>
            </div>
          </div>

          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Your Details</h2>
            <p className="text-slate-500 text-sm">Create your account to proceed with payment</p>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              if (!formData.name || !formData.email || !formData.phone || !formData.password) {
                setFormError('Please fill in all fields');
                return;
              }
              if (formData.password.length < 8) {
                setFormError('Password must be at least 8 characters');
                return;
              }

              setProcessing(true);
              try {
                // Create account
                const signupRes = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName: formData.name.split(' ')[0] || formData.name,
                    lastName: formData.name.split(' ').slice(1).join(' ') || '',
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    role: 'client',
                  }),
                });

                const signupData = await signupRes.json();
                
                // 409 means user already exists - try to sign in
                if (!signupRes.ok && signupRes.status !== 409) {
                  throw new Error(signupData.error || 'Failed to create account');
                }

                // Now proceed to payment with Ziina
                const link = getZiinaLink(selectedProgramType!, pendingPaymentOption!, therapist?.name, therapist?.slug);
                if (link) {
                  sessionStorage.setItem('pendingPayment', JSON.stringify({
                    programType: selectedProgramType,
                    option: pendingPaymentOption,
                    email: formData.email,
                  }));
                  window.open(link, '_blank');
                  setSelectedPaymentOption(pendingPaymentOption);
                  setShowConfirmPayment(true);
                  setStep('payment');
                } else {
                  throw new Error('Payment link not available');
                }
              } catch (err: any) {
                setFormError(err.message || 'Something went wrong');
              } finally {
                setProcessing(false);
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="+971 50 000 0000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Create Password *</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
              <p className="text-[11px] text-slate-400 mt-1">You'll use this to access your dashboard</p>
            </div>

            <button
              type="submit"
              disabled={processing || !formData.name || !formData.email || !formData.phone || !formData.password}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                processing || !formData.name || !formData.email || !formData.phone || !formData.password
                  ? 'bg-slate-300 cursor-not-allowed'
                  : selectedProgramType === 'private'
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Create Account & Proceed to Payment
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
