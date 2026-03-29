'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FreeConsultationForm from './FreeConsultationForm';
import { supabase } from '@/lib/supabase/client';

type BookingModalContextType = {
  openBookingModal: (type?: 'consultation' | 'program' | null) => void;
  closeBookingModal: () => void;
};

const BookingModalContext = createContext<BookingModalContextType | null>(null);

type ModalView = 'chooser' | 'consultation';

export function BookingModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('chooser');
  const [hasActiveProgram, setHasActiveProgram] = useState(false);
  const [loading, setLoading] = useState(true);

  const openBookingModal = useCallback(
    (type?: 'consultation' | 'program' | null) => {
      if (type === 'consultation') {
        setModalView('consultation');
      } else if (type === 'program') {
        router.push('/booking/paid-program-booking');
        return;
      } else {
        setModalView('chooser');
      }
      setIsOpen(true);
    },
    [router],
  );

  const closeBookingModal = useCallback(() => {
    setIsOpen(false);
    setModalView('chooser');
  }, []);

  // Fetch user state when modal opens as chooser
  useEffect(() => {
    if (!isOpen || modalView !== 'chooser') return;
    setLoading(true);
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const res = await fetch('/api/users/check-program');
          if (res.ok) {
            const data = await res.json();
            setHasActiveProgram(data.hasProgram ?? false);
          }
        } else {
          setHasActiveProgram(false);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [isOpen, modalView]);

  const handleChooseConsultation = () => setModalView('consultation');

  const handleChooseProgram = () => {
    closeBookingModal();
    router.push('/booking/paid-program-booking');
  };

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
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeBookingModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className={`relative w-full max-w-[500px] overflow-hidden rounded-3xl shadow-2xl ${
                modalView === 'consultation' ? 'bg-[#0B1028]' : 'bg-white'
              }`}
              style={{ maxHeight: '90vh' }}
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
            >
              <button
                type="button"
                onClick={closeBookingModal}
                className={`absolute right-4 top-4 z-10 rounded-lg p-2 transition-colors ${
                  modalView === 'consultation'
                    ? 'text-white/50 hover:bg-white/10 hover:text-white'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <div className="overflow-y-auto" style={{ maxHeight: '85vh' }}>
                {modalView === 'chooser' && (
                  <ChooserView
                    loading={loading}
                    hasActiveProgram={hasActiveProgram}
                    onChooseConsultation={handleChooseConsultation}
                    onChooseProgram={handleChooseProgram}
                  />
                )}
                {modalView === 'consultation' && (
                  <FreeConsultationForm mode="embedded" />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </BookingModalContext.Provider>
  );
}

/* ── Chooser View ── */
function ChooserView({
  loading,
  hasActiveProgram,
  onChooseConsultation,
  onChooseProgram,
}: {
  loading: boolean;
  hasActiveProgram: boolean;
  onChooseConsultation: () => void;
  onChooseProgram: () => void;
}) {
  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4" />
        <p className="text-slate-500 text-sm">Loading options...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-slate-900">How would you like to begin?</h2>
        <p className="text-sm text-slate-500 mt-1">Choose the path that suits you</p>
      </div>

      <div className="space-y-4">
        {/* Free Consultation — always available */}
        <button
          onClick={onChooseConsultation}
          className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-900">Free Consultation</h3>
                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[11px] font-bold rounded-full uppercase">Free</span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                A complimentary session to understand your needs and explore how we can help.
              </p>
            </div>
            <span className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-3">→</span>
          </div>
        </button>

        {/* Paid Program */}
        {!hasActiveProgram ? (
          <button
            onClick={onChooseProgram}
            className="w-full text-left p-5 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">Paid Program</h3>
                <p className="text-sm text-slate-500 mt-1">
                  View pricing for Private (1-on-1) or Group programs and choose your plan.
                </p>
              </div>
              <span className="text-slate-300 group-hover:text-indigo-500 transition-colors mt-3">→</span>
            </div>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700">
              <span className="font-medium">✓ Active program</span> — You already have an active program. Visit your dashboard to manage sessions.
            </p>
          </div>
        )}
      </div>
    </div>
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
