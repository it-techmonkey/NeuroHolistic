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

// --- Original Styled Calendar Component ---
function CalendarPicker({ selectedDate, onSelect }: { selectedDate: Date | null; onSelect: (date: Date) => void }) {
  const [viewDate, setViewDate] = useState(new Date());
  
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });
  const year = viewDate.getFullYear();

  const isSelected = (day: number) => 
    selectedDate?.getDate() === day && 
    selectedDate?.getMonth() === viewDate.getMonth() && 
    selectedDate?.getFullYear() === viewDate.getFullYear();

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-4">
      <div className="mb-4 flex items-center justify-between border-b border-[#F3F4F6] pb-3">
        <span className="text-[15px] font-semibold text-[#111827]">
          {monthName} {year}
        </span>
        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))}
            className="p-1 text-[#6B7280] hover:text-[#111827]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button 
            type="button" 
            onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))}
            className="p-1 text-[#6B7280] hover:text-[#111827]"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <span key={d} className="text-[12px] font-medium text-[#9CA3AF] mb-2">{d}</span>
        ))}
        {blanks.map(i => <div key={`b-${i}`} />)}
        {days.map(day => (
          <button
            key={day}
            type="button"
            onClick={() => onSelect(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
            className={`m-0.5 rounded-full py-2 text-[13px] transition-colors ${
              isSelected(day) 
                ? "bg-[#2B2F55] text-white" 
                : "text-[#374151] hover:bg-[#F3F4F6]"
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}

function VisualImage() {
  return (
    <img
      src="https://images.unsplash.com/photo-1545389336-cf090694435e?w=1400&q=80"
      alt="Neuroscience wellness visual"
      className="h-full w-full object-cover"
    />
  );
}

function BookingModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
          style={{ backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative grid w-[min(1100px,96vw)] max-h-[92vh] overflow-y-auto lg:overflow-hidden rounded-[24px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)] lg:grid-cols-2"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-20 rounded-full p-2 text-white/90 transition-opacity hover:opacity-70"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
              </svg>
            </button>

            <div className="order-2 bg-[#F8F9FB] p-6 sm:p-8 lg:order-1 lg:p-12">
              <h2 className="mb-8 text-[30px] font-semibold tracking-tight text-[#111827] sm:text-[36px]">
                Schedule a Booking
              </h2>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Full Name *</label>
                    <input required placeholder="Enter Full Name" className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] outline-none focus:border-[#4F46E5]" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Email *</label>
                    <input required type="email" placeholder="Enter Email" className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] outline-none focus:border-[#4F46E5]" />
                  </div>
                </div>

                {/* Calendar Integrated with Original Style */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#374151]">Select Date *</label>
                  <CalendarPicker selectedDate={selectedDate} onSelect={setSelectedDate} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Preferred Time</label>
                    <select defaultValue="" className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] outline-none focus:border-[#4F46E5]">
                      <option value="" disabled>Select Time</option>
                      <option>09:00 AM</option>
                      <option>11:00 AM</option>
                      <option>02:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-[#374151]">Therapist</label>
                    <select defaultValue="" className="h-[46px] w-full rounded-[8px] border border-[#E5E7EB] bg-white px-[14px] text-[15px] outline-none focus:border-[#4F46E5]">
                      <option value="" disabled>Select Therapist</option>
                      <option>Dr. Fawzia Yassmina</option>
                      <option>Mariam Al Kaisi</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ y: -1 }}
                  className="mt-2 h-12 w-full rounded-[8px] bg-[#2B2F55] text-[15px] font-medium text-white hover:bg-[#1F2345]"
                >
                  Confirm Booking
                </motion.button>
              </form>
            </div>

            <div className="order-1 relative min-h-[220px] lg:order-2 lg:min-h-full">
              <VisualImage />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/70" />
              <div className="absolute bottom-0 left-0 z-10 p-5 sm:p-8 lg:p-12">
                <h3 className="max-w-[420px] text-[22px] font-semibold leading-[1.3] text-white sm:text-[28px] lg:text-[32px]">
                  Restore the System. <br/>Transform Your Life.
                </h3>
                <p className="mt-2 sm:mt-3 max-w-[460px] text-[14px] sm:text-[16px] leading-relaxed text-white/85">
                  The NeuroHolistic Method™ is a science-based approach that restores balance within the human system.
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