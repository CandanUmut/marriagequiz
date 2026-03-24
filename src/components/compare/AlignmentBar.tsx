'use client';

import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, BookOpen } from 'lucide-react';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import type { DimensionAlignment } from '@/lib/types/compare';

interface AlignmentBarProps {
  alignment: DimensionAlignment;
}

function scoreColorClass(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

const zoneBadge: Record<DimensionAlignment['zone'], { bg: string; text: string; labelEn: string; labelTr: string }> = {
  green: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', labelEn: 'Aligned', labelTr: 'Uyumlu' },
  yellow: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', labelEn: 'Discuss', labelTr: 'Tartışın' },
  red: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', labelEn: 'Mismatch', labelTr: 'Uyumsuz' },
};

const zoneDot: Record<DimensionAlignment['zone'], string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

export default function AlignmentBar({ alignment }: AlignmentBarProps) {
  const { locale } = useLocale();
  const category = categoryDefinitions[alignment.categoryId];
  const badge = zoneBadge[alignment.zone];
  const categoryName = locale === 'en' ? category.nameEn : category.nameTr;
  const hasDealBreaker = alignment.personADealBreaker || alignment.personBDealBreaker;
  const summary = locale === 'en' ? alignment.summaryEn : alignment.summaryTr;
  const researchNote = locale === 'en' ? alignment.researchNoteEn : alignment.researchNoteTr;

  return (
    <div className={`rounded-xl border ${
      alignment.hasDealBreakerCollision
        ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
        : 'border-sand-200 dark:border-sand-800 bg-white dark:bg-sand-950'
    } p-4`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${zoneDot[alignment.zone]}`} />
          <h4 className="text-sm font-medium text-sand-900 dark:text-sand-100 truncate">
            {categoryName}
          </h4>
          {alignment.hasDealBreakerCollision && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <ShieldAlert size={14} className="text-red-500" />
              <span className="text-xs font-bold text-red-600 dark:text-red-400">
                {locale === 'en' ? 'CONFLICT' : 'ÇATIŞMA'}
              </span>
            </span>
          )}
          {hasDealBreaker && !alignment.hasDealBreakerCollision && (
            <span className="flex items-center gap-1 flex-shrink-0">
              <AlertTriangle size={14} className="text-accent-500" />
              <span className="text-xs font-medium text-accent-600 dark:text-accent-400">
                {locale === 'en' ? 'Deal-breaker' : 'Kırmızı çizgi'}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
            {locale === 'en' ? badge.labelEn : badge.labelTr}
          </span>
          <span className={`text-sm font-semibold ${scoreColorClass(alignment.alignmentScore)}`}>
            {Math.round(alignment.alignmentScore)}%
          </span>
        </div>
      </div>

      {/* Side-by-side bars */}
      <div className="space-y-2">
        {/* Person A */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-primary-600 dark:text-primary-400 w-6 flex-shrink-0">
            A
          </span>
          <div className="flex-1 h-2.5 bg-sand-200 dark:bg-sand-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-primary-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, alignment.personAScore))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <span className="text-xs tabular-nums text-sand-500 dark:text-sand-400 w-8 text-right flex-shrink-0">
            {Math.round(alignment.personAScore)}
          </span>
        </div>

        {/* Person B */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-accent-600 dark:text-accent-400 w-6 flex-shrink-0">
            B
          </span>
          <div className="flex-1 h-2.5 bg-sand-200 dark:bg-sand-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-accent-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, alignment.personBScore))}%` }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
          <span className="text-xs tabular-nums text-sand-500 dark:text-sand-400 w-8 text-right flex-shrink-0">
            {Math.round(alignment.personBScore)}
          </span>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p className="mt-3 text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
          {summary}
        </p>
      )}

      {/* Deal-breaker detail */}
      {hasDealBreaker && !alignment.hasDealBreakerCollision && (
        <div className="mt-2 pt-2 border-t border-sand-100 dark:border-sand-800">
          <p className="text-xs text-sand-500 dark:text-sand-400">
            {alignment.personADealBreaker && alignment.personBDealBreaker
              ? (locale === 'en'
                ? 'Both partners flagged this as a deal-breaker — but your positions align.'
                : 'Her iki partner de bunu kırmızı çizgi olarak işaretledi — ama pozisyonlarınız uyumlu.')
              : alignment.personADealBreaker
                ? (locale === 'en'
                  ? 'Person A flagged this as a deal-breaker.'
                  : 'A kişisi bunu kırmızı çizgi olarak işaretledi.')
                : (locale === 'en'
                  ? 'Person B flagged this as a deal-breaker.'
                  : 'B kişisi bunu kırmızı çizgi olarak işaretledi.')}
          </p>
        </div>
      )}

      {/* Research note */}
      {researchNote && (
        <div className="mt-2 pt-2 border-t border-sand-100 dark:border-sand-800 flex items-start gap-1.5">
          <BookOpen size={12} className="text-sand-400 dark:text-sand-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-sand-400 dark:text-sand-500 italic leading-relaxed">
            {researchNote}
          </p>
        </div>
      )}
    </div>
  );
}
