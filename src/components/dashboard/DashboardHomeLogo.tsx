'use client';

import Link from 'next/link';
import Image from 'next/image';

/** Brand mark → landing page (`/`). Used in dashboard shells (not browser Back). */
export default function DashboardHomeLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="NeuroHolistic — Home"
      className={
        className ??
        'inline-flex shrink-0 items-center justify-center rounded-lg p-1 -ml-1 hover:bg-slate-100/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B2F55]/30'
      }
    >
      <Image
        src="/images/team/logo.svg"
        alt=""
        width={36}
        height={36}
        className="h-9 w-9"
        priority
      />
    </Link>
  );
}
