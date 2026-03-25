'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type Therapist = {
  id: string;
  name: string;
};

type Slot = {
  time: string;
  display: string;
};

function ScheduleSessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [program, setProgram] = useState<any>(null);
  const [session, setSession] = useState<any>(null);

  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');

  const [schedulingError, setSchedulingError] = useState('');
  const [schedulingSuccess, setSchedulingSuccess] = useState(false);

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
      if (programRes.ok) {
        const data = await programRes.json();
        if (data.program) {
          setProgram(data.program);
          setSession(data.firstPendingSession);
        }
      }

      // Load therapists
      try {
        const res = await fetch('/api/therapist/list');
        if (res.ok) {
          const data = await res.json();
          setTherapists(data.therapists || []);
          if (data.therapists?.length > 0) {
            setSelectedTherapist(data.therapists[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load therapists:', err);
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
        if (!res.ok) throw new Error('Failed to load slots');
        const data = await res.json();
        setSlots(data.slots || []);
      } catch (err) {
        console.error(err);
        setSchedulingError('Could not load availability.');
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
      if (!res.ok) throw new Error(data.error || 'Scheduling failed');

      setSchedulingSuccess(true);
    } catch (err: any) {
      setSchedulingError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>;
  }

  if (schedulingSuccess) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-light text-slate-900 mb-4">Session Scheduled</h1>
        <p className="text-slate-500 max-w-md mb-8">
          Your session has been scheduled. You will receive a confirmation email with the Google Meet link.
        </p>
        <Link
          href="/dashboard/client"
          className="px-8 py-3 bg-[#2B2F55] text-white rounded-lg font-medium hover:bg-[#1E2140] transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-slate-900">Schedule Your Session</h1>
          <p className="mt-2 text-slate-600">
            {session ? `Session ${session.session_number}` : 'Your first session'} — Select a date and time.
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Therapist</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {therapists.map(therapist => (
                <button
                  key={therapist.id}
                  onClick={() => setSelectedTherapist(therapist.id)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTherapist === therapist.id
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-medium text-slate-900">{therapist.name}</div>
                  <div className="text-xs text-slate-500 mt-1">NeuroHolistic Specialist</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          {/* Time Slots */}
          {(selectedDate && selectedTherapist) && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
              {slotsLoading ? (
                <div className="text-slate-400 text-sm">Loading availability...</div>
              ) : slots.length === 0 ? (
                <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded">
                  No slots available for this date. Please try another day.
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
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleSchedule}
              disabled={!selectedSlot || loading}
              className={`px-8 py-3 rounded-lg text-white font-medium shadow-sm transition-all ${
                !selectedSlot || loading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              {loading ? 'Scheduling...' : 'Confirm Session'}
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
