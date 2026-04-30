'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useLang } from '@/lib/translations/LanguageContext';

type Therapist = {
  id: string;
  name: string;
  role?: string;
};

type Slot = {
  time: string;
  display: string;
};

function ScheduleSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const { isArabic } = useLang();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [schedulingError, setSchedulingError] = useState('');
  const [schedulingSuccess, setSchedulingSuccess] = useState(false);
  const [needsConsultFirst, setNeedsConsultFirst] = useState(false);

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

  const buildCalendarDays = (month: Date) => {
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startOffset = firstDay.getDay();
    const totalCells = 42; // 6 weeks
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

  const todayValue = toDateValue(new Date());
  const calendarDays = buildCalendarDays(calendarMonth);

  const handleSelectCalendarDay = (date: Date) => {
    const value = toDateValue(date);
    if (value < todayValue) return;
    setSelectedDate(value);
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

  // 1. Check Auth & Load Program/Session
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?next=/booking/schedule-session');
        return;
      }
      setUser(user);

      // Load user's program
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

      const dashRes = await fetch('/api/client/dashboard');
      let completedFreeConsult = false;
      if (dashRes.ok) {
        const dash = await dashRes.json();
        completedFreeConsult = !!dash.hasCompletedFreeConsult;
      }

      if (loadedProgram && !completedFreeConsult) {
        setNeedsConsultFirst(true);
      } else {
        setProgram(loadedProgram);
        setSession(loadedSession);
      }

      // Load therapists and assigned therapist in parallel
      let therapistList: Therapist[] = [];
      let assignedTherapistId: string | null = null;

      try {
        const [therapistsRes, assignedTherapistRes] = await Promise.all([
          fetch('/api/therapist/list'),
          fetch('/api/client/assigned-therapist'),
        ]);

        if (therapistsRes.ok) {
          const data = await therapistsRes.json();
          therapistList = data.therapists || [];
          setTherapists(therapistList);
        }

        if (assignedTherapistRes.ok) {
          const therapistData = await assignedTherapistRes.json();
          if (therapistData.therapist) {
            assignedTherapistId = therapistData.therapist.slug || therapistData.therapist.id;
          }
        }
      } catch (err) {
        console.error('Failed to load therapists:', err);
      }

      // Set the selected therapist using the fetched list directly
      if (assignedTherapistId) {
        setSelectedTherapist(assignedTherapistId);
      } else if (therapistList.length > 0) {
        setSelectedTherapist(therapistList[0].id);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  // 2. Load Availability when therapist or date changes
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchAvailability() {
      setSlotsLoading(true);
      setSchedulingError('');
      try {
        const res = await fetch(`/api/bookings/availability?therapistId=${selectedTherapist}&date=${selectedDate}`);
        if (!res.ok) throw new Error(isArabic ? 'فشل تحميل المواعيد' : 'Failed to load slots');
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error(err);
        setSchedulingError(isArabic ? 'تعذر تحميل الأوقات المتاحة.' : 'Could not load availability.');
      } finally {
        setSlotsLoading(false);
      }
    }

    fetchAvailability();
  }, [selectedTherapist, selectedDate]);

  const handleSchedule = async () => {
    if (!user || !selectedTherapist || !selectedDate || !selectedSlot) return;

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
          therapistId: selectedTherapist,
          therapistName: therapists.find(t => t.id === selectedTherapist)?.name,
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

  if (needsConsultFirst) {
    return (
      <div dir={isArabic ? 'rtl' : 'ltr'} className="min-h-screen bg-slate-50 pt-28 sm:pt-32 md:pt-40 px-4 sm:px-6 lg:px-8 pb-16 flex flex-col items-center justify-center">
        <div className={`max-w-lg mx-auto space-y-4 ${isArabic ? 'text-right' : 'text-center'}`}>
          <h1 className="text-2xl font-light text-slate-900">{isArabic ? 'أكمل الاستشارة المجانية أولاً' : 'Complete your free consultation first'}</h1>
          <p className="text-slate-600 leading-relaxed">
            {isArabic
              ? 'تُفتح جلسات البرنامج بعد إكمال الاستشارة المجانية. احجز أو أكمل الاستشارة ثم عُد هنا للجدولة.'
              : 'Program sessions unlock after your free consultation is completed. Book or finish your consultation, then return here to schedule.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link
              href="/consultation/book"
              className="inline-flex justify-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
            >
              {isArabic ? 'احجز استشارة مجانية' : 'Book free consultation'}
            </Link>
            <Link
              href="/dashboard/client"
              className="inline-flex justify-center px-6 py-3 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50"
            >
              {isArabic ? 'العودة إلى لوحة التحكم' : 'Back to dashboard'}
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

          {/* Therapist Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{isArabic ? 'اختر المعالج' : 'Select Therapist'}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {therapists.map(therapist => (
                <button
                  key={therapist.id}
                  onClick={() => setSelectedTherapist(therapist.id)}
                  className={`p-4 border rounded-lg transition-all relative ${isArabic ? 'text-right' : 'text-left'} ${
                    selectedTherapist === therapist.id
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {therapist.role === 'Founder & Lead Practitioner' && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full">
                      {isArabic ? 'المؤسسة' : 'Founder'}
                    </span>
                  )}
                  <div className="font-medium text-slate-900">{therapist.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {therapist.role || (isArabic ? 'أخصائي NeuroHolistic' : 'NeuroHolistic Specialist')}
                  </div>
                </button>
              ))}
            </div>
          </div>

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
                  const isSelected = selectedDate === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSelectCalendarDay(date)}
                      disabled={isPast}
                      className={`h-10 rounded-md text-sm border transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : isPast
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Time Slots */}
          {(selectedDate && selectedTherapist) && (
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
