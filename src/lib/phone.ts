/**
 * Shared phone-number handling.
 *
 * Every public form must collect a country code plus a national number, and
 * store the result in E.164 form (`+<country><number>`). Validation lives here
 * so the client component and the API routes agree on what "valid" means —
 * never trust the client alone.
 */

export interface CountryCode {
  /** ISO 3166-1 alpha-2, used as the stable option value. */
  iso: string;
  /** Dial prefix without the leading "+". */
  dial: string;
  name: string;
  nameAr: string;
  flag: string;
}

/** Ordered so the UAE and the rest of the GCC surface first. */
export const COUNTRY_CODES: CountryCode[] = [
  { iso: "AE", dial: "971", name: "United Arab Emirates", nameAr: "الإمارات العربية المتحدة", flag: "🇦🇪" },
  { iso: "SA", dial: "966", name: "Saudi Arabia", nameAr: "السعودية", flag: "🇸🇦" },
  { iso: "QA", dial: "974", name: "Qatar", nameAr: "قطر", flag: "🇶🇦" },
  { iso: "KW", dial: "965", name: "Kuwait", nameAr: "الكويت", flag: "🇰🇼" },
  { iso: "BH", dial: "973", name: "Bahrain", nameAr: "البحرين", flag: "🇧🇭" },
  { iso: "OM", dial: "968", name: "Oman", nameAr: "عمان", flag: "🇴🇲" },
  { iso: "EG", dial: "20", name: "Egypt", nameAr: "مصر", flag: "🇪🇬" },
  { iso: "JO", dial: "962", name: "Jordan", nameAr: "الأردن", flag: "🇯🇴" },
  { iso: "LB", dial: "961", name: "Lebanon", nameAr: "لبنان", flag: "🇱🇧" },
  { iso: "MA", dial: "212", name: "Morocco", nameAr: "المغرب", flag: "🇲🇦" },
  { iso: "DZ", dial: "213", name: "Algeria", nameAr: "الجزائر", flag: "🇩🇿" },
  { iso: "TN", dial: "216", name: "Tunisia", nameAr: "تونس", flag: "🇹🇳" },
  { iso: "IQ", dial: "964", name: "Iraq", nameAr: "العراق", flag: "🇮🇶" },
  { iso: "GB", dial: "44", name: "United Kingdom", nameAr: "المملكة المتحدة", flag: "🇬🇧" },
  { iso: "US", dial: "1", name: "United States", nameAr: "الولايات المتحدة", flag: "🇺🇸" },
  { iso: "CA", dial: "1", name: "Canada", nameAr: "كندا", flag: "🇨🇦" },
  { iso: "IN", dial: "91", name: "India", nameAr: "الهند", flag: "🇮🇳" },
  { iso: "PK", dial: "92", name: "Pakistan", nameAr: "باكستان", flag: "🇵🇰" },
  { iso: "PH", dial: "63", name: "Philippines", nameAr: "الفلبين", flag: "🇵🇭" },
  { iso: "DE", dial: "49", name: "Germany", nameAr: "ألمانيا", flag: "🇩🇪" },
  { iso: "FR", dial: "33", name: "France", nameAr: "فرنسا", flag: "🇫🇷" },
  { iso: "ES", dial: "34", name: "Spain", nameAr: "إسبانيا", flag: "🇪🇸" },
  { iso: "IT", dial: "39", name: "Italy", nameAr: "إيطاليا", flag: "🇮🇹" },
  { iso: "NL", dial: "31", name: "Netherlands", nameAr: "هولندا", flag: "🇳🇱" },
  { iso: "TR", dial: "90", name: "Türkiye", nameAr: "تركيا", flag: "🇹🇷" },
  { iso: "ZA", dial: "27", name: "South Africa", nameAr: "جنوب أفريقيا", flag: "🇿🇦" },
  { iso: "AU", dial: "61", name: "Australia", nameAr: "أستراليا", flag: "🇦🇺" },
  { iso: "SG", dial: "65", name: "Singapore", nameAr: "سنغافورة", flag: "🇸🇬" },
];

export const DEFAULT_COUNTRY_ISO = "AE";

const DIAL_CODES = Array.from(new Set(COUNTRY_CODES.map((c) => c.dial)));

/** Strip everything except digits. */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Build an E.164 number from a dial code and a national number.
 * Tolerates the user re-typing the country code or a leading trunk "0".
 */
export function composePhone(dial: string, nationalNumber: string): string {
  const d = digitsOnly(dial);
  let n = digitsOnly(nationalNumber).replace(/^0+/, "");
  if (d && n.startsWith(d)) n = n.slice(d.length).replace(/^0+/, "");
  return `+${d}${n}`;
}

/**
 * A phone is acceptable when it is E.164-shaped, carries a dial code we know,
 * and has a plausible national-number length.
 */
export function isValidPhone(value: string | null | undefined): boolean {
  if (!value) return false;
  const trimmed = value.trim();
  if (!/^\+[1-9]\d{6,17}$/.test(trimmed)) return false;

  const digits = trimmed.slice(1);
  const dial = DIAL_CODES.filter((code) => digits.startsWith(code)).sort((a, b) => b.length - a.length)[0];
  if (!dial) return false;

  const national = digits.slice(dial.length);
  return national.length >= 6 && national.length <= 14;
}

/**
 * Normalize an arbitrary submitted value, returning null when it cannot be
 * accepted. API routes should reject on null rather than storing junk.
 */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  let trimmed = value.trim().replace(/[\s()\-.]/g, "");
  if (trimmed.startsWith("00")) trimmed = `+${trimmed.slice(2)}`;
  if (!trimmed.startsWith("+")) trimmed = `+${digitsOnly(trimmed)}`;
  return isValidPhone(trimmed) ? trimmed : null;
}

/** Split a stored E.164 number back into a country + national number. */
export function splitPhone(value: string | null | undefined): { iso: string; nationalNumber: string } {
  const normalized = normalizePhone(value);
  if (!normalized) return { iso: DEFAULT_COUNTRY_ISO, nationalNumber: "" };

  const digits = normalized.slice(1);
  const dial = DIAL_CODES.filter((code) => digits.startsWith(code)).sort((a, b) => b.length - a.length)[0];
  if (!dial) return { iso: DEFAULT_COUNTRY_ISO, nationalNumber: "" };

  const country = COUNTRY_CODES.find((c) => c.dial === dial) ?? COUNTRY_CODES[0];
  return { iso: country.iso, nationalNumber: digits.slice(dial.length) };
}

export const PHONE_ERROR = {
  en: "Please enter a valid mobile number including the country code.",
  ar: "يرجى إدخال رقم هاتف صحيح مع رمز الدولة.",
};
