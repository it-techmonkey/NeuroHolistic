'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { en } from './en';
import { ur } from './ur';

type Lang = 'en' | 'ur';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: typeof en | typeof ur;
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
    setLang(prev => (prev === 'en' ? 'ur' : 'en'));
  }, []);

  const t = lang === 'ur' ? ur : en;
  const isArabic = false;
  // Keep UI layout fixed LTR; language only changes copy.
  const isUrdu = lang === 'ur';

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isUrdu, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
