'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ur } from './ur';
import { en } from './en';

type Lang = 'en' | 'ar';

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
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  }, []);

  const t = lang === 'ar' ? ur : en;
  const isArabic = lang === 'ar';
  const isUrdu = isArabic;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isUrdu, isArabic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
