"use client";

import { type MouseEvent, type ReactNode } from "react";
import { useBookingModal } from "./BookingModalProvider";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export default function BookNowButton({ className = "", children, onClick }: BookNowButtonProps) {
  const { openBookingModal } = useBookingModal();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    console.log('[BOOK_NOW_BUTTON] Clicked');
    onClick?.(event);
    if (!event.defaultPrevented) {
      console.log('[BOOK_NOW_BUTTON] Opening modal');
      openBookingModal();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
