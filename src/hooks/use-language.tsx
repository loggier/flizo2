
"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTranslations, locales, Locale } from '@/lib/locales';
import { storage } from '@/lib/storage';

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Locale>('es');

  useEffect(() => {
    storage.get('language').then(savedLanguage => {
      if (savedLanguage && locales.includes(savedLanguage as Locale)) {
        setLanguageState(savedLanguage as Locale);
      }
    });
  }, []);

  const setLanguage = (lang: Locale) => {
    if (locales.includes(lang)) {
      setLanguageState(lang);
      storage.set('language', lang);
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
