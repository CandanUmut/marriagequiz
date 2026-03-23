'use client';

import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/config';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { Heart } from 'lucide-react';

export default function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-sand-950/80 backdrop-blur-md border-b border-sand-100 dark:border-sand-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <span className="font-serif text-xl font-bold text-primary-800 dark:text-primary-300 group-hover:text-primary-600 transition-colors">
            {t.common.appName}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/quiz"
            className="text-sm text-sand-600 dark:text-sand-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t.common.startQuiz}
          </Link>
          <Link
            href="/results"
            className="text-sm text-sand-600 dark:text-sand-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t.common.viewResults}
          </Link>
          <Link
            href="/compare"
            className="text-sm text-sand-600 dark:text-sand-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t.common.compare}
          </Link>
          <Link
            href="/about"
            className="text-sm text-sand-600 dark:text-sand-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            {t.common.about}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
