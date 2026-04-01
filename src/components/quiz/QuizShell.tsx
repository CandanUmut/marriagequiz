'use client';

import { ReactNode, useMemo } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { questionsByCategory } from '@/lib/quiz/questions';
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

  // Calculate total questions and answered count for time estimate
  const totalAllQuestions = useMemo(
    () => progress.selectedCategories.reduce((sum, catId) => sum + (questionsByCategory[catId]?.length || 0), 0),
    [progress.selectedCategories]
  );
  const answeredCount = Object.keys(progress.answers).length;
  const remainingCount = totalAllQuestions - answeredCount;
  const isLastCategory = progress.currentCategoryIndex >= progress.selectedCategories.length - 1;

  const timeEstimate = useMemo(() => {
    if (remainingCount <= 0) return locale === 'en' ? 'Last question!' : 'Son soru!';
    if (isLastCategory && remainingCount <= 3) return locale === 'en' ? 'Almost done!' : 'Neredeyse bitti!';

    // Calculate from actual answer timestamps, capping idle gaps at 30s
    const timestamps = Object.values(progress.answers)
      .map((a) => a.timestamp)
      .sort((a, b) => a - b);

    let effectiveTime = 0;
    if (timestamps.length >= 3) {
      for (let i = 1; i < timestamps.length; i++) {
        const gap = timestamps[i] - timestamps[i - 1];
        effectiveTime += Math.min(gap, 30000); // cap at 30s
      }
      const avgPerQuestion = effectiveTime / (timestamps.length - 1);
      const estMinutes = Math.ceil((remainingCount * avgPerQuestion) / 60000);
      if (estMinutes <= 1) return locale === 'en' ? '~1 min left' : '~1 dk kaldı';
      return locale === 'en' ? `~${estMinutes} min left` : `~${estMinutes} dk kaldı`;
    }

    // Fallback: ~12s per question
    const estMinutes = Math.ceil((remainingCount * 12) / 60);
    return locale === 'en' ? `~${estMinutes} min left` : `~${estMinutes} dk kaldı`;
  }, [remainingCount, isLastCategory, progress.answers, locale]);

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
              <div className="flex items-center gap-3">
                <span className="text-xs text-sand-400">{timeEstimate}</span>
                <span className="text-xs text-sand-400 tabular-nums">
                  {overallProgress < 100 ? overallProgress.toFixed(1) : '100'}%
                </span>
              </div>
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

      {/* Quiz content area */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        <main>
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
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 md:bottom-4 md:right-4 md:left-auto md:translate-x-0 text-xs text-sand-400 flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-green-400" />
        {locale === 'en' ? 'Progress saved' : 'İlerleme kaydedildi'}
      </div>
    </div>
  );
}
