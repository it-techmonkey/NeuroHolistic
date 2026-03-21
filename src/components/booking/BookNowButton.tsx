"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode } from "react";
import { useAuth } from "@/lib/auth/context";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  href?: string;
};

/**
 * BookNowButton — navigates to consultation or paid program booking.
 * If authenticated and has used free consultation, goes to /booking/payment-options
 * Otherwise goes to /consultation for free consultation
 */
export default function BookNowButton({ className = "", children, onClick, href = "/consultation" }: BookNowButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      // If authenticated and going to paid program, redirect to login with next param
      if (isAuthenticated) {
        router.push(href);
      } else if (href !== "/consultation") {
        // If not authenticated but trying to go to paid program, redirect to login with next param
        router.push(`/auth/login?next=${encodeURIComponent(href)}`);
      } else {
        router.push("/consultation");
      }
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
