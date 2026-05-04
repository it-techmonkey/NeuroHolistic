'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import HeroCalendar from './HeroCalendar';
import { useLang } from '@/lib/translations/LanguageContext';

type Therapist = {
  id: string;
  name: string;
};

type Slot = {
  time: string;
  display: string;
};

function normalizeTherapistName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(dr|doctor)\s+/i, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ');
}

interface FreeConsultationFormProps {
  /** Render mode: 'page' wraps in a full-page dark layout, 'embedded' renders form only */
  mode?: 'page' | 'embedded';
}

export default function FreeConsultationForm({ mode = 'embedded' }: FreeConsultationFormProps) {
  const { t, isUrdu } = useLang();
  const isArabic = isUrdu;
  const [step, setStep] = useState<'details' | 'schedule' | 'success'>('details');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Logged-in user state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });
  const [signupSession, setSignupSession] = useState<{ access_token?: string; refresh_token?: string } | null>(null);

  // Check if user is already logged in and load their profile
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          setIsLoggedIn(true);

          // Load user profile
          const { data: profile } = await supabase
            .from('users')
            .select('full_name, email, phone, country')
            .eq('id', user.id)
            .single();

          if (profile) {
            setFormData({
              name: profile.full_name || user.user_metadata?.first_name + ' ' + (user.user_metadata?.last_name || '') || '',
              email: profile.email || user.email || '',
              phone: profile.phone || user.user_metadata?.phone || '',
              country: profile.country || user.user_metadata?.country || '',
              password: '',
            });
          } else {
            setFormData({
              name: (user.user_metadata?.first_name || '') + ' ' + (user.user_metadata?.last_name || ''),
              email: user.email || '',
              phone: user.user_metadata?.phone || '',
              country: user.user_metadata?.country || '',
              password: '',
            });
          }

          // Skip directly to schedule step
          setStep('schedule');
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Load therapists on mount
  useEffect(() => {
    if (therapists.length === 0) {
      fetch('/api/therapist/list')
        .then(res => res.json())
        .then(data => {
          const list = (data.therapists || []).filter((t: Therapist) =>
            !t.name.toLowerCase().includes('admin')
          );
          const seen = new Set<string>();
          const unique = list.filter((t: Therapist) => {
            const key = normalizeTherapistName(t.name);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          setTherapists(unique);
          if (unique.length > 0) setSelectedTherapist(unique[0].id);
        })
        .catch(err => {
          console.error('Failed to load therapists:', err);
          setTherapists([]);
        });
    }
  }, [therapists.length]);

  // Load slots when therapist and date change
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setError('');

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    fetch(`/api/bookings/availability?therapistId=${encodeURIComponent(selectedTherapist)}&date=${encodeURIComponent(dateStr)}`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || []);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        setError(isArabic ? 'فشل تحميل المواعيد المتاحة' : 'Failed to load time slots');
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedTherapist, selectedDate]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError(t.consultationForm.pleaseFillAll);
      return;
    }
    if (formData.password.length < 8) {
      setError(t.consultationForm.passwordMin8);
      return;
    }
    setError('');
    setStep('schedule');
  };

  const handleBooking = async () => {
    if (!selectedTherapist || !selectedDate || !selectedSlot) {
      setError(isArabic ? 'يرجى اختيار المعالج والتاريخ والوقت' : 'Please select a therapist, date, and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Only sign up if user is not already logged in
      if (!isLoggedIn) {
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
          throw new Error(signupData.error || t.consultationForm.accountCreatedFailed);
        }

        if (signupData.session) {
          setSignupSession(signupData.session);
        }
      }

      const therapist = therapists.find(t => t.id === selectedTherapist);
      const bookYear = selectedDate.getFullYear();
      const bookMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const bookDay = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${bookYear}-${bookMonth}-${bookDay}`;

      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: isLoggedIn ? userId : null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country || '',
          therapistId: selectedTherapist,
          therapistName: therapist?.name || (isArabic ? 'المعالج' : 'Therapist'),
          date: dateStr,
          time: selectedSlot,
          type: 'free_consultation',
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || t.consultationForm.bookingFailed);

      setStep('success');
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || t.consultationForm.somethingWrong);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      if (isLoggedIn) {
        // Already logged in, just navigate
        window.location.href = '/dashboard/client';
        return;
      }

      if (signupSession?.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: signupSession.access_token,
          refresh_token: signupSession.refresh_token || '',
        });

        if (!sessionError) {
          window.location.href = '/dashboard/client';
          return;
        }
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError(t.consultationForm.signInFailed);
        return;
      }

      window.location.href = '/dashboard/client';
    } catch (err: any) {
      setError(t.consultationForm.signInFailed);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all';

  // Show loading while checking auth
  if (authLoading) {
    const loadingContent = (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/60 text-sm">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
      </div>
    );

    if (mode === 'page') {
      return (
      <div className="min-h-screen bg-[#0B1028] pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-lg mx-auto">{loadingContent}</div>
        </div>
      );
    }
    return <div className="p-6">{loadingContent}</div>;
  }

  const formContent = (
    <>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          {step === 'success' ? t.consultationForm.bookingConfirmed : t.consultationForm.bookFreeConsultation}
        </h2>
        <p className="text-sm text-white/60 mt-1">
          {step === 'details' && t.consultationForm.enterDetails}
          {step === 'schedule' && (isLoggedIn
            ? (isArabic ? 'اختر التاريخ والوقت المناسبين لك' : 'Select your preferred date and time')
            : t.consultationForm.selectDateTime
          )}
          {step === 'success' && t.consultationForm.consultationBooked}
        </p>
        {isLoggedIn && step === 'schedule' && (
          <p className="text-xs text-indigo-300 mt-2">
            {isArabic ? 'الحجز باسم' : 'Booking as'} {formData.name} ({formData.email})
          </p>
        )}
      </div>

      {/* Progress indicator */}
      {step !== 'success' && (
        <div className="flex gap-2 mb-6">
          {!isLoggedIn && (
            <div className={`h-1 flex-1 rounded ${step === 'details' ? 'bg-indigo-400' : 'bg-white/20'}`} />
          )}
          <div className={`h-1 flex-1 rounded ${step === 'schedule' ? 'bg-indigo-400' : 'bg-white/20'}`} />
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-200 p-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <form onSubmit={handleDetailsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">{t.consultationForm.fullName}</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">{t.consultationForm.email}</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">{t.consultationForm.phone}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">{t.consultationForm.country}</label>
              <input
                type="text"
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">{t.consultationForm.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className={inputClass + (isUrdu ? ' pr-10' : ' pl-10')}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors ${isUrdu ? 'right-3' : 'left-3'}`}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-[10px] text-white/40 mt-1">{t.consultationForm.useForDashboard}</p>
          </div>

          <button
            type="submit"
            disabled={!formData.name || !formData.email || !formData.phone || !formData.password}
            className={`w-full py-3 rounded-lg font-medium transition-all mt-2 ${
              formData.name && formData.email && formData.phone && formData.password
                ? 'bg-white text-[#0B0F2B] hover:bg-white/90'
                : 'bg-white/20 text-white/40 cursor-not-allowed'
            }`}
          >
            {t.consultationForm.continueToSchedule}
          </button>
        </form>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="space-y-4">
          {/* Therapist Selection */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">{t.consultationForm.selectTherapist}</label>
            <div className="grid grid-cols-2 gap-2">
              {therapists.map(therapist => (
                <button
                  key={therapist.id}
                  type="button"
                  onClick={() => {
                    setSelectedTherapist(therapist.id);
                    setSelectedSlot('');
                  }}
                  className={`p-2.5 border rounded-lg text-right transition-all ${
                    selectedTherapist === therapist.id
                      ? 'border-indigo-400 bg-indigo-400/10'
                      : 'border-white/20 hover:border-white/30'
                  }`}
                >
                  <span className="font-medium text-white text-xs block truncate">{therapist.name}</span>
                  <span className="block text-[10px] text-white/50 mt-0.5">{t.consultationForm.specialist}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection - Custom Calendar */}
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">{t.consultationForm.selectDate}</label>
            <HeroCalendar
              selectedDate={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setSelectedSlot('');
              }}
              minDate={new Date()}
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-xs font-medium text-white/70 mb-2">
                {t.consultationForm.selectTime}
              </label>
              {slotsLoading ? (
                <div className="text-center py-4 text-white/60 text-sm">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto mb-2"></div>
                  {t.consultationForm.loadingTimes}
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-4 text-amber-300 bg-amber-500/10 rounded-lg text-sm">
                  {t.consultationForm.noSlots}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border transition-all ${
                        selectedSlot === slot.time
                          ? 'border-indigo-400 bg-indigo-500 text-white'
                          : 'border-green-400/30 bg-green-500/10 text-green-200 hover:border-indigo-400/50 hover:bg-indigo-500/20'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
              {selectedSlot && (
                <p className="mt-2 text-xs text-green-400 font-medium">
                  {t.consultationForm.selected} {slots.find(s => s.time === selectedSlot)?.display}
                </p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-2 pt-2">
            {!isLoggedIn && (
              <button
                onClick={() => setStep('details')}
                className="flex-1 py-2.5 border border-white/20 rounded-lg font-medium text-white/70 hover:bg-white/10 transition text-sm"
              >
                {t.consultationForm.back}
              </button>
            )}
            <button
              onClick={handleBooking}
              disabled={!selectedTherapist || !selectedDate || !selectedSlot || loading}
              className={`${isLoggedIn ? 'w-full' : 'flex-1'} py-2.5 rounded-lg font-medium transition text-sm ${
                selectedTherapist && selectedDate && selectedSlot && !loading
                  ? 'bg-white text-[#0B0F2B] hover:bg-white/90'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B0F2B]"></div>
                  {t.consultationForm.creatingAccount}
                </span>
              ) : (
                t.consultationForm.bookConsultation
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{t.consultationForm.consultationBookedSuccess}</h3>
            <p className="text-white/60 mt-1">
              {selectedDate && formatDate(selectedDate)}
            </p>
            <p className="text-white/60">
              {slots.find(s => s.time === selectedSlot)?.display}
            </p>
            <p className="text-white/60 mt-1">
              {therapists.find(t => t.id === selectedTherapist)?.name}
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleGoToDashboard}
              disabled={loading}
              className="w-full py-3 bg-white text-[#0B0F2B] rounded-lg font-medium hover:bg-white/90 transition disabled:opacity-50"
            >
              {loading
                ? t.consultationForm.signingIn
                : isLoggedIn
                ? (isArabic ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard')
                : t.consultationForm.goToDashboard
              }
            </button>

            <p className="text-xs text-white/40">
              {formData.email}
            </p>
          </div>
        </div>
      )}
    </>
  );

  if (mode === 'page') {
    return (
      <div className="min-h-screen bg-[#0B1028] pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto">
          {formContent}
        </div>
      </div>
    );
  }

  return <div className="p-6">{formContent}</div>;
}
