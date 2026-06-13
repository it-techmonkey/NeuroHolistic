'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard, Users, User, ArrowLeft, Stethoscope, ChevronRight, CalendarDays } from 'lucide-react';
import ScheduleStep from '@/components/booking/shared/ScheduleStep';
import { supabase } from '@/lib/supabase/client';
import {
  type ProgramType,
  type PaymentOption,
  getPrice,
  getPerSessionFromFull,
  DR_FAWZIA_NAME,
  DR_FAWZIA_SLUG,
  ACADEMY_PRICING,
} from '@/lib/payments/pricing';
import { redirectToZiinaCheckout } from '@/lib/payments/client';
import { useLang } from '@/lib/translations/LanguageContext';
import type { DiscountPercent } from '@/lib/payments/discount';
import TherapistCard from '@/components/booking/shared/TherapistCard';

interface PaidProgramBookingFormProps {
  userEmail: string;
  userName: string;
  isAuthenticated?: boolean;
}

interface TherapistInfo {
  name: string;
  slug?: string;
  id?: string;
}

interface DiscountInfo {
  discountPercent: DiscountPercent;
}

function applyClientDiscount(originalPrice: number, discountPercent: DiscountPercent) {
  const factor = discountPercent / 100;
  return Math.round(originalPrice * (1 - factor));
}

type Step = 'program_type' | 'therapist' | 'schedule' | 'payment' | 'account_prompt' | 'signup_form' | 'details';

export default function PaidProgramBookingForm({ userEmail, userName, isAuthenticated = true }: PaidProgramBookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isArabic } = useLang();
  const preselectedType = searchParams.get('type') as ProgramType | null;
  const academyMode = searchParams.get('mode') === 'academy';
  const preferredTherapistSlug = searchParams.get('therapist')?.trim() || '';

  const [step, setStep] = useState<Step>(
    !isAuthenticated ? 'account_prompt' : academyMode ? 'payment' : preselectedType ? 'therapist' : 'program_type'
  );
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType | null>(
    academyMode ? 'private' : (preselectedType || null)
  );
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption | null>(null);
  const [processing, setProcessing] = useState(false);
  const [hasActiveProgram, setHasActiveProgram] = useState(false);

  const [selectedTherapist, setSelectedTherapist] = useState<TherapistInfo | null>(null);
  const [therapistList, setTherapistList] = useState<Array<{ id: string; slug: string; name: string; role: string }>>([]);
  const [loadingTherapists, setLoadingTherapists] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    country: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [pendingPaymentOption, setPendingPaymentOption] = useState<PaymentOption | null>(null);
  const [userDiscount, setUserDiscount] = useState<DiscountInfo | null>(null);
  const [locallyAuthenticated, setLocallyAuthenticated] = useState(false);
  const effectivelyAuthenticated = isAuthenticated || locallyAuthenticated;

  useEffect(() => {
    async function loadData() {
      try {
        const [therapistRes, programRes, discountRes] = await Promise.all([
          fetch('/api/therapist/list'),
          isAuthenticated ? fetch('/api/users/check-program') : Promise.resolve(null),
          isAuthenticated ? fetch('/api/client/my-discount') : Promise.resolve(null),
        ]);

        if (therapistRes.ok) {
          const data = await therapistRes.json();
          setTherapistList(data.therapists || []);
        }

        if (programRes?.ok) {
          const progData = await programRes.json();
          setHasActiveProgram(progData.hasProgram ?? false);
        }

        if (discountRes?.ok) {
          const discountData = await discountRes.json();
          if (discountData.discount) {
            setUserDiscount(discountData.discount);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoadingTherapists(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const getPriceForDisplay = useCallback((type: ProgramType, option: PaymentOption, therapist?: TherapistInfo | null) => {
    if (academyMode) {
      return option === 'full' ? ACADEMY_PRICING.fullProgram : ACADEMY_PRICING.installment;
    }
    return getPrice(type, option, therapist?.name, therapist?.slug);
  }, [academyMode]);

  const handleSelectProgramType = (type: ProgramType) => {
    setSelectedProgramType(type);
    if (academyMode) {
      setStep('payment');
    } else {
      setStep(type === 'group' ? 'schedule' : 'therapist');
    }
  };

  const handleSelectTherapist = (therapist: { id: string; slug: string; name: string; role: string }) => {
    setSelectedTherapist({ name: therapist.name, slug: therapist.slug, id: therapist.id });
    setStep('schedule');
  };

  const handleSelectSchedule = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep('payment');
  };

  const handleBack = () => {
    if (step === 'signup_form') {
      setStep('account_prompt');
    } else if (step === 'payment') {
      setStep('schedule');
      setSelectedPaymentOption(null);
    } else if (step === 'schedule') {
      setStep(selectedProgramType === 'group' ? 'program_type' : 'therapist');
      setSelectedDate('');
      setSelectedTime('');
    } else if (step === 'therapist') {
      setStep('program_type');
      setSelectedTherapist(null);
    } else if (step === 'details') {
      setStep('payment');
    }
  };

  const handlePayment = async (option: PaymentOption) => {
    if (!selectedProgramType) return;

    if (!effectivelyAuthenticated) {
      setPendingPaymentOption(option);
      setStep('details');
      return;
    }

    setSelectedPaymentOption(option);
    setProcessing(true);
    try {
      await redirectToZiinaCheckout({
        programType: academyMode ? 'academy' : selectedProgramType,
        paymentOption: option,
        therapistName: selectedTherapist?.name,
        therapistSlug: selectedTherapist?.slug,
        discountPercent: userDiscount?.discountPercent,
        preferredDate: selectedDate || undefined,
        preferredTime: selectedTime || undefined,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to start payment.');
      setProcessing(false);
    }
  };

  if (hasActiveProgram && isAuthenticated) {
    return (
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-indigo-600" />
        </div>
        <h3 className="text-xl font-bold text-indigo-900 mb-2">{isArabic ? 'لديك برنامج نشط بالفعل' : 'You Already Have an Active Program'}</h3>
        <p className="text-indigo-600 text-sm mb-6">
          {isArabic ? 'لديك برنامج نشط بالفعل. انتقل إلى لوحة التحكم لإدارة الجلسات ومتابعة التقدم.' : 'You already have an active program. Visit your dashboard to manage sessions and track progress.'}
        </p>
        <button onClick={() => router.push('/dashboard/client')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-all">
          {isArabic ? 'اذهب إلى لوحة التحكم' : 'Go to Dashboard'}
        </button>
      </div>
    );
  }

  const stepIndicators = academyMode
    ? [{ key: 'payment' as Step, label: isArabic ? 'الدفع' : 'Payment' }]
    : selectedProgramType === 'group'
      ? [
          { key: 'program_type' as Step, label: isArabic ? 'البرنامج' : 'Program' },
          { key: 'schedule' as Step, label: isArabic ? 'الموعد' : 'Schedule' },
          { key: 'payment' as Step, label: isArabic ? 'الدفع' : 'Payment' },
        ]
      : [
          { key: 'program_type' as Step, label: isArabic ? 'البرنامج' : 'Program' },
          { key: 'therapist' as Step, label: isArabic ? 'المعالج' : 'Therapist' },
          { key: 'schedule' as Step, label: isArabic ? 'الموعد' : 'Schedule' },
          { key: 'payment' as Step, label: isArabic ? 'الدفع' : 'Payment' },
        ];

  const stepOrder = stepIndicators.map(s => s.key);
  const currentStepIndex = stepOrder.indexOf(step);

  const PriceTag = ({ type, option }: { type: ProgramType; option: PaymentOption }) => {
    const original = getPriceForDisplay(type, option, selectedTherapist);
    const discounted = userDiscount ? applyClientDiscount(original, userDiscount.discountPercent) : original;
    const isDiscounted = !!userDiscount;

    return (
      <div className="flex items-baseline gap-2 flex-wrap">
        {isDiscounted && (
          <span className="text-lg text-slate-400 line-through">{original.toLocaleString()}</span>
        )}
        <span className={`text-4xl font-bold ${isDiscounted ? 'text-indigo-600' : 'text-slate-900'}`}>
          {isArabic ? 'يبدأ من' : 'From'} {discounted.toLocaleString()}
        </span>
        <span className="text-slate-500 text-base">{isArabic ? 'درهم إماراتي' : 'AED'}</span>
        {isDiscounted && (
          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            -{userDiscount.discountPercent}%
          </span>
        )}
      </div>
    );
  };

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="space-y-6">
      {/* Step indicator */}
      {!academyMode && (
        <div className="flex items-center gap-2 mb-6">
          {stepIndicators.map((s, i) => {
            const isActive = step === s.key;
            const isPast = currentStepIndex > i;
            return (
              <div key={s.key} className="flex items-center gap-2">
                {i > 0 && <div className={`w-6 h-px ${isPast ? 'bg-indigo-400' : 'bg-slate-200'}`} />}
                <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${isActive ? 'bg-indigo-600 text-white' : isPast ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'}`}>
                  {isPast ? <CheckCircle className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className={`mb-2 ${isArabic ? 'text-right' : 'text-center'}`}>
        <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-[#6366F1]">
          {academyMode ? (isArabic ? 'أكاديمية نيوروهوليستك' : 'NeuroHolistic Academy') : (isArabic ? 'برنامج نيوروهوليستك' : 'NeuroHolistic Program')}
        </p>
        <h1 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
          {step === 'program_type' && (isArabic ? 'اختر برنامجك' : 'Choose Your Program')}
          {step === 'therapist' && (isArabic ? 'اختر معالجك' : 'Choose Your Therapist')}
          {step === 'schedule' && (isArabic ? 'اختر الموعد' : 'Choose Your Schedule')}
          {step === 'payment' && (isArabic ? 'اختر طريقة الدفع' : 'Choose Payment Option')}
          {step === 'details' && (isArabic ? 'بياناتك' : 'Your Details')}
        </h1>
        <p className="text-[16px] leading-relaxed text-slate-500 mx-auto max-w-lg">
          {step === 'program_type' && (isArabic ? 'اطّلع على خيارات البرامج والأسعار واختر النوع الأنسب لاحتياجاتك.' : 'View our program options and pricing. Choose the type that best suits your needs.')}
          {step === 'therapist' && (isArabic ? 'اختر المعالج الذي تفضله. الأسعار قد تختلف حسب المعالج.' : 'Select your preferred therapist. Pricing may vary by therapist.')}
          {step === 'schedule' && (isArabic ? 'اختر التاريخ والوقت المناسب لجلساتك.' : 'Pick your preferred date and time for sessions.')}
          {step === 'payment' && (isArabic ? 'اختر كيف تريد الدفع.' : 'Select how you\'d like to pay.')}
          {step === 'details' && (isArabic ? 'أنشئ حسابك للمتابعة إلى الدفع' : 'Create your account to proceed with payment')}
        </p>
      </div>

      {loadingTherapists && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 mr-2" />
          <span className="text-sm text-slate-500">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
        </div>
      )}

      {/* STEP 1: Program Type */}
      {step === 'program_type' && !loadingTherapists && (
        <>
          {/* Free Consultation Suggestion */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1">
                  {isArabic ? 'هل فكّرت في الاستشارة المجانية؟' : 'Consider a Free Consultation?'}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {isArabic 
                    ? 'نوصي بالبدء باستشارة مجانية لتقييم احتياجاتك والتعرف على معالجك المناسب قبل اختيار البرنامج.'
                    : 'We recommend starting with a free consultation to assess your needs and find the right therapist before choosing a program.'}
                </p>
                <button
                  onClick={() => router.push('/consultation/book')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Stethoscope className="w-4 h-4" />
                  {isArabic ? 'احجز استشارة مجانية' : 'Book Free Consultation'}
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
          <button onClick={() => handleSelectProgramType('private')} className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 md:p-8 flex flex-col text-left transition-all hover:shadow-lg hover:border-indigo-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <User className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider w-fit">
              {isArabic ? 'مخصص' : 'Personalized'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">{isArabic ? 'برنامج فردي' : 'Private Program'}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              {isArabic ? 'جلسات فردية مع معالجك المخصص.' : 'One-on-one sessions with your dedicated therapist.'}
            </p>
            <div className="border-t border-slate-100 pt-4">
              <PriceTag type="private" option="full" />
              <p className="text-slate-500 text-xs mt-1">
                {isArabic ? '10 جلسات' : '10 sessions'} · {isArabic ? 'ابدأ باختيار المعالج' : 'Start by choosing your therapist'}
              </p>
            </div>
          </button>

          <button onClick={() => handleSelectProgramType('group')} className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 md:p-8 flex flex-col text-left transition-all hover:shadow-lg hover:border-indigo-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500" />
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-5">
              <Users className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider w-fit">
              {isArabic ? 'تعاوني' : 'Collaborative'}
            </span>
            <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">{isArabic ? 'برنامج جماعي' : 'Group Program'}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">
              {isArabic ? 'انضم إلى مجموعة داعمة من المشاركين.' : 'Join a supportive group of peers on the same journey.'}
            </p>
            <div className="border-t border-slate-100 pt-4">
              <PriceTag type="group" option="full" />
              <p className="text-slate-500 text-xs mt-1">{isArabic ? '10 جلسات' : '10 sessions'} · {isArabic ? 'جميع المعالجين' : 'All therapists'}</p>
            </div>
          </button>
        </div>
        </>
      )}

      {/* STEP 2: Therapist Selection */}
      {step === 'therapist' && !loadingTherapists && (
        <div className="space-y-4">
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{isArabic ? 'العودة' : 'Back'}</span>
          </button>

          <div className="grid md:grid-cols-2 gap-3">
            {therapistList.map((t) => {
              const isSelected = selectedTherapist?.slug === t.slug;
              const privatePrice = getPriceForDisplay('private', 'full', { name: t.name, slug: t.slug });
              const discountedPrice = userDiscount ? applyClientDiscount(privatePrice, userDiscount.discountPercent) : privatePrice;
              const isFounder = t.slug === DR_FAWZIA_SLUG;

              return (
                <button
                  key={t.slug}
                  onClick={() => handleSelectTherapist(t)}
                  className={`flex items-start gap-4 rounded-2xl border-2 p-5 text-left transition-all ${
                    isSelected ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                    {t.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 truncate">{t.name}</p>
                      {isFounder && (
                        <span className="shrink-0 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">Founder</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{t.role}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      {userDiscount ? (
                        <>
                          <span className="text-sm text-slate-400 line-through">{privatePrice.toLocaleString()}</span>
                          <span className="text-lg font-bold text-indigo-600">{discountedPrice.toLocaleString()}</span>
                          <span className="text-xs text-slate-500">AED</span>
                          <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">-{userDiscount.discountPercent}%</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-slate-900">{privatePrice.toLocaleString()}</span>
                          <span className="text-xs text-slate-500">AED</span>
                        </>
                      )}
                      <span className="text-xs text-slate-400">{isArabic ? 'برنامج كامل' : 'full program'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2.5: Schedule Selection */}
      {step === 'schedule' && (
        <ScheduleStep
          onSelect={handleSelectSchedule}
          onBack={handleBack}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          therapistId={selectedTherapist?.id}
          therapistName={selectedTherapist?.name}
        />
      )}

      {/* STEP 3: Payment Options */}
      {step === 'payment' && selectedProgramType && (
        <div className="space-y-4">
          {!academyMode && (
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">{isArabic ? 'العودة' : 'Back'}</span>
            </button>
          )}

          {/* Selection summary */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                {selectedProgramType === 'private' ? <User className="w-5 h-5 text-indigo-600" /> : <Users className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">
                  {selectedProgramType === 'private' ? (isArabic ? 'برنامج فردي' : 'Private Program') : (isArabic ? 'البرنامج الجماعي' : 'Group Program')}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedTherapist ? selectedTherapist.name : (academyMode ? 'Academy' : isArabic ? '10 جلسات' : '10 sessions')}
                  {userDiscount && <span className="ml-2 text-emerald-600 font-semibold">-{userDiscount.discountPercent}% discount</span>}
                </p>
              </div>
              {selectedDate && selectedTime && (
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-indigo-200">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium text-slate-700">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', { month: 'short', day: 'numeric' })}
                    {' · '}
                    {(() => {
                      const [h, m] = selectedTime.split(':').map(Number);
                      const suffix = h >= 12 ? 'PM' : 'AM';
                      return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${suffix}`;
                    })()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Payment */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 md:p-8 flex flex-col transition-all hover:border-indigo-200">
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider w-fit">
                {isArabic ? 'أفضل قيمة' : 'Best Value'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">{isArabic ? 'الدفع الكامل' : 'Full Payment'}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                {academyMode
                  ? (isArabic ? 'ادفع قيمة جميع جلسات الأكاديمية الخمس مقدمًا.' : 'Pay for all 5 Academy sessions upfront.')
                  : (isArabic ? 'ادفع مقابل جميع الجلسات العشر مقدماً ووفر.' : 'Pay for all 10 sessions upfront and save.')}
              </p>
              <div className="mb-6">
                <PriceTag type={selectedProgramType} option="full" />
                <p className="text-slate-500 text-sm mt-1">
                  {academyMode
                    ? `5 sessions · ${Math.round(getPriceForDisplay(selectedProgramType, 'full', selectedTherapist) / (userDiscount ? (1 - userDiscount.discountPercent / 100) : 1) / 5)} AED / session`
                    : `${isArabic ? '10 جلسات' : '10 sessions'} · ${getPerSessionFromFull(getPriceForDisplay(selectedProgramType, 'full', selectedTherapist))} AED / session`}
                </p>
              </div>
              <button onClick={() => handlePayment('full')} disabled={processing}
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> {isArabic ? 'جارٍ المعالجة...' : 'Processing...'}</> : <><CreditCard className="w-4 h-4" /> {isArabic ? 'المتابعة إلى الدفع' : 'Proceed to Payment'}</>}
              </button>
            </div>

            {/* Per Session */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 md:p-8 flex flex-col transition-all hover:border-indigo-200">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider w-fit">
                {isArabic ? 'مرونة' : 'Flexible'}
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-3 mb-2">{isArabic ? 'الدفع لكل جلسة' : 'Pay Session by Session'}</h3>
              <p className="text-slate-500 text-sm mb-6 flex-1">
                {academyMode
                  ? (isArabic ? 'ادفع 5000 درهم لكل جلسة أكاديمية.' : 'Pay 5,000 AED per Academy session.')
                  : (isArabic ? 'ادفع لكل جلسة بشكل منفصل. مرونة للاستمرار حسب وتيرتك.' : 'Pay for each session individually. Flexibility to continue at your own pace.')}
              </p>
              <div className="mb-6">
                <PriceTag type={selectedProgramType} option="per_session" />
                <p className="text-slate-500 text-sm mt-1">{isArabic ? 'لكل جلسة' : 'per session'}</p>
              </div>
              <button onClick={() => handlePayment('per_session')} disabled={processing}
                className="w-full py-3.5 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-50 disabled:border-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> {isArabic ? 'جارٍ المعالجة...' : 'Processing...'}</> : <><CreditCard className="w-4 h-4" /> {isArabic ? 'المتابعة إلى الدفع' : 'Proceed to Payment'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: Account Prompt (unauthenticated users - first step) */}
      {step === 'account_prompt' && (
        <div className={`space-y-6 ${isArabic ? 'text-right' : ''}`}>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <User className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {isArabic ? 'هل لديك حساب بالفعل؟' : 'Already Have an Account?'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {isArabic 
                ? 'سجّل الدخول للمتابعة إلى الدفع بشكل أسرع.'
                : 'Sign in to proceed to checkout faster.'}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  const returnUrl = encodeURIComponent('/booking/paid-program-booking');
                  router.push(`/auth/login?next=${returnUrl}`);
                }}
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
              >
                {isArabic ? 'نعم، سجّل الدخول' : 'Yes, Sign In'}
              </button>
              <button
                onClick={() => setStep('signup_form')}
                className="w-full py-3.5 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-slate-50 hover:border-slate-300"
              >
                {isArabic ? 'لا، أنشئ حساباً جديداً' : 'No, Create New Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP: Signup Form (unauthenticated users - create account first) */}
      {step === 'signup_form' && (
        <div className={`space-y-6 ${isArabic ? 'text-right' : ''}`}>
          <button onClick={() => setStep('account_prompt')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{isArabic ? 'العودة' : 'Back'}</span>
          </button>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <User className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {isArabic ? 'إنشاء حساب جديد' : 'Create Your Account'}
              </h3>
              <p className="text-slate-500 text-sm">
                {isArabic ? 'أدخل بياناتك للمتابعة' : 'Enter your details to continue'}
              </p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm mb-4">{formError}</div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setFormError('');
              if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.password) {
                setFormError(isArabic ? 'يرجى تعبئة جميع الحقول' : 'Please fill in all fields');
                return;
              }
              if (formData.password.length < 8) {
                setFormError(isArabic ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
                return;
              }
              setProcessing(true);
              try {
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
                if (!signupRes.ok && signupRes.status !== 409) {
                  throw new Error(signupData.error || 'Failed to create account');
                }
                if (signupData.session?.access_token) {
                  await supabase.auth.setSession({
                    access_token: signupData.session.access_token,
                    refresh_token: signupData.session.refresh_token || '',
                  });
                }
                setLocallyAuthenticated(true);
                setStep('program_type');
              } catch (err: any) {
                setFormError(err.message || 'Something went wrong');
              } finally {
                setProcessing(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'الاسم الكامل *' : 'Full Name *'}</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder={isArabic ? 'اسمك الكامل' : 'Your full name'} required autoComplete="name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'البريد الإلكتروني *' : 'Email *'}</label>
                <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="your@email.com" required autoComplete="email" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'رقم الهاتف *' : 'Phone *'}</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="+971 50 000 0000" required autoComplete="tel" inputMode="tel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'الدولة *' : 'Country *'}</label>
                  <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder={isArabic ? 'الإمارات' : 'UAE'} required autoComplete="country-name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'إنشاء كلمة المرور *' : 'Create Password *'}</label>
                <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder={isArabic ? '8 أحرف على الأقل' : 'At least 8 characters'} required minLength={8} />
              </div>
              <button type="submit" disabled={processing || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password}
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed mt-2">
                {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> {isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating Account...'}</> : <><CheckCircle className="w-4 h-4" /> {isArabic ? 'إنشاء حساب والمتابعة' : 'Create Account & Continue'}</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP: Details (unauthenticated users - create account after payment selection) */}
      {step === 'details' && selectedProgramType && pendingPaymentOption && (
        <div className={`space-y-6 ${isArabic ? 'text-right' : ''}`}>
          <button onClick={handleBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{isArabic ? 'العودة' : 'Back'}</span>
          </button>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  {selectedProgramType === 'private' ? <User className="w-5 h-5 text-indigo-600" /> : <Users className="w-5 h-5 text-indigo-600" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedProgramType === 'private' ? (isArabic ? 'برنامج فردي' : 'Private Program') : (isArabic ? 'البرنامج الجماعي' : 'Group Program')}
                    {selectedTherapist && ` — ${selectedTherapist.name}`}
                  </p>
                  <p className="text-sm text-slate-500">
                    {pendingPaymentOption === 'full' ? (isArabic ? 'دفع كامل' : 'Full payment') : (isArabic ? 'لكل جلسة' : 'Per session')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                {userDiscount ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400 line-through">
                      {getPriceForDisplay(selectedProgramType, pendingPaymentOption, selectedTherapist).toLocaleString()} AED
                    </span>
                    <span className="text-xl font-bold text-indigo-600">
                      {applyClientDiscount(getPriceForDisplay(selectedProgramType, pendingPaymentOption, selectedTherapist), userDiscount.discountPercent).toLocaleString()} AED
                    </span>
                  </div>
                ) : (
                  <p className="text-xl font-bold text-slate-900">
                    {getPriceForDisplay(selectedProgramType, pendingPaymentOption, selectedTherapist).toLocaleString()} AED
                  </p>
                )}
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{formError}</div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault();
            setFormError('');
            if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.password) {
              setFormError(isArabic ? 'يرجى تعبئة جميع الحقول' : 'Please fill in all fields');
              return;
            }
            if (formData.password.length < 8) {
              setFormError(isArabic ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters');
              return;
            }
            setProcessing(true);
            try {
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
              if (!signupRes.ok && signupRes.status !== 409) {
                throw new Error(signupData.error || 'Failed to create account');
              }
              if (signupData.session?.access_token) {
                await supabase.auth.setSession({
                  access_token: signupData.session.access_token,
                  refresh_token: signupData.session.refresh_token || '',
                });
              }
              setSelectedPaymentOption(pendingPaymentOption);
              await redirectToZiinaCheckout({
                programType: academyMode ? 'academy' : selectedProgramType!,
                paymentOption: pendingPaymentOption,
                therapistName: selectedTherapist?.name,
                therapistSlug: selectedTherapist?.slug,
                preferredDate: selectedDate || undefined,
                preferredTime: selectedTime || undefined,
              });
            } catch (err: any) {
              setFormError(err.message || 'Something went wrong');
            } finally {
              setProcessing(false);
            }
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'الاسم الكامل *' : 'Full Name *'}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder={isArabic ? 'اسمك الكامل' : 'Your full name'} required autoComplete="name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'البريد الإلكتروني *' : 'Email *'}</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="your@email.com" required autoComplete="email" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'رقم الهاتف *' : 'Phone *'}</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="+971 50 000 0000" required autoComplete="tel" inputMode="tel" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'الدولة *' : 'Country *'}</label>
                <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder={isArabic ? 'الإمارات' : 'UAE'} required autoComplete="country-name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{isArabic ? 'إنشاء كلمة المرور *' : 'Create Password *'}</label>
              <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder={isArabic ? '8 أحرف على الأقل' : 'At least 8 characters'} required minLength={8} />
            </div>
            <button type="submit" disabled={processing || !formData.name || !formData.email || !formData.phone || !formData.country || !formData.password}
              className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed">
              {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> {isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating Account...'}</> : <><CreditCard className="w-4 h-4" /> {isArabic ? 'إنشاء حساب والمتابعة للدفع' : 'Create Account & Proceed to Payment'}</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
