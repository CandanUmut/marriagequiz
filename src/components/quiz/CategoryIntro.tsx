'use client';

import { motion } from 'framer-motion';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { CategoryId } from '@/lib/types/quiz';
import Button from '@/components/ui/Button';
import * as Icons from 'lucide-react';

interface CategoryIntroProps {
  categoryId: CategoryId;
  questionCount: number;
  onStart: () => void;
}

export default function CategoryIntro({ categoryId, questionCount, onStart }: CategoryIntroProps) {
  const { locale } = useLocale();
  const catDef = categoryDefinitions[categoryId];

  const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
  const description = locale === 'en' ? catDef?.descriptionEn : catDef?.descriptionTr;
  const citation = locale === 'en' ? catDef?.researchCitationEn : catDef?.researchCitationTr;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (Icons as any)[catDef?.iconName || 'Circle'] || Icons.Circle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center px-4 py-16"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ backgroundColor: `${catDef?.color}15` }}
      >
        <IconComponent size={32} style={{ color: catDef?.color }} />
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
        {name}
      </h2>

      <p className="text-base text-sand-600 dark:text-sand-400 leading-relaxed mb-6 max-w-lg mx-auto">
        {description}
      </p>

      <div className="bg-primary-50 dark:bg-primary-950/50 rounded-xl p-4 mb-8 max-w-lg mx-auto">
        <p className="text-xs text-primary-700 dark:text-primary-300 italic leading-relaxed">
          {citation}
        </p>
      </div>

      <p className="text-sm text-sand-500 mb-6">
        {questionCount} {locale === 'en' ? 'questions' : 'soru'} · ~{Math.ceil(questionCount * 0.5)}{' '}
        {locale === 'en' ? 'minutes' : 'dakika'}
      </p>

      <Button onClick={onStart} size="lg">
        {locale === 'en' ? 'Begin' : 'Başla'}
      </Button>

      <div className="mt-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sand-100 dark:bg-sand-800">
        <span className="text-xs font-medium" style={{ color: catDef?.color }}>
          {catDef?.weight}
        </span>
        <span className="text-xs text-sand-500">
          {locale === 'en' ? 'importance' : 'önem düzeyi'}
        </span>
      </div>
    </motion.div>
  );
}
