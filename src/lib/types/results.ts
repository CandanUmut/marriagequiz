import type { CategoryId } from './quiz';

export interface DimensionScore {
  categoryId: CategoryId;
  selfScore: number;
  importanceScore: number;
  flexibilityScore: number;
  dealBreaker: boolean;
  consistencyScore: number;
}

export interface ProfileResult {
  id: string;
  version: number;
  dimensions: DimensionScore[];
  overallConsistency: number;
  honestyCalibration: {
    score: number;
    flags: string[];
  };
  typeDescription: {
    en: string;
    tr: string;
  };
  completedAt: string;
  selectedCategories: CategoryId[];
}

export interface Insight {
  categoryId: CategoryId;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  severity: 'info' | 'warning' | 'alert';
  researchBasis: string;
}

export interface BlindSpot {
  categoryId: CategoryId;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  statedPreference: number;
  revealedPattern: number;
}
