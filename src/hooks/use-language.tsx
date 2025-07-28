
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTranslations, locales, Locale } from '@/lib/locales';

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Locale;
    if (savedLanguage && locales.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    if (locales.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem('language', lang);
    }
  };

  const t = useMemo(() => getTranslations(language), [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
