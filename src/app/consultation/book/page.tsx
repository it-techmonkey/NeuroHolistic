'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

type Therapist = {
  id: string;
  name: string;
};

type Slot = {
  time: string;
  display: string;
};

export default function BookConsultationPage() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // 1. Check Auth & Load Therapists
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login?next=/consultation/book');
        return;
      }
      setUser(user);

      // Load therapists
      try {
        const res = await fetch('/api/therapist/list');
        if (!res.ok) throw new Error('Failed to load therapists');
        const data = await res.json();
        const therapistList = data.therapists || [];
        setTherapists(therapistList);
        if (therapistList.length > 0) {
          setSelectedTherapist(therapistList[0].id);
        }
      } catch (err) {
        console.error('Failed to load therapists:', err);
        setBookingError('Failed to load therapists. Please refresh.');
      } finally {
        setInitialLoading(false);
      }
    }
    init();
  }, [router]);

  // 2. Fetch availability when both therapist and date are selected
  const fetchAvailability = useCallback(async () => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    console.log('Fetching availability for:', { therapistId: selectedTherapist, date: selectedDate });
    setSlotsLoading(true);
    setBookingError('');

    try {
      const url = `/api/bookings/availability?therapistId=${encodeURIComponent(selectedTherapist)}&date=${encodeURIComponent(selectedDate)}`;
      console.log('Fetching:', url);
      
      const res = await fetch(url);
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load slots');
      }
      
      const data = await res.json();
      console.log('Availability response:', data);
      
      setSlots(data.slots || []);
      setSelectedSlot(''); // Reset selected slot when date changes
    } catch (err: any) {
      console.error('Availability fetch error:', err);
      setBookingError('Could not load availability. Please try again.');
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedTherapist, selectedDate]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleBooking = async () => {
    if (!user || !selectedTherapist || !selectedDate || !selectedSlot) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      const therapist = therapists.find(t => t.id === selectedTherapist);
      
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.user_metadata?.full_name || 
                `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || 
                user.email,
          email: user.email,
          phone: user.phone || user.user_metadata?.phone || '',
          country: user.user_metadata?.country || '',
          therapistId: selectedTherapist,
          therapistName: therapist?.name || 'Therapist',
          date: selectedDate,
          time: selectedSlot,
          type: 'free_consultation'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      // Auto-login for new users or redirect for existing
      if (data.user?.tempPassword) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: data.user.tempPassword,
        });
        
        if (!signInError) {
          router.push('/dashboard/client');
          return;
        }
      }

      router.push('/consultation/confirmed');
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const showSlotsSection = selectedDate && selectedTherapist;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-slate-900">Book Your Consultation</h1>
          <p className="mt-2 text-slate-600">Select a therapist and time for your free introduction.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          {/* Error Message */}
          {bookingError && (
            <div className="bg-red-50 text-red-700 p-4 rounded text-sm">
              {bookingError}
            </div>
          )}

          {/* Therapist Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Therapist <span className="text-indigo-600">({therapists.length} available)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {therapists.map(therapist => (
                <button
                  key={therapist.id}
                  type="button"
                  onClick={() => {
                    setSelectedTherapist(therapist.id);
                    setSelectedSlot('');
                  }}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    selectedTherapist === therapist.id
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
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
              className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border text-base"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => {
                console.log('Date selected:', e.target.value);
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
            />
          </div>

          {/* Time Slots Section */}
          {showSlotsSection && (
            <div className="border-t border-slate-100 pt-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select Time
                {selectedDate && (
                  <span className="text-slate-400 font-normal ml-2">
                    for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                )}
              </label>
              
              {slotsLoading ? (
                <div className="flex items-center gap-2 text-slate-500 py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span>Loading available times...</span>
                </div>
              ) : slots.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
                  <p className="font-medium">No slots available for this date.</p>
                  <p className="text-sm mt-1">Please select a different date or contact us for assistance.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs text-green-600 mb-3 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {slots.length} time slots available - click to select
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => {
                          console.log('Slot clicked:', slot.time);
                          setSelectedSlot(slot.time);
                        }}
                        className="py-3 px-4 text-sm font-medium rounded-lg border-2 border-green-300 bg-green-50 text-green-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        style={{ pointerEvents: 'auto' }}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </>
              )}
              
              {selectedSlot && (
                <p className="mt-3 text-sm text-green-600 font-medium">
                  ✓ Selected: {slots.find(s => s.time === selectedSlot)?.display}
                </p>
              )}
            </div>
          )}

          {/* Show prompt if no date selected */}
          {!selectedDate && (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
              <p className="text-slate-500">Please select a date above to see available time slots.</p>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleBooking}
              disabled={!selectedSlot || bookingLoading}
              className={`w-full py-4 rounded-lg text-white font-semibold text-base shadow-lg transition-all ${
                !selectedSlot || bookingLoading
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
              }`}
            >
              {bookingLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Confirming Booking...
                </span>
              ) : selectedSlot ? (
                `Confirm Booking at ${slots.find(s => s.time === selectedSlot)?.display}`
              ) : (
                'Select a time slot to continue'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
