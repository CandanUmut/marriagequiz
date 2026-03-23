'use client';

import { motion } from 'framer-motion';
import { useTranslations } from '@/lib/i18n/config';
import Card from '@/components/ui/Card';
import { Heart, Shield, BookOpen, Github, Users } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations();

  const sections = [
    { icon: Heart, title: t.about.missionTitle, text: t.about.missionText, color: '#2d9a89' },
    { icon: BookOpen, title: t.about.researchTitle, text: t.about.researchText, color: '#dc952b' },
    { icon: Shield, title: t.about.privacyTitle, text: t.about.privacyText, color: '#3b82f6' },
    { icon: Github, title: t.about.openSourceTitle, text: t.about.openSourceText, color: '#8b5cf6' },
    { icon: Users, title: t.about.creditsTitle, text: t.about.creditsText, color: '#ec4899' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
          {t.about.title}
        </h1>
      </motion.div>

      <div className="space-y-6">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card variant="outlined" padding="lg">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${section.color}15` }}
                >
                  <section.icon size={24} style={{ color: section.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mb-2">
                    {section.title}
                  </h2>
                  <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
                    {section.text}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
