'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, X, ShieldAlert, Check, Circle } from 'lucide-react';
import { useLocale } from '@/lib/i18n/config';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { questionsByCategory } from '@/lib/quiz/questions';
import { useQuizStore } from '@/lib/store/quizStore';
import type { CategoryId } from '@/lib/types/quiz';

interface QuizCategoryNavProps {
  onNavigate: (catIndex: number) => void;
  currentCategoryIndex: number;
}

function getCategoryStatus(
  catId: CategoryId,
  answers: Record<string, { value?: number | number[] }>,
): 'not-started' | 'in-progress' | 'complete' {
  const questions = questionsByCategory[catId] || [];
  if (questions.length === 0) return 'not-started';
  const answered = questions.filter((q) => answers[q.id] !== undefined).length;
  if (answered === 0) return 'not-started';
  if (answered < questions.length) return 'in-progress';
  return 'complete';
}

function StatusIcon({ status }: { status: 'not-started' | 'in-progress' | 'complete' }) {
  if (status === 'complete') return <Check className="w-3.5 h-3.5 text-emerald-500" />;
  if (status === 'in-progress') return (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 bg-amber-100 dark:bg-amber-900/40" />
  );
  return <Circle className="w-3.5 h-3.5 text-sand-300 dark:text-sand-600" />;
}

export default function QuizCategoryNav({
  onNavigate,
  currentCategoryIndex,
}: QuizCategoryNavProps) {
  const { locale } = useLocale();
  const { progress } = useQuizStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const selectedCategories = progress.selectedCategories;
  const answers = progress.answers;

  const handleNavClick = useCallback((catIndex: number) => {
    onNavigate(catIndex);
    setDrawerOpen(false);
  }, [onNavigate]);

  // ── Horizontal segment bar (always visible at top of quiz shell) ──
  // Rendered separately, not here — see QuizShell

  // ── Desktop sidebar content ──
  const SidebarContent = () => (
    <div className="space-y-1 py-2">
      {selectedCategories.map((catId, idx) => {
        const catDef = categoryDefinitions[catId];
        const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
        const questions = questionsByCategory[catId] || [];
        const hasDealBreaker = questions.some((q) => answers[q.id]?.dealBreaker);
        const status = getCategoryStatus(catId, answers);
        const isCurrent = idx === currentCategoryIndex;

        return (
          <button
            key={catId}
            onClick={() => handleNavClick(idx)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all text-xs
              ${isCurrent
                ? 'bg-primary-50 dark:bg-primary-950/50 border border-primary-200 dark:border-primary-800'
                : 'hover:bg-sand-100 dark:hover:bg-sand-800/50 border border-transparent'
              }`}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: catDef?.color || '#2d9a89' }}
            />
            <span className={`flex-1 truncate ${isCurrent ? 'text-primary-700 dark:text-primary-300 font-semibold' : 'text-sand-700 dark:text-sand-300'}`}>
              {name}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasDealBreaker && (
                <ShieldAlert className="w-3 h-3 text-accent-500" />
              )}
              <StatusIcon status={status} />
            </div>
          </button>
        );
      })}
    </div>
  );

  // ── Mobile floating button + bottom drawer ──
  const MobileNav = () => (
    <>
      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-6 right-4 z-40 w-12 h-12 rounded-full bg-primary-600 shadow-lg flex items-center justify-center text-white hover:bg-primary-700 transition-colors md:hidden"
        aria-label={locale === 'en' ? 'Quiz categories' : 'Test kategorileri'}
      >
        <LayoutGrid size={20} />
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-sand-900 rounded-t-2xl shadow-2xl max-h-[75vh] overflow-hidden flex flex-col md:hidden"
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-sand-300 dark:bg-sand-600" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-sand-100 dark:border-sand-800">
                <h3 className="text-sm font-semibold text-sand-900 dark:text-sand-100">
                  {locale === 'en' ? 'All Categories' : 'Tüm Kategoriler'}
                </h3>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors"
                >
                  <X size={16} className="text-sand-500" />
                </button>
              </div>

              {/* Category list */}
              <div className="overflow-y-auto flex-1 px-3 pb-6">
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  // ── Desktop sidebar ──
  const DesktopSidebar = () => (
    <div className={`hidden md:flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-8' : 'w-52'} flex-shrink-0`}>
      <div className="sticky top-24">
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="mb-2 p-1.5 rounded-lg text-sand-400 hover:text-primary-500 hover:bg-sand-100 dark:hover:bg-sand-800 transition-colors self-end"
          title={sidebarCollapsed
            ? (locale === 'en' ? 'Expand navigation' : 'Gezinmeyi genişlet')
            : (locale === 'en' ? 'Collapse navigation' : 'Gezinmeyi daralt')}
        >
          <LayoutGrid size={16} />
        </button>

        {!sidebarCollapsed && (
          <div className="bg-white dark:bg-sand-900 rounded-xl border border-sand-100 dark:border-sand-800 shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-sand-100 dark:border-sand-800">
              <p className="text-xs font-semibold text-sand-500 dark:text-sand-400 uppercase tracking-wider">
                {locale === 'en' ? 'Categories' : 'Kategoriler'}
              </p>
            </div>
            <div className="px-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <SidebarContent />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileNav />
    </>
  );
}

// ── Horizontal Category Progress Segments (used in QuizShell) ──
export function CategoryProgressSegments({
  selectedCategories,
  answers,
  currentCategoryIndex,
  onNavigate,
}: {
  selectedCategories: CategoryId[];
  answers: Record<string, { value?: number | number[] }>;
  currentCategoryIndex: number;
  onNavigate?: (idx: number) => void;
}) {
  return (
    <div className="flex gap-0.5 w-full">
      {selectedCategories.map((catId, idx) => {
        const questions = questionsByCategory[catId] || [];
        const answered = questions.filter((q) => answers[q.id] !== undefined).length;
        const status = answered === 0
          ? 'not-started'
          : answered < questions.length
            ? 'in-progress'
            : 'complete';
        const isCurrent = idx === currentCategoryIndex;

        let segColor = 'bg-sand-200 dark:bg-sand-700'; // not started
        if (status === 'complete') segColor = 'bg-emerald-400 dark:bg-emerald-500';
        else if (status === 'in-progress') segColor = 'bg-amber-400 dark:bg-amber-500';
        if (isCurrent) segColor = 'bg-primary-500';

        return (
          <button
            key={catId}
            onClick={() => onNavigate?.(idx)}
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${segColor} ${onNavigate ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
            title={categoryDefinitions[catId]?.nameEn || catId}
          />
        );
      })}
    </div>
  );
}
