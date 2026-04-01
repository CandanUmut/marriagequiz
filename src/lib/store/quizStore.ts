import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CategoryId, QuizAnswer, QuizProgress } from '@/lib/types/quiz';
import { categoryOrder } from '@/lib/quiz/categories';

interface QuizState {
  progress: QuizProgress;
  isStarted: boolean;
  isComplete: boolean;

  // Actions
  startQuiz: (categories?: CategoryId[]) => void;
  setAnswer: (questionId: string, value: number | number[], dealBreaker?: boolean) => void;
  nextQuestion: (totalInCategory: number) => void;
  prevQuestion: () => void;
  nextCategory: (totalCategories: number) => void;
  setCurrentQuestion: (categoryIndex: number, questionIndex: number) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
  removeAnswer: (questionId: string) => void;
  getAnswer: (questionId: string) => QuizAnswer | undefined;
  hasExistingProgress: () => boolean;
}

const initialProgress: QuizProgress = {
  currentCategoryIndex: 0,
  currentQuestionIndex: 0,
  answers: {},
  startedAt: '',
  selectedCategories: [...categoryOrder],
};

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      progress: { ...initialProgress },
      isStarted: false,
      isComplete: false,

      startQuiz: (categories) => {
        set({
          progress: {
            ...initialProgress,
            selectedCategories: categories || [...categoryOrder],
            startedAt: new Date().toISOString(),
          },
          isStarted: true,
          isComplete: false,
        });
      },

      setAnswer: (questionId, value, dealBreaker) => {
        set((state) => ({
          progress: {
            ...state.progress,
            answers: {
              ...state.progress.answers,
              [questionId]: {
                questionId,
                value,
                dealBreaker,
                timestamp: Date.now(),
              },
            },
          },
        }));
      },

      nextQuestion: (totalInCategory) => {
        const { progress } = get();
        if (progress.currentQuestionIndex < totalInCategory - 1) {
          set({
            progress: {
              ...progress,
              currentQuestionIndex: progress.currentQuestionIndex + 1,
            },
          });
        }
      },

      prevQuestion: () => {
        const { progress } = get();
        if (progress.currentQuestionIndex > 0) {
          set({
            progress: {
              ...progress,
              currentQuestionIndex: progress.currentQuestionIndex - 1,
            },
          });
        }
      },

      nextCategory: (totalCategories) => {
        const { progress } = get();
        if (progress.currentCategoryIndex < totalCategories - 1) {
          set({
            progress: {
              ...progress,
              currentCategoryIndex: progress.currentCategoryIndex + 1,
              currentQuestionIndex: 0,
            },
          });
        }
      },

      setCurrentQuestion: (categoryIndex, questionIndex) => {
        set((state) => ({
          progress: {
            ...state.progress,
            currentCategoryIndex: categoryIndex,
            currentQuestionIndex: questionIndex,
          },
        }));
      },

      completeQuiz: () => {
        set({ isComplete: true });
      },

      resetQuiz: () => {
        set({
          progress: { ...initialProgress },
          isStarted: false,
          isComplete: false,
        });
      },

      removeAnswer: (questionId) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [questionId]: _, ...rest } = state.progress.answers;
          return { progress: { ...state.progress, answers: rest } };
        });
      },

      getAnswer: (questionId) => {
        return get().progress.answers[questionId];
      },

      hasExistingProgress: () => {
        return Object.keys(get().progress.answers).length > 0;
      },
    }),
    {
      name: 'hayirlisi-quiz',
    }
  )
);
