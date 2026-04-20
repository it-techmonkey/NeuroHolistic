'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en } from './en';

type Lang = 'en';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: typeof en;
  isUrdu: boolean;
  isArabic: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: en,
  isUrdu: false,
  isArabic: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = useCallback(() => {
    setLang('en');
  }, []);

  const t = en;
  const isArabic = false;
  // Keep UI layout fixed LTR; language only changes copy.
  const isUrdu = false;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isUrdu, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
