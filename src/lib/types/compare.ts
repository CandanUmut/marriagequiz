import type { CategoryId } from './quiz';
import type { ProfileResult } from './results';

export interface DimensionAlignment {
  categoryId: CategoryId;
  alignmentScore: number;
  zone: 'green' | 'yellow' | 'red';
  personAScore: number;
  personBScore: number;
  personADealBreaker: boolean;
  personBDealBreaker: boolean;
}

export interface AsymmetryAlert {
  categoryId: CategoryId;
  descriptionEn: string;
  descriptionTr: string;
  personAImportance: number;
  personBImportance: number;
}

export interface CompromiseItem {
  categoryId: CategoryId;
  suggestionEn: string;
  suggestionTr: string;
  difficulty: 'low' | 'medium' | 'high';
  researchBasis: string;
}

export interface ComparisonResult {
  profileA: ProfileResult;
  profileB: ProfileResult;
  overallAlignment: number;
  dimensionAlignments: DimensionAlignment[];
  asymmetryAlerts: AsymmetryAlert[];
  compromiseRoadmap: CompromiseItem[];
}

export interface ShareableCode {
  version: number;
  data: string;
}
