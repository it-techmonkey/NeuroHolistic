'use client';

import { useState } from 'react';
import Link from 'next/link';

const FULL_PROGRAM_AED = 7700;
const PER_SESSION_AED = 800;

interface PaymentButtonsProps {
  userEmail: string;
  userName: string;
}

export default function PaymentButtons({ userEmail, userName }: PaymentButtonsProps) {
  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg text-center">
        <p className="text-indigo-800 text-sm font-medium">
          Payment integration is currently in progress.
        </p>
        <p className="text-indigo-600 text-xs mt-1">
          You will be notified when online payments are available.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Option 1 — Full Program */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 flex flex-col relative overflow-hidden opacity-75">
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-300" />
          <div className="mb-1">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
              Best Value
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-700 mt-3 mb-2">Full Program Payment</h2>
          <p className="text-slate-400 text-sm mb-6 flex-1">
            Book the full program of 10 sessions and pay in advance. Get the complete
            transformation journey at the best rate.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-500">7,700</span>
            <span className="text-slate-400 text-base ml-1">AED</span>
            <p className="text-slate-400 text-sm mt-1">10 sessions · 770 AED / session</p>
          </div>
          <button
            disabled
            className="w-full py-3.5 rounded-xl bg-slate-300 text-slate-500 font-semibold text-[15px] cursor-not-allowed transition-all"
          >
            Coming Soon
          </button>
        </div>

        {/* Option 2 — Per Session */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-8 flex flex-col opacity-75">
          <div className="mb-1">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-wider">
              Flexible
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-700 mt-3 mb-2">Pay Session by Session</h2>
          <p className="text-slate-400 text-sm mb-6 flex-1">
            Book and pay one session at a time. Flexibility to continue at your own pace
            without a full commitment upfront.
          </p>
          <div className="mb-6">
            <span className="text-4xl font-bold text-slate-500">800</span>
            <span className="text-slate-400 text-base ml-1">AED</span>
            <p className="text-slate-400 text-sm mt-1">per session</p>
          </div>
          <button
            disabled
            className="w-full py-3.5 rounded-xl border-2 border-slate-300 text-slate-500 font-semibold text-[15px] cursor-not-allowed transition-all"
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Notify Me / Contact */}
      <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
        <p className="text-slate-600 text-sm leading-relaxed mb-4">
          <strong className="text-slate-800">Interested in the program?</strong>{' '}
          Payment integration is coming soon. In the meantime, you can proceed with a free consultation.
        </p>
        <Link
          href="/consultation/book"
          className="inline-block px-6 py-3 bg-[#2B2F55] text-white rounded-lg font-medium text-sm hover:bg-[#1E2140] transition-colors"
        >
          Book Free Consultation
        </Link>
      </div>
    </div>
  );
}
