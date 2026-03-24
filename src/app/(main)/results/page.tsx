'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useResultStore } from '@/lib/store/resultStore';
import { useTranslations } from '@/lib/i18n/config';
import { decodeProfile } from '@/lib/export/share';
import { ProfileResult } from '@/lib/types/results';
import ResultsDashboard from '@/components/results/ResultsDashboard';
import Button from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ResultsContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { currentResult, savedResults } = useResultStore();
  const [profile, setProfile] = useState<ProfileResult | null>(null);

  useEffect(() => {
    const data = searchParams.get('data');
    if (data) {
      const result = decodeProfile(data);
      if (result) {
        setProfile(result.profile);
        return;
      }
    }
    if (currentResult) {
      setProfile(currentResult);
    }
  }, [searchParams, currentResult]);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
          {t.results.title}
        </h1>
        <p className="text-sand-600 dark:text-sand-400 mb-8">
          {savedResults.length > 0
            ? 'Select a saved result or take the quiz.'
            : 'Complete the quiz to see your results.'}
        </p>

        {savedResults.length > 0 && (
          <div className="space-y-3 mb-8">
            {savedResults.map((result) => (
              <button
                key={result.id}
                onClick={() => setProfile(result)}
                className="w-full text-left p-4 rounded-xl border border-sand-200 dark:border-sand-700 hover:border-primary-500 transition-colors"
              >
                <div className="text-sm font-medium text-sand-800 dark:text-sand-200">
                  {new Date(result.completedAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-sand-500 mt-1">
                  {result.dimensions.length} dimensions
                </div>
              </button>
            ))}
          </div>
        )}

        <Link href="/quiz">
          <Button>
            {t.common.startQuiz}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return <ResultsDashboard profile={profile} />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-sand-500">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}
