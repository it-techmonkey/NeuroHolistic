'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import CalendarPicker from '@/components/booking/shared/CalendarPicker';
import { generateGoogleCalendarUrl } from '@/lib/calendar-utils';
import { Calendar, Download } from 'lucide-react';

type Therapist = {
  id: string;
  name: string;
  slug?: string;
};

type Slot = {
  time: string;
  display: string;
};

export default function BookConsultationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedSlug = searchParams.get('therapist');
  const [initialLoading, setInitialLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [step, setStep] = useState<'details' | 'schedule' | 'success'>('details');
  
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [therapistLocked, setTherapistLocked] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Auth form data
  const [authData, setAuthData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });
  const [signupSession, setSignupSession] = useState<{ access_token?: string; refresh_token?: string } | null>(null);

  // 1. Check Auth & Load Therapists
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Pre-fill auth data from user
        setAuthData({
          name: user.user_metadata?.full_name || 
                `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() || '',
          email: user.email || '',
          phone: user.phone || user.user_metadata?.phone || '',
          country: user.user_metadata?.country || '',
          password: '',
        });
      } else {
        setShowAuthForm(true);
      }

      // Load therapists (filter out admin)
      try {
        const res = await fetch('/api/therapist/list');
        if (!res.ok) throw new Error('Failed to load therapists');
        const data = await res.json();
        const therapistList = (data.therapists || []).filter((t: any) => 
          !t.name.toLowerCase().includes('admin')
        );
        setTherapists(therapistList);
        
        // If a therapist slug was passed via URL, auto-select and lock it
        if (preselectedSlug) {
          const match = therapistList.find((t: any) => t.slug === preselectedSlug);
          if (match) {
            setSelectedTherapist(match.id);
            setTherapistLocked(true);
          } else if (therapistList.length > 0) {
            setSelectedTherapist(therapistList[0].id);
          }
        } else if (therapistList.length > 0) {
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

    setSlotsLoading(true);
    setBookingError('');

    try {
      // Format date without timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const url = `/api/bookings/availability?therapistId=${encodeURIComponent(selectedTherapist)}&date=${encodeURIComponent(dateStr)}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to load slots');
      }
      
      const data = await res.json();
      
      setSlots(data.slots || []);
      setSelectedSlot('');
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

  // Handle auth form submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authData.name || !authData.email || !authData.phone || !authData.password) {
      setBookingError('Please fill in all required fields');
      return;
    }
    if (authData.password.length < 8) {
      setBookingError('Password must be at least 8 characters');
      return;
    }
    setBookingError('');
    setStep('schedule');
  };

  const handleBooking = async () => {
    if (!selectedTherapist || !selectedDate || !selectedSlot) return;

    setBookingLoading(true);
    setBookingError('');

    try {
      // Create account (only if not logged in)
      if (!user) {
        const signupRes = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: authData.name.split(' ')[0] || authData.name,
            lastName: authData.name.split(' ').slice(1).join(' ') || '',
            email: authData.email,
            password: authData.password,
            phone: authData.phone,
            country: authData.country,
            role: 'client',
          }),
        });

        const signupData = await signupRes.json();
        
        // 409 means user already exists
        if (!signupRes.ok && signupRes.status !== 409) {
          throw new Error(signupData.error || 'Failed to create account');
        }

        // Store session if returned
        if (signupData.session) {
          setSignupSession(signupData.session);
        }
      }

      const therapist = therapists.find(t => t.id === selectedTherapist);
      // Format date without timezone conversion
      const bookYear = selectedDate.getFullYear();
      const bookMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const bookDay = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${bookYear}-${bookMonth}-${bookDay}`;
      
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          name: user?.user_metadata?.full_name || authData.name,
          email: user?.email || authData.email,
          phone: user?.phone || user?.user_metadata?.phone || authData.phone,
          country: user?.user_metadata?.country || authData.country || '',
          therapistId: selectedTherapist,
          therapistName: therapist?.name || 'Therapist',
          date: dateStr,
          time: selectedSlot,
          type: 'free_consultation',
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      // Show success screen
      setStep('success');
    } catch (err: any) {
      console.error('Booking error:', err);
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    setBookingLoading(true);
    setBookingError('');
    
    try {
      // If we have a session from signup, use it to set the client-side session
      if (signupSession?.access_token) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: signupSession.access_token,
          refresh_token: signupSession.refresh_token || '',
        });

        if (!sessionError) {
          router.push('/dashboard/client');
          return;
        }
      }

      // Fallback: Try sign in with password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authData.email,
        password: authData.password,
      });

      if (signInError) {
        setBookingError('Failed to sign in. Please try logging in manually.');
        return;
      }

      router.push('/dashboard/client');
    } catch (err: any) {
      setBookingError('Something went wrong. Please try logging in manually.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-28 sm:pt-32 md:pt-40 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  const inputClass = 'w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none';

  return (
    <div className="min-h-screen bg-slate-50 pt-28 sm:pt-32 md:pt-40 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-light text-slate-900">Book Your Free Consultation</h1>
          <p className="mt-2 text-slate-600">Create your account and select a time for your free introduction.</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 space-y-8">
          {/* Error Message */}
          {bookingError && (
            <div className="bg-red-50 text-red-700 p-4 rounded text-sm">
              {bookingError}
            </div>
          )}

          {/* Step: Details (for non-logged-in users) */}
          {showAuthForm && step === 'details' && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <h2 className="text-lg font-medium text-slate-900">Your Details</h2>
                <p className="text-sm text-slate-500 mt-1">Create your account to continue</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={authData.name}
                      onChange={e => setAuthData({ ...authData, name: e.target.value })}
                      className={inputClass}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={authData.phone}
                      onChange={e => setAuthData({ ...authData, phone: e.target.value })}
                      className={inputClass}
                      placeholder="+971 50 000 0000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={authData.email}
                    onChange={e => setAuthData({ ...authData, email: e.target.value })}
                    className={inputClass}
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={authData.country}
                    onChange={e => setAuthData({ ...authData, country: e.target.value })}
                    className={inputClass}
                    placeholder="UAE"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={authData.password}
                      onChange={e => setAuthData({ ...authData, password: e.target.value })}
                      className={inputClass + ' pr-10'}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
                  <p className="text-xs text-slate-500 mt-1">You'll use this to access your dashboard</p>
                </div>

                <button
                  type="submit"
                  disabled={!authData.name || !authData.email || !authData.phone || !authData.password}
                  className={`w-full py-3 rounded-lg font-medium transition ${
                    authData.name && authData.email && authData.phone && authData.password
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Continue to Schedule
                </button>
              </form>
            </div>
          )}

          {/* Step: Schedule */}
          {(step === 'schedule' || (user && step === 'details')) && (
            <div className="space-y-6">
              {/* Therapist Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {therapistLocked ? 'Your Therapist' : (
                    <>Select Therapist <span className="text-indigo-600">({therapists.length} available)</span></>
                  )}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(therapistLocked ? therapists.filter(t => t.id === selectedTherapist) : therapists).map(therapist => (
                    <button
                      key={therapist.id}
                      type="button"
                      disabled={therapistLocked}
                      onClick={() => {
                        if (!therapistLocked) {
                          setSelectedTherapist(therapist.id);
                          setSelectedSlot('');
                        }
                      }}
                      className={`p-4 border rounded-lg text-left transition-all ${
                        selectedTherapist === therapist.id
                          ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600'
                          : 'border-slate-200 hover:border-indigo-300'
                      } ${therapistLocked ? 'cursor-default' : ''}`}
                    >
                      <div className="font-medium text-slate-900">{therapist.name}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {therapistLocked ? '✓ Pre-selected from profile' : 'NeuroHolistic Specialist'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection - Custom Calendar */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                <CalendarPicker
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
                <div className="border-t border-slate-100 pt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Select Time for {formatDate(selectedDate)}
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
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-3 px-4 text-sm font-medium rounded-lg border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                              selectedSlot === slot.time
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-green-300 bg-green-50 text-green-800 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
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
                {showAuthForm && step === 'schedule' && (
                  <button
                    onClick={() => setStep('details')}
                    className="w-full py-3 mb-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                  >
                    ← Back to Details
                  </button>
                )}
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
                      Creating Account & Booking...
                    </span>
                  ) : selectedSlot ? (
                    `Book Free Consultation at ${slots.find(s => s.time === selectedSlot)?.display}`
                  ) : (
                    'Select a time slot to continue'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Your consultation is booked!</h3>
                <p className="text-slate-500 mt-1">{selectedDate && formatDate(selectedDate)}</p>
                <p className="text-slate-500">at {slots.find(s => s.time === selectedSlot)?.display}</p>
                <p className="text-slate-500 mt-1">with {therapists.find(t => t.id === selectedTherapist)?.name}</p>
              </div>

              <div className="pt-4 space-y-3">
                {/* Add to Calendar Button */}
                {selectedDate && selectedSlot && (
                  <button
                    onClick={() => {
                      const [hours, minutes] = selectedSlot.split(':').map(Number);
                      const startDate = new Date(selectedDate);
                      startDate.setHours(hours, minutes, 0, 0);
                      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
                      
                      const url = generateGoogleCalendarUrl({
                        title: 'Free Consultation - NeuroHolistic',
                        description: `Free consultation session with NeuroHolistic.\n\nYou will receive a Google Meet link before the session.`,
                        startDate,
                        endDate,
                      });
                      window.open(url, '_blank');
                    }}
                    className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Add to Google Calendar
                  </button>
                )}
                
                {!user && (
                  <button
                    onClick={handleGoToDashboard}
                    disabled={bookingLoading}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {bookingLoading ? 'Signing in...' : 'Go to Dashboard'}
                  </button>
                )}
                
                {user && (
                  <button
                    onClick={() => router.push('/dashboard/client')}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
                  >
                    Go to Dashboard
                  </button>
                )}
                
                <p className="text-sm text-slate-400">
                  A confirmation email has been sent to {user?.email || authData.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
