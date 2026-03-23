'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from '@/lib/i18n/config';
import Card from '@/components/ui/Card';
import { Heart, Shield, BookOpen, Github, Users, AlertTriangle } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations();
  const { locale } = useLocale();

  const sections = [
    { icon: Heart, title: t.about.missionTitle, text: t.about.missionText, color: '#2d9a89' },
    { icon: BookOpen, title: t.about.researchTitle, text: t.about.researchText, color: '#dc952b' },
    { icon: Shield, title: t.about.privacyTitle, text: t.about.privacyText, color: '#3b82f6' },
    { icon: Github, title: t.about.openSourceTitle, text: t.about.openSourceText, color: '#8b5cf6' },
    { icon: Users, title: t.about.creditsTitle, text: t.about.creditsText, color: '#ec4899' },
  ];

  const keyStudies = [
    {
      name: 'Gottman Institute',
      description: locale === 'en'
        ? '"The Seven Principles for Making Marriage Work" (Gottman & Silver). "Four Horsemen" conflict patterns, 5:1 positive-to-negative ratio.'
        : '"Evliliği Etkili Kılan Yedi İlke" (Gottman & Silver). "Dört Atlı" çatışma kalıpları, 5:1 olumlu-olumsuz oranı.',
      url: 'https://www.gottman.com',
    },
    {
      name: 'PREPARE/ENRICH Assessment',
      description: locale === 'en'
        ? 'Most widely validated pre-marital assessment tool, 35+ years of research.'
        : 'En yaygın şekilde doğrulanmış evlilik öncesi değerlendirme aracı, 35+ yıllık araştırma.',
      url: 'https://www.prepare-enrich.com',
    },
    {
      name: locale === 'en' ? 'National Marriage Project (University of Virginia)' : 'Ulusal Evlilik Projesi (Virginia Üniversitesi)',
      description: locale === 'en'
        ? 'Annual "State of Our Unions" reports.'
        : 'Yıllık "Birlikteliğimizin Durumu" raporları.',
      url: 'http://nationalmarriageproject.org',
    },
    {
      name: 'Karney & Bradbury (1995)',
      description: locale === 'en'
        ? 'Longitudinal meta-analysis of marital quality and stability.'
        : 'Evlilik kalitesi ve istikrarının uzunlamasına meta-analizi.',
    },
    {
      name: 'Amato et al. (2007)',
      description: locale === 'en'
        ? '"Alone Together: How Marriage in America Is Changing"'
        : '"Birlikte Yalnız: Amerika\'da Evlilik Nasıl Değişiyor"',
    },
  ];

  const books = [
    { title: 'The Seven Principles for Making Marriage Work', author: 'John Gottman' },
    { title: 'Hold Me Tight', author: locale === 'en' ? 'Sue Johnson (attachment theory)' : 'Sue Johnson (bağlanma teorisi)' },
    { title: 'The Meaning of Marriage', author: locale === 'en' ? 'Timothy Keller (faith-based)' : 'Timothy Keller (inanç temelli)' },
    { title: 'Before You Say I Do', author: 'H. Norman Wright' },
    { title: 'The Muslim Marriage Guide', author: 'Ruqaiyyah Waris Maqsood' },
  ];

  const assessmentTools = [
    { name: 'PREPARE/ENRICH', url: 'https://www.prepare-enrich.com' },
    { name: 'RELATE (BYU)', url: 'https://www.relate-institute.org' },
    { name: locale === 'en' ? 'FOCCUS (Catholic pre-marital)' : 'FOCCUS (Katolik evlilik öncesi)', url: 'https://www.foccusinc.com' },
    { name: 'Taylor-Johnson Temperament Analysis' },
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

      {/* Research & Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sections.length * 0.1 }}
        className="mt-16"
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#dc952b15' }}
          >
            <BookOpen size={24} style={{ color: '#dc952b' }} />
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-sand-900 dark:text-sand-100">
            {locale === 'en' ? 'Research & Resources' : 'Araştırma ve Kaynaklar'}
          </h2>
        </div>

        {/* Key Studies & Frameworks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 1) * 0.1 }}
          className="mb-6"
        >
          <Card variant="outlined" padding="lg">
            <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
              {locale === 'en' ? 'Key Studies & Frameworks' : 'Temel Çalışmalar ve Çerçeveler'}
            </h3>
            <ul className="space-y-4">
              {keyStudies.map((study, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1.5 flex-shrink-0">&#8226;</span>
                  <div className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
                    {study.url ? (
                      <a
                        href={study.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        {study.name}
                      </a>
                    ) : (
                      <span className="font-semibold text-sand-900 dark:text-sand-100">{study.name}</span>
                    )}
                    {' — '}
                    {study.description}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Books for Further Reading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 2) * 0.1 }}
          className="mb-6"
        >
          <Card variant="outlined" padding="lg">
            <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
              {locale === 'en' ? 'Books for Further Reading' : 'İleri Okuma Kitapları'}
            </h3>
            <ul className="space-y-3">
              {books.map((book, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1.5 flex-shrink-0">&#8226;</span>
                  <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
                    <span className="font-semibold text-sand-900 dark:text-sand-100">
                      &ldquo;{book.title}&rdquo;
                    </span>
                    {' — '}
                    {book.author}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Assessment Tools Referenced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 3) * 0.1 }}
          className="mb-6"
        >
          <Card variant="outlined" padding="lg">
            <h3 className="text-lg font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
              {locale === 'en' ? 'Assessment Tools Referenced' : 'Referans Alınan Değerlendirme Araçları'}
            </h3>
            <ul className="space-y-3">
              {assessmentTools.map((tool, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary-500 mt-1.5 flex-shrink-0">&#8226;</span>
                  <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
                    {tool.url ? (
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold underline text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                      >
                        {tool.name}
                      </a>
                    ) : (
                      <span className="font-semibold text-sand-900 dark:text-sand-100">{tool.name}</span>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sections.length + 4) * 0.1 }}
        >
          <Card variant="outlined" padding="lg" className="border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-sand-700 dark:text-sand-300 leading-relaxed">
                {locale === 'en'
                  ? 'This tool is for self-awareness and educational purposes. It is not a substitute for professional pre-marital counseling.'
                  : 'Bu araç, öz farkındalık ve eğitim amaçlıdır. Profesyonel evlilik öncesi danışmanlığın yerini tutmaz.'}
              </p>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
