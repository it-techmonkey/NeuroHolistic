'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function AuthGoBackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }}
      className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-colors self-start"
    >
      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden />
      Go Back
    </button>
  );
}
