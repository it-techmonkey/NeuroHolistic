"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { EventSessionDate } from "./types";

interface Labels {
  namePlaceholder: string;
  emailPlaceholder: string;
  phonePlaceholder: string;
  dateLabel: string;
  datePlaceholder: string;
  submit: string;
  submitting: string;
  alreadyPaid: string;
  genericError: string;
}

const EN_LABELS: Labels = {
  namePlaceholder: "Full name",
  emailPlaceholder: "Email address",
  phonePlaceholder: "Phone (optional)",
  dateLabel: "Select a session date",
  datePlaceholder: "Choose a date",
  submit: "Continue to payment",
  submitting: "Redirecting to payment...",
  alreadyPaid: "You are already registered and paid for this event.",
  genericError: "Something went wrong. Please try again.",
};

const AR_LABELS: Labels = {
  namePlaceholder: "الاسم الكامل",
  emailPlaceholder: "البريد الإلكتروني",
  phonePlaceholder: "رقم الهاتف (اختياري)",
  dateLabel: "اختر موعد الجلسة",
  datePlaceholder: "اختر تاريخاً",
  submit: "المتابعة إلى الدفع",
  submitting: "جارٍ التحويل إلى صفحة الدفع...",
  alreadyPaid: "أنت مسجّل وقد دفعت بالفعل لهذه الفعالية.",
  genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
};

interface Props {
  eventId: string;
  eventTitle: string;
  ctaLabel: string;
  locale: "en" | "ar";
  className?: string;
  sessionDates?: EventSessionDate[];
}

export default function EventPaymentButton({ eventId, eventTitle, ctaLabel, locale, className, sessionDates }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const L = locale === "ar" ? AR_LABELS : EN_LABELS;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const hasDateChoice = !!sessionDates && sessionDates.length > 1;

  const handleClose = () => {
    setIsOpen(false);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const selectedDateValue = String(formData.get("sessionDate") || "");

    if (!name || !email) return;
    if (hasDateChoice && !selectedDateValue) return;

    const selectedDate = sessionDates?.find((d) => d.value === selectedDateValue) ?? null;

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/events/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          eventTitle,
          name,
          email,
          phone,
          selectedDate: selectedDate?.value ?? null,
          selectedDateLabel: selectedDate?.label[locale] ?? null,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.paymentLink) {
        setStatus("error");
        setErrorMessage(res.status === 409 ? L.alreadyPaid : data.error || L.genericError);
        return;
      }

      window.location.href = data.paymentLink;
    } catch {
      setStatus("error");
      setErrorMessage(L.genericError);
    }
  };

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className}>
        {ctaLabel}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white p-8 shadow-2xl"
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 16 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              dir={dir}
            >
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-4 top-4 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 rtl:right-auto rtl:left-4"
                aria-label="Close"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
                <h3 className="text-[20px] font-semibold text-[#0F172A]">{eventTitle}</h3>

                {hasDateChoice && (
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="sessionDate" className="text-[13px] font-medium text-[#334155]">
                      {L.dateLabel}
                    </label>
                    <select
                      id="sessionDate"
                      name="sessionDate"
                      required
                      defaultValue=""
                      className="h-12 rounded-xl border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] outline-none transition-colors focus:border-[#6366F1]"
                    >
                      <option value="" disabled>
                        {L.datePlaceholder}
                      </option>
                      {sessionDates!.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label[locale]}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <input
                  name="name"
                  type="text"
                  required
                  placeholder={L.namePlaceholder}
                  className="h-12 rounded-xl border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] outline-none transition-colors focus:border-[#6366F1]"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={L.emailPlaceholder}
                  className="h-12 rounded-xl border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] outline-none transition-colors focus:border-[#6366F1]"
                />
                <input
                  name="phone"
                  type="tel"
                  placeholder={L.phonePlaceholder}
                  className="h-12 rounded-xl border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] outline-none transition-colors focus:border-[#6366F1]"
                />

                {status === "error" && <p className="text-[14px] text-red-600">{errorMessage}</p>}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="mt-2 inline-flex h-14 items-center justify-center rounded-full bg-[#0F172A] px-10 text-[14px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B] disabled:opacity-60"
                >
                  {status === "submitting" ? L.submitting : L.submit}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
