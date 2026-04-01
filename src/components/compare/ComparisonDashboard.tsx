'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Handshake, Layers, ShieldAlert, Download, Loader2 } from 'lucide-react';
import Card from '@/components/ui/Card';
import RadarChart from '@/components/ui/RadarChart';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import AlignmentBar from '@/components/compare/AlignmentBar';
import { generateComparisonPDF } from '@/lib/export/comparisonPdf';
import type { ComparisonResult, AsymmetryAlert, CompromiseItem, DealBreakerCollision } from '@/lib/types/compare';
import type { QuizAnswer } from '@/lib/types/quiz';

interface ComparisonDashboardProps {
  comparison: ComparisonResult;
  labelA?: string;
  labelB?: string;
  answersA?: Record<string, QuizAnswer>;
  answersB?: Record<string, QuizAnswer>;
}

function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  if (score >= 30) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
}

function scoreRingColor(score: number): string {
  if (score >= 85) return 'border-emerald-400 dark:border-emerald-500';
  if (score >= 70) return 'border-emerald-400 dark:border-emerald-500';
  if (score >= 50) return 'border-amber-400 dark:border-amber-500';
  if (score >= 30) return 'border-orange-400 dark:border-orange-500';
  return 'border-red-400 dark:border-red-500';
}

function scoreBg(score: number): string {
  if (score >= 70) return 'bg-emerald-50 dark:bg-emerald-950/30';
  if (score >= 50) return 'bg-amber-50 dark:bg-amber-950/30';
  if (score >= 30) return 'bg-orange-50 dark:bg-orange-950/30';
  return 'bg-red-50 dark:bg-red-950/30';
}

const difficultyBadge: Record<CompromiseItem['difficulty'], { bg: string; text: string; en: string; tr: string }> = {
  low: { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', en: 'Easy', tr: 'Kolay' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-700 dark:text-amber-300', en: 'Moderate', tr: 'Orta' },
  high: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', en: 'Challenging', tr: 'Zor' },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};

export default function ComparisonDashboard({ comparison, labelA, labelB, answersA, answersB }: ComparisonDashboardProps) {
  const { locale } = useLocale();
  const [isDownloading, setIsDownloading] = useState(false);
  const {
    overallAlignment,
    scoreCeiling,
    dealBreakerCollisions,
    framing,
    dimensionAlignments,
    asymmetryAlerts,
    compromiseRoadmap,
  } = comparison;

  const personALabel = labelA || (locale === 'en' ? 'Person A (You)' : 'A Kişisi (Sen)');
  const personBLabel = labelB || (locale === 'en' ? 'Person B (Partner)' : 'B Kişisi (Partner)');

  const handleDownloadPDF = async () => {
    if (!answersA || !answersB) return;
    setIsDownloading(true);
    try {
      await generateComparisonPDF(comparison, answersA, answersB, locale, personALabel, personBLabel);
    } finally {
      setIsDownloading(false);
    }
  };

  // Build radar chart data
  const radarPrimary = dimensionAlignments.map((da) => {
    const cat = categoryDefinitions[da.categoryId];
    return {
      dimension: locale === 'en' ? cat.nameEn : cat.nameTr,
      value: da.personAScore,
      fullMark: 100,
    };
  });

  const radarSecondary = dimensionAlignments.map((da) => {
    const cat = categoryDefinitions[da.categoryId];
    return {
      dimension: locale === 'en' ? cat.nameEn : cat.nameTr,
      value: da.personBScore,
      fullMark: 100,
    };
  });

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto space-y-8"
    >
      {/* ─── Deal-Breaker Collision Banner (BEFORE overall score) ─── */}
      {dealBreakerCollisions.length > 0 && (
        <motion.div variants={fadeUp}>
          <DealBreakerBanner collisions={dealBreakerCollisions} locale={locale} />
        </motion.div>
      )}

      {/* ─── Overall Score ─── */}
      <motion.div variants={fadeUp}>
        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-sm font-medium text-sand-500 dark:text-sand-400 mb-2 uppercase tracking-wider">
            {locale === 'en' ? 'Overall Alignment' : 'Genel Uyum'}
          </p>

          <div className="flex items-center justify-center mb-3">
            <div className={`w-28 h-28 rounded-full border-4 ${scoreRingColor(overallAlignment)} ${scoreBg(overallAlignment)} flex items-center justify-center`}>
              <motion.span
                className={`text-4xl font-bold tabular-nums ${scoreColor(overallAlignment)}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              >
                {Math.round(overallAlignment)}
              </motion.span>
            </div>
          </div>

          <p className={`text-base font-medium ${scoreColor(overallAlignment)}`}>
            {locale === 'en' ? framing.labelEn : framing.labelTr}
          </p>

          <p className="text-sm text-sand-600 dark:text-sand-400 mt-3 max-w-xl mx-auto leading-relaxed">
            {locale === 'en' ? framing.descriptionEn : framing.descriptionTr}
          </p>

          {dealBreakerCollisions.length > 0 && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2 italic">
              {locale === 'en'
                ? `Score reflects deal-breaker penalty (${scoreCeiling}% of base score retained). Each conflict multiplies the reduction.`
                : `Puan, vazgeçilmez çatışma cezasını yansıtıyor (baz puanın %${scoreCeiling}'i korundu). Her çatışma indirgemeyi çarpar.`}
            </p>
          )}
        </Card>
      </motion.div>

      {/* ─── Radar Chart Overlay ─── */}
      <motion.div variants={fadeUp}>
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-primary-500" />
            <h3 className="text-base font-serif font-medium text-sand-900 dark:text-sand-100">
              {locale === 'en' ? 'Profile Overlay' : 'Profil Karşılaştırması'}
            </h3>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-500" />
              <span className="text-xs text-sand-600 dark:text-sand-400">{personALabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-accent-500" />
              <span className="text-xs text-sand-600 dark:text-sand-400">{personBLabel}</span>
            </div>
          </div>

          <RadarChart data={radarPrimary} secondaryData={radarSecondary} height={360} />
        </Card>
      </motion.div>

      {/* ─── Dimension Alignment List ─── */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-primary-500" />
          <h3 className="text-base font-serif font-medium text-sand-900 dark:text-sand-100">
            {locale === 'en' ? 'Dimension Breakdown' : 'Boyut Detayları'}
          </h3>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {dimensionAlignments.map((da) => (
            <motion.div key={da.categoryId} variants={fadeUp}>
              <AlignmentBar alignment={da} />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* ─── Asymmetry Alerts ─── */}
      {asymmetryAlerts.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-base font-serif font-medium text-sand-900 dark:text-sand-100">
              {locale === 'en' ? 'Asymmetry Alerts' : 'Asimetri Uyarıları'}
            </h3>
          </div>
          <p className="text-sm text-sand-500 dark:text-sand-400 mb-3">
            {locale === 'en'
              ? 'These dimensions show significant differences in how much each person cares about them.'
              : 'Bu boyutlar, her bir kişinin ne kadar önem verdiği konusunda önemli farklılıklar gösteriyor.'}
          </p>

          <div className="space-y-3">
            {asymmetryAlerts.map((alert) => (
              <AsymmetryAlertCard key={`${alert.categoryId}-asym`} alert={alert} locale={locale} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Compromise Roadmap ─── */}
      {compromiseRoadmap.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 mb-4">
            <Handshake size={18} className="text-golden-500" />
            <h3 className="text-base font-serif font-medium text-sand-900 dark:text-sand-100">
              {locale === 'en' ? 'Compromise Roadmap' : 'Uzlaşma Yol Haritası'}
            </h3>
          </div>
          <p className="text-sm text-sand-500 dark:text-sand-400 mb-3">
            {locale === 'en'
              ? 'Research-backed suggestions for bridging your differences.'
              : 'Farklılıklarınızı aşmak için araştırma destekli öneriler.'}
          </p>

          <div className="space-y-3">
            {compromiseRoadmap.map((item) => (
              <CompromiseCard key={item.categoryId} item={item} locale={locale} />
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Download PDF ─── */}
      {answersA && answersB && (
        <motion.div variants={fadeUp} className="text-center pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            {isDownloading
              ? (locale === 'en' ? 'Generating PDF...' : 'PDF oluşturuluyor...')
              : (locale === 'en' ? 'Download Comparison Report' : 'Karşılaştırma Raporunu İndir')}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ─── Deal-Breaker Banner ─── */

function DealBreakerBanner({ collisions, locale }: { collisions: DealBreakerCollision[]; locale: 'en' | 'tr' }) {
  const criticalCount = collisions.filter((c) => c.severity === 'critical').length;
  const seriousCount = collisions.filter((c) => c.severity === 'serious').length;

  return (
    <Card variant="outlined" padding="md" className="border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert size={20} className="text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-red-700 dark:text-red-300 mb-2">
            {locale === 'en'
              ? 'DEAL-BREAKER CONFLICTS DETECTED'
              : 'VAZGEÇİLMEZ ÇATIŞMALAR TESPİT EDİLDİ'}
          </h3>

          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            {locale === 'en'
              ? `${collisions.length} fundamental conflict${collisions.length > 1 ? 's' : ''} found between your profiles${criticalCount > 0 ? ` (${criticalCount} critical` : ''}${criticalCount > 0 && seriousCount > 0 ? `, ${seriousCount} serious)` : criticalCount > 0 ? ')' : seriousCount > 0 ? ` (${seriousCount} serious)` : ''}:`
              : `Profilleriniz arasında ${collisions.length} temel çatışma bulundu${criticalCount > 0 ? ` (${criticalCount} kritik` : ''}${criticalCount > 0 && seriousCount > 0 ? `, ${seriousCount} ciddi)` : criticalCount > 0 ? ')' : seriousCount > 0 ? ` (${seriousCount} ciddi)` : ''}:`}
          </p>

          <ul className="space-y-2 mb-3">
            {collisions.map((collision, idx) => (
              <li key={`${collision.questionKey}-${idx}`} className="flex items-start gap-2">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0 ${
                  collision.severity === 'critical'
                    ? 'bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200'
                    : 'bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                }`}>
                  {collision.severity === 'critical'
                    ? (locale === 'en' ? 'CRITICAL' : 'KRİTİK')
                    : (locale === 'en' ? 'SERIOUS' : 'CİDDİ')}
                </span>
                <span className="text-sm text-red-700 dark:text-red-300">
                  {locale === 'en' ? collision.descriptionEn : collision.descriptionTr}
                </span>
              </li>
            ))}
          </ul>

          <p className="text-xs text-red-500 dark:text-red-400 italic">
            {locale === 'en'
              ? 'These are areas where research shows compromise is rarely sustainable long-term. The overall score reflects this reality.'
              : 'Bunlar, araştırmaların uzlaşmanın nadiren uzun vadeli sürdürülebilir olduğunu gösterdiği alanlardır. Genel puan bu gerçeği yansıtmaktadır.'}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ─── Sub-components ─── */

function AsymmetryAlertCard({ alert, locale }: { alert: AsymmetryAlert; locale: 'en' | 'tr' }) {
  const category = categoryDefinitions[alert.categoryId];
  const description = locale === 'en' ? alert.descriptionEn : alert.descriptionTr;

  return (
    <Card variant="outlined" padding="sm">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-full min-h-[2.5rem] rounded-full bg-amber-400 dark:bg-amber-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-sm font-medium text-sand-900 dark:text-sand-100">
              {locale === 'en' ? category.nameEn : category.nameTr}
            </h4>
            <div className="flex items-center gap-3 text-xs text-sand-500 dark:text-sand-400 flex-shrink-0">
              <span>
                A: <span className="font-medium text-primary-600 dark:text-primary-400">{Math.round(alert.personAImportance)}</span>
              </span>
              <span>
                B: <span className="font-medium text-accent-600 dark:text-accent-400">{Math.round(alert.personBImportance)}</span>
              </span>
            </div>
          </div>
          <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

function CompromiseCard({ item, locale }: { item: CompromiseItem; locale: 'en' | 'tr' }) {
  const category = categoryDefinitions[item.categoryId];
  const suggestion = locale === 'en' ? item.suggestionEn : item.suggestionTr;
  const badge = difficultyBadge[item.difficulty];

  return (
    <Card variant="outlined" padding="sm">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-golden-100 dark:bg-golden-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Handshake size={14} className="text-golden-600 dark:text-golden-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-medium text-sand-900 dark:text-sand-100">
              {locale === 'en' ? category.nameEn : category.nameTr}
            </h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.text}`}>
              {locale === 'en' ? badge.en : badge.tr}
            </span>
          </div>
          <p className="text-sm text-sand-600 dark:text-sand-400 leading-relaxed">
            {suggestion}
          </p>
          {item.researchBasis && (
            <p className="text-xs text-sand-400 dark:text-sand-500 mt-1 italic">
              {item.researchBasis}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
