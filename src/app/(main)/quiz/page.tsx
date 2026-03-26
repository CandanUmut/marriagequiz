'use client';

import { Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuizStore } from '@/lib/store/quizStore';
import { useResultStore } from '@/lib/store/resultStore';
import { useLocale, useTranslations } from '@/lib/i18n/config';
import { questionsByCategory } from '@/lib/quiz/questions';
import { categoryDefinitions, categoryOrder } from '@/lib/quiz/categories';
import { calculateFullProfile, getFlaggedQuestions } from '@/lib/quiz/scoring';
import { shouldShowHonestyNudge } from '@/lib/quiz/honesty';
import QuizShell from '@/components/quiz/QuizShell';
import QuestionCard from '@/components/quiz/QuestionCard';
import CategoryIntro from '@/components/quiz/CategoryIntro';
import QuizNavigation from '@/components/quiz/QuizNavigation';
import HonestyPrompt from '@/components/quiz/HonestyPrompt';
import QuizCategoryNav from '@/components/quiz/QuizCategoryNav';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Play, RotateCcw, Check, ShieldAlert, ArrowLeft, Send } from 'lucide-react';
import { CategoryId } from '@/lib/types/quiz';

type Phase = 'setup' | 'category-intro' | 'question' | 'honesty-nudge' | 'review';

function QuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const t = useTranslations();

  const {
    progress,
    isStarted,
    startQuiz,
    setAnswer,
    nextQuestion,
    prevQuestion,
    nextCategory,
    setCurrentQuestion,
    completeQuiz,
    resetQuiz,
    getAnswer,
    hasExistingProgress,
  } = useQuizStore();

  const { saveResult } = useResultStore();

  // Edit mode: check for ?edit=<categoryId>
  const editCategoryId = searchParams.get('edit') as CategoryId | null;
  const editCategoryIndex = editCategoryId
    ? categoryOrder.indexOf(editCategoryId)
    : -1;
  const isEditMode = editCategoryId !== null && editCategoryIndex >= 0;

  // Determine initial phase
  const getInitialPhase = (): Phase => {
    if (isEditMode) return 'question';
    if (isStarted) return 'question';
    return 'setup';
  };

  const [phase, setPhase] = useState<Phase>(getInitialPhase);
  const [showCategoryIntro, setShowCategoryIntro] = useState(true);
  const [editInitialized, setEditInitialized] = useState(false);

  // When entering edit mode, jump to the correct category
  useEffect(() => {
    if (isEditMode && !editInitialized) {
      setCurrentQuestion(editCategoryIndex, 0);
      // Ensure quiz is marked as started
      if (!isStarted) {
        useQuizStore.setState({ isStarted: true });
      }
      setPhase('question');
      setEditInitialized(true);
    }
  }, [isEditMode, editCategoryIndex, editInitialized, setCurrentQuestion, isStarted]);

  const selectedCategories = progress.selectedCategories;
  const currentCatId = selectedCategories[progress.currentCategoryIndex];
  const currentQuestions = useMemo(
    () => questionsByCategory[currentCatId] || [],
    [currentCatId]
  );
  const currentQuestion = currentQuestions[progress.currentQuestionIndex];

  const totalQuestions = useMemo(
    () => selectedCategories.reduce((sum, catId) => sum + (questionsByCategory[catId]?.length || 0), 0),
    [selectedCategories]
  );

  const answeredCount = Object.keys(progress.answers).length;

  const overallProgress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const categoryProgress = currentQuestions.length > 0
    ? (progress.currentQuestionIndex / currentQuestions.length) * 100
    : 0;

  // Finish edit mode: recalculate and go back to results
  const finishEditMode = useCallback(() => {
    const profile = calculateFullProfile(progress.answers, selectedCategories);
    saveResult(profile);
    router.push('/results');
  }, [progress.answers, selectedCategories, saveResult, router]);

  const handleStart = useCallback((fresh: boolean) => {
    if (fresh) resetQuiz();
    startQuiz();
    setPhase('category-intro');
    setShowCategoryIntro(true);
  }, [resetQuiz, startQuiz]);

  const handleCategoryIntroStart = useCallback(() => {
    setPhase('question');
    setShowCategoryIntro(false);
  }, []);

  const handleAnswer = useCallback((value: number | number[], dealBreaker?: boolean) => {
    if (!currentQuestion) return;
    setAnswer(currentQuestion.id, value, dealBreaker);
  }, [currentQuestion, setAnswer]);

  const handleNext = useCallback(() => {
    const isLastQuestionInCategory = progress.currentQuestionIndex >= currentQuestions.length - 1;
    const isLastCategory = progress.currentCategoryIndex >= selectedCategories.length - 1;

    // In edit mode, when we reach the last question of the edited category, finish
    if (isEditMode && isLastQuestionInCategory) {
      finishEditMode();
      return;
    }

    // Check honesty nudge (not in edit mode)
    if (!isEditMode) {
      const newAnsweredCount = answeredCount + 1;
      if (shouldShowHonestyNudge(newAnsweredCount)) {
        setPhase('honesty-nudge');
        return;
      }
    }

    if (isLastQuestionInCategory && isLastCategory) {
      // Show review screen instead of completing immediately
      setPhase('review');
      return;
    }

    if (isLastQuestionInCategory) {
      nextCategory(selectedCategories.length);
      setPhase('category-intro');
      setShowCategoryIntro(true);
    } else {
      nextQuestion(currentQuestions.length);
    }
  }, [
    progress, currentQuestions, selectedCategories, answeredCount,
    isEditMode, finishEditMode, nextCategory, nextQuestion,
  ]);

  const handlePrev = useCallback(() => {
    if (progress.currentQuestionIndex > 0) {
      prevQuestion();
    }
  }, [progress.currentQuestionIndex, prevQuestion]);

  const handleHonestyContinue = useCallback(() => {
    setPhase('question');
    // Continue with the navigation that was interrupted
    const isLastQuestionInCategory = progress.currentQuestionIndex >= currentQuestions.length - 1;
    const isLastCategory = progress.currentCategoryIndex >= selectedCategories.length - 1;

    if (isLastQuestionInCategory && isLastCategory) {
      setPhase('review');
    } else if (isLastQuestionInCategory) {
      nextCategory(selectedCategories.length);
      setPhase('category-intro');
      setShowCategoryIntro(true);
    } else {
      nextQuestion(currentQuestions.length);
    }
  }, [progress, currentQuestions, selectedCategories, nextCategory, nextQuestion]);

  // Handle jumping to a category from the review screen or nav drawer
  const handleNavigateToCategory = useCallback((catIndex: number) => {
    setCurrentQuestion(catIndex, 0);
    setPhase('question');
    setShowCategoryIntro(false);
  }, [setCurrentQuestion]);

  const handleReviewCategoryClick = handleNavigateToCategory;

  // Handle final submission from review screen
  const handleSubmitFromReview = useCallback(() => {
    completeQuiz();
    const profile = calculateFullProfile(progress.answers, selectedCategories);
    saveResult(profile);
    router.push('/results');
  }, [completeQuiz, progress.answers, selectedCategories, saveResult, router]);

  // Setup phase
  if (phase === 'setup' || (!isStarted && !isEditMode)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
            {t.quiz.title}
          </h1>
          <p className="text-base text-sand-600 dark:text-sand-400 leading-relaxed max-w-lg mx-auto">
            {t.quiz.intro}
          </p>
        </div>

        {hasExistingProgress() && (
          <Card variant="outlined" padding="lg" className="mb-6">
            <p className="text-sm text-sand-700 dark:text-sand-300 mb-4">
              {t.quiz.progressSaved}
            </p>
            <div className="flex gap-3">
              <Button onClick={() => { setPhase('question'); useQuizStore.setState({ isStarted: true }); }}>
                <Play size={16} className="mr-2" />
                {t.quiz.resumeQuiz}
              </Button>
              <Button variant="outline" onClick={() => handleStart(true)}>
                <RotateCcw size={16} className="mr-2" />
                {t.quiz.startFresh}
              </Button>
            </div>
          </Card>
        )}

        <Card variant="elevated" padding="lg">
          <h3 className="font-serif font-bold text-sand-900 dark:text-sand-100 mb-4">
            {t.quiz.selectCategories}
          </h3>
          <p className="text-sm text-sand-500 mb-6">
            {t.quiz.estimatedTime}: ~{Math.ceil(totalQuestions * 0.5)} {t.quiz.minutes}
          </p>

          <div className="space-y-3 mb-8">
            {categoryOrder.map((catId) => {
              const catDef = categoryDefinitions[catId];
              const name = locale === 'en' ? catDef.nameEn : catDef.nameTr;
              const qCount = questionsByCategory[catId]?.length || 0;
              return (
                <div key={catId} className="flex items-center justify-between py-2 px-3 rounded-lg bg-sand-50 dark:bg-sand-900">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: catDef.color }} />
                    <span className="text-sm font-medium text-sand-800 dark:text-sand-200">{name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sand-200 dark:bg-sand-700 text-sand-600 dark:text-sand-400">
                      {catDef.weight}
                    </span>
                    <span className="text-xs text-sand-500">{qCount}q</span>
                  </div>
                </div>
              );
            })}
          </div>

          <Button onClick={() => handleStart(true)} size="lg" className="w-full">
            {t.landing.ctaButton}
          </Button>

          <p className="text-xs text-sand-400 mt-4 text-center italic">
            {t.quiz.honestyPrompt}
          </p>
        </Card>
      </div>
    );
  }

  // Review phase - shown before final submission
  if (phase === 'review') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-sand-900 dark:text-sand-100 mb-2">
            {t.common.reviewAnswers}
          </h1>
          <p className="text-sm text-sand-600 dark:text-sand-400">
            {locale === 'en'
              ? 'Review each section before submitting your results.'
              : 'Sonuclarinizi gondermeden once her bolumu gozden gecirin.'}
          </p>
        </div>

        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="space-y-2">
            {selectedCategories.map((catId, catIndex) => {
              const catDef = categoryDefinitions[catId];
              const name = locale === 'en' ? catDef.nameEn : catDef.nameTr;
              const catQuestions = questionsByCategory[catId] || [];
              const answeredInCat = catQuestions.filter(
                (q) => progress.answers[q.id] !== undefined
              ).length;
              const allAnswered = answeredInCat === catQuestions.length;
              const hasDealBreaker = catQuestions.some(
                (q) => progress.answers[q.id]?.dealBreaker
              );

              return (
                <motion.button
                  key={catId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: catIndex * 0.04, duration: 0.25 }}
                  onClick={() => handleReviewCategoryClick(catIndex)}
                  className="w-full flex items-center justify-between py-3 px-4 rounded-xl border border-sand-100 dark:border-sand-800 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-sand-50 dark:hover:bg-sand-900/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: catDef.color + '20' }}
                    >
                      {allAnswered ? (
                        <Check className="w-4 h-4" style={{ color: catDef.color }} />
                      ) : (
                        <span
                          className="text-xs font-bold"
                          style={{ color: catDef.color }}
                        >
                          {answeredInCat}/{catQuestions.length}
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-medium text-sand-800 dark:text-sand-200">
                        {name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-medium ${
                            allAnswered
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-yellow-600 dark:text-yellow-400'
                          }`}
                        >
                          {allAnswered ? t.common.allAnswered : t.common.incomplete}
                        </span>
                        {hasDealBreaker && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-accent-600 dark:text-accent-400">
                            <ShieldAlert className="w-3 h-3" />
                            {t.common.dealBreakerMarked}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <ArrowLeft className="w-4 h-4 text-sand-400 rotate-180" />
                </motion.button>
              );
            })}
          </div>
        </Card>

        <Button onClick={handleSubmitFromReview} size="lg" className="w-full">
          <Send size={16} className="mr-2" />
          {t.common.submitAndView}
        </Button>
      </div>
    );
  }

  // Category intro phase (not shown in edit mode)
  if (phase === 'category-intro' && showCategoryIntro && currentCatId && !isEditMode) {
    return (
      <CategoryIntro
        categoryId={currentCatId}
        questionCount={currentQuestions.length}
        onStart={handleCategoryIntroStart}
      />
    );
  }

  // Honesty nudge phase
  if (phase === 'honesty-nudge') {
    return <HonestyPrompt onContinue={handleHonestyContinue} />;
  }

  // Question phase
  if (!currentQuestion) return null;

  const existingAnswer = getAnswer(currentQuestion.id);

  // In edit mode, compute flagged questions for the current category
  const flaggedQuestionsForCategory = isEditMode && editCategoryId
    ? getFlaggedQuestions(editCategoryId, progress.answers)
    : [];
  const flagForCurrentQuestion = flaggedQuestionsForCategory.find(
    (f) => f.questionId === currentQuestion.id
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <QuizCategoryNav
        onNavigate={handleNavigateToCategory}
        currentCategoryIndex={progress.currentCategoryIndex}
        mode="desktop"
      />

      {/* Main quiz area */}
      <div className="flex-1 min-w-0">
        <QuizShell
          currentCategory={currentCatId}
          overallProgress={isEditMode ? categoryProgress : overallProgress}
          categoryProgress={categoryProgress}
          questionNumber={progress.currentQuestionIndex + 1}
          totalQuestions={currentQuestions.length}
          onNavigateCategory={handleNavigateToCategory}
        >
          {/* Edit mode: Back to Results button */}
          {isEditMode && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={finishEditMode}
              >
                <ArrowLeft size={16} className="mr-1" />
                {t.common.backToResults}
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              value={existingAnswer?.value}
              dealBreaker={existingAnswer?.dealBreaker}
              onAnswer={handleAnswer}
              questionNumber={progress.currentQuestionIndex + 1}
              totalQuestions={currentQuestions.length}
              flagReason={flagForCurrentQuestion?.reasonEn}
              flagReasonTr={flagForCurrentQuestion?.reasonTr}
            />
          </AnimatePresence>

          <QuizNavigation
            onPrev={handlePrev}
            onNext={handleNext}
            onSkip={handleNext}
            canPrev={progress.currentQuestionIndex > 0}
            canNext={true}
            isLastQuestion={
              isEditMode
                ? progress.currentQuestionIndex >= currentQuestions.length - 1
                : (progress.currentQuestionIndex >= currentQuestions.length - 1 &&
                   progress.currentCategoryIndex >= selectedCategories.length - 1)
            }
            hasAnswer={!!existingAnswer}
          />
        </QuizShell>
      </div>

      {/* Mobile FAB only */}
      <QuizCategoryNav
        onNavigate={handleNavigateToCategory}
        currentCategoryIndex={progress.currentCategoryIndex}
        mode="mobile"
      />
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-sand-500">Loading...</div>}>
      <QuizContent />
    </Suspense>
  );
}
