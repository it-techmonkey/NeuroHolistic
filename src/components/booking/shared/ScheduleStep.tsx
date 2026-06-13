'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarDays, Clock, ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { useLang } from '@/lib/translations/LanguageContext';

interface ScheduleStepProps {
  onSelect: (date: string, time: string) => void;
  onBack: () => void;
  selectedDate?: string;
  selectedTime?: string;
  therapistId?: string;
  therapistName?: string;
}

type Slot = { time: string; display: string };

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_AR = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dateToStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${suffix}`;
}

export default function ScheduleStep({
  onSelect,
  onBack,
  selectedDate,
  selectedTime,
  therapistId,
  therapistName,
}: ScheduleStepProps) {
  const { isArabic } = useLang();
  const today = useMemo(() => stripTime(new Date()), []);

  const [viewMonth, setViewMonth] = useState(
    selectedDate
      ? new Date(selectedDate + 'T00:00:00')
      : new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [pickedDate, setPickedDate] = useState<Date | null>(
    selectedDate ? new Date(selectedDate + 'T00:00:00') : null
  );
  const [pickedTime, setPickedTime] = useState<string>(selectedTime || '');

  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ date: Date; inMonth: boolean } | null> = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
    return cells;
  }, [year, month]);

  const canGoPrev = useMemo(() => {
    const prevMonthEnd = new Date(year, month, 0);
    return prevMonthEnd >= today;
  }, [year, month, today]);

  const goToPrev = useCallback(() => {
    if (canGoPrev) setViewMonth(new Date(year, month - 1, 1));
  }, [canGoPrev, year, month]);

  const goToNext = useCallback(() => {
    setViewMonth(new Date(year, month + 1, 1));
  }, [year, month]);

  const monthLabel = isArabic
    ? `${MONTHS_AR[month]} ${year}`
    : `${MONTHS[month]} ${year}`;

  const dayLabels = isArabic ? DAYS_AR : DAYS;

  // Fetch available slots when date or therapist changes
  useEffect(() => {
    if (!pickedDate || !therapistId) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setSlotsError('');
    setPickedTime('');

    const dateStr = dateToStr(pickedDate);

    fetch(`/api/bookings/availability?therapistId=${encodeURIComponent(therapistId)}&date=${encodeURIComponent(dateStr)}`)
      .then(res => res.json())
      .then(data => {
        setSlots(data.slots || []);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        setSlotsError(isArabic ? 'فشل تحميل المواعيد المتاحة' : 'Failed to load time slots');
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [pickedDate, therapistId, isArabic]);

  const handleDayClick = (date: Date) => {
    if (date < today) return;
    setPickedDate(date);
    setPickedTime('');
  };

  const handleConfirm = () => {
    if (pickedDate && pickedTime) {
      onSelect(dateToStr(pickedDate), pickedTime);
    }
  };

  const pickedDateStr = pickedDate ? dateToStr(pickedDate) : '';

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">{isArabic ? 'العودة' : 'Back'}</span>
      </button>

      {therapistName && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-sm text-slate-700">
            {isArabic ? 'مع' : 'With'} <span className="font-semibold">{therapistName}</span>
          </p>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-indigo-600" />
          <span className="font-semibold text-slate-900">{isArabic ? 'اختر التاريخ' : 'Select Date'}</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrev}
            disabled={!canGoPrev}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
          <span className="font-semibold text-slate-900">{monthLabel}</span>
          <button onClick={goToNext} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayLabels.map((d, i) => (
            <div key={i} className="text-center text-xs font-medium text-slate-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((cell, i) => {
            if (!cell) return <div key={`empty-${i}`} />;

            const { date } = cell;
            const isDisabled = date < today;
            const isSelected = pickedDate !== null && isSameDay(date, pickedDate);
            const isToday = isSameDay(date, today);

            return (
              <button
                key={date.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => handleDayClick(date)}
                className={`relative h-10 rounded-lg text-sm font-medium transition-all ${
                  isDisabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : isSelected
                      ? 'bg-indigo-600 text-white shadow-md'
                      : isToday
                        ? 'bg-indigo-100 text-indigo-700 font-bold hover:bg-indigo-200'
                        : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {date.getDate()}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-indigo-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {pickedDate && (
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="font-semibold text-slate-900">{isArabic ? 'اختر الوقت' : 'Select Time'}</span>
          </div>

          <p className="text-sm text-slate-500 mb-4">
            {isArabic ? 'توقيت دبي (GMT+4)' : 'Dubai Time (GMT+4)'} ·{' '}
            {pickedDate.toLocaleDateString(isArabic ? 'ar-AE' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {slotsLoading ? (
            <div className="flex items-center justify-center py-8 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-sm text-slate-500">{isArabic ? 'جارٍ تحميل المواعيد...' : 'Loading available times...'}</span>
            </div>
          ) : slotsError ? (
            <div className="text-center py-8 text-sm text-red-600 bg-red-50 rounded-xl">{slotsError}</div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 text-sm text-amber-600 bg-amber-50 rounded-xl">
              {isArabic ? 'لا توجد مواعيد متاحة لهذا التاريخ' : 'No available slots for this date. Try another day.'}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map(slot => {
                const isSelected = slot.time === pickedTime;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    onClick={() => setPickedTime(slot.time)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {slot.display}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Confirm button */}
      {pickedDate && pickedTime && (
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 hover:bg-indigo-700"
        >
          <CheckCircle className="w-4 h-4" />
          {isArabic ? 'تأكيد الموعد' : 'Confirm Schedule'}
        </button>
      )}
    </div>
  );
}
