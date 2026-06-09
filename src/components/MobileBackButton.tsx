'use client';

import Link from 'next/link';
import { useLang } from '@/lib/translations/LanguageContext';

interface MobileBackButtonProps {
  href: string;
  label: string;
  className?: string;
}

export default function MobileBackButton({ href, label, className = '' }: MobileBackButtonProps) {
  const { isArabic } = useLang();

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-[#6366F1] hover:bg-[#6366F1]/5 transition-all duration-200 touch-target md:hidden ${isArabic ? 'flex-row-reverse' : ''} ${className}`}
    >
      <svg
        className={`w-4 h-4 ${isArabic ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
