"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import BookNowButton from "@/components/booking/BookNowButton";
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
};

export default function LandingBookingCTA({
  primaryClassName,
  secondaryClassName = "",
  containerClassName = "",
  dashboardLabel = "Go to Dashboard",
}: LandingBookingCTAProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, isUrdu } = useLang();
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

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
          {dashboardLabel} <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
        </a>
      </div>
    );
  }

  if (eligibility?.role === 'admin') {
    return (
      <div className={containerClassName}>
        <a href="/dashboard/admin" className={`${primaryClassName} group`}>
          {dashboardLabel} <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
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
          {dashboardLabel} <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
        </a>
      </div>
    );
  }

  // 2. Has completed free consultation, no active program -> Book Paid Program
  if (eligibility?.consultationStatus === 'completed' && !eligibility?.hasActiveProgram) {
    return (
      <div className={containerClassName}>
        <a href="/booking/paid-program-booking" className={`${primaryClassName} group`}>
          Book Paid Program <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
        </a>
      </div>
    );
  }

  // 3. Has scheduled/confirmed consultation -> Go to Dashboard
  if (['scheduled', 'confirmed', 'pending'].includes(eligibility?.consultationStatus as string)) {
    return (
      <div className={containerClassName}>
        <a href="/dashboard/client" className={`${primaryClassName} group`}>
          {dashboardLabel} <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
        </a>
      </div>
    );
  }

  // 4. No consultation yet -> Book Free Consultation
  if (eligibility?.canBookConsultation && isAuthenticated == false) {
    return (
      <div className={containerClassName}>
        <a href="/consultation/book" className={`${primaryClassName} group`}>
          Book Free Consultation <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
        </a>
      </div>
    );
  }

  // Fallback -> Go to Dashboard
  return (
    <div className={containerClassName}>
      <a href="/dashboard/client" className={`${primaryClassName} group`}>
        {dashboardLabel} <span aria-hidden="true" className={`inline-block transition-transform group-hover:${isUrdu ? '-translate-x-1' : 'translate-x-1'}`}>{isUrdu ? '←' : '→'}</span>
      </a>
    </div>
  );
}
