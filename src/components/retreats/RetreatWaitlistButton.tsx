"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PhoneInput from "@/components/ui/PhoneInput";
import { isValidPhone, PHONE_ERROR } from "@/lib/phone";

interface Labels {
  namePlaceholder: string;
  emailPlaceholder: string;
  phoneLabel: string;
  submit: string;
  submitting: string;
  success: string;
  alreadyJoined: string;
  genericError: string;
}

const EN_LABELS: Labels = {
  namePlaceholder: "Full name",
  emailPlaceholder: "Email address",
  phoneLabel: "Mobile number",
  submit: "Join The Wish List",
  submitting: "Joining...",
  success: "You're on the wish list! We'll email you as soon as dates and booking details are announced.",
  alreadyJoined: "You are already on the wish list for this retreat.",
  genericError: "Something went wrong. Please try again.",
};

const AR_LABELS: Labels = {
  namePlaceholder: "الاسم الكامل",
  emailPlaceholder: "البريد الإلكتروني",
  phoneLabel: "رقم الهاتف المحمول",
  submit: "انضمي إلى قائمة الانتظار",
  submitting: "جارٍ الانضمام...",
  success: "تم تسجيلك في قائمة الانتظار! سنرسل إليك بريداً إلكترونياً فور الإعلان عن المواعيد وتفاصيل الحجز.",
  alreadyJoined: "أنتِ مسجّلة بالفعل في قائمة الانتظار لهذه التجربة.",
  genericError: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
};

interface Props {
  retreatId: string;
  retreatTitle: string;
  ctaLabel: string;
  locale: "en" | "ar";
  className?: string;
}

export default function RetreatWaitlistButton({ retreatId, retreatTitle, ctaLabel, locale, className }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [phone, setPhone] = useState("");
  const L = locale === "ar" ? AR_LABELS : EN_LABELS;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const handleClose = () => {
    setIsOpen(false);
    setStatus("idle");
    setErrorMessage("");
    setPhone("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();

    if (!name || !email) return;

    if (!isValidPhone(phone)) {
      setStatus("error");
      setErrorMessage(PHONE_ERROR[locale]);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/retreats/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retreatId, retreatTitle, name, email, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(res.status === 409 ? L.alreadyJoined : data.error || L.genericError);
        return;
      }

      setStatus("success");
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

              {status === "success" ? (
                <div className="pt-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[16px] leading-relaxed text-[#334155]">{L.success}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
                  <h3 className="text-[20px] font-semibold text-[#0F172A]">{retreatTitle}</h3>
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
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="waitlist-phone" className="text-[13px] font-medium text-[#334155]">
                      {L.phoneLabel}
                    </label>
                    <PhoneInput id="waitlist-phone" value={phone} onChange={setPhone} locale={locale} required />
                  </div>

                  {status === "error" && <p className="text-[14px] text-red-600">{errorMessage}</p>}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="mt-2 inline-flex h-14 items-center justify-center rounded-full bg-[#0F172A] px-10 text-[14px] font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1E293B] disabled:opacity-60"
                  >
                    {status === "submitting" ? L.submitting : L.submit}
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
