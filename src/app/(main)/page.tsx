'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n/config';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Heart, Shield, BookOpen, Users, ArrowRight, Github, Eye, BarChart3 } from 'lucide-react';

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-sand-50 to-golden-50 dark:from-primary-950 dark:via-sand-950 dark:to-sand-950" />
        <div className="relative max-w-4xl mx-auto px-4 pt-20 pb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 mb-8">
              <Shield size={16} className="text-primary-700 dark:text-primary-300" />
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">
                {t.common.privacyNote}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-bold text-sand-900 dark:text-sand-100 leading-tight mb-6 whitespace-pre-line">
              {t.landing.heroTitle}
            </h1>

            <p className="text-lg md:text-xl text-sand-600 dark:text-sand-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              {t.landing.heroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/quiz">
                <Button size="lg">
                  {t.landing.ctaButton}
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-sand-500 mt-4">{t.landing.ctaSubtext}</p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-sand-900/50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-serif font-bold text-center text-sand-900 dark:text-sand-100 mb-12">
            {t.landing.statsTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: t.landing.stat1Value, label: t.landing.stat1Label, icon: BarChart3 },
              { value: t.landing.stat2Value, label: t.landing.stat2Label, icon: Users },
              { value: t.landing.stat3Value, label: t.landing.stat3Label, icon: BookOpen },
              { value: t.landing.stat4Value, label: t.landing.stat4Label, icon: Shield },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon size={24} className="mx-auto mb-3 text-primary-600" />
                <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                  {stat.value}
                </div>
                <div className="text-sm text-sand-600 dark:text-sand-400 mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-sand-900 dark:text-sand-100 mb-16">
            {t.landing.howItWorksTitle}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: t.landing.step1Title, desc: t.landing.step1Desc, color: '#2d9a89' },
              { icon: BarChart3, title: t.landing.step2Title, desc: t.landing.step2Desc, color: '#dc952b' },
              { icon: Users, title: t.landing.step3Title, desc: t.landing.step3Desc, color: '#8b5cf6' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <Card variant="outlined" padding="lg">
                  <div className="text-center">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
                      style={{ backgroundColor: `${step.color}15` }}
                    >
                      <step.icon size={28} style={{ color: step.color }} />
                    </div>
                    <div className="text-sm font-bold text-primary-600 mb-2">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Exists */}
      <section className="py-20 bg-primary-50 dark:bg-primary-950/30 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <Heart size={32} className="mx-auto mb-6 text-primary-600" />
          <h2 className="text-3xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-6">
            {t.landing.whyTitle}
          </h2>
          <p className="text-base text-sand-600 dark:text-sand-400 leading-relaxed mb-8">
            {t.landing.whyText}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-sand-900 shadow-sm">
            <Github size={16} className="text-sand-600" />
            <span className="text-sm text-sand-700 dark:text-sand-300">
              {t.landing.openSourceTitle}
            </span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
            {t.landing.ctaButton}
          </h2>
          <p className="text-sand-600 dark:text-sand-400 mb-8">{t.landing.ctaSubtext}</p>
          <Link href="/quiz">
            <Button size="lg">
              {t.common.startQuiz}
              <ArrowRight size={20} className="ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
