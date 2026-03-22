'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const TIME_SLOTS = [
  { id: 'morning-early', display: '09:00 AM', value: '09:00' },
  { id: 'morning-late', display: '11:00 AM', value: '11:00' },
  { id: 'afternoon-early', display: '02:00 PM', value: '14:00' },
  { id: 'afternoon-late', display: '04:00 PM', value: '16:00' },
  { id: 'evening', display: '06:00 PM', value: '18:00' },
];

type SessionSummary = {
  totalSessions: number | null;
  usedSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  remainingSessions: number | null;
  canScheduleNextSession: boolean;
  nextSchedulableSessionNumber: number | null;
  programType: 'private' | 'group' | null;
};

type UpcomingBooking = {
  id: string;
  date: string;
  time: string;
  therapist_name: string | null;
  meeting_link: string | null;
  sessionNumber: number | null;
};

type ProgressResponse = {
  nextUpcomingBooking: UpcomingBooking | null;
  summary: SessionSummary;
};

function CalendarPicker({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const currentMonthName = viewDate.toLocaleString('default', { month: 'long' });
  const currentYear = viewDate.getFullYear();

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <span className="text-xl font-light tracking-tight text-slate-900">
          {currentMonthName} <span className="text-slate-400">{currentYear}</span>
        </span>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
            className="text-slate-400 hover:text-slate-900 transition-colors"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-4">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const isPast = date < today;
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(date)}
              className={`
                aspect-square flex items-center justify-center text-sm font-medium transition-all duration-200
                ${isPast ? 'text-slate-200 cursor-not-allowed' : ''}
                ${isSelected ? 'bg-[#2B2F55] text-white' : ''}
                ${!isSelected && !isPast && isToday ? 'text-[#2B2F55] font-bold ring-1 ring-slate-200' : ''}
                ${!isSelected && !isPast && !isToday ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function BlockedState({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl border border-slate-200 rounded-[2rem] p-10 md:p-14 text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-6">{eyebrow}</p>
        <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 mb-6">{title}</h1>
        <p className="text-base text-slate-500 leading-relaxed max-w-xl mx-auto">{body}</p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={primaryHref}
            className="px-8 py-4 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel && (
            <Link
              href={secondaryHref}
              className="px-8 py-4 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-slate-50 transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function ScheduleSessionPageContent() {
  const searchParams = useSearchParams();
  const rescheduleBookingId = searchParams.get('reschedule');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS.map((slot) => slot.value));
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [flowLoading, setFlowLoading] = useState(true);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{
    sessionNumber: number | null;
    remaining: number | null;
    date: string;
    time: string;
    rescheduled?: boolean;
  } | null>(null);

  useEffect(() => {
    const loadFlow = async () => {
      setFlowLoading(true);
      setFlowError(null);

      try {
        const response = await fetch('/api/users/session-progress');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load session flow.');
        }

        setProgress(data);
      } catch (err) {
        setFlowError(err instanceof Error ? err.message : 'Failed to load session flow.');
      } finally {
        setFlowLoading(false);
      }
    };

    loadFlow();
  }, []);

  const nextUpcomingBooking = progress?.nextUpcomingBooking ?? null;
  const summary = progress?.summary ?? null;
  const isRescheduling = Boolean(rescheduleBookingId);
  const isReschedulingNextSession = Boolean(
    rescheduleBookingId && nextUpcomingBooking && nextUpcomingBooking.id === rescheduleBookingId
  );
  const canCreateNextSession = Boolean(summary?.canScheduleNextSession);
  const shouldShowScheduler = isRescheduling ? isReschedulingNextSession : canCreateNextSession;
  const nextSessionLabel = nextUpcomingBooking?.sessionNumber
    ? `Session ${nextUpcomingBooking.sessionNumber}`
    : 'Your next session';

  useEffect(() => {
    if (!selectedDate || !shouldShowScheduler) {
      setAvailableSlots(TIME_SLOTS.map((slot) => slot.value));
      return;
    }

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setError(null);

      try {
        const date = toIsoDate(selectedDate);
        const params = new URLSearchParams({ date });

        if (rescheduleBookingId) {
          params.set('excludeBookingId', rescheduleBookingId);
        }

        const response = await fetch(`/api/booking/availability?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load availability');
          return;
        }

        setAvailableSlots(data.availableSlots ?? []);

        if (time && !(data.availableSlots ?? []).includes(time)) {
          setTime('');
        }
      } catch {
        setError('Failed to load real-time availability.');
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();
  }, [rescheduleBookingId, selectedDate, shouldShowScheduler, time]);

  async function handleSchedule() {
    if (!shouldShowScheduler) return;
    if (!selectedDate) {
      setError('Please select a date from the calendar.');
      return;
    }
    if (!time) {
      setError('Please select a time slot.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const isoDate = toIsoDate(selectedDate);
      const endpoint = rescheduleBookingId ? '/api/booking/reschedule' : '/api/booking/schedule-session';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          rescheduleBookingId
            ? { bookingId: rescheduleBookingId, date: isoDate, time }
            : { date: isoDate, time }
        ),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Unable to schedule session.');
        return;
      }

      setSuccess({
        sessionNumber: data.sessionNumber ?? summary?.nextSchedulableSessionNumber ?? null,
        remaining: data.remainingSessions ?? summary?.remainingSessions ?? null,
        date: isoDate,
        time,
        rescheduled: Boolean(rescheduleBookingId),
      });
    } catch {
      setError('Network communication failed.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-lg text-center space-y-12">
          <div className="flex justify-center">
            <span className="w-16 h-16 rounded-full border border-slate-200 flex items-center justify-center text-[#2B2F55]">
              <Check size={32} strokeWidth={1.5} />
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">Confirmation</p>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">
              {success.rescheduled ? 'Session Rescheduled.' : `Session ${success.sessionNumber} Confirmed.`}
            </h1>
          </div>

          <div className="border-t border-b border-slate-100 py-8 space-y-4">
            <div className="flex items-center justify-center gap-3 text-slate-900">
              <CalendarIcon size={16} strokeWidth={1.5} className="text-slate-400" />
              <span className="font-light text-lg">{formatDisplayDate(success.date)}</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-900">
              <Clock size={16} strokeWidth={1.5} className="text-slate-400" />
              <span className="font-light text-lg">{formatDisplayTime(success.time)}</span>
            </div>
          </div>

          <div className="space-y-8">
            {typeof success.remaining === 'number' && !success.rescheduled && (
              <p className="text-sm text-slate-500 font-light">
                You have <strong className="font-medium text-slate-900">{success.remaining} sessions</strong> left after this booking.
              </p>
            )}
            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard"
                className="w-full py-4 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors flex items-center justify-center"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (flowLoading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-slate-400">Loading...</div>;
  }

  if (flowError) {
    return (
      <BlockedState
        eyebrow="Session Coordination"
        title="Unable to Load Scheduling Flow."
        body={flowError}
        primaryHref="/dashboard"
        primaryLabel="Return to Dashboard"
      />
    );
  }

  if (isRescheduling && !isReschedulingNextSession) {
    return (
      <BlockedState
        eyebrow="Reschedule Rule"
        title="Only the Immediate Next Session Can Be Rescheduled."
        body="This link does not point to your currently scheduled next session. Use the dashboard card for the next confirmed session."
        primaryHref={nextUpcomingBooking ? `/booking/schedule-session?reschedule=${nextUpcomingBooking.id}` : '/dashboard'}
        primaryLabel={nextUpcomingBooking ? 'Reschedule Next Session' : 'Return to Dashboard'}
        secondaryHref="/dashboard"
        secondaryLabel="Back to Dashboard"
      />
    );
  }

  if (!isRescheduling && nextUpcomingBooking) {
    return (
      <BlockedState
        eyebrow="Next Session"
        title="Your Next Session Is Already Scheduled."
        body={`${nextSessionLabel} is booked for ${formatDisplayDate(nextUpcomingBooking.date)} at ${formatDisplayTime(nextUpcomingBooking.time)}. You can reschedule that session, but you cannot book the one after it yet.`}
        primaryHref={`/booking/schedule-session?reschedule=${nextUpcomingBooking.id}`}
        primaryLabel="Reschedule This Session"
        secondaryHref="/dashboard"
        secondaryLabel="Back to Dashboard"
      />
    );
  }

  if (!summary?.totalSessions) {
    return (
      <BlockedState
        eyebrow="Session Coordination"
        title="No Active Program Found."
        body="Session scheduling is available only for clients with an active program."
        primaryHref="/dashboard"
        primaryLabel="Return to Dashboard"
      />
    );
  }

  if (!isRescheduling && summary.remainingSessions === 0) {
    return (
      <BlockedState
        eyebrow="Program Complete"
        title="No Sessions Remaining."
        body="All sessions in your current program have already been allocated."
        primaryHref="/dashboard"
        primaryLabel="Return to Dashboard"
      />
    );
  }

  const sessionNumberLabel = isRescheduling
    ? nextUpcomingBooking?.sessionNumber
    : summary.nextSchedulableSessionNumber;

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-50">
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
        <FadeIn>
          <header className="mb-20">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8 hover:text-slate-900 transition-colors"
            >
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-tight mb-6">
              {isRescheduling ? 'Reschedule Session.' : `Schedule Session ${sessionNumberLabel}.`}
            </h1>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl">
              {isRescheduling
                ? 'Move your immediate next session to a new available slot.'
                : 'Only the immediate next session can be booked. Once it is completed and no future session is on the calendar, the next one becomes available.'}
            </p>
          </header>

          <div className="mb-12 p-6 border border-slate-200 rounded-[1.5rem] bg-slate-50">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">
              {isRescheduling ? 'Current Booking' : 'Session Flow'}
            </p>
            <p className="text-slate-700 leading-relaxed">
              {isRescheduling && nextUpcomingBooking
                ? `${nextSessionLabel} is currently set for ${formatDisplayDate(nextUpcomingBooking.date)} at ${formatDisplayTime(nextUpcomingBooking.time)}.`
                : `${summary.completedSessions} of ${summary.totalSessions} sessions are completed. ${summary.remainingSessions} session${summary.remainingSessions === 1 ? '' : 's'} remain unscheduled.`}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
            <div className="lg:col-span-5 space-y-12">
              <section>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-8">
                  Select Date
                </span>
                <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
              </section>
            </div>

            <div className="lg:col-span-7 lg:border-l lg:border-slate-50 lg:pl-16 space-y-16">
              <section>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-8">
                  Available Slots (UAE Standard Time)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = time === slot.value;
                    const isAvailable = availableSlots.includes(slot.value);

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setTime(slot.value)}
                        disabled={!isAvailable || availabilityLoading}
                        className={`
                          group relative flex items-center justify-between p-6 border transition-all duration-300
                          ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}
                          ${isSelected
                            ? 'border-[#2B2F55] bg-[#2B2F55] text-white'
                            : 'border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-900'}
                        `}
                      >
                        <span className={`text-sm font-medium tracking-wide ${isSelected ? 'text-white' : ''}`}>
                          {slot.display}
                        </span>
                        {isSelected && <Check size={16} strokeWidth={1.5} />}
                        {!isSelected && !isAvailable && <span className="text-xs font-semibold">Booked</span>}
                      </button>
                    );
                  })}
                </div>
                {availabilityLoading && (
                  <p className="text-xs text-slate-400 mt-3">Checking therapist availability...</p>
                )}
              </section>

              {error && (
                <div className="p-6 bg-red-50 text-red-900 text-xs tracking-wide border-l-2 border-red-500 font-medium">
                  {error}
                </div>
              )}

              <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                  {selectedDate
                    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Select Date'}{' '}
                  {'\u2014'} {time ? formatDisplayTime(time) : 'Select Time'}
                </div>
                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={loading || !selectedDate || !time}
                  className="px-12 py-5 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {loading ? 'Confirming...' : isRescheduling ? 'Confirm Reschedule' : 'Confirm Schedule'}
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

export default function ScheduleSessionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ScheduleSessionPageContent />
    </Suspense>
  );
}
