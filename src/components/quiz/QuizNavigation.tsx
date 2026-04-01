'use client';

import { useTranslations } from '@/lib/i18n/config';
import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

interface QuizNavigationProps {
  onPrev: () => void;
  onNext: () => void;
  onSkip?: () => void;
  canPrev: boolean;
  canNext: boolean;
  isLastQuestion?: boolean;
  hasAnswer: boolean;
}

export default function QuizNavigation({
  onPrev,
  onNext,
  onSkip,
  canPrev,
  canNext,
  isLastQuestion = false,
  hasAnswer,
}: QuizNavigationProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between mt-10 pt-6 border-t border-sand-100 dark:border-sand-800">
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={!canPrev}
        size="sm"
      >
        <ChevronLeft size={18} className="mr-1" />
        {t.common.previous}
      </Button>

      <div className="flex items-center gap-2">
        {onSkip && (
          <Button
            variant="ghost"
            onClick={onSkip}
            size="sm"
            className="text-sand-400 hover:text-sand-600"
          >
            {t.common.skip}
            <SkipForward size={14} className="ml-1" />
          </Button>
        )}

        <Button
          onClick={onNext}
          disabled={!hasAnswer && !canNext}
          size="sm"
        >
          {isLastQuestion ? (t.common.viewResults) : t.common.next}
          {!isLastQuestion && <ChevronRight size={18} className="ml-1" />}
        </Button>
      </div>
    </div>
  );
}
