'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ur } from './ur';
import { en } from './en';

type Lang = 'en' | 'ur';

type LanguageContextType = {
  lang: Lang;
  toggleLang: () => void;
  t: typeof en | typeof ur;
  isUrdu: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  toggleLang: () => {},
  t: en,
  isUrdu: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'en' ? 'ur' : 'en');
  }, []);

  const t = lang === 'ur' ? ur : en;
  const isUrdu = lang === 'ur';

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, isUrdu }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
