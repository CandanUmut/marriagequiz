'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '@/lib/types/quiz';
import { useLocale } from '@/lib/i18n/config';
import Slider from '@/components/ui/Slider';
import Toggle from '@/components/ui/Toggle';
import { Info, Flag } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  value?: number | number[];
  dealBreaker?: boolean;
  onAnswer: (value: number | number[], dealBreaker?: boolean) => void;
  questionNumber: number;
  totalQuestions: number;
  flagReason?: string; // EN reason why this question is flagged for review
  flagReasonTr?: string; // TR reason
}

export default function QuestionCard({
  question,
  value,
  dealBreaker = false,
  onAnswer,
  questionNumber,
  totalQuestions,
  flagReason,
  flagReasonTr,
}: QuestionCardProps) {
  const { locale } = useLocale();
  const [showResearch, setShowResearch] = useState(false);
  const [localDealBreaker, setLocalDealBreaker] = useState(dealBreaker);
  const currentValue = typeof value === 'number' ? value : (Array.isArray(value) ? value[0] : 4);

  const text = locale === 'en' ? question.textEn : question.textTr;

  const handleValueChange = (newValue: number | number[]) => {
    onAnswer(newValue, localDealBreaker);
  };

  const handleDealBreakerChange = (checked: boolean) => {
    setLocalDealBreaker(checked);
    onAnswer(typeof value === 'number' ? value : 4, checked);
  };

  const displayFlagReason = locale === 'en' ? flagReason : flagReasonTr;
  const isFlagged = !!flagReason;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-2xl mx-auto ${isFlagged ? 'border-l-4 border-l-amber-400 pl-4' : ''}`}
    >
      <div className="text-xs text-sand-400 mb-2">
        {questionNumber} / {totalQuestions}
      </div>

      {/* Flagged indicator */}
      {isFlagged && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex items-start gap-2 mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
        >
          <Flag className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {displayFlagReason}
          </p>
        </motion.div>
      )}

      <h2 className="text-xl md:text-2xl font-serif font-medium text-sand-900 dark:text-sand-100 mb-8 leading-relaxed">
        {text}
      </h2>

      <div className="space-y-6">
        {/* Likert Scale */}
        {question.type === 'likert' && (
          <div>
            <Slider
              min={1}
              max={7}
              value={currentValue}
              onChange={(v) => handleValueChange(v)}
              minLabel={locale === 'en' ? question.likertLabels?.lowEn : question.likertLabels?.lowTr}
              maxLabel={locale === 'en' ? question.likertLabels?.highEn : question.likertLabels?.highTr}
            />
          </div>
        )}

        {/* Slider type */}
        {question.type === 'slider' && (
          <div>
            <Slider
              min={1}
              max={7}
              value={currentValue}
              onChange={(v) => handleValueChange(v)}
              minLabel={locale === 'en' ? question.sliderLabels?.minEn : question.sliderLabels?.minTr}
              maxLabel={locale === 'en' ? question.sliderLabels?.maxEn : question.sliderLabels?.maxTr}
            />
          </div>
        )}

        {/* Scenario / This-or-That / Options */}
        {(question.type === 'scenario' || question.type === 'thisOrThat') && question.options && (
          <div className="space-y-3">
            {question.options.map((option) => (
              <motion.button
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleValueChange(option.value)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  currentValue === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 dark:border-primary-400'
                    : 'border-sand-200 dark:border-sand-700 hover:border-sand-300 dark:hover:border-sand-600'
                }`}
              >
                <span className={`text-sm md:text-base ${
                  currentValue === option.value
                    ? 'text-primary-800 dark:text-primary-200 font-medium'
                    : 'text-sand-700 dark:text-sand-300'
                }`}>
                  {locale === 'en' ? option.textEn : option.textTr}
                </span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Ranking */}
        {question.type === 'ranking' && question.options && (
          <div className="space-y-2">
            <p className="text-sm text-sand-500 dark:text-sand-400 mb-3">
              {locale === 'en' ? 'Click to rank in order of importance (1 = most important)' : 'Önem sırasına göre tıklayın (1 = en önemli)'}
            </p>
            {question.options.map((option) => {
              const rankings = Array.isArray(value) ? value : [];
              const rank = rankings.indexOf(option.value) + 1;
              const isRanked = rank > 0;

              return (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    const current = Array.isArray(value) ? [...value] : [];
                    if (isRanked) {
                      handleValueChange(current.filter((v) => v !== option.value));
                    } else {
                      handleValueChange([...current, option.value]);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                    isRanked
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                      : 'border-sand-200 dark:border-sand-700'
                  }`}
                >
                  {isRanked && (
                    <span className="w-7 h-7 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {rank}
                    </span>
                  )}
                  <span className="text-sm text-sand-700 dark:text-sand-300">
                    {locale === 'en' ? option.textEn : option.textTr}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Deal-breaker toggle */}
        {question.type === 'dealbreaker' && (
          <div className="space-y-4">
            <Slider
              min={1}
              max={7}
              value={currentValue}
              onChange={(v) => handleValueChange(v)}
              minLabel={locale === 'en' ? question.likertLabels?.lowEn || 'Not important' : question.likertLabels?.lowTr || 'Önemli değil'}
              maxLabel={locale === 'en' ? question.likertLabels?.highEn || 'Extremely important' : question.likertLabels?.highTr || 'Son derece önemli'}
            />
          </div>
        )}

        {/* Deal-breaker follow-up for all types */}
        {question.dealBreakerFollowUp && (
          <div className="mt-6 pt-4 border-t border-sand-200 dark:border-sand-700">
            <Toggle
              checked={localDealBreaker}
              onChange={handleDealBreakerChange}
              label={locale === 'en' ? 'This is a deal-breaker for me' : 'Bu benim için kırmızı çizgi'}
            />
            <p className="text-xs text-sand-400 mt-1 ml-14">
              {locale === 'en'
                ? 'Would you walk away if your partner disagreed on this?'
                : 'Partneriniz bu konuda farklı düşünse ilişkiden vazgeçer miydiniz?'}
            </p>
          </div>
        )}
      </div>

      {/* Research tooltip */}
      <button
        onClick={() => setShowResearch(!showResearch)}
        className="mt-6 flex items-center gap-1 text-xs text-sand-400 hover:text-primary-500 transition-colors"
      >
        <Info size={14} />
        {locale === 'en' ? 'Why this question?' : 'Neden bu soru?'}
      </button>

      <AnimatePresence>
        {showResearch && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-sand-500 dark:text-sand-400 mt-2 leading-relaxed"
          >
            {locale === 'en'
              ? 'This question helps assess your position and flexibility in this dimension, which research shows is important for long-term relationship compatibility.'
              : 'Bu soru, araştırmaların uzun vadeli ilişki uyumu için önemli olduğunu gösterdiği bu boyuttaki konumunuzu ve esnekliğinizi değerlendirmeye yardımcı olur.'}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
