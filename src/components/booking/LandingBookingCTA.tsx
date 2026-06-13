"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useLang } from "@/lib/translations/LanguageContext";

type EligibilityResult = {
  canBookConsultation: boolean;
  hasActiveProgram: boolean;
  canBookProgramSessions: boolean;
  programId: string | null;
  remainingSessions: number;
  programPaymentType: 'full_program' | 'single_session' | null;
  assignedTherapist: {
    slug: string;
    name: string;
    userId: string | null;
  } | null;
  consultationStatus: 'none' | 'scheduled' | 'pending' | 'completed' | 'cancelled' | 'confirmed';
  role: 'client' | 'therapist' | 'admin' | null;
};

type LandingBookingCTAProps = {
  primaryClassName: string;
  secondaryClassName?: string;
  containerClassName?: string;
  dashboardLabel?: string;
  signupLabel?: string;
};

export default function LandingBookingCTA({
  primaryClassName,
  secondaryClassName = "",
  containerClassName = "",
  dashboardLabel,
  signupLabel,
}: LandingBookingCTAProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLang();
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const dashboardLabelText = dashboardLabel ?? t.consultationForm.goToDashboard;
  const signupLabelText = signupLabel ?? t.finalCTA.signUpNow;
  const bookPaidProgramLabel = t.finalCTA.bookPaidProgram;
  const bookFreeConsultationLabel = t.consultationForm.bookFreeConsultation;

  useEffect(() => {
    if (!isAuthenticated || !user?.email) {
      setEligibility(null);
      setEligibilityLoading(false);
      return;
    }

    let cancelled = false;
    setEligibilityLoading(true);

    fetch(`/api/bookings/eligibility?email=${encodeURIComponent(user.email)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load booking eligibility");
        }
        return response.json();
      })
      .then((data: EligibilityResult) => {
        if (!cancelled) {
          setEligibility(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEligibility(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEligibilityLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.email]);

  if (isLoading || (isAuthenticated && eligibilityLoading)) {
    return (
      <div className={containerClassName}>
        <button type="button" disabled className={primaryClassName}>
          {t.consultationForm.loadingTimes}
        </button>
      </div>
    );
  }


  // Role-based routing for therapists and admins
  if (eligibility?.role === 'therapist' && isAuthenticated) {
    return (
      <div className={containerClassName}>
        <a href="/dashboard/therapist" className={`${primaryClassName} group`}>
          {dashboardLabelText}
        </a>
      </div>
    );
  }

  if (eligibility?.role === 'admin') {
    return (
      <div className={containerClassName}>
        <a href="/dashboard/admin" className={`${primaryClassName} group`}>
          {dashboardLabelText}
        </a>
      </div>
    );
  }

  // Client logic
  // 1. Has active paid program -> Go to Dashboard
  if (eligibility?.hasActiveProgram) {
    return (
      <div className={containerClassName}>
        <a href="/dashboard/client" className={`${primaryClassName} group`}>
          {dashboardLabelText}
        </a>
      </div>
    );
  }

  // 2. No active program -> Book Paid Program directly; consultation remains optional.
  if (isAuthenticated && eligibility && !eligibility.hasActiveProgram) {
    return (
      <div className={containerClassName}>
        <a href="/booking/paid-program-booking" className={`${primaryClassName} group`}>
          {bookPaidProgramLabel}
        </a>
        {eligibility.canBookConsultation && secondaryClassName && (
          <a href="/consultation/book" className={`${secondaryClassName} group`}>
            {bookFreeConsultationLabel}
          </a>
        )}
      </div>
    );
  }

  // 3. Guests can create an account during paid-program checkout.
  if (!isAuthenticated) {
    return (
      <div className={containerClassName}>
        <a href="/booking/paid-program-booking" className={`${primaryClassName} group`}>
          {bookPaidProgramLabel}
        </a>
        {secondaryClassName && (
          <a href="/consultation/book" className={`${secondaryClassName} group`}>
            {bookFreeConsultationLabel}
          </a>
        )}
      </div>
    );
  }

  // Fallback -> Sign Up if not authenticated, Dashboard if authenticated
  return (
    <div className={containerClassName}>
      <a href={isAuthenticated ? "/dashboard/client" : "/auth/signup"} className={`${primaryClassName} group`}>
        {isAuthenticated ? dashboardLabelText : signupLabelText}
      </a>
    </div>
  );
}
