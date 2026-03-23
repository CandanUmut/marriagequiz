'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from '@/lib/i18n/config';
import { researchFindings } from '@/data/research';
import Card from '@/components/ui/Card';
import { BookOpen, Star } from 'lucide-react';

export default function ResearchPage() {
  const t = useTranslations();
  const { locale } = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <BookOpen size={32} className="mx-auto mb-4 text-primary-600" />
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
          {t.research.title}
        </h1>
        <p className="text-base text-sand-600 dark:text-sand-400 max-w-2xl mx-auto">
          {t.research.subtitle}
        </p>
      </motion.div>

      <h2 className="text-2xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-8">
        {t.research.keyFindings}
      </h2>

      <div className="space-y-4">
        {researchFindings.map((finding, i) => (
          <motion.div
            key={finding.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card variant="outlined" padding="md">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-1 mt-1 flex-shrink-0">
                  {Array.from({ length: Math.min(5, Math.ceil(finding.impactScore / 2)) }).map((_, j) => (
                    <Star
                      key={j}
                      size={12}
                      className="text-golden-500 fill-golden-500"
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-sand-900 dark:text-sand-100 mb-2">
                    {locale === 'en' ? finding.titleEn : finding.titleTr}
                  </h3>
                  <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed mb-3">
                    {locale === 'en' ? finding.summaryEn : finding.summaryTr}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300">
                      {finding.category}
                    </span>
                    <span className="text-xs text-sand-400">{finding.year}</span>
                  </div>
                  <p className="text-xs text-sand-500 mt-2 italic">{finding.citation}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
