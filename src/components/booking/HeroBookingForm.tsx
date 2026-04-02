'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FreeConsultationForm from './FreeConsultationForm';
import { useLang } from '@/lib/translations/LanguageContext';

export default function HeroBookingForm() {
  const { t, isUrdu } = useLang();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Open Modal Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="mt-10 flex items-center justify-center lg:justify-start gap-3"
      >
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-white px-7 py-4 text-[15px] font-semibold text-[#0B0F2B] transition-all duration-300 hover:shadow-[0_12px_28px_rgba(161,184,255,0.2)] hover:bg-[#F3F6FF] active:scale-95"
        >
          {t.heroBookingForm.bookConsultation} <span aria-hidden="true">{isUrdu ? '←' : '→'}</span>
        </button>
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

              <FreeConsultationForm mode="embedded" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
