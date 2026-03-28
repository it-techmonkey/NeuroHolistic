"use client";

import { useRouter } from "next/navigation";
import { type MouseEvent, type ReactNode } from "react";
import { useBookingModalSafe } from "./BookingModal";

type BookNowButtonProps = {
  className?: string;
  children: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  bookingType?: "consultation" | "program" | null;
};

export default function BookNowButton({
  className = "",
  children,
  onClick,
  bookingType = null,
}: BookNowButtonProps) {
  const router = useRouter();
  const modal = useBookingModalSafe();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (modal) {
      // Open the booking modal directly on the page
      modal.openBookingModal(bookingType);
    } else {
      // Fallback: navigate to booking page
      if (bookingType === "program") {
        router.push("/booking/paid-program-booking");
      } else {
        router.push("/consultation/book");
      }
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children}
    </button>
  );
}
