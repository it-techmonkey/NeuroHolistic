"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PENDING_PAYMENT_KEY } from "./payment-storage";

type Tone = "success" | "pending" | "warning";
type Phase = "verifying" | "confirmed" | "processing" | "cancelled" | "failed";

const TEXT: Record<Phase, { en: string; ar: string }> = {
  verifying: {
    en: "Confirming your payment…",
    ar: "جارٍ تأكيد عملية الدفع…",
  },
  confirmed: {
    en: "Payment received — your spot is confirmed! A confirmation email with your joining link is on its way.",
    ar: "تم استلام الدفع — تم تأكيد مقعدك! رسالة التأكيد مع رابط الانضمام في طريقها إليك.",
  },
  // Deliberately makes no promise that an email has already gone out: the
  // old banner always claimed one had been sent, which was untrue whenever
  // the confirmation had not actually been processed.
  processing: {
    en: "Payment received. We're still finalising your registration — your confirmation email will arrive shortly. Contact us if it hasn't within an hour.",
    ar: "تم استلام الدفع. ما زلنا نُنهي تسجيلك — ستصلك رسالة التأكيد قريباً. تواصل معنا إذا لم تصلك خلال ساعة.",
  },
  cancelled: {
    en: "Payment was cancelled. You can try again whenever you're ready.",
    ar: "تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى في أي وقت.",
  },
  failed: {
    en: "Payment failed. Please try again or contact us for help.",
    ar: "فشلت عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل معنا للمساعدة.",
  },
};

const TONE: Record<Phase, Tone> = {
  verifying: "pending",
  confirmed: "success",
  processing: "pending",
  cancelled: "warning",
  failed: "warning",
};

const TONE_CLASS: Record<Tone, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  pending: "border-sky-200 bg-sky-50 text-sky-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

export default function EventPaymentBanner({ locale }: { locale: "en" | "ar" }) {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const [phase, setPhase] = useState<Phase | null>(null);

  useEffect(() => {
    if (paymentStatus === "cancelled") return setPhase("cancelled");
    if (paymentStatus === "failed") return setPhase("failed");
    if (paymentStatus !== "success") return setPhase(null);

    let intentId: string | null = null;
    try {
      intentId = sessionStorage.getItem(PENDING_PAYMENT_KEY);
    } catch {
      // Storage unavailable — fall through to the processing message. The
      // server-side reconciliation sweep still confirms this payment.
    }

    if (!intentId) return setPhase("processing");

    setPhase("verifying");
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/events/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentIntentId: intentId }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok && data.success) {
          setPhase("confirmed");
          try {
            sessionStorage.removeItem(PENDING_PAYMENT_KEY);
          } catch {
            // Nothing to clean up if storage is unavailable.
          }
        } else {
          setPhase("processing");
        }
      } catch {
        if (!cancelled) setPhase("processing");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentStatus]);

  if (!phase) return null;

  return (
    <div
      className={`mt-6 rounded-xl border p-4 text-[14px] font-medium ${TONE_CLASS[TONE[phase]]}`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {TEXT[phase][locale]}
    </div>
  );
}
