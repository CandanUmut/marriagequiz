'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardPaste, AlertCircle, UserCheck } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useLocale } from '@/lib/i18n/config';
import { decodeProfile } from '@/lib/export/share';
import { useResultStore } from '@/lib/store/resultStore';
import { categoryDefinitions } from '@/lib/quiz/categories';
import type { ProfileResult } from '@/lib/types/results';

interface CompareInputProps {
  onCompare: (profileB: ProfileResult) => void;
}

export default function CompareInput({ onCompare }: CompareInputProps) {
  const { locale } = useLocale();
  const currentResult = useResultStore((s) => s.currentResult);

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDecoding, setIsDecoding] = useState(false);

  const handleDecode = () => {
    setError(null);
    const trimmed = code.trim();

    if (!trimmed) {
      setError(
        locale === 'en'
          ? 'Please paste a share code first.'
          : 'Lütfen önce bir paylaşım kodu yapıştırın.'
      );
      return;
    }

    setIsDecoding(true);

    // Small delay for UX feedback
    setTimeout(() => {
      const decoded = decodeProfile(trimmed);
      setIsDecoding(false);

      if (!decoded) {
        setError(
          locale === 'en'
            ? 'Invalid share code. Please check and try again.'
            : 'Geçersiz paylaşım kodu. Lütfen kontrol edip tekrar deneyin.'
        );
        return;
      }

      if (decoded.dimensions.length === 0) {
        setError(
          locale === 'en'
            ? 'This code does not contain valid profile data.'
            : 'Bu kod geçerli profil verisi içermiyor.'
        );
        return;
      }

      onCompare(decoded);
    }, 300);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setCode(text);
      setError(null);
    } catch {
      // Clipboard API may not be available
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Profile A summary */}
      {currentResult && (
        <Card variant="outlined" padding="md">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
              <UserCheck size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-sm font-semibold text-sand-900 dark:text-sand-100">
              {locale === 'en' ? 'Your Profile (A)' : 'Senin Profilin (A)'}
            </h3>
          </div>

          <p className="text-sm text-sand-600 dark:text-sand-400 mb-3">
            {locale === 'en'
              ? currentResult.typeDescription.en || 'Profile completed'
              : currentResult.typeDescription.tr || 'Profil tamamlandı'}
          </p>

          <div className="flex flex-wrap gap-2">
            {currentResult.selectedCategories.slice(0, 6).map((catId) => {
              const cat = categoryDefinitions[catId];
              if (!cat) return null;
              return (
                <span
                  key={catId}
                  className="text-xs px-2 py-1 rounded-full bg-sand-100 dark:bg-sand-800 text-sand-600 dark:text-sand-400"
                >
                  {locale === 'en' ? cat.nameEn : cat.nameTr}
                </span>
              );
            })}
            {currentResult.selectedCategories.length > 6 && (
              <span className="text-xs px-2 py-1 rounded-full bg-sand-100 dark:bg-sand-800 text-sand-500">
                +{currentResult.selectedCategories.length - 6}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Code input */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-lg font-serif font-medium text-sand-900 dark:text-sand-100 mb-2">
          {locale === 'en'
            ? "Enter your partner's share code"
            : 'Partnerinizin paylaşım kodunu girin'}
        </h2>
        <p className="text-sm text-sand-500 dark:text-sand-400 mb-4">
          {locale === 'en'
            ? 'Ask your partner to share their profile code from the results page, then paste it below.'
            : 'Partnerinizden sonuç sayfasındaki profil kodunu paylaşmasını isteyin, ardından aşağıya yapıştırın.'}
        </p>

        <div className="relative">
          <textarea
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError(null);
            }}
            placeholder={
              locale === 'en'
                ? 'Paste the share code here...'
                : 'Paylaşım kodunu buraya yapıştırın...'
            }
            rows={4}
            className="w-full rounded-xl border-2 border-sand-200 dark:border-sand-700 bg-sand-50 dark:bg-sand-900 text-sand-900 dark:text-sand-100 placeholder-sand-400 dark:placeholder-sand-600 p-4 pr-12 text-sm font-mono resize-none focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
          <button
            type="button"
            onClick={handlePaste}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-sand-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950 transition-colors"
            title={locale === 'en' ? 'Paste from clipboard' : 'Panodan yapıştır'}
          >
            <ClipboardPaste size={18} />
          </button>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 mt-3 text-red-600 dark:text-red-400"
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4">
          <Button
            onClick={handleDecode}
            disabled={isDecoding || !code.trim()}
            size="lg"
            className="w-full"
          >
            {isDecoding
              ? (locale === 'en' ? 'Decoding...' : 'Çözülüyor...')
              : (locale === 'en' ? 'Compare Profiles' : 'Profilleri Karşılaştır')}
          </Button>
        </div>
      </Card>
    </div>
  );
}
