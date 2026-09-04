"use client";

import { useEffect, useMemo, useState } from "react";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY_ISO,
  composePhone,
  isValidPhone,
  splitPhone,
} from "@/lib/phone";

interface Props {
  /** Current E.164 value, e.g. "+971500000000". */
  value: string;
  /** Receives the composed E.164 value on every change. */
  onChange: (value: string) => void;
  locale?: "en" | "ar";
  /** Extra classes for the national-number input, so each form keeps its own look. */
  inputClassName?: string;
  /** Extra classes for the country select. Falls back to `inputClassName`. */
  selectClassName?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
}

const BASE_FIELD =
  "h-12 rounded-xl border border-[#E2E8F0] px-4 text-[15px] text-[#0F172A] outline-none transition-colors focus:border-[#6366F1]";

/**
 * Country code + national number, always emitting an E.164 string.
 * The country code is mandatory by construction — there is no free-text mode.
 */
export default function PhoneInput({
  value,
  onChange,
  locale = "en",
  inputClassName,
  selectClassName,
  placeholder,
  id,
  name,
  required = true,
  disabled,
}: Props) {
  const parsed = useMemo(() => splitPhone(value), [value]);
  const [iso, setIso] = useState(parsed.iso || DEFAULT_COUNTRY_ISO);
  const [national, setNational] = useState(parsed.nationalNumber);

  const country = COUNTRY_CODES.find((c) => c.iso === iso) ?? COUNTRY_CODES[0];

  // Re-sync when the parent supplies a value we did not produce — e.g. a
  // profile loaded after mount, or a form reset.
  useEffect(() => {
    const current = national ? composePhone(country.dial, national) : "";
    if (value === current) return;
    setIso(parsed.iso || DEFAULT_COUNTRY_ISO);
    setNational(parsed.nationalNumber);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const fieldClass = inputClassName ?? BASE_FIELD;
  const isArabic = locale === "ar";
  const invalid = required && national.length > 0 && !isValidPhone(composePhone(country.dial, national));

  const emit = (nextIso: string, nextNational: string) => {
    const nextCountry = COUNTRY_CODES.find((c) => c.iso === nextIso) ?? COUNTRY_CODES[0];
    onChange(nextNational ? composePhone(nextCountry.dial, nextNational) : "");
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-2" dir="ltr">
        <select
          aria-label={isArabic ? "رمز الدولة" : "Country code"}
          value={iso}
          disabled={disabled}
          onChange={(e) => {
            setIso(e.target.value);
            emit(e.target.value, national);
          }}
          className={`${selectClassName ?? fieldClass} w-[132px] shrink-0 cursor-pointer px-2`}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} +{c.dial}
            </option>
          ))}
        </select>

        <input
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          disabled={disabled}
          value={national}
          placeholder={placeholder ?? (isArabic ? "50 000 0000" : "50 000 0000")}
          onChange={(e) => {
            const next = e.target.value.replace(/[^\d\s-]/g, "");
            setNational(next);
            emit(iso, next);
          }}
          className={`${fieldClass} w-full`}
        />

        {/* Submitted value for plain (non-controlled) <form> consumers. */}
        {name && <input type="hidden" name={name} value={national ? composePhone(country.dial, national) : ""} />}
      </div>

      {invalid && (
        <p className="text-[13px] text-red-600" dir={isArabic ? "rtl" : "ltr"}>
          {isArabic ? "يرجى إدخال رقم هاتف صحيح." : "Please enter a valid mobile number."}
        </p>
      )}
    </div>
  );
}
