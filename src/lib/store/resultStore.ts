import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProfileResult } from '@/lib/types/results';

interface ResultState {
  currentResult: ProfileResult | null;
  savedResults: ProfileResult[];

  setResult: (result: ProfileResult) => void;
  saveResult: (result: ProfileResult) => void;
  clearResult: () => void;
  getResultById: (id: string) => ProfileResult | undefined;
}

export const useResultStore = create<ResultState>()(
  persist(
    (set, get) => ({
      currentResult: null,
      savedResults: [],

      setResult: (result) => {
        set({ currentResult: result });
      },

      saveResult: (result) => {
        set((state) => ({
          savedResults: [
            result,
            ...state.savedResults.filter((r) => r.id !== result.id),
          ].slice(0, 10), // Keep last 10
          currentResult: result,
        }));
      },

      clearResult: () => {
        set({ currentResult: null });
      },

      getResultById: (id) => {
        const { savedResults, currentResult } = get();
        if (currentResult?.id === id) return currentResult;
        return savedResults.find((r) => r.id === id);
      },
    }),
    {
      name: 'hayirlisi-results',
    }
  )
);
