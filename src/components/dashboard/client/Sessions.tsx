'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Video, Clock, X } from 'lucide-react';

type Slot = {
  time: string;
  display: string;
};

export default function Sessions({ upcoming, past }: { upcoming: any[]; past: any[] }) {
  const [reschedulingSession, setReschedulingSession] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  useEffect(() => {
    if (!reschedulingSession || !selectedDate) {
      setSlots([]);
      return;
    }

    async function fetchSlots() {
      setSlotsLoading(true);
      setRescheduleError('');
      try {
        const res = await fetch(
          `/api/bookings/availability?therapistId=${reschedulingSession.therapist_user_id || reschedulingSession.therapist_id}&date=${selectedDate}`
        );
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
        }
      } catch {
        setRescheduleError('Could not load availability');
      } finally {
        setSlotsLoading(false);
      }
    }
    fetchSlots();
  }, [reschedulingSession, selectedDate]);

  const handleRescheduleConfirm = async () => {
    if (!reschedulingSession || !selectedDate || !selectedSlot) return;

    setRescheduleError('');
    try {
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: reschedulingSession.id,
          newDate: selectedDate,
          newTime: selectedSlot,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reschedule failed');
      }

      setRescheduleSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setRescheduleError(err.message);
    }
  };

  const closeReschedule = () => {
    setReschedulingSession(null);
    setSelectedDate('');
    setSlots([]);
    setSelectedSlot('');
    setRescheduleError('');
    setRescheduleSuccess(false);
  };

  return (
    <div className="space-y-8">
      {/* Upcoming */}
      <section>
        <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
          Upcoming Sessions
        </h2>
        {upcoming.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border border-slate-200 text-slate-500 text-sm">
            No upcoming sessions scheduled.
          </div>
        ) : (
          <div className="grid gap-4">
            {upcoming.map(session => (
              <div key={session.id} className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="font-medium text-slate-900 mb-1">
                    {session.session_number ? `Session #${session.session_number}` : 'Free Consultation'}
                  </div>
                  <div className="text-sm text-slate-600 flex items-center space-x-4">
                    <span>{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    <span>{session.time}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Therapist: {session.therapist_name || 'Assigned'}</div>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Join Meet
                    </a>
                  )}
                  <button
                    onClick={() => setReschedulingSession(session)}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      <section>
        <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-400" />
          Past Sessions
        </h2>
        {past.length === 0 ? (
          <div className="text-sm text-slate-500 italic">No completed sessions yet.</div>
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
            {past.map(session => (
              <div key={session.id} className="p-4 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {session.session_number ? `Session #${session.session_number}` : 'Free Consultation'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(session.date).toLocaleDateString()} at {session.time}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    session.status === 'completed' ? 'bg-green-100 text-green-800' :
                    session.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Reschedule Modal */}
      {reschedulingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Reschedule Session</h3>
              <button onClick={closeReschedule} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rescheduleSuccess ? (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-medium">Session rescheduled successfully!</p>
                <p className="text-sm text-slate-500 mt-1">Reloading...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {rescheduleError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {rescheduleError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">New Time</label>
                    {slotsLoading ? (
                      <p className="text-sm text-slate-400">Loading availability...</p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map(slot => (
                          <button
                            key={slot.time}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-2 text-xs rounded border transition-colors ${
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

                <div className="pt-4 flex justify-end gap-3">
                  <button onClick={closeReschedule} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
                    Cancel
                  </button>
                  <button
                    onClick={handleRescheduleConfirm}
                    disabled={!selectedSlot}
                    className={`px-4 py-2 text-sm rounded-lg text-white ${
                      selectedSlot ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300 cursor-not-allowed'
                    }`}
                  >
                    Confirm Reschedule
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
