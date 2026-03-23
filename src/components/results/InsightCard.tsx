'use client';

import { motion } from 'framer-motion';
import { Info, AlertTriangle, AlertCircle, BookOpen } from 'lucide-react';
import Card from '@/components/ui/Card';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import type { Insight } from '@/lib/types/results';

interface InsightCardProps {
  insight: Insight;
}

const severityConfig = {
  info: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: Info,
    border: 'border-l-blue-500',
    labelEn: 'Insight',
    labelTr: 'Bilgi',
  },
  warning: {
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: AlertTriangle,
    border: 'border-l-yellow-500',
    labelEn: 'Worth Considering',
    labelTr: 'Düşünülmesi Gereken',
  },
  alert: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    icon: AlertCircle,
    border: 'border-l-red-500',
    labelEn: 'Important',
    labelTr: 'Onemli',
  },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const { locale } = useLocale();
  const config = severityConfig[insight.severity];
  const SeverityIcon = config.icon;
  const catDef = categoryDefinitions[insight.categoryId];

  const title = locale === 'en' ? insight.titleEn : insight.titleTr;
  const description = locale === 'en' ? insight.descriptionEn : insight.descriptionTr;
  const badgeLabel = locale === 'en' ? config.labelEn : config.labelTr;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="outlined"
        padding="md"
        className={`border-l-4 ${config.border}`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <SeverityIcon className="w-5 h-5 text-sand-500" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h4 className="text-base font-semibold text-sand-900 dark:text-sand-100">
                {title}
              </h4>
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.badge}`}
              >
                {badgeLabel}
              </span>
            </div>

            {/* Category tag */}
            {catDef && (
              <span
                className="inline-block text-xs font-medium mb-2 px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: catDef.color + '18',
                  color: catDef.color,
                }}
              >
                {locale === 'en' ? catDef.nameEn : catDef.nameTr}
              </span>
            )}

            {/* Description */}
            <p className="text-sm text-sand-700 dark:text-sand-300 leading-relaxed mb-3">
              {description}
            </p>

            {/* Research basis */}
            {insight.researchBasis && (
              <div className="flex items-start gap-1.5 text-xs text-sand-500 dark:text-sand-400">
                <BookOpen className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="italic">{insight.researchBasis}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
