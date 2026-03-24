'use client';

import { useState } from 'react';
import { useTranslations } from '@/lib/i18n/config';
import { useResultStore } from '@/lib/store/resultStore';
import { useQuizStore } from '@/lib/store/quizStore';
import { useCompareStore } from '@/lib/store/compareStore';
import { calculateCompatibility } from '@/lib/compare/matching';
import { ProfileResult } from '@/lib/types/results';
import { QuizAnswer } from '@/lib/types/quiz';
import { ComparisonResult } from '@/lib/types/compare';
import CompareInput from '@/components/compare/CompareInput';
import ComparisonDashboard from '@/components/compare/ComparisonDashboard';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ComparePage() {
  const t = useTranslations();
  const { currentResult } = useResultStore();
  const quizAnswers = useQuizStore((s) => s.progress.answers);
  const { setProfileA, setProfileB, setComparisonResult } = useCompareStore();
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const handleCompare = (profileB: ProfileResult, answersB: Record<string, QuizAnswer>) => {
    if (!currentResult) return;
    setProfileA(currentResult);
    setProfileB(profileB);
    const result = calculateCompatibility(currentResult, profileB, quizAnswers, answersB);
    setComparisonResult(result);
    setComparison(result);
  };

  if (!currentResult) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
          {t.compare.title}
        </h1>
        <p className="text-sand-600 dark:text-sand-400 mb-8">
          Complete the quiz first to compare with someone.
        </p>
        <Link href="/quiz">
          <Button>
            {t.common.startQuiz}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  if (comparison) {
    return <ComparisonDashboard comparison={comparison} />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-2 text-center">
        {t.compare.title}
      </h1>
      <p className="text-sand-600 dark:text-sand-400 mb-10 text-center">
        {t.compare.subtitle}
      </p>
      <CompareInput onCompare={handleCompare} />
    </div>
  );
}
