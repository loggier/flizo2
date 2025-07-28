import { en } from './en';
import { es } from './es';

export const locales = ['en', 'es'] as const;
export type Locale = typeof locales[number];

const translations = {
  en,
  es,
};

export const getTranslations = (locale: Locale) => {
  return translations[locale] || translations.es;
};
