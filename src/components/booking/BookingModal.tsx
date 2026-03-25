'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BookingForm from './BookingForm';

type BookingModalContextType = {
  openBookingModal: (type?: 'consultation' | 'program' | null) => void;
  closeBookingModal: () => void;
};

const BookingModalContext = createContext<BookingModalContextType | null>(null);

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'consultation' | 'program' | null>(null);

  const openBookingModal = useCallback(
    (type?: 'consultation' | 'program' | null) => {
      setBookingType(type ?? 'consultation');
      setIsOpen(true);
    },
    [],
  );

  const closeBookingModal = useCallback(() => {
    setIsOpen(false);
    setBookingType(null);
  }, []);

  const value = useMemo(
    () => ({ openBookingModal, closeBookingModal }),
    [openBookingModal, closeBookingModal],
  );

  return (
    <BookingModalContext.Provider value={value}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeBookingModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* panel */}
            <motion.div
              className="relative w-full max-w-[500px] overflow-hidden rounded-3xl bg-white shadow-2xl"
              style={{ maxHeight: '90vh' }}
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            >
              <button
                type="button"
                onClick={closeBookingModal}
                className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <div className="overflow-y-auto" style={{ maxHeight: '85vh' }}>
                <BookingForm
                  onClose={closeBookingModal}
                  bookingType={bookingType}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingModalContext.Provider>
  );
}

export function useBookingModal() {
  const ctx = useContext(BookingModalContext);
  if (!ctx) {
    throw new Error('useBookingModal must be used within BookingModalProvider');
  }
  return ctx;
}

export function useBookingModalSafe(): BookingModalContextType | null {
  return useContext(BookingModalContext);
}
