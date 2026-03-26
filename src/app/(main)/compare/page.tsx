'use client';

import { useState } from 'react';
import { useLocale } from '@/lib/i18n/config';
import { useResultStore } from '@/lib/store/resultStore';
import { useQuizStore } from '@/lib/store/quizStore';
import { useCompareStore } from '@/lib/store/compareStore';
import { calculateCompatibility } from '@/lib/compare/matching';
import { decodeProfile } from '@/lib/export/share';
import { ProfileResult } from '@/lib/types/results';
import { QuizAnswer } from '@/lib/types/quiz';
import { ComparisonResult } from '@/lib/types/compare';
import CompareInput from '@/components/compare/CompareInput';
import ComparisonDashboard from '@/components/compare/ComparisonDashboard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { ArrowRight, Users, UserCheck, ClipboardPaste, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CompareMode = 'mine' | 'matchmaker';

export default function ComparePage() {
  const { locale } = useLocale();
  const { currentResult } = useResultStore();
  const quizAnswers = useQuizStore((s) => s.progress.answers);
  const { setProfileA, setProfileB, setComparisonResult } = useCompareStore();
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [mode, setMode] = useState<CompareMode>(currentResult ? 'mine' : 'matchmaker');

  // Matchmaker mode state
  const [codeA, setCodeA] = useState('');
  const [nicknameA, setNicknameA] = useState('');
  const [codeB, setCodeB] = useState('');
  const [nicknameB, setNicknameB] = useState('');
  const [matchmakerError, setMatchmakerError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleCompare = (profileB: ProfileResult, answersB: Record<string, QuizAnswer>) => {
    if (!currentResult) return;
    setProfileA(currentResult);
    setProfileB(profileB);
    const result = calculateCompatibility(currentResult, profileB, quizAnswers, answersB);
    setComparisonResult(result);
    setComparison(result);
  };

  const handleMatchmakerCompare = () => {
    setMatchmakerError(null);
    if (!codeA.trim() || !codeB.trim()) {
      setMatchmakerError(
        locale === 'en'
          ? 'Please paste both profile codes before comparing.'
          : 'Karşılaştırmadan önce lütfen her iki profil kodunu da yapıştırın.'
      );
      return;
    }
    setIsDecoding(true);
    setTimeout(() => {
      const resultA = decodeProfile(codeA.trim());
      const resultB = decodeProfile(codeB.trim());
      setIsDecoding(false);
      if (!resultA) {
        setMatchmakerError(
          locale === 'en'
            ? 'Profile A code is invalid. Please check and try again.'
            : 'A profil kodu geçersiz. Lütfen kontrol edip tekrar deneyin.'
        );
        return;
      }
      if (!resultB) {
        setMatchmakerError(
          locale === 'en'
            ? 'Profile B code is invalid. Please check and try again.'
            : 'B profil kodu geçersiz. Lütfen kontrol edip tekrar deneyin.'
        );
        return;
      }
      // Attach nicknames to profiles for display
      const profileA = {
        ...resultA.profile,
        nickname: nicknameA.trim() || (locale === 'en' ? 'Profile A' : 'Profil A'),
      };
      const profileB = {
        ...resultB.profile,
        nickname: nicknameB.trim() || (locale === 'en' ? 'Profile B' : 'Profil B'),
      };
      setProfileA(profileA);
      setProfileB(profileB);
      const result = calculateCompatibility(profileA, profileB, resultA.answers, resultB.answers);
      setComparisonResult(result);
      setComparison(result);
    }, 400);
  };

  if (comparison) {
    const nameA = (comparison.profileA as ProfileResult & { nickname?: string }).nickname;
    const nameB = (comparison.profileB as ProfileResult & { nickname?: string }).nickname;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <Button variant="outline" size="sm" onClick={() => setComparison(null)}>
            ← {locale === 'en' ? 'New Comparison' : 'Yeni Karşılaştırma'}
          </Button>
        </div>
        <ComparisonDashboard comparison={comparison} labelA={nameA} labelB={nameB} />
      </div>
    );
  }

  const t = {
    title: locale === 'en' ? 'Compare Profiles' : 'Profilleri Karşılaştır',
    subtitle: locale === 'en' ? 'See how two profiles align across all dimensions' : 'İki profilin tüm boyutlarda nasıl örtüştüğünü gör',
    modeMyProfile: locale === 'en' ? 'Compare with My Profile' : 'Profilimle Karşılaştır',
    modeMyProfileSub: locale === 'en' ? 'Uses your quiz results' : 'Kendi test sonuçlarını kullanır',
    modeMatchmaker: locale === 'en' ? 'Compare Two Profiles' : 'İki Profili Karşılaştır',
    modeMatchmakerSub: locale === 'en' ? 'For families, matchmakers & counselors' : 'Aileler, aracılar ve danışmanlar için',
    profileA: locale === 'en' ? 'Profile A' : 'Profil A',
    profileB: locale === 'en' ? 'Profile B' : 'Profil B',
    pasteCodeA: locale === 'en' ? 'Paste share code for Person A...' : 'A kişisinin paylaşım kodunu yapıştırın...',
    pasteCodeB: locale === 'en' ? 'Paste share code for Person B...' : 'B kişisinin paylaşım kodunu yapıştırın...',
    optionalNickname: locale === 'en' ? 'Optional nickname (e.g. "Ahmet")' : 'İsteğe bağlı takma ad (örn. "Ahmet")',
    compareBtn: locale === 'en' ? 'Compare Profiles' : 'Profilleri Karşılaştır',
    comparing: locale === 'en' ? 'Comparing...' : 'Karşılaştırılıyor...',
    privacyNote: locale === 'en'
      ? 'Share codes contain category scores only, not individual answers. No personal data is stored on any server.'
      : 'Paylaşım kodları yalnızca kategori puanlarını içerir, bireysel cevapları değil. Hiçbir sunucuda kişisel veri saklanmaz.',
    needQuiz: locale === 'en'
      ? 'Complete the quiz first to compare with someone.'
      : 'Biriyle karşılaştırmak için önce testi tamamla.',
    startQuiz: locale === 'en' ? 'Start Quiz' : 'Teste Başla',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-2 text-center">
        {t.title}
      </h1>
      <p className="text-sand-600 dark:text-sand-400 mb-8 text-center">{t.subtitle}</p>

      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-2 mb-8">
        <button
          onClick={() => setMode('mine')}
          disabled={!currentResult}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium
            ${mode === 'mine'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
              : 'border-sand-200 dark:border-sand-700 text-sand-600 dark:text-sand-400 hover:border-sand-300'
            }
            ${!currentResult ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2">
            <UserCheck size={16} />
            <span>{t.modeMyProfile}</span>
          </div>
          <span className="text-xs font-normal opacity-70">{t.modeMyProfileSub}</span>
        </button>

        <button
          onClick={() => setMode('matchmaker')}
          className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer
            ${mode === 'matchmaker'
              ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300'
              : 'border-sand-200 dark:border-sand-700 text-sand-600 dark:text-sand-400 hover:border-sand-300'
            }`}
        >
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>{t.modeMatchmaker}</span>
          </div>
          <span className="text-xs font-normal opacity-70">{t.modeMatchmakerSub}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Mode A: Compare with My Profile ── */}
        {mode === 'mine' && (
          <motion.div
            key="mine"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {!currentResult ? (
              <Card variant="outlined" padding="lg" className="text-center">
                <p className="text-sand-600 dark:text-sand-400 mb-4">{t.needQuiz}</p>
                <Link href="/quiz">
                  <Button>
                    {t.startQuiz}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </Card>
            ) : (
              <CompareInput onCompare={handleCompare} />
            )}
          </motion.div>
        )}

        {/* ── Mode B: Matchmaker — Compare Two Profiles ── */}
        {mode === 'matchmaker' && (
          <motion.div
            key="matchmaker"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Profile A */}
              <Card variant="outlined" padding="md">
                <h3 className="text-sm font-semibold text-sand-900 dark:text-sand-100 mb-3">
                  {t.profileA}
                </h3>
                <textarea
                  value={codeA}
                  onChange={(e) => { setCodeA(e.target.value); setMatchmakerError(null); }}
                  placeholder={t.pasteCodeA}
                  rows={4}
                  className="w-full rounded-lg border border-sand-200 dark:border-sand-700 bg-sand-50 dark:bg-sand-900 text-sand-900 dark:text-sand-100 placeholder-sand-400 p-3 text-xs font-mono resize-none focus:outline-none focus:border-primary-500 transition-colors"
                />
                <input
                  value={nicknameA}
                  onChange={(e) => setNicknameA(e.target.value)}
                  placeholder={t.optionalNickname}
                  className="mt-2 w-full rounded-lg border border-sand-200 dark:border-sand-700 bg-sand-50 dark:bg-sand-900 text-sand-900 dark:text-sand-100 placeholder-sand-400 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </Card>

              {/* Profile B */}
              <Card variant="outlined" padding="md">
                <h3 className="text-sm font-semibold text-sand-900 dark:text-sand-100 mb-3">
                  {t.profileB}
                </h3>
                <textarea
                  value={codeB}
                  onChange={(e) => { setCodeB(e.target.value); setMatchmakerError(null); }}
                  placeholder={t.pasteCodeB}
                  rows={4}
                  className="w-full rounded-lg border border-sand-200 dark:border-sand-700 bg-sand-50 dark:bg-sand-900 text-sand-900 dark:text-sand-100 placeholder-sand-400 p-3 text-xs font-mono resize-none focus:outline-none focus:border-primary-500 transition-colors"
                />
                <input
                  value={nicknameB}
                  onChange={(e) => setNicknameB(e.target.value)}
                  placeholder={t.optionalNickname}
                  className="mt-2 w-full rounded-lg border border-sand-200 dark:border-sand-700 bg-sand-50 dark:bg-sand-900 text-sand-900 dark:text-sand-100 placeholder-sand-400 px-3 py-2 text-sm focus:outline-none focus:border-primary-500 transition-colors"
                />
              </Card>
            </div>

            <AnimatePresence>
              {matchmakerError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400"
                >
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <p className="text-sm">{matchmakerError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleMatchmakerCompare}
              disabled={isDecoding || !codeA.trim() || !codeB.trim()}
              size="lg"
              className="w-full mb-3"
            >
              <ClipboardPaste size={16} className="mr-2" />
              {isDecoding ? t.comparing : t.compareBtn}
            </Button>

            <p className="text-xs text-sand-400 dark:text-sand-500 text-center italic">
              {t.privacyNote}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
