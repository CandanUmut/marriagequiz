'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from './en.json';
import tr from './tr.json';

export type Locale = 'en' | 'tr';

export const defaultLocale: Locale = 'en';
export const locales: Locale[] = ['en', 'tr'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  tr: 'Türkçe',
};

export type TranslationKeys = typeof en;

const translations: Record<Locale, TranslationKeys> = { en, tr };

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] ?? translations[defaultLocale];
}

export function getDirection(): 'ltr' {
  return 'ltr';
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
}

export const LocaleContext = createContext<LocaleContextValue>({
  locale: defaultLocale,
  setLocale: () => {},
  t: en,
});

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleRaw] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem('hayirlisi-locale') as Locale | null;
    if (saved && locales.includes(saved)) {
      setLocaleRaw(saved);
    } else if (navigator.language.startsWith('tr')) {
      setLocaleRaw('tr');
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleRaw(newLocale);
    localStorage.setItem('hayirlisi-locale', newLocale);
  }, []);

  const t = getTranslations(locale);

  return React.createElement(
    LocaleContext.Provider,
    { value: { locale, setLocale, t } },
    children
  );
}

export function useLocale() {
  const { locale, setLocale } = useContext(LocaleContext);
  return { locale, setLocale };
}

export function useTranslations(): TranslationKeys {
  const { t } = useContext(LocaleContext);
  return t;
}
