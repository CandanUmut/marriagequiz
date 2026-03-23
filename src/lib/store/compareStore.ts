import { create } from 'zustand';
import { ComparisonResult } from '@/lib/types/compare';
import { ProfileResult } from '@/lib/types/results';

interface CompareState {
  profileA: ProfileResult | null;
  profileB: ProfileResult | null;
  comparisonResult: ComparisonResult | null;

  setProfileA: (profile: ProfileResult) => void;
  setProfileB: (profile: ProfileResult) => void;
  setComparisonResult: (result: ComparisonResult) => void;
  clearComparison: () => void;
}

export const useCompareStore = create<CompareState>()((set) => ({
  profileA: null,
  profileB: null,
  comparisonResult: null,

  setProfileA: (profile) => set({ profileA: profile }),
  setProfileB: (profile) => set({ profileB: profile }),
  setComparisonResult: (result) => set({ comparisonResult: result }),
  clearComparison: () =>
    set({ profileA: null, profileB: null, comparisonResult: null }),
}));
