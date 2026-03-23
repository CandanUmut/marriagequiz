'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { CategoryId } from '@/lib/types/quiz';

interface QuizShellProps {
  children: ReactNode;
  currentCategory: CategoryId;
  overallProgress: number; // 0-100
  categoryProgress: number; // 0-100
  questionNumber: number;
  totalQuestions: number;
}

export default function QuizShell({
  children,
  currentCategory,
  overallProgress,
  categoryProgress,
}: QuizShellProps) {
  const { locale } = useLocale();
  const catDef = categoryDefinitions[currentCategory];
  const categoryName = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-sand-950">
      {/* Top progress bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-sand-950/90 backdrop-blur-sm border-b border-sand-100 dark:border-sand-800 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-sm font-medium"
              style={{ color: catDef?.color || '#2d9a89' }}
            >
              {categoryName}
            </span>
            <span className="text-xs text-sand-400">
              {Math.round(overallProgress)}%
            </span>
          </div>
          <ProgressBar
            value={overallProgress}
            color={`bg-primary-500`}
            height="sm"
          />
          <div className="mt-1">
            <ProgressBar
              value={categoryProgress}
              height="sm"
            />
          </div>
        </div>
      </div>

      {/* Quiz content area */}
      <main className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 text-xs text-sand-400 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        {locale === 'en' ? 'Progress saved' : 'İlerleme kaydedildi'}
      </div>
    </div>
  );
}
