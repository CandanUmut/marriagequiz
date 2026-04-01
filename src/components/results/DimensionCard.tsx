'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import { useLocale, useTranslations } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import type { DimensionScore } from '@/lib/types/results';
import type { CategoryWeight } from '@/lib/types/quiz';

interface DimensionCardProps {
  dimension: DimensionScore;
  answeredCount?: number;
  totalQuestionCount?: number;
}

const weightConfig: Record<CategoryWeight, { labelEn: string; labelTr: string; className: string }> = {
  CRITICAL: {
    labelEn: 'CRITICAL',
    labelTr: 'KRİTİK',
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  },
  HIGH: {
    labelEn: 'HIGH',
    labelTr: 'YÜKSEK',
    className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  },
  MEDIUM: {
    labelEn: 'MEDIUM',
    labelTr: 'ORTA',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  LOW: {
    labelEn: 'LOW',
    labelTr: 'DÜŞÜK',
    className: 'bg-sand-100 text-sand-600 dark:bg-sand-800 dark:text-sand-400',
  },
};

function getConsistencyInfo(score: number) {
  if (score >= 80)
    return {
      labelEn: 'Very Consistent',
      labelTr: 'Cok Tutarli',
      className: 'text-green-600 dark:text-green-400',
    };
  if (score >= 60)
    return {
      labelEn: 'Mostly Consistent',
      labelTr: 'Cogunlukla Tutarli',
      className: 'text-yellow-600 dark:text-yellow-400',
    };
  return {
    labelEn: 'Some Inconsistency',
    labelTr: 'Bazi Tutarsizliklar',
    className: 'text-red-600 dark:text-red-400',
  };
}

function getIcon(iconName: string) {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>;
  return icons[iconName] || LucideIcons.Circle;
}

export default function DimensionCard({ dimension, answeredCount, totalQuestionCount }: DimensionCardProps) {
  const { locale } = useLocale();
  const t = useTranslations();
  const catDef = categoryDefinitions[dimension.categoryId];

  if (!catDef) return null;

  const name = locale === 'en' ? catDef.nameEn : catDef.nameTr;
  const weight = catDef.weight as CategoryWeight;
  const wConfig = weightConfig[weight];
  const consistency = getConsistencyInfo(dimension.consistencyScore);
  const Icon = getIcon(catDef.iconName);

  const selfLabel = locale === 'en' ? 'Your Position' : 'Pozisyonunuz';
  const importanceLabel = locale === 'en' ? 'Importance' : 'Onem';
  const flexibilityLabel = locale === 'en' ? 'Flexibility' : 'Esneklik';
  const consistencyLabel = locale === 'en' ? 'Consistency' : 'Tutarlilik';
  const dealBreakerLabel = locale === 'en' ? 'Deal-Breaker' : 'Kirmizi Cizgi';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card variant="default" padding="md" className="hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: catDef.color + '20' }}
            >
              <Icon className="w-5 h-5" style={{ color: catDef.color }} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-sand-900 dark:text-sand-100">
                {name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full ${wConfig.className}`}
                >
                  {locale === 'en' ? wConfig.labelEn : wConfig.labelTr}
                </span>
                {dimension.dealBreaker && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-full bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                    <LucideIcons.ShieldAlert className="w-3 h-3" />
                    {dealBreakerLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Consistency indicator + Edit */}
          <div className="flex items-start gap-2">
            <div className="text-right">
              <span className={`text-xs font-medium ${consistency.className}`}>
                {locale === 'en' ? consistency.labelEn : consistency.labelTr}
              </span>
              <p className="text-[10px] text-sand-400 mt-0.5">
                {consistencyLabel}: {dimension.consistencyScore}%
              </p>
            </div>
            <Link
              href={`/quiz?edit=${dimension.categoryId}`}
              className="shrink-0 p-1.5 rounded-lg text-sand-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/20 transition-colors"
              title={t.common.edit}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Score bars */}
        <div className="space-y-3">
          <ProgressBar
            value={dimension.selfScore}
            color="bg-primary-500"
            height="md"
            showLabel
            label={selfLabel}
          />
          <ProgressBar
            value={dimension.importanceScore}
            color="bg-golden-500"
            height="sm"
            showLabel
            label={importanceLabel}
          />
          <ProgressBar
            value={dimension.flexibilityScore}
            color="bg-blue-400"
            height="sm"
            showLabel
            label={flexibilityLabel}
          />
        </div>

        {/* Partial data indicator */}
        {answeredCount !== undefined && totalQuestionCount !== undefined && answeredCount < totalQuestionCount && (
          <p className="text-[10px] text-sand-400 dark:text-sand-500 mt-3 italic">
            {locale === 'en'
              ? `Based on ${answeredCount}/${totalQuestionCount} questions answered`
              : `${totalQuestionCount} sorudan ${answeredCount} tanesine dayalı`}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
