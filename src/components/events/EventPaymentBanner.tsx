"use client";

import { useSearchParams } from "next/navigation";

const PAYMENT_BANNER_TEXT = {
  success: {
    en: "Payment received — your spot is confirmed! We've sent a confirmation email.",
    ar: "تم استلام الدفع — تم تأكيد مقعدك! لقد أرسلنا بريداً إلكترونياً للتأكيد.",
  },
  cancelled: {
    en: "Payment was cancelled. You can try again whenever you're ready.",
    ar: "تم إلغاء عملية الدفع. يمكنك المحاولة مرة أخرى في أي وقت.",
  },
  failed: {
    en: "Payment failed. Please try again or contact us for help.",
    ar: "فشلت عملية الدفع. يرجى المحاولة مرة أخرى أو التواصل معنا للمساعدة.",
  },
} as const;

export default function EventPaymentBanner({ locale }: { locale: "en" | "ar" }) {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get("payment");
  const banner = paymentStatus && paymentStatus in PAYMENT_BANNER_TEXT
    ? PAYMENT_BANNER_TEXT[paymentStatus as keyof typeof PAYMENT_BANNER_TEXT]
    : null;

  if (!banner) return null;

  return (
    <div
      className={`mt-6 rounded-xl border p-4 text-[14px] font-medium ${
        paymentStatus === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      }`}
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {banner[locale]}
    </div>
  );
}
