'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { useQuizStore } from '@/lib/store/quizStore';
import { CategoryProgressSegments } from './QuizCategoryNav';
import { CategoryId } from '@/lib/types/quiz';

interface QuizShellProps {
  children: ReactNode;
  currentCategory: CategoryId;
  overallProgress: number; // 0-100
  categoryProgress: number; // 0-100
  questionNumber: number;
  totalQuestions: number;
  onNavigateCategory?: (catIndex: number) => void;
}

export default function QuizShell({
  children,
  currentCategory,
  overallProgress,
  categoryProgress,
  onNavigateCategory,
}: QuizShellProps) {
  const { locale } = useLocale();
  const catDef = categoryDefinitions[currentCategory];
  const categoryName = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
  const { progress } = useQuizStore();

  return (
    <div className="min-h-screen bg-sand-50 dark:bg-sand-950">
      {/* Top progress bar */}
      <div className="sticky top-16 z-30 bg-white/90 dark:bg-sand-950/90 backdrop-blur-sm border-b border-sand-100 dark:border-sand-800 px-4 py-3">
        <div className="max-w-5xl mx-auto">
          {/* Category segment bar */}
          <div className="mb-2">
            <CategoryProgressSegments
              selectedCategories={progress.selectedCategories}
              answers={progress.answers}
              currentCategoryIndex={progress.currentCategoryIndex}
              onNavigate={onNavigateCategory}
            />
          </div>
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
      </div>

      {/* Quiz content area with sidebar */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-16 flex gap-6">
        {/* Main content */}
        <main className="flex-1 max-w-2xl mx-auto md:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-20 md:right-4 text-xs text-sand-400 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        {locale === 'en' ? 'Progress saved' : 'İlerleme kaydedildi'}
      </div>
    </div>
  );
}
