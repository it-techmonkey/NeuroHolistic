"use client";

import { useLang } from "@/lib/translations/LanguageContext";

export type ContentLocale = "en" | "ar";

/** Arabic copy only when Arabic mode is active; otherwise English (including Urdu UI). */
export function useContentLocale(): ContentLocale {
  const { isArabic } = useLang();
  return isArabic ? "ar" : "en";
}
