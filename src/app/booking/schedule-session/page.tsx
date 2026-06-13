'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useLang } from '@/lib/translations/LanguageContext';

type Slot = {
  time: string;
  display: string;
};

function ScheduleSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isArabic } = useLang();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const [therapistId, setTherapistId] = useState<string>('');
  const [therapistName, setTherapistName] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());

  const [schedulingError, setSchedulingError] = useState('');
  const [schedulingSuccess, setSchedulingSuccess] = useState(false);

  const weekdayLabels = isArabic
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getMonthLabel = (date: Date) =>
    date.toLocaleDateString(isArabic ? 'ar' : 'en-US', { month: 'long', year: 'numeric' });

  const toDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayValue = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dubai',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  };

  const todayValue = getTodayValue();

  const buildCalendarDays = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startOffset = firstDay.getDay();
    const totalCells = 42;
    const cells: Array<Date | null> = [];

    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(month.getFullYear(), month.getMonth(), day));
    }
    while (cells.length < totalCells) {
      cells.push(null);
    }
    return cells;
  };

  const calendarDays = buildCalendarDays(calendarMonth);

  const handleSelectCalendarDay = (date: Date) => {
    const value = toDateValue(date);
    if (value < todayValue) return;
    if (blockedDates.has(value)) return;
    setSelectedDate(value);
    setSelectedSlot('');
  };

  const goToPreviousMonth = () => {
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const prev = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1);
    if (prev < currentMonthStart) return;
    setCalendarMonth(prev);
  };

  const goToNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1));
  };

  // 1. Check Auth & Load Program/Session + Auto-select Therapist
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?next=/booking/schedule-session');
        return;
      }
      setUser(user);

      const programRes = await fetch('/api/users/check-program');
      let loadedProgram: any = null;
      let loadedSession: any = null;
      if (programRes.ok) {
        const data = await programRes.json();
        if (data.program) {
          loadedProgram = data.program;
          loadedSession = data.firstPendingSession;
        }
      }

      setProgram(loadedProgram);
      setSession(loadedSession);

      // Auto-select therapist from program or assigned therapist
      let resolvedTherapistId = loadedProgram?.therapist_user_id || null;
      let resolvedTherapistName = loadedProgram?.therapist_name || '';

      if (!resolvedTherapistId) {
        try {
          const assignedRes = await fetch('/api/client/assigned-therapist');
          if (assignedRes.ok) {
            const assignedData = await assignedRes.json();
            if (assignedData.therapist) {
              resolvedTherapistId = assignedData.therapist.id || assignedData.therapist.slug;
              resolvedTherapistName = assignedData.therapist.name || resolvedTherapistName;
            }
          }
        } catch {}
      }

      if (resolvedTherapistId) {
        setTherapistId(resolvedTherapistId);
        setTherapistName(resolvedTherapistName);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  // 2. Fetch blocked dates when therapist is known
  useEffect(() => {
    if (!therapistId) return;

    async function fetchBlockedDates() {
      try {
        const res = await fetch(`/api/bookings/blocked-dates?therapistId=${therapistId}`);
        if (res.ok) {
          const data = await res.json();
          setBlockedDates(new Set(data.blockedDates || []));
        }
      } catch {}
    }
    fetchBlockedDates();
  }, [therapistId]);

  // 3. Load Availability when date changes
  useEffect(() => {
    if (!therapistId || !selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchAvailability() {
      setSlotsLoading(true);
      setSchedulingError('');
      try {
        const res = await fetch(`/api/bookings/availability?therapistId=${therapistId}&date=${selectedDate}`);
        if (!res.ok) throw new Error(isArabic ? 'فشل تحميل المواعيد' : 'Failed to load slots');
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        setSchedulingError(isArabic ? 'تعذر تحميل الأوقات المتاحة.' : 'Could not load availability.');
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchAvailability();
  }, [therapistId, selectedDate]);

  const handleSchedule = async () => {
    if (!user || !therapistId || !selectedDate || !selectedSlot) return;

    setLoading(true);
    setSchedulingError('');

    try {
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.user_metadata?.full_name || `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || user.email,
          email: user.email,
          phone: user.phone || user.user_metadata?.phone || '',
          country: user.user_metadata?.country || '',
          therapistId: therapistId,
          therapistName: therapistName,
          date: selectedDate,
          time: selectedSlot,
          type: 'program',
          programId: program?.id,
          sessionId: session?.id,
          sessionNumber: session?.session_number || 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isArabic ? 'فشل جدولة الجلسة' : 'Scheduling failed'));

      setSchedulingSuccess(true);
    } catch (err: any) {
      setSchedulingError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-white flex items-center justify-center">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</div>;
  }

  if (!program) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 pt-28 sm:pt-32 md:pt-40 px-4 sm:px-6 lg:px-8 pb-16 flex flex-col items-center justify-center">
        <div className={`max-w-lg mx-auto space-y-4 ${isArabic ? 'text-right' : 'text-center'}`}>
          <h1 className="text-2xl font-light text-slate-900">{isArabic ? 'لا يوجد برنامج نشط' : 'No Active Program'}</h1>
          <p className="text-slate-600 leading-relaxed">
            {isArabic ? 'يجب شراء برنامج أولاً قبل جدولة الجلسات.' : 'You need to purchase a program before scheduling sessions.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/booking/paid-program-booking"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              {isArabic ? 'شراء برنامج' : 'Purchase Program'}
            </Link>
            <Link
              href="/dashboard/client"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (schedulingSuccess) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className={`min-h-screen bg-white flex flex-col items-center justify-center p-6 ${isArabic ? 'text-right' : 'text-center'}`}>
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-light text-slate-900 mb-4">{isArabic ? 'تمت جدولة الجلسة' : 'Session Scheduled'}</h1>
        <p className="text-slate-500 max-w-md mb-8">
          {isArabic
            ? 'تمت جدولة جلستك. ستتلقى رسالة تأكيد عبر البريد الإلكتروني تتضمن رابط Google Meet.'
            : 'Your session has been scheduled. You will receive a confirmation email with the Google Meet link.'}
        </p>
        <Link
          href="/dashboard/client"
          className="px-8 py-3 bg-[#2B2F55] text-white rounded-lg font-medium hover:bg-[#1E2140] transition-colors"
        >
          {isArabic ? 'اذهب إلى لوحة التحكم' : 'Go to Dashboard'}
        </Link>
      </div>
    );
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className={`mb-10 ${isArabic ? 'text-right' : 'text-center'}`}>
          <h1 className="text-3xl font-light text-slate-900">{isArabic ? 'جدولة جلستك' : 'Schedule Your Session'}</h1>
          <p className="mt-2 text-slate-600">
            {session
              ? (isArabic ? `الجلسة ${session.session_number}` : `Session ${session.session_number}`)
              : (isArabic ? 'جلستك الأولى' : 'Your first session')} — {isArabic ? 'اختر التاريخ والوقت.' : 'Select a date and time.'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          {schedulingError && (
            <div className="bg-red-50 text-red-700 p-4 rounded text-sm mb-4">
              {schedulingError}
            </div>
          )}

          {/* Therapist Info — read-only, auto-selected from program */}
          {therapistName && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">{isArabic ? 'معالجك' : 'Your Therapist'}</p>
                  <p className="text-slate-900 font-semibold">{therapistName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{isArabic ? 'اختر التاريخ' : 'Select Date'}</label>
            <div className="mt-1 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={goToPreviousMonth}
                  disabled={
                    new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1) <=
                    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:border-indigo-300 disabled:text-slate-300 disabled:border-slate-100 disabled:cursor-not-allowed"
                >
                  {isArabic ? 'السابق' : 'Prev'}
                </button>
                <div className="text-sm font-medium text-slate-800">{getMonthLabel(calendarMonth)}</div>
                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="px-3 py-1.5 text-sm border border-slate-200 rounded-md text-slate-700 hover:border-indigo-300"
                >
                  {isArabic ? 'التالي' : 'Next'}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekdayLabels.map((label) => (
                  <div key={label} className="text-xs font-medium text-slate-500 text-center py-1">
                    {label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={`blank-${index}`} className="h-10" />;
                  }

                  const value = toDateValue(date);
                  const isPast = value < todayValue;
                  const isBlocked = blockedDates.has(value);
                  const isSelected = selectedDate === value;
                  const isDisabled = isPast || isBlocked;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectCalendarDay(date)}
                      disabled={isDisabled}
                      title={isBlocked ? (isArabic ? 'هذا التاريخ محجوز' : 'This date is blocked') : undefined}
                      className={`h-10 rounded-md text-sm border transition-colors relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isDisabled
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {date.getDate()}
                      {isBlocked && !isPast && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{isArabic ? 'اختر الوقت' : 'Select Time'}</label>
              {slotsLoading ? (
                <div className="text-slate-400 text-sm">{isArabic ? 'جارٍ تحميل الأوقات المتاحة...' : 'Loading availability...'}</div>
              ) : slots.length === 0 ? (
                <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded">
                  {isArabic ? 'لا توجد أوقات متاحة لهذا التاريخ. يرجى تجربة يوم آخر.' : 'No slots available for this date. Please try another day.'}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2 px-3 text-sm rounded border transition-colors ${
                        selectedSlot === slot.time
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action */}
          <div className={`pt-6 border-t border-slate-100 flex ${isArabic ? 'justify-start' : 'justify-end'}`}>
            <button
              onClick={handleSchedule}
              disabled={!selectedSlot || loading}
              className={`px-8 py-3 rounded-lg text-white font-medium shadow-sm transition-all ${
                !selectedSlot || loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? (isArabic ? 'جارٍ الجدولة...' : 'Scheduling...') : (isArabic ? 'تأكيد الجلسة' : 'Confirm Session')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScheduleSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ScheduleSessionContent />
    </Suspense>
  );
}
