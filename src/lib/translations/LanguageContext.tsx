'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
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
  /** Retained for legacy components; always false when only EN/AR are used. */
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
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const t = lang === 'ar' ? ar : en;
  const isArabic = lang === 'ar';
  const isUrdu = false;

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = 'ltr';
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{ lang, cycleLang, toggleLang: cycleLang, t, isUrdu, isArabic }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
