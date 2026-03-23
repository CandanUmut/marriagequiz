'use client';

import { useTranslations } from '@/lib/i18n/config';
import { Heart, Github, Shield } from 'lucide-react';

export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-sand-100 dark:border-sand-800 bg-sand-50 dark:bg-sand-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart size={18} className="text-primary-600" />
              <span className="font-serif text-lg font-bold text-primary-800 dark:text-primary-300">
                {t.common.appName}
              </span>
            </div>
            <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
              {t.common.tagline}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-primary-600" />
              <span className="text-sm font-medium text-sand-800 dark:text-sand-200">
                {t.common.privacyNote}
              </span>
            </div>
            <p className="text-xs text-sand-500 dark:text-sand-500 leading-relaxed">
              {t.about.privacyText}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Github size={16} className="text-primary-600" />
              <span className="text-sm font-medium text-sand-800 dark:text-sand-200">
                {t.about.openSourceTitle}
              </span>
            </div>
            <p className="text-xs text-sand-500 dark:text-sand-500 leading-relaxed">
              {t.about.openSourceText}
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-sand-200 dark:border-sand-800 text-center">
          <p className="text-xs text-sand-400">
            © {new Date().getFullYear()} Hayırlısı — Open Source, Non-Profit
          </p>
        </div>
      </div>
    </footer>
  );
}
