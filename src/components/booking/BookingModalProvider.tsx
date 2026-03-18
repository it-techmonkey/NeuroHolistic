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
import { createBooking } from "@/lib/supabase/bookings";
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
      <div className="grid grid-cols-7 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={`${d}-${i}`} className="text-[10px] font-bold text-slate-300 mb-2 uppercase tracking-widest">{d}</span>
        ))}
        {blanks.map(i => <div key={`b-${i}`} />)}
        {days.map(day => (
          <button key={day} type="button" onClick={() => onSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
            className={`h-9 w-9 mx-auto flex items-center justify-center rounded-xl text-[13px] transition-all ${selectedDate?.getDate() === day && selectedDate?.getMonth() === viewDate.getMonth() ? "bg-[#2B2F55] text-white shadow-md" : "text-slate-600 hover:bg-white"}`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { formData, errors, setField, setDate, reset } = useBookingForm();

  const isStepValid = useMemo(() => {
    if (currentStep === 1) return formData.name.trim() !== "" && formData.email.includes("@");
    if (currentStep === 2) return formData.therapist !== "";
    if (currentStep === 3) return formData.date !== null && formData.time !== "";
    return true;
  }, [currentStep, formData]);

  const handleNext = () => isStepValid && currentStep < 4 && setCurrentStep(s => s + 1);
  const handleBack = () => currentStep > 1 && setCurrentStep(s => s - 1);

  const selectedTherapist = useMemo(() => THERAPISTS.find(t => t.id === formData.therapist), [formData.therapist]);
  const selectedTimeSlot = useMemo(() => TIME_SLOTS.find(s => s.value === formData.time), [formData.time]);

  // Handle final confirmation click (not form submit)
  const handleConfirmBooking = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const isoDate = formData.date?.toISOString().split('T')[0] ?? '';
      
      // Duplicate Check
      const { data: existing, error: checkErr } = await supabase
        .from("bookings")
        .select("id")
        .eq("therapist_id", formData.therapist)
        .eq("date", isoDate)
        .eq("time", formData.time)
        .maybeSingle();

      if (checkErr) throw checkErr;
      if (existing) {
        setErrorMessage("This time slot is no longer available. Please choose another.");
        setIsSubmitting(false);
        return;
      }

      // Create Booking
      await createBooking({
        name: formData.name,
        email: formData.email,
        therapist_id: formData.therapist,
        therapist_name: selectedTherapist?.name || 'Unknown',
        date: isoDate,
        time: formData.time,
      });

      // Advance to Success Page
      setCurrentStep(5);

      // Send confirmation email (non-blocking, fire-and-forget)
      sendBookingConfirmationEmail({
        name: formData.name,
        email: formData.email,
        therapistName: selectedTherapist?.name || 'Unknown',
        date: isoDate,
        time: formData.time,
        // Optionally add meetingLink when available
        meetingLink: undefined,
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'An error occurred during booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form submission (no longer needed, but kept for structure)
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const handleClose = () => {
    reset();
    setCurrentStep(1);
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={handleClose} />

          <motion.div 
            className="relative flex w-full max-w-[1000px] h-[90vh] max-h-[720px] overflow-hidden rounded-[40px] bg-white shadow-2xl lg:grid lg:grid-cols-[1fr_1.2fr]" 
            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
          >
            {/* Form Column - Sandwich layout ensures fixed header/footer and scrollable middle */}
            <div className="flex flex-col h-full bg-white overflow-hidden min-h-0">
              
              {/* Header */}
              <header className="px-8 pt-10 pb-4 shrink-0">
                <h2 className="text-2xl font-semibold text-slate-800 tracking-tight sm:text-3xl">Schedule Booking</h2>
                {currentStep < 5 && (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div className="h-full bg-[#2B2F55]" animate={{ width: `${(currentStep / 4) * 100}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Step {currentStep}/4</span>
                  </div>
                )}
              </header>

              {/* Scrollable Middle */}
              <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar min-h-0">
                <AnimatePresence mode="wait">
                  <motion.div key={currentStep} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                    
                    {currentStep === 1 && (
                      <div className="space-y-4">
                        <p className="text-slate-500 text-sm">Please provide your details to get started.</p>
                        <div className="space-y-4">
                          <input type="text" value={formData.name} onChange={(e) => setField("name", e.target.value)} placeholder="Full Name" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                          <input type="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} placeholder="Email Address" className="w-full rounded-2xl bg-slate-50 px-5 py-4 text-slate-800 outline-none ring-1 ring-slate-100 focus:ring-2 focus:ring-[#2B2F55]/20 transition-all" />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
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

                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <CalendarPicker selectedDate={formData.date} onSelect={setDate} />
                        <div className="grid grid-cols-3 gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button key={slot.id} type="button" onClick={() => setField("time", slot.value)} className={`py-3 rounded-2xl text-[12px] font-semibold transition-all ${formData.time === slot.value ? "bg-[#2B2F55] text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>{slot.display}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="rounded-3xl bg-slate-50 p-8 space-y-4">
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Practitioner</span><span className="font-bold text-slate-700">{selectedTherapist?.name}</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Time</span><span className="font-bold text-slate-700">{selectedTimeSlot?.display}</span></div>
                          <div className="flex justify-between items-center text-sm"><span className="text-slate-400 font-medium">Date</span><span className="font-bold text-slate-700">{formData.date?.toLocaleDateString()}</span></div>
                        </div>
                        <p className="text-[11px] text-center text-slate-400">Review your information. Once you click "Confirm Booking", we'll secure your session.</p>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className="flex flex-col items-center py-12 text-center">
                        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500"><svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                        <h3 className="text-2xl font-bold text-slate-800">Booking Confirmed</h3>
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
                    {currentStep < 5 ? (
                      <>
                        {currentStep > 1 && (
                          <button type="button" onClick={handleBack} className="h-14 px-8 font-semibold text-slate-400 hover:text-slate-800 transition-colors">
                            Back
                          </button>
                        )}
                        <button 
                          type="button"
                          onClick={currentStep === 4 ? handleConfirmBooking : (currentStep < 4 ? handleNext : undefined)} 
                          disabled={!isStepValid || isSubmitting}
                          className={`h-14 flex-1 rounded-[22px] font-bold text-white transition-all active:scale-[0.98] ${isStepValid ? "bg-[#2B2F55] shadow-lg shadow-[#2B2F55]/20 hover:opacity-95" : "bg-slate-100 text-slate-300"}`}
                        >
                          {isSubmitting ? "Processing..." : currentStep === 4 ? "Confirm Booking" : "Continue"}
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