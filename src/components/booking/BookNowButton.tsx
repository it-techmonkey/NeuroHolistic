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
    onClick?.(event);
    if (!event.defaultPrevented) {
      openBookingModal();
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
