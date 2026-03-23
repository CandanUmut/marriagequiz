'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileDown,
  ImageIcon,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Eye,
  Lightbulb,
  BarChart3,
  Radar,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import RadarChart from '@/components/ui/RadarChart';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { generateInsights } from '@/lib/quiz/insights';
import { detectBlindSpots } from '@/lib/quiz/scoring';
import { encodeProfile } from '@/lib/export/share';
import { generatePDF } from '@/lib/export/pdf';
import { generateShareImage } from '@/lib/export/image';
import DimensionCard from './DimensionCard';
import InsightCard from './InsightCard';
import type { ProfileResult, BlindSpot } from '@/lib/types/results';

interface ResultsDashboardProps {
  profile: ProfileResult;
}

function getHonestyConfig(score: number) {
  if (score > 80)
    return {
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      Icon: ShieldCheck,
      labelEn: 'High Honesty',
      labelTr: 'Yuksek Durustluk',
    };
  if (score > 60)
    return {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      Icon: ShieldAlert,
      labelEn: 'Moderate Honesty',
      labelTr: 'Orta Durustluk',
    };
  return {
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    Icon: ShieldX,
    labelEn: 'Low Honesty Score',
    labelTr: 'Dusuk Durustluk Puani',
  };
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

export default function ResultsDashboard({ profile }: ResultsDashboardProps) {
  const { locale } = useLocale();
  const [codeCopied, setCodeCopied] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingImage, setExportingImage] = useState(false);

  const insights = generateInsights(profile.dimensions);
  const blindSpots = detectBlindSpots(profile.dimensions);
  const honestyConfig = getHonestyConfig(profile.honestyCalibration.score);
  const HonestyIcon = honestyConfig.Icon;

  // Radar chart data
  const radarData = profile.dimensions.map((dim) => {
    const catDef = categoryDefinitions[dim.categoryId];
    const label = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
    return {
      dimension: label || dim.categoryId,
      value: dim.selfScore,
      fullMark: 100,
    };
  });

  // Export handlers
  const handleCopyCode = useCallback(async () => {
    const code = encodeProfile(profile);
    await navigator.clipboard.writeText(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2500);
  }, [profile]);

  const handleExportPDF = useCallback(async () => {
    setExportingPDF(true);
    try {
      await generatePDF(profile, locale);
    } finally {
      setExportingPDF(false);
    }
  }, [profile, locale]);

  const handleExportImage = useCallback(async () => {
    setExportingImage(true);
    try {
      const blob = await generateShareImage(profile, locale);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hayirlisi-profile-${profile.id}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingImage(false);
    }
  }, [profile, locale]);

  // Labels
  const t = {
    profileType: locale === 'en' ? 'Your Profile' : 'Profiliniz',
    honesty: locale === 'en' ? 'Honesty Calibration' : 'Durustluk Kalibrasyonu',
    honestyScore: locale === 'en' ? 'Score' : 'Puan',
    consistency: locale === 'en' ? 'Consistency' : 'Tutarlilik',
    radarTitle: locale === 'en' ? 'Dimension Overview' : 'Boyut Genel Bakisi',
    dimensions: locale === 'en' ? 'Dimension Breakdown' : 'Boyut Detaylari',
    insights: locale === 'en' ? 'Key Insights' : 'Onemli Bilgiler',
    insightsEmpty: locale === 'en'
      ? 'No specific insights for your current profile. This typically means your answers are well-balanced.'
      : 'Mevcut profiliniz icin belirli bir bilgi yok. Bu genellikle yanitlarinizin dengeli oldugu anlamina gelir.',
    blindSpots: locale === 'en' ? 'Potential Blind Spots' : 'Olasi Kor Noktalar',
    blindSpotsEmpty: locale === 'en'
      ? 'No blind spots detected. Your stated priorities align well with your answer patterns.'
      : 'Kor nokta tespit edilmedi. Belirtilen oncelikleriniz yanit kaliplariyla uyumlu.',
    export: locale === 'en' ? 'Share & Export' : 'Paylas ve Disari Aktar',
    downloadPDF: locale === 'en' ? 'Download PDF' : 'PDF Indir',
    downloadImage: locale === 'en' ? 'Download Image' : 'Gorsel Indir',
    copyCode: locale === 'en' ? 'Copy Code' : 'Kodu Kopyala',
    copied: locale === 'en' ? 'Copied!' : 'Kopyalandi!',
    exporting: locale === 'en' ? 'Exporting...' : 'Disa aktariliyor...',
    honestyNote: locale === 'en'
      ? 'This score reflects how consistently and candidly you answered. Higher is better, but no score is inherently bad — it helps calibrate how to read your results.'
      : 'Bu puan, yanitlarinizin ne kadar tutarli ve samimi oldugunu yansitir. Yuksek daha iyidir, ancak dusuk puan kotu demek degildir — sonuclarinizi nasil okumaniz gerektigini kalibre etmeye yardimci olur.',
    statedVsRevealed:
      locale === 'en' ? 'Stated vs. Revealed' : 'Belirtilen vs. Ortaya Cikan',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Section 1: Profile Type */}
      <motion.section custom={0} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-2 mb-3">
            <Radar className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-primary-800 dark:text-primary-300">
              {t.profileType}
            </h2>
          </div>
          <p className="text-sand-700 dark:text-sand-300 leading-relaxed text-lg">
            {locale === 'en' ? profile.typeDescription.en : profile.typeDescription.tr}
          </p>
        </Card>
      </motion.section>

      {/* Section 2: Honesty Calibration */}
      <motion.section custom={1} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card
          variant="outlined"
          padding="md"
          className={`border ${honestyConfig.border} ${honestyConfig.bg}`}
        >
          <div className="flex items-start gap-4">
            <div className="shrink-0">
              <HonestyIcon className={`w-8 h-8 ${honestyConfig.color}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-sand-900 dark:text-sand-100 mb-1">
                {t.honesty}
              </h3>
              <div className="flex items-center gap-4 mb-2">
                <span className={`text-2xl font-bold ${honestyConfig.color}`}>
                  {profile.honestyCalibration.score}
                  <span className="text-sm font-normal text-sand-500">/100</span>
                </span>
                <span className={`text-sm font-medium ${honestyConfig.color}`}>
                  {locale === 'en' ? honestyConfig.labelEn : honestyConfig.labelTr}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-sand-500 mb-2">
                <span>
                  {t.consistency}: {profile.overallConsistency}%
                </span>
                {profile.honestyCalibration.flags.length > 0 && (
                  <span>
                    {profile.honestyCalibration.flags.length}{' '}
                    {locale === 'en' ? 'flags' : 'isaret'}
                  </span>
                )}
              </div>
              <p className="text-xs text-sand-500 dark:text-sand-400 leading-relaxed">
                {t.honestyNote}
              </p>
            </div>
          </div>
        </Card>
      </motion.section>

      {/* Section 3: Radar Chart */}
      <motion.section custom={2} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card variant="default" padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
              {t.radarTitle}
            </h2>
          </div>
          <RadarChart data={radarData} primaryColor="#2d9a89" height={380} />
        </Card>
      </motion.section>

      {/* Section 4: Dimension Breakdown */}
      <motion.section custom={3} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
            {t.dimensions}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.dimensions.map((dim) => (
            <DimensionCard key={dim.categoryId} dimension={dim} />
          ))}
        </div>
      </motion.section>

      {/* Section 5: Insights */}
      <motion.section custom={4} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-golden-500" />
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
            {t.insights}
          </h2>
        </div>
        {insights.length > 0 ? (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <InsightCard key={`${insight.categoryId}-${i}`} insight={insight} />
            ))}
          </div>
        ) : (
          <Card variant="outlined" padding="md">
            <p className="text-sm text-sand-500 dark:text-sand-400 text-center italic">
              {t.insightsEmpty}
            </p>
          </Card>
        )}
      </motion.section>

      {/* Section 6: Blind Spots */}
      <motion.section custom={5} initial="hidden" animate="visible" variants={sectionVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5 text-accent-500" />
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
            {t.blindSpots}
          </h2>
        </div>
        {blindSpots.length > 0 ? (
          <div className="space-y-3">
            {blindSpots.map((spot, i) => (
              <BlindSpotCard key={`${spot.categoryId}-${i}`} spot={spot} locale={locale} />
            ))}
          </div>
        ) : (
          <Card variant="outlined" padding="md">
            <p className="text-sm text-sand-500 dark:text-sand-400 text-center italic">
              {t.blindSpotsEmpty}
            </p>
          </Card>
        )}
      </motion.section>

      {/* Section 7: Export / Share */}
      <motion.section custom={6} initial="hidden" animate="visible" variants={sectionVariants}>
        <Card variant="elevated" padding="lg">
          <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100 mb-4">
            {t.export}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="md"
              onClick={handleExportPDF}
              disabled={exportingPDF}
            >
              <FileDown className="w-4 h-4 mr-2" />
              {exportingPDF ? t.exporting : t.downloadPDF}
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleExportImage}
              disabled={exportingImage}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {exportingImage ? t.exporting : t.downloadImage}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleCopyCode}
            >
              {codeCopied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {t.copied}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {t.copyCode}
                </>
              )}
            </Button>
          </div>
        </Card>
      </motion.section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline BlindSpotCard (internal to this file)                        */
/* ------------------------------------------------------------------ */

function BlindSpotCard({ spot, locale }: { spot: BlindSpot; locale: 'en' | 'tr' }) {
  const catDef = categoryDefinitions[spot.categoryId];
  const title = locale === 'en' ? spot.titleEn : spot.titleTr;
  const description = locale === 'en' ? spot.descriptionEn : spot.descriptionTr;
  const statedLabel = locale === 'en' ? 'Stated' : 'Belirtilen';
  const revealedLabel = locale === 'en' ? 'Revealed' : 'Ortaya Cikan';

  return (
    <Card variant="outlined" padding="md" className="border-l-4 border-l-accent-400">
      <div className="flex items-start gap-3">
        <Eye className="w-5 h-5 text-accent-500 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-sand-900 dark:text-sand-100 mb-1">
            {title}
          </h4>

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

          <p className="text-sm text-sand-700 dark:text-sand-300 leading-relaxed mb-3">
            {description}
          </p>

          {/* Stated vs Revealed mini-bars */}
          <div className="flex items-center gap-4 text-xs text-sand-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-500" />
              <span>
                {statedLabel}: {spot.statedPreference}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              <span>
                {revealedLabel}: {spot.revealedPattern}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
