"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBookingForm } from "./hooks/useBookingForm";
import { THERAPISTS, TIME_SLOTS } from "./constants";
import { createBooking, type BookingError } from "@/lib/supabase/bookings-with-programs";
import { sendBookingConfirmationEmail } from "@/lib/email/send-booking-email";
import { supabase } from "@/lib/supabase/client";

type BookingModalContextType = {
  openBookingModal: () => void;
  closeBookingModal: () => void;
};

const BookingModalContext = createContext<BookingModalContextType | null>(null);

const THERAPIST_IMAGE_MAP: Record<string, string> = {
  "dr-fawzia-yassmina": "/images/team/Fawzia%20Yassmina.jpeg",
  "mariam-al-kaisi": "/images/team/Mariam%20Al%20Kaissi.jpeg",
  "noura-youssef": "/images/team/Noura%20Yousef.jpeg",
  "reem-mobayed": "/images/team/Reem%20Mbayed.jpeg",
  "fawares-azaar": "/images/team/Fawares%20Azaar.jpeg",
  "joud-charafeddin": "/images/team/Joud%20Charafeddin.jpeg",
};

function CalendarPicker({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-semibold text-slate-800">
          {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
        </span>
        <div className="flex gap-1">
          <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className="p-2 text-slate-400 hover:text-slate-800 transition-colors">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-1 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-[11px] font-bold text-slate-400 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {blanks.map((i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelect(date)}
              className={`py-2 text-[12px] font-bold rounded-lg transition-all ${
                isSelected
                  ? "bg-[#2B2F55] text-white"
                  : isToday
                  ? "bg-slate-100 text-slate-800"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { formData, errors, setField, setDate, validate, reset } = useBookingForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasActiveProgram, setHasActiveProgram] = useState(false);
  const [hasHadConsultation, setHasHadConsultation] = useState(false);
  const [isCheckingProgram, setIsCheckingProgram] = useState(false);
  const [isCheckingConsultation, setIsCheckingConsultation] = useState(false);

  const selectedTherapist = THERAPISTS.find((t) => t.id === formData.therapist);
  const selectedTimeSlot = TIME_SLOTS.find((t) => t.value === formData.time);

  // Determine total steps based on booking type
  const getTotalSteps = () => {
    if (formData.bookingType === 'consultation') return 6; // personal → type → therapist → date/time → confirm → success
    if (formData.bookingType === 'program') {
      return hasActiveProgram ? 6 : 7; // personal → type → [if no program: payment] → date/time → confirm → success
    }
    return 6; // default
  };

  const totalSteps = getTotalSteps();

  const handleNext = async () => {
    // Step 1: Personal info - validate and move to type selection
    if (currentStep === 1) {
      if (!formData.name || !formData.email || !formData.phone || !formData.country) {
        setErrorMessage("Please fill in all fields");
        return;
      }
      // Check consultation history when moving from step 1
      setIsCheckingConsultation(true);
      try {
        const res = await fetch('/api/users/check-consultation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email }),
        });
        if (res.ok) {
          const data = await res.json();
          const alreadyHad = data.hasHadConsultation ?? false;
          setHasHadConsultation(alreadyHad);
          // If they've had a consultation, force booking type to program
          if (alreadyHad) {
            setField('bookingType', 'program');
          }
        }
      } catch {
        // Non-fatal: default to allowing consultation option
      } finally {
        setIsCheckingConsultation(false);
      }
      setCurrentStep(2);
      setErrorMessage(null);
      return;
    }

    // Step 2: Type selection - validate and check program status if program
    if (currentStep === 2) {
      if (!formData.bookingType) {
        setErrorMessage("Please select a booking type");
        return;
      }
      
      if (formData.bookingType === 'program') {
        await checkUserProgram();
      }
      
      setCurrentStep(3);
      setErrorMessage(null);
      return;
    }

    // Step 3: Therapist selection (consultation) or Payment info (program without active)
    if (currentStep === 3) {
      if (formData.bookingType === 'consultation' && !formData.therapist) {
        setErrorMessage("Please select a therapist");
        return;
      }
      setCurrentStep(4);
      setErrorMessage(null);
      return;
    }

    // Step 4: Date & Time selection
    if (currentStep === 4) {
      if (!formData.date || !formData.time) {
        setErrorMessage("Please select date and time");
        return;
      }
      setCurrentStep(5);
      setErrorMessage(null);
      return;
    }

    // Step 5: Confirmation
    if (currentStep === 5) {
      setCurrentStep(6);
      setErrorMessage(null);
    }
  };

  const checkUserProgram = async () => {
    setIsCheckingProgram(true);
    try {
      const response = await fetch('/api/users/check-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setHasActiveProgram(data.hasActiveProgram ?? false);
      }
    } catch (error) {
      console.error('Error checking program:', error);
      setHasActiveProgram(false);
    } finally {
      setIsCheckingProgram(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
    setErrorMessage(null);
  };

  const handleConfirmBooking = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isoDate = formData.date?.toISOString().split('T')[0] ?? '';

      // Duplicate Check for consultation bookings (time slot specific)
      if (formData.bookingType === 'consultation') {
        const { data: existingSlot } = await supabase
          .from("bookings")
          .select("id")
          .eq("therapist_id", formData.therapist)
          .eq("date", isoDate)
          .eq("time", formData.time)
          .maybeSingle();

        if (existingSlot) {
          setErrorMessage("This time slot is no longer available. Please choose another.");
          setIsSubmitting(false);
          return;
        }
      }

      // Create Booking with correct type
      await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        therapist_id: formData.bookingType === 'consultation' ? formData.therapist : '',
        therapist_name: formData.bookingType === 'consultation' ? (selectedTherapist?.name || 'Unknown') : 'Program',
        date: isoDate,
        time: formData.time,
        type: formData.bookingType as 'consultation' | 'program',
      });

      // Advance to Success Page
      setCurrentStep(totalSteps);

      // Send confirmation email
      sendBookingConfirmationEmail({
        name: formData.name,
        email: formData.email,
        therapistName: formData.bookingType === 'consultation' ? (selectedTherapist?.name || 'Unknown') : 'Program Session',
        date: isoDate,
        time: formData.time,
        meetingLink: undefined,
      });
    } catch (error: any) {
      let displayMessage = 'An error occurred during booking. Please try again.';

      if (error && typeof error === 'object' && 'userMessage' in error) {
        displayMessage = error.userMessage;
      } else if (error instanceof Error) {
        displayMessage = error.message;
      }

      setErrorMessage(displayMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInitiatePayment = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          phoneNumber: formData.phone,
          amount: 'full',
          metadata: {
            bookingEmail: formData.email,
            bookingType: 'program-purchase',
          },
        }),
      });

      if (!response.ok) throw new Error('Payment creation failed');

      const { checkoutUrl } = await response.json();
      window.location.href = checkoutUrl;
    } catch (error: any) {
      let displayMessage = 'Payment initiation failed. Please try again.';
      if (error instanceof Error) {
        displayMessage = error.message;
      }
      setErrorMessage(displayMessage);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    setErrorMessage(null);
    setHasActiveProgram(false);
    setHasHadConsultation(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleClose} />

          <motion.div
            className="relative flex w-full max-w-[1000px] h-[90vh] max-h-[720px] overflow-hidden rounded-[40px] bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_1.2fr]"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
          >
            {/* Form Column */}
            <div className="flex flex-col h-full bg-white overflow-hidden min-h-0">

              {/* Header */}
              <header className="px-8 pt-10 pb-4 shrink-0">
                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight sm:text-3xl">Schedule Booking</h2>
                {currentStep < totalSteps && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className="h-full bg-[#2B2F55]" animate={{ width: `${(currentStep / totalSteps) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Step {currentStep}/{totalSteps}</span>
                  </div>
                )}
              </header>

              {/* Scrollable Middle */}
              <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>

                    {/* STEP 1: Personal Information */}
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">Please provide your details to get started.</p>
                        <div className="space-y-4">
                          <input type="text" value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full Name" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                          <input type="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} placeholder="Email Address" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                          <input type="tel" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Phone Number" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                          <input type="text" value={formData.country} onChange={(e) => setField("country", e.target.value)} placeholder="Country of Residency" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                        </div>
                      </div>
                    )}

                    {/* STEP 2: Booking Type Selection */}
                    {currentStep === 2 && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">
                          {hasHadConsultation
                            ? 'Your free consultation has already been used. Please book a program session.'
                            : 'What would you like to book?'}
                        </p>
                        <div className="grid grid-cols-1 gap-3">
                          {/* Only show consultation option if client hasn't had one yet */}
                          {!hasHadConsultation && (
                            <button
                              type="button"
                              onClick={() => setField("bookingType", "consultation")}
                              className={`flex flex-col items-start justify-start gap-3 rounded-2xl p-5 border-2 transition-all ${
                                formData.bookingType === "consultation"
                                  ? "border-[#2B2F55] bg-[#2B2F55]/5"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <h3 className={`font-bold ${formData.bookingType === "consultation" ? "text-[#2B2F55]" : "text-slate-800"}`}>
                                  Consultation Booking
                                </h3>
                                {formData.bookingType === "consultation" && (
                                  <div className="h-5 w-5 rounded-full bg-[#2B2F55] flex items-center justify-center">
                                    <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <p className="text-slate-500 text-sm">Single complimentary session with a therapist of your choice</p>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setField("bookingType", "program")}
                            className={`flex flex-col items-start justify-start gap-3 rounded-2xl p-5 border-2 transition-all ${
                              formData.bookingType === "program"
                                ? "border-[#2B2F55] bg-[#2B2F55]/5"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <h3 className={`font-bold ${formData.bookingType === "program" ? "text-[#2B2F55]" : "text-slate-800"}`}>
                                Program Session
                              </h3>
                              {formData.bookingType === "program" && (
                                <div className="h-5 w-5 rounded-full bg-[#2B2F55] flex items-center justify-center">
                                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-slate-500 text-sm">
                              {hasActiveProgram ? "Book a session as part of your program" : "Buy a program or book per-session"}
                            </p>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Therapist Selection (Consultation only) */}
                    {currentStep === 3 && formData.bookingType === 'consultation' && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">Who would you like to book a session with?</p>
                        <div className="grid grid-cols-1 gap-3">
                          {THERAPISTS.map((t) => (
                            <button key={t.id} type="button" onClick={() => setField("therapist", t.id)}
                              className={`flex items-center gap-4 rounded-2xl p-4 border transition-all ${formData.therapist === t.id ? "bg-[#2B2F55] border-[#2B2F55] text-white shadow-lg" : "bg-white border-slate-100 hover:border-slate-200"}`}
                            >
                              <img src={THERAPIST_IMAGE_MAP[t.id]} className="h-12 w-12 rounded-2xl object-cover" alt={t.name} />
                              <div className="text-left">
                                <p className={`text-[14px] font-bold ${formData.therapist === t.id ? "text-white" : "text-slate-800"}`}>{t.name}</p>
                                <p className={`text-[12px] ${formData.therapist === t.id ? "text-white/70" : "text-slate-400"}`}>{t.role}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Program Payment Info (Program without active program) */}
                    {currentStep === 3 && formData.bookingType === 'program' && !hasActiveProgram && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">You don't have an active program. Let's get you set up!</p>
                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
                          <p className="text-sm text-blue-900 font-medium">Next: Payment Options</p>
                          <p className="text-xs text-blue-700 mt-1">Choose between a full program or pay-per-session option</p>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: Date & Time Selection (Consultation or Program with active) */}
                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <CalendarPicker selectedDate={formData.date} onSelect={setDate} />
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button key={slot.id} type="button" onClick={() => setField("time", slot.value)} className={`py-3 rounded-2xl text-[12px] font-semibold transition-all ${formData.time === slot.value ? "bg-[#2B2F55] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{slot.display}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* STEP 5: Confirmation */}
                    {currentStep === 5 && (
                      <div className="space-y-6">
                        <div className="rounded-3xl bg-slate-50 p-8 space-y-4">
                          {formData.bookingType === 'consultation' && (
                            <div>
                              <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Practitioner</span><span className="font-bold text-slate-700">{selectedTherapist?.name}</span></div>
                              <div className="border-t border-slate-200 my-3" />
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Type</span><span className="font-bold text-slate-700 capitalize">{formData.bookingType} Session</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Date</span><span className="font-bold text-slate-700">{formData.date?.toLocaleDateString()}</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Time</span><span className="font-bold text-slate-700">{selectedTimeSlot?.display}</span></div>
                        </div>
                        <p className="text-[11px] text-center text-slate-400">Review your information. Once you click "Confirm Booking", we'll secure your session.</p>
                      </div>
                    )}

                    {/* Success Screen */}
                    {currentStep === totalSteps && (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500"><svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          {formData.bookingType === 'consultation' ? 'Booking Confirmed' : 'Session Booked'}
                        </h3>
                        <p className="mt-2 text-slate-500">We've sent a confirmation email to {formData.email}.</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer */}
              <footer className="px-8 py-8 border-t border-slate-50 bg-white shrink-0">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-3">
                    {currentStep < totalSteps ? (
                      <>
                        {currentStep > 1 && (
                          <button type="button" onClick={handleBack} className="h-14 px-8 font-semibold text-slate-400 hover:text-slate-800 transition-colors">
                            Back
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={
                            currentStep === 5
                              ? handleConfirmBooking
                              : handleNext
                          }
                          disabled={isSubmitting || isCheckingProgram || isCheckingConsultation}
                          className={`h-14 flex-1 rounded-[22px] font-bold text-white transition-all active:scale-[0.98] ${
                            isSubmitting || isCheckingProgram || isCheckingConsultation
                              ? "bg-slate-100 text-slate-300"
                              : "bg-[#2B2F55] shadow-lg shadow-[#2B2F55]/20 hover:opacity-95"
                          }`}
                        >
                          {isSubmitting ? "Processing..." : isCheckingProgram || isCheckingConsultation ? "Checking..." : currentStep === 5 ? "Confirm Booking" : "Continue"}
                        </button>
                      </>
                    ) : (
                      <button type="button" onClick={handleClose} className="h-14 w-full rounded-[22px] bg-[#2B2F55] font-bold text-white shadow-lg">Done</button>
                    )}
                  </div>
                  {errorMessage && <p className="mt-4 text-center text-[13px] font-bold text-red-500">{errorMessage}</p>}
                </form>
              </footer>
            </div>

            {/* Visual Panel */}
            <div className="relative hidden lg:block overflow-hidden">
              <img src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=1400&q=80" className="h-full w-full object-cover grayscale-[0.2]" alt="Wellness" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
              <div className="absolute bottom-16 left-12 right-12 text-white">
                <h3 className="text-3xl font-light leading-snug">Restore the System. <br /><span className="font-semibold">Transform Your Life.</span></h3>
              </div>
            </div>

            <button onClick={handleClose} className="absolute right-6 top-8 z-50 p-2 text-slate-300 hover:text-slate-600 lg:hidden">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const openBookingModal = useCallback(() => setIsOpen(true), []);
  const closeBookingModal = useCallback(() => setIsOpen(false), []);
  const contextValue = useMemo(() => ({ openBookingModal, closeBookingModal }), [openBookingModal, closeBookingModal]);

  return (
    <BookingModalContext.Provider value={contextValue}>
      {children}
      <BookingModal isOpen={isOpen} onClose={closeBookingModal} />
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) throw new Error("useBookingModal must be used within BookingModalProvider");
  return context;
}
