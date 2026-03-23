'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/config';
import Button from '@/components/ui/Button';
import { Eye } from 'lucide-react';

interface HonestyPromptProps {
  onContinue: () => void;
}

export default function HonestyPrompt({ onContinue }: HonestyPromptProps) {
  const t = useTranslations();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-lg mx-auto text-center px-4 py-16"
    >
      <div className="w-14 h-14 rounded-2xl bg-golden-100 dark:bg-golden-900/30 flex items-center justify-center mx-auto mb-6">
        <Eye size={28} className="text-golden-600" />
      </div>

      <h3 className="text-xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
        {t.quiz.honestyCheck}
      </h3>

      <p className="text-base text-sand-600 dark:text-sand-400 leading-relaxed mb-8">
        {t.quiz.honestyCheckText}
      </p>

      <Button onClick={onContinue} variant="secondary" size="lg">
        {t.common.next}
      </Button>
    </motion.div>
  );
}
