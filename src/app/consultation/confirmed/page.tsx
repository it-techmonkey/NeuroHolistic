'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface BookingDetails {
  name: string;
  email: string;
  therapistName: string;
  date: string;
  time: string;
  meetingLink: string;
}

function formatDisplayDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDisplayTime(time: string): string {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function ConsultationConfirmedPage() {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('consultation_booking');
    if (!stored) {
      router.replace('/consultation');
      return;
    }
    setBooking(JSON.parse(stored));
    // We keep the data for this view, but could clear it on unmount if needed
  }, [router]);

  async function copyLink() {
    if (!booking?.meetingLink) return;
    await navigator.clipboard.writeText(booking.meetingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!booking) return null;

  const labelClass = "text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-1 block";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-[#2B2F55] selection:text-white flex items-center justify-center py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[540px] text-center"
      >
        {/* Success Protocol Header */}
        <header className="mb-12">
          <div className="w-12 h-12 bg-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 block mb-4">Protocol Confirmed</span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Appointment Secured.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-500 font-light max-w-sm mx-auto">
            A confirmation of this schedule has been dispatched to <span className="text-slate-900 font-medium">{booking.email}</span>.
          </p>
        </header>

        {/* The Digital Receipt / Details Card */}
        <div className="border-y border-slate-100 py-10 mb-12 space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <span className={labelClass}>Practitioner</span>
              <p className="text-[15px] font-semibold text-slate-900">{booking.therapistName}</p>
            </div>
            <div>
              <span className={labelClass}>Status</span>
              <p className="text-[13px] font-bold text-emerald-600 uppercase tracking-wider">Verified</p>
            </div>
            <div className="md:col-span-2">
              <span className={labelClass}>Scheduled Timing (UAE)</span>
              <p className="text-[15px] font-medium text-slate-900">
                {formatDisplayDate(booking.date)} <span className="text-slate-400 mx-2">|</span> {formatDisplayTime(booking.time)}
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50">
            <span className={labelClass}>Virtual Consultation Room</span>
            <div className="mt-3 flex items-center gap-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2B2F55] text-[13px] font-medium flex-1 truncate hover:underline"
              >
                {booking.meetingLink}
              </a>
              <button
                onClick={copyLink}
                className="text-slate-400 hover:text-slate-900 transition-colors"
                title="Copy Link"
              >
                {copied ? (
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Copied</span>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* System Actions */}
        <div className="space-y-4">
          <a
            href={booking.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-4 rounded-full bg-[#2B2F55] text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Enter Meeting Room
          </a>
          <Link
            href="/programs"
            className="block w-full text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors py-2"
          >
            Explore Framework Methodologies
          </Link>
        </div>

        {/* Footer Identifier */}
        <footer className="mt-16 text-[10px] uppercase tracking-widest text-slate-300 font-medium">
          NeuroHolistic Institute // Institutional Records
        </footer>
      </motion.div>
    </div>
  );
}