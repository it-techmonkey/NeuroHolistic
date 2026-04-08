'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { generateGoogleCalendarUrl } from '@/lib/calendar-utils';
import { Calendar } from 'lucide-react';

type Therapist = {
  id: string;
  name: string;
};

type Slot = {
  time: string;
  display: string;
};

type BookingFormProps = {
  onClose: () => void;
  bookingType?: 'consultation' | 'program' | null;
};

interface BookingResult {
  date: string;
  time: string;
  therapistName?: string;
  meetLink?: string;
  tempPassword?: string;
  email?: string;
  bookingId?: string;
}

function normalizeTherapistName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/^(dr|doctor)\s+/i, '')
    .replace(/\./g, '')
    .replace(/\s+/g, ' ');
}

export default function BookingForm({ onClose, bookingType = 'consultation' }: BookingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<'details' | 'schedule' | 'success'>('details');
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  
  // New: Password setup state
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
  });

  // Load therapists - deduplicate by name
  useEffect(() => {
    fetch('/api/therapist/list')
      .then(res => res.json())
      .then(data => {
        const list = data.therapists || [];
        // Deduplicate by normalized name
        const seen = new Set<string>();
        const unique = list.filter((t: Therapist) => {
          const key = normalizeTherapistName(t.name);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setTherapists(unique);
        if (unique.length > 0) setSelectedTherapist(unique[0].id);
      })
      .catch(err => {
        console.error('Failed to load therapists:', err);
        setTherapists([{ id: 'default', name: 'NeuroHolistic Therapist' }]);
        setSelectedTherapist('default');
      });
  }, []);

  // Load slots when therapist and date change
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setSlots([]);
      return;
    }

    setSlotsLoading(true);
    setError('');
    
    fetch(`/api/bookings/availability?therapistId=${encodeURIComponent(selectedTherapist)}&date=${encodeURIComponent(selectedDate)}`)
      .then(res => res.json())
      .then(data => {
        console.log('Slots response:', data);
        setSlots(data.slots || []);
      })
      .catch(err => {
        console.error('Failed to load slots:', err);
        setError('Failed to load time slots');
        setSlots([]);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedTherapist, selectedDate]);

  const handleDetailsSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Try to sign up - user might already exist which is fine
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.name.split(' ')[0] || formData.name,
          lastName: formData.name.split(' ').slice(1).join(' ') || '',
          email: formData.email,
          password: formData.password || 'TempPass123!',
          phone: formData.phone,
          country: formData.country,
          role: 'client',
        }),
      });

      const data = await res.json();
      
      // 409 means user already exists - that's fine, continue
      if (res.ok || res.status === 409) {
        setStep('schedule');
      } else {
        // Other errors - still continue since booking can work without signup
        console.log('Signup note:', data.error);
        setStep('schedule');
      }
    } catch (err: any) {
      // Network error - still continue to scheduling
      console.log('Signup error, continuing anyway:', err);
      setStep('schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    console.log('Book clicked:', { selectedTherapist, selectedDate, selectedSlot, formData });
    
    if (!selectedTherapist || !selectedDate || !selectedSlot) {
      setError('Please select a therapist, date, and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const therapist = therapists.find(t => t.id === selectedTherapist);
      
      const payload = {
        userId: null,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country || '',
        therapistId: selectedTherapist,
        therapistName: therapist?.name || 'Therapist',
        date: selectedDate,
        time: selectedSlot,
        type: 'free_consultation',
      };
      
      console.log('Sending booking payload:', payload);
      
      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      // Always show success screen first
      setBookingResult({
        date: selectedDate,
        time: selectedSlot,
        therapistName: therapist?.name,
        meetLink: data.booking?.meetLink || data.booking?.meeting_link,
        tempPassword: data.user?.tempPassword,
        email: formData.email,
        bookingId: data.booking?.id,
      });
      setStep('success');
      
      // Try to auto-login in background (optional)
      if (data.user?.tempPassword) {
        await supabase.auth.signInWithPassword({
          email: formData.email,
          password: data.user.tempPassword,
        });
      }
    } catch (err: any) {
      console.error('Booking error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle password setup
  const handlePasswordSetup = async () => {
    setPasswordError('');
    
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setSavingPassword(true);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user || !bookingResult?.email) {
        setPasswordError('Session expired. Please log in again.');
        return;
      }
      
      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (updateError) {
        setPasswordError(updateError.message);
        return;
      }
      
      // Success - redirect to dashboard
      router.push('/dashboard/client');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to set password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleGoToDashboard = () => {
    if (bookingResult?.tempPassword && !showPasswordSetup) {
      setShowPasswordSetup(true);
    } else {
      router.push('/dashboard/client');
    }
  };

  const formatTime = (time: string) => {
    const [h, m] = time.split(':');
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">
          {step === 'success' ? 'Booking Confirmed!' : 'Book Free Consultation'}
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          {step === 'details' && 'Enter your details to get started'}
          {step === 'schedule' && 'Select your preferred date and time'}
          {step === 'success' && 'Check your email for confirmation'}
        </p>
      </div>

      {/* Progress indicator */}
      {step !== 'success' && (
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded ${step === 'details' ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
          <div className={`h-1 flex-1 rounded ${step === 'schedule' ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {/* Step: Details */}
      {step === 'details' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="+971 50 000 0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={e => setFormData({ ...formData, country: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
              placeholder="UAE"
            />
          </div>

          <button
            onClick={handleDetailsSubmit}
            disabled={loading || !formData.name || !formData.email || !formData.phone}
            className={`w-full py-3 rounded-lg font-medium transition mt-4 ${
              formData.name && formData.email && formData.phone
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Continuing...' : 'Continue to Schedule'}
          </button>
        </div>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="space-y-6">
          {/* Therapist Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Therapist</label>
            <div className="space-y-2">
              {therapists.map(therapist => (
                <button
                  key={therapist.id}
                  onClick={() => setSelectedTherapist(therapist.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    selectedTherapist === therapist.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="font-medium text-slate-900">{therapist.name}</span>
                  <span className="block text-xs text-slate-500 mt-1">NeuroHolistic Specialist</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => {
                setSelectedDate(e.target.value);
                setSelectedSlot('');
              }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
              {slotsLoading ? (
                <div className="text-center py-6 text-slate-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                  Loading available times...
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-6 text-amber-600 bg-amber-50 rounded-lg">
                  No slots available for this date. Please try another day.
                </div>
              ) : (
                <>
                  <p className="text-xs text-green-600 mb-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {slots.length} time slots available
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`py-3 px-2 text-sm font-medium rounded-lg border-2 transition-all ${
                          selectedSlot === slot.time
                            ? 'border-indigo-500 bg-indigo-600 text-white'
                            : 'border-green-200 bg-green-50 text-green-800 hover:border-indigo-300 hover:bg-indigo-50'
                        }`}
                      >
                        {slot.display}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep('details')}
              className="flex-1 py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={!selectedTherapist || !selectedDate || !selectedSlot || loading}
              className={`flex-1 py-3 rounded-lg font-medium transition ${
                selectedTherapist && selectedDate && selectedSlot && !loading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Booking...
                </span>
              ) : !selectedSlot ? (
                'Select a time slot'
              ) : !selectedDate ? (
                'Select a date'
              ) : (
                'Book Now'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && bookingResult && (
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Your consultation is booked!</h3>
            <p className="text-slate-500 mt-1">{formatDate(bookingResult.date)}</p>
            <p className="text-slate-500">at {formatTime(bookingResult.time)}</p>
            <p className="text-slate-500 mt-1">with {bookingResult.therapistName}</p>
          </div>

          {bookingResult.meetLink && (
            <a href={bookingResult.meetLink} target="_blank" rel="noopener noreferrer" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              Join Google Meet
            </a>
          )}

          <a href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=NeuroHolistic+Consultation&dates=${bookingResult.date.replace(/-/g, '')}T${bookingResult.time.replace(':', '')}00/${bookingResult.date.replace(/-/g, '')}T${(parseInt(bookingResult.time.split(':')[0]) + 1).toString().padStart(2, '0') + bookingResult.time.slice(2)}00`} target="_blank" rel="noopener noreferrer" className="block w-full py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition">
            Add to Google Calendar
          </a>

          {showPasswordSetup && bookingResult.tempPassword ? (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-left">
              <p className="text-sm font-medium text-indigo-900 mb-3">Set your password to access dashboard</p>
              <div className="space-y-3">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm" placeholder="New password (min 8 chars)" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-indigo-300 rounded-lg text-sm" placeholder="Confirm password" />
                {passwordError && <p className="text-xs text-red-600">{passwordError}</p>}
                <button onClick={handlePasswordSetup} disabled={savingPassword} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50">
                  {savingPassword ? 'Saving...' : 'Save Password & Go to Dashboard'}
                </button>
              </div>
            </div>
          ) : null}

          {!showPasswordSetup && bookingResult.tempPassword && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200 text-left">
              <p className="text-sm font-medium text-indigo-900 mb-2">Your account has been created!</p>
              <p className="text-xs text-indigo-700 mb-3">Please set a password to access your dashboard.</p>
              <button onClick={handleGoToDashboard} className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
                Set Password & Go to Dashboard
              </button>
            </div>
          )}

          {/* Add to Calendar Button */}
          {bookingResult.date && bookingResult.time && (
            <button
              onClick={() => {
                const [hours, minutes] = bookingResult.time.split(':').map(Number);
                const dateParts = bookingResult.date.split('-').map(Number);
                const startDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], hours, minutes);
                const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
                
                const url = generateGoogleCalendarUrl({
                  title: `Therapy Session with ${bookingResult.therapistName || 'NeuroHolistic'}`,
                  description: `Therapy session at NeuroHolistic.\n\n${bookingResult.meetLink ? `Google Meet: ${bookingResult.meetLink}` : ''}`,
                  startDate,
                  endDate,
                  location: bookingResult.meetLink || 'Online - NeuroHolistic',
                });
                window.open(url, '_blank');
              }}
              className="w-full py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Add to Google Calendar
            </button>
          )}

          {!bookingResult.tempPassword && (
            <button onClick={() => router.push('/dashboard/client')} className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition">
              Go to Dashboard
            </button>
          )}

          <p className="text-sm text-slate-400">A confirmation email has been sent with all details.</p>

          <button onClick={onClose} className="w-full py-3 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition">
            Close
          </button>
        </div>
      )}
    </div>
  );
}
