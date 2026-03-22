'use client';

import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Clock, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import FadeIn from '@/components/ui/FadeIn';

const TIME_SLOTS = [
  { id: 'morning-early', display: '09:00 AM', value: '09:00' },
  { id: 'morning-late', display: '11:00 AM', value: '11:00' },
  { id: 'afternoon-early', display: '02:00 PM', value: '14:00' },
  { id: 'afternoon-late', display: '04:00 PM', value: '16:00' },
  { id: 'evening', display: '06:00 PM', value: '18:00' },
];

function CalendarPicker({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay(); // 0 is Sunday
  
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
        {blanks.map((i) => <div key={`blank-${i}`} />)}
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

function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function ScheduleSessionPageContent() {
  const searchParams = useSearchParams();
  const rescheduleBookingId = searchParams.get('reschedule');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [time, setTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>(TIME_SLOTS.map((slot) => slot.value));
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ sessionNumber: number; remaining: number; date: string; time: string; rescheduled?: boolean } | null>(null);

  useEffect(() => {
    if (!selectedDate) {
      setAvailableSlots(TIME_SLOTS.map((slot) => slot.value));
      return;
    }

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setError(null);
      try {
        const date = selectedDate.toISOString().split('T')[0];
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
  }, [selectedDate, rescheduleBookingId, time]);

  async function handleSchedule() {
    if (!selectedDate) { setError('Please select a date from the calendar.'); return; }
    if (!time) { setError('Please select a time slot.'); return; }

    setError(null);
    setLoading(true);

    try {
      const isoDate = selectedDate.toISOString().split('T')[0];
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
        sessionNumber: data.sessionNumber ?? 0,
        remaining: data.remainingSessions ?? 0,
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
            {!success.rescheduled && (
              <p className="text-sm text-slate-500 font-light">
                You have <strong className="font-medium text-slate-900">{success.remaining} sessions</strong> remaining in your program.
              </p>
            )}
            <div className="flex flex-col gap-4">
              <Link href="/dashboard" className="w-full py-4 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors flex items-center justify-center">
                Return to Dashboard
              </Link>
              {success.remaining > 0 && (
                <button
                  onClick={() => setSuccess(null)}
                  className="w-full py-4 border border-slate-200 text-slate-900 text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-slate-50 transition-colors flex items-center justify-center"
                >
                  Schedule Another
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white selection:bg-indigo-50">
      <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-24">
        <FadeIn>
          <header className="mb-20">
            <Link href="/dashboard" className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-8 hover:text-slate-900 transition-colors">
              <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-light tracking-tight text-slate-900 leading-tight mb-6">
              Session Coordination.
            </h1>
            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl">
              Select a time that allows for 15 minutes of integration post-session.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
            
            {/* Left Col: Calendar */}
            <div className="lg:col-span-5 space-y-12">
              <section>
                 <span className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-8">
                    Select Date
                 </span>
                 <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
              </section>
            </div>

            {/* Right Col: Time & Confirm */}
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
                              : 'border-slate-100 hover:border-slate-300 text-slate-500 hover:text-slate-900'
                           }
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
                 {availabilityLoading && <p className="text-xs text-slate-400 mt-3">Checking therapist availability...</p>}
               </section>

               {error && (
                 <div className="p-6 bg-red-50 text-red-900 text-xs tracking-wide border-l-2 border-red-500 font-medium">
                   {error}
                 </div>
               )}

               <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                 <div className="text-xs uppercase tracking-widest text-slate-400 font-medium">
                   {selectedDate ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select Date'} — {time ? formatDisplayTime(time) : 'Select Time'}
                 </div>
                 <button
                   type="button"
                   onClick={handleSchedule}
                   disabled={loading || !selectedDate || !time}
                   className="px-12 py-5 bg-[#2B2F55] text-white text-xs font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#1E2140] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                 >
                   {loading ? 'Confirming...' : 'Confirm Schedule'}
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
