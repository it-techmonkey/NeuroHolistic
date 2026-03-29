'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import HeroCalendar from './HeroCalendar';

type Therapist = {
  id: string;
  name: string;
};

type Slot = {
  time: string;
  display: string;
};

export default function HeroBookingForm() {
  const [isOpen, setIsOpen] = useState(false);
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });
  const [signupSession, setSignupSession] = useState<{ access_token?: string; refresh_token?: string } | null>(null);

  // Load therapists when modal opens
  useEffect(() => {
    if (isOpen && therapists.length === 0) {
      fetch('/api/therapist/list')
        .then(res => res.json())
        .then(data => {
          const list = (data.therapists || []).filter((t: Therapist) => 
            !t.name.toLowerCase().includes('admin')
          );
          const seen = new Set<string>();
          const unique = list.filter((t: Therapist) => {
            const key = t.name.toLowerCase().trim();
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
  }, [isOpen, therapists.length]);

  // Load slots when therapist and date change
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setError('');
    
    // Format date without timezone conversion (YYYY-MM-DD in local timezone)
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
        setError('Failed to load time slots');
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedTherapist, selectedDate]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields including password');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setStep('schedule');
  };

  const handleBooking = async () => {
    if (!selectedTherapist || !selectedDate || !selectedSlot) {
      setError('Please select a therapist, date, and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create the user account
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
      
      // 409 means user already exists - that's fine
      if (!signupRes.ok && signupRes.status !== 409) {
        throw new Error(signupData.error || 'Failed to create account');
      }

      // Store session if returned
      if (signupData.session) {
        setSignupSession(signupData.session);
      }

      // Create the booking
      const therapist = therapists.find(t => t.id === selectedTherapist);
      // Format date without timezone conversion
      const bookYear = selectedDate.getFullYear();
      const bookMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const bookDay = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${bookYear}-${bookMonth}-${bookDay}`;
      
      const bookingRes = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: null,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          country: formData.country || '',
          therapistId: selectedTherapist,
          therapistName: therapist?.name || 'Therapist',
          date: dateStr,
          time: selectedSlot,
          type: 'free_consultation',
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) throw new Error(bookingData.error || 'Booking failed');

      // Show success screen
      setStep('success');
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      // If we have a session from signup, use it to set the client-side session
      if (signupSession?.access_token) {
        // Use the access token to set the session on the client
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: signupSession.access_token,
          refresh_token: signupSession.refresh_token || '',
        });

        if (!sessionError) {
          window.location.href = '/dashboard/client';
          return;
        }
      }

      // Fallback: Try sign in with password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Failed to sign in. Please try logging in manually.');
        return;
      }

      // Redirect to dashboard
      window.location.href = '/dashboard/client';
    } catch (err: any) {
      setError('Something went wrong. Please try logging in manually.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const inputClass = 'w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all';

  return (
    <>
      {/* Open Modal Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-7 py-4 text-[15px] font-semibold text-[#0B0F2B] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(161,184,255,0.2)] hover:bg-[#F3F6FF] active:scale-95"
        >
          Book Free Consultation <span aria-hidden="true">→</span>
        </button>
        <a href="/booking/paid-program-booking" className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-white/25 bg-white/10 px-7 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-white/15">
          Book Paid Program <span aria-hidden="true">→</span>
        </a>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0B1028] border border-white/10 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 z-10 text-white/50 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {step === 'success' ? 'Booking Confirmed!' : 'Book Free Consultation'}
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    {step === 'details' && 'Enter your details to get started'}
                    {step === 'schedule' && 'Select your preferred date and time'}
                    {step === 'success' && 'Your consultation has been booked'}
                  </p>
                </div>

                {/* Progress indicator */}
                {step !== 'success' && (
                  <div className="flex gap-2 mb-6">
                    <div className={`h-1 flex-1 rounded ${step === 'details' ? 'bg-indigo-400' : 'bg-white/20'}`} />
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
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className={inputClass}
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Email *</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className={inputClass}
                        placeholder="your@email.com"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Phone *</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className={inputClass}
                          placeholder="+971 50 000 0000"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-white/70 mb-1.5">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={e => setFormData({ ...formData, country: e.target.value })}
                          className={inputClass}
                          placeholder="UAE"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-1.5">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className={inputClass + ' pr-10'}
                          placeholder="At least 8 characters"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
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
                      <p className="text-[10px] text-white/40 mt-1">You'll use this to access your dashboard</p>
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
                      Continue to Schedule
                    </button>
                  </form>
                )}

                {/* Step: Schedule */}
                {step === 'schedule' && (
                  <div className="space-y-4">
                    {/* Therapist Selection */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-2">Select Therapist</label>
                      <div className="grid grid-cols-2 gap-2">
                        {therapists.map(therapist => (
                          <button
                            key={therapist.id}
                            type="button"
                            onClick={() => {
                              setSelectedTherapist(therapist.id);
                              setSelectedSlot('');
                            }}
                            className={`p-2.5 border rounded-lg text-left transition-all ${
                              selectedTherapist === therapist.id
                                ? 'border-indigo-400 bg-indigo-400/10'
                                : 'border-white/20 hover:border-white/30'
                            }`}
                          >
                            <span className="font-medium text-white text-xs block truncate">{therapist.name}</span>
                            <span className="block text-[10px] text-white/50 mt-0.5">Specialist</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection - Custom Calendar */}
                    <div>
                      <label className="block text-xs font-medium text-white/70 mb-2">Select Date</label>
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
                          Select Time for {formatDate(selectedDate)}
                        </label>
                        {slotsLoading ? (
                          <div className="text-center py-4 text-white/60 text-sm">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto mb-2"></div>
                            Loading available times...
                          </div>
                        ) : slots.length === 0 ? (
                          <div className="text-center py-4 text-amber-300 bg-amber-500/10 rounded-lg text-sm">
                            No slots available for this date. Please try another day.
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
                            ✓ Selected: {slots.find(s => s.time === selectedSlot)?.display}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setStep('details')}
                        className="flex-1 py-2.5 border border-white/20 rounded-lg font-medium text-white/70 hover:bg-white/10 transition text-sm"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleBooking}
                        disabled={!selectedTherapist || !selectedDate || !selectedSlot || loading}
                        className={`flex-1 py-2.5 rounded-lg font-medium transition text-sm ${
                          selectedTherapist && selectedDate && selectedSlot && !loading
                            ? 'bg-white text-[#0B0F2B] hover:bg-white/90'
                            : 'bg-white/20 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0B0F2B]"></div>
                            Creating Account...
                          </span>
                        ) : (
                          'Book Consultation'
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
                      <h3 className="text-lg font-semibold text-white">Your consultation is booked!</h3>
                      <p className="text-white/60 mt-1">
                        {selectedDate && formatDate(selectedDate)}
                      </p>
                      <p className="text-white/60">
                        at {slots.find(s => s.time === selectedSlot)?.display}
                      </p>
                      <p className="text-white/60 mt-1">
                        with {therapists.find(t => t.id === selectedTherapist)?.name}
                      </p>
                    </div>

                    <div className="pt-4 space-y-3">
                      <button
                        onClick={handleGoToDashboard}
                        disabled={loading}
                        className="w-full py-3 bg-white text-[#0B0F2B] rounded-lg font-medium hover:bg-white/90 transition disabled:opacity-50"
                      >
                        {loading ? 'Signing in...' : 'Go to Dashboard'}
                      </button>
                      
                      <p className="text-xs text-white/40">
                        A confirmation email has been sent to {formData.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
