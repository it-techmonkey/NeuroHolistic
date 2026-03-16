"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";

type BookingModalContextType = {
  openBookingModal: () => void;
  closeBookingModal: () => void;
};

const BookingModalContext = createContext<BookingModalContextType | null>(null);

function VisualImage() {
  const visualSvg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 1400'>
  <defs>
    <linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#0B0F2B'/>
      <stop offset='55%' stop-color='#11174A'/>
      <stop offset='100%' stop-color='#1A2166'/>
    </linearGradient>
    <radialGradient id='haloA' cx='28%' cy='22%' r='42%'>
      <stop offset='0%' stop-color='rgba(166,166,255,0.55)'/>
      <stop offset='100%' stop-color='rgba(166,166,255,0)'/>
    </radialGradient>
    <radialGradient id='haloB' cx='78%' cy='72%' r='44%'>
      <stop offset='0%' stop-color='rgba(139,139,255,0.48)'/>
      <stop offset='100%' stop-color='rgba(139,139,255,0)'/>
    </radialGradient>
  </defs>
  <rect width='1200' height='1400' fill='url(#bg)'/>
  <ellipse cx='340' cy='280' rx='320' ry='240' fill='url(#haloA)'/>
  <ellipse cx='860' cy='980' rx='300' ry='280' fill='url(#haloB)'/>
  <circle cx='640' cy='620' r='230' fill='none' stroke='rgba(255,255,255,0.18)' stroke-width='3'/>
  <circle cx='640' cy='620' r='175' fill='none' stroke='rgba(255,255,255,0.15)' stroke-width='2.5'/>
  <circle cx='640' cy='620' r='114' fill='none' stroke='rgba(255,255,255,0.13)' stroke-width='2'/>
  <circle cx='640' cy='620' r='64' fill='rgba(198,205,255,0.65)'/>
</svg>`;

  return (
    <img
      src={`data:image/svg+xml,${encodeURIComponent(visualSvg)}`}
      alt="Neuroscience wellness visual"
      className="h-full w-full object-cover"
    />
  );
}

function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 sm:p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{ backdropFilter: "blur(8px)" }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative grid w-[min(1100px,96vw)] max-h-[92vh] overflow-y-auto lg:overflow-hidden rounded-[24px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] lg:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-modal-title"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/90 transition-opacity hover:opacity-70"
              aria-label="Close booking modal"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="order-2 bg-[#F8F9FB] p-6 sm:p-8 lg:order-1 lg:p-12">
              <h2 id="booking-modal-title" className="mb-8 text-[30px] font-semibold tracking-tight text-[#111827] sm:text-[36px]">
                Schedule a Booking
              </h2>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-[#374151]">
                    Full Name *
                  </label>
                  <input
                    id="full-name"
                    name="full-name"
                    required
                    placeholder="Enter Full Name"
                    className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#374151]">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="Enter Email"
                    className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[#374151]">
                    Phone Number *
                  </label>
                  <div className="grid grid-cols-[84px_1fr] sm:grid-cols-[96px_1fr] gap-2">
                    <select
                      aria-label="Country code"
                      className="h-[46px] rounded-[8px] border border-[#E5E7EB] bg-white px-3 text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                      defaultValue="+971"
                    >
                      <option value="+971">+971</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                    </select>
                    <input
                      id="phone"
                      name="phone"
                      required
                      placeholder="Enter Phone Number"
                      className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="preferred-date" className="mb-2 block text-sm font-medium text-[#374151]">
                      Preferred Date
                    </label>
                    <input
                      id="preferred-date"
                      name="preferred-date"
                      type="date"
                      className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                    />
                  </div>
                  <div>
                    <label htmlFor="preferred-time" className="mb-2 block text-sm font-medium text-[#374151]">
                      Preferred Time
                    </label>
                    <select
                      id="preferred-time"
                      name="preferred-time"
                      className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select Time
                      </option>
                      <option>09:00 AM</option>
                      <option>11:00 AM</option>
                      <option>01:00 PM</option>
                      <option>03:00 PM</option>
                      <option>05:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="therapist" className="mb-2 block text-sm font-medium text-[#374151]">
                    Therapist
                  </label>
                  <select
                    id="therapist"
                    name="therapist"
                    className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select Therapist
                    </option>
                    <option>Dr. Fawzia Yassmina</option>
                    <option>Mariam Al Kaisi</option>
                    <option>Noura Youssef</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="notes" className="mb-2 block text-sm font-medium text-[#374151]">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Share anything that can help us prepare your session"
                    className="h-[120px] w-full resize-none rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] py-3 text-[15px] text-[#111827] outline-none transition-colors focus:border-[#4F46E5]"
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="mt-1 h-12 w-full rounded-[8px] bg-[#2B2F55] text-[15px] font-medium text-white transition-colors hover:bg-[#1F2345]"
                >
                  Book Now
                </motion.button>
              </form>
            </div>

            <div className="order-1 relative min-h-[220px] sm:min-h-[280px] lg:order-2 lg:min-h-full">
              <VisualImage />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
              <div className="absolute bottom-0 left-0 z-10 p-5 sm:p-8 lg:p-12">
                <h3 className="max-w-[420px] text-[22px] font-semibold leading-[1.3] text-white sm:text-[28px] lg:text-[32px]">
                  Restore the System Transform Your Life.
                </h3>
                <p className="mt-2 sm:mt-3 max-w-[460px] text-[14px] sm:text-[16px] leading-relaxed text-white/85">
                  The NeuroHolistic Method™ is a science-based approach that restores balance within the human system, supporting deep, long-lasting transformation.
                </p>
              </div>
            </div>
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

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const contextValue = useMemo(
    () => ({ openBookingModal, closeBookingModal }),
    [openBookingModal, closeBookingModal]
  );

  return (
    <BookingModalContext.Provider value={contextValue}>
      {children}
      <BookingModal isOpen={isOpen} onClose={closeBookingModal} />
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const context = useContext(BookingModalContext);
  if (!context) {
    throw new Error("useBookingModal must be used within BookingModalProvider");
  }
  return context;
}
