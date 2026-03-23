'use client';

import { useLocale } from '@/lib/i18n/config';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'tr' : 'en')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm
        text-sand-600 dark:text-sand-400 hover:bg-sand-100 dark:hover:bg-sand-800
        transition-colors"
      aria-label="Switch language"
    >
      <Globe size={16} />
      <span className="font-medium">{locale === 'en' ? 'TR' : 'EN'}</span>
    </button>
  );
}
