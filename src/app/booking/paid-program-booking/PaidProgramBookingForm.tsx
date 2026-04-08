'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard, Users, User, ArrowLeft, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import {
  type ProgramType,
  type PaymentOption,
  getPrice,
  getZiinaLink,
  getPerSessionFromFull,
  isDrFawzia,
  ACADEMY_PRICING,
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

const THERAPIST_NAME_BY_SLUG: Record<string, string> = {
  'fawzia-yassmina': 'Dr. Fawzia Yassmina',
  'mariam-al-kaisi': 'Mariam Al Kaissi',
  'noura-youssef': 'Noura Youssef',
  'zekra-khayata': 'Zekra Khayata',
  'reem-mobayed': 'Reem Mobayed',
  'fawares-azaar': 'Fawares Azaar',
  'joud-charafeddin': 'Joud Charafeddin',
};

export default function PaidProgramBookingForm({ userEmail, userName, isAuthenticated = true }: PaidProgramBookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedType = searchParams.get('type') as ProgramType | null;
  const academyMode = searchParams.get('mode') === 'academy';
  const preferredTherapistSlug = searchParams.get('therapist')?.trim() || '';
  const [step, setStep] = useState<'program_type' | 'payment' | 'details'>(
    academyMode || preselectedType === 'private' || preselectedType === 'group' ? 'payment' : 'program_type'
  );
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(
    academyMode ? 'private' : (preselectedType === 'private' || preselectedType === 'group' ? preselectedType : null)
  );
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [therapist, setTherapist] = useState<TherapistInfo | null>(null);
  const [loadingTherapist, setLoadingTherapist] = useState(true);
  const [hasActiveProgram, setHasActiveProgram] = useState(false);
  const [hasCompletedConsultation, setHasCompletedConsultation] = useState<boolean | null>(null);
  const [consultationCheckDone, setConsultationCheckDone] = useState(false);
  
  // Inline signup form data (for unauthenticated users)
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    country: '',
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
          // Check if user has completed a free consultation
          const consultRes = await fetch('/api/client/dashboard');
          if (consultRes.ok) {
            const consultData = await consultRes.json();
            setHasCompletedConsultation(consultData.hasCompletedFreeConsult ?? false);
          }
          setConsultationCheckDone(true);
        } else {
          // Unauthenticated users - check after signup in the details step
          setHasCompletedConsultation(false);
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

  const preferredTherapist: TherapistInfo | null = preferredTherapistSlug
    ? {
        slug: preferredTherapistSlug,
        name:
          THERAPIST_NAME_BY_SLUG[preferredTherapistSlug] ||
          preferredTherapistSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      }
    : null;
  const effectiveTherapist = preferredTherapist || therapist;
  const isFawzia = isDrFawzia(effectiveTherapist?.name, effectiveTherapist?.slug);
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
    if (academyMode) {
      return option === 'full' ? ACADEMY_PRICING.fullProgram : ACADEMY_PRICING.installment;
    }
    return getPrice(type, option, effectiveTherapist?.name, effectiveTherapist?.slug);
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
    const ziinaLink = academyMode
      ? (option === 'full' ? ACADEMY_PRICING.ziinaLinks.fullProgram : ACADEMY_PRICING.ziinaLinks.installment)
      : getZiinaLink(selectedProgramType, option, effectiveTherapist?.name, effectiveTherapist?.slug);
    
    // Store payment context for confirmation
    sessionStorage.setItem('pendingPayment', JSON.stringify({
      programType: selectedProgramType,
      option,
      amount: getPriceForDisplay(selectedProgramType, option),
      therapistName: effectiveTherapist?.name,
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
      // Create the program in our system (status: pending, awaiting admin verification)
      const res = await fetch('/api/bookings/purchase-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: academyMode
            ? (selectedPaymentOption === 'full' ? 'academy_full' : 'academy_installment')
            : selectedPaymentOption === 'full'
            ? (selectedProgramType === 'private' ? 'private' : 'group_full')
            : (selectedProgramType === 'private' ? 'session_by_session' : 'group_session'),
          programType: academyMode ? 'academy' : selectedProgramType,
          amount: getPriceForDisplay(selectedProgramType, selectedPaymentOption || 'full') * 100,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.requiresConsultation) {
          setHasCompletedConsultation(false);
          return;
        }
        throw new Error(data.error || 'Failed to submit payment');
      }

      sessionStorage.removeItem('pendingPayment');
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/dashboard/client');
      }, 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit payment. Please try again.');
    } finally {
      setConfirmingPayment(false);
    }
  };

  if (success) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">Payment Submitted!</h3>
        <p className="text-amber-700 text-sm mb-4">
          Your {academyMode ? 'Academy' : (selectedProgramType === 'private' ? 'Private' : 'Group')} Program payment has been submitted for verification.
          Our admin team will verify your payment and confirm your booking shortly.
        </p>
        <div className="bg-amber-100/50 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">What happens next</p>
          <ul className="space-y-1.5 text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">1</span>
              Our team verifies your payment
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">2</span>
              You'll receive a confirmation email
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">3</span>
              Schedule your sessions from the dashboard
            </li>
          </ul>
        </div>
        <p className="text-amber-600 text-xs">Redirecting to your dashboard...</p>
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

  // Show consultation required guard for authenticated users who haven't completed consultation
  // Also shows for non-authenticated users after they enter details and are found to lack a consultation
  if (hasCompletedConsultation === false && !academyMode && (isAuthenticated || consultationCheckDone)) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-amber-900 mb-2">Free Consultation Required</h3>
        <p className="text-amber-700 text-sm mb-6 max-w-md mx-auto">
          A free consultation with a therapist is required before purchasing a paid program. 
          During the consultation, your therapist will complete an initial assessment to establish your baseline and create a personalized treatment plan.
        </p>
        <button
          onClick={() => router.push('/consultation/book')}
          className="px-8 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-all"
        >
          Book Free Consultation
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
            {academyMode ? 'Academy' : (selectedProgramType === 'private' ? 'Private' : 'Group')} Program.
          </p>
          <p className="text-slate-600 text-sm mb-6">
            Amount: <strong>{getPriceForDisplay(selectedProgramType || 'private', selectedPaymentOption || 'full').toLocaleString()} AED</strong>
          </p>
        </div>

        {effectiveTherapist && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900">Your Therapist</p>
                <p className="text-lg font-semibold text-indigo-800">{effectiveTherapist.name}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleConfirmPayment}
          disabled={confirmingPayment}
          className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-all flex items-center justify-center gap-2"
        >
          {confirmingPayment ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              I've Made the Payment
            </>
          )}
        </button>

        <button
          onClick={() => {
            sessionStorage.removeItem('pendingPayment');
            setShowConfirmPayment(false);
            setSelectedProgramType(null);
            setSelectedPaymentOption(null);
            setStep(preselectedType === 'private' || preselectedType === 'group' ? 'payment' : 'program_type');
            if (!isAuthenticated) {
              setPendingPaymentOption(null);
            }
            router.push('/booking/paid-program-booking');
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
      {effectiveTherapist && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-900">Your Assigned Therapist</p>
              <p className="text-lg font-semibold text-indigo-800">{effectiveTherapist.name}</p>
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
          {!academyMode && (
            <button
              onClick={handleBackToProgramType}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back to program type</span>
            </button>
          )}

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
                  {academyMode ? 'Academy Program' : (selectedProgramType === 'private' ? 'Private Program' : 'Group Program')}
                </p>
                <p className="text-sm text-slate-500">{academyMode ? '5 sessions included' : '10 sessions included'}</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Choose Payment Option</h2>
            <p className="text-slate-500 text-sm">
              {academyMode
                ? 'Select your Academy payment option.'
                : `Select how you'd like to pay for your ${selectedProgramType === 'private' ? 'Private' : 'Group'} Program.`}
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
                {academyMode
                  ? 'Pay for all 5 Academy sessions upfront.'
                  : 'Pay for all 10 sessions upfront and save. Commit to your complete transformation journey.'}
              </p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">
                  {getPriceForDisplay(selectedProgramType, 'full').toLocaleString()}
                </span>
                <span className="text-slate-500 text-base ml-1">AED</span>
                <p className="text-slate-500 text-sm mt-1">
                  {academyMode
                    ? `5 sessions · ${Math.round(getPriceForDisplay(selectedProgramType, 'full') / 5)} AED / session`
                    : `10 sessions · ${getPerSessionFromFull(getPriceForDisplay(selectedProgramType, 'full'))} AED / session`}
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
                {academyMode
                  ? 'Pay 5,000 AED per Academy session. Total Academy program consists of 5 sessions.'
                  : 'Pay for each session individually. Flexibility to continue at your own pace without upfront commitment.'}
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
                    {academyMode ? 'Academy Program' : `${selectedProgramType === 'private' ? 'Private' : 'Group'} Program`}
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
              if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.password) {
                setFormError('Please fill in all fields');
                return;
              }
              if (formData.password.length < 8) {
                setFormError('Password must be at least 8 characters');
                return;
              }

              setProcessing(true);
              try {
                // Create account (API auto-signs in and returns session)
                const signupRes = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firstName: formData.name.split(' ')[0] || formData.name,
                    lastName: formData.name.split(' ').slice(1).join(' ') || '',
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    country: formData.country,
                    role: 'client',
                  }),
                });

                const signupData = await signupRes.json();
                
                // 409 means user already exists - still proceeds with session
                if (!signupRes.ok && signupRes.status !== 409) {
                  throw new Error(signupData.error || 'Failed to create account');
                }

                // Set the session on the client so authenticated API calls work
                if (signupData.session?.access_token) {
                  await supabase.auth.setSession({
                    access_token: signupData.session.access_token,
                    refresh_token: signupData.session.refresh_token || '',
                  });
                }

                // Check if this email has a completed free consultation
                const consultCheckRes = await fetch('/api/client/dashboard');
                if (consultCheckRes.ok) {
                  const consultCheckData = await consultCheckRes.json();
                  if (!consultCheckData.hasCompletedFreeConsult) {
                    setHasCompletedConsultation(false);
                    setConsultationCheckDone(true);
                    setStep('payment');
                    setProcessing(false);
                    return;
                  }
                } else {
                  // If dashboard check fails, block to be safe
                  setHasCompletedConsultation(false);
                  setConsultationCheckDone(true);
                  setStep('payment');
                  setProcessing(false);
                  return;
                }

                // Has completed consultation - proceed to payment
                const link = getZiinaLink(
                  selectedProgramType!,
                  pendingPaymentOption!,
                  effectiveTherapist?.name,
                  effectiveTherapist?.slug
                );
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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country *</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="UAE"
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
              disabled={processing || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password}
              className={`w-full py-3.5 rounded-xl text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 ${
                processing || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password
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
