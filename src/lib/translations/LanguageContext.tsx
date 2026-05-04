'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { arabicUiEnabled } from '@/lib/site-features';
import { en } from './en';
import { ar } from './ar';

export type Lang = 'en' | 'ar';

type LanguageContextType = {
  lang: Lang;
  /** Toggles English ↔ Arabic (single predictable step). */
  cycleLang: () => void;
  /** @deprecated Use cycleLang */
  toggleLang: () => void;
  t: typeof en | typeof ar;
  /** Retained for legacy components; mirrors Arabic state for backward compatibility. */
  isUrdu: boolean;
  isArabic: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  cycleLang: () => {},
  toggleLang: () => {},
  t: en,
  isUrdu: false,
  isArabic: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const cycleLang = useCallback(() => {
    if (!arabicUiEnabled) return;
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const effectiveLang: Lang = arabicUiEnabled ? lang : 'en';
  const t = effectiveLang === 'ar' ? ar : en;
  const isArabic = effectiveLang === 'ar';
  // Legacy flag used by older UI sections for RTL styling.
  const isUrdu = isArabic;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = effectiveLang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = effectiveLang === 'ar' ? 'rtl' : 'ltr';
  }, [effectiveLang]);

  return (
    <LanguageContext.Provider
      value={{ lang: effectiveLang, cycleLang, toggleLang: cycleLang, t, isUrdu, isArabic }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
