import type { CategoryId } from './quiz';
import type { ProfileResult } from './results';

export type CollisionSeverity = 'critical' | 'serious';

export interface DealBreakerCollision {
  category: CategoryId;
  questionKey: string;
  personAPosition: number;
  personBPosition: number;
  personAIsDealBreaker: boolean;
  personBIsDealBreaker: boolean;
  severity: CollisionSeverity;
  descriptionEn: string;
  descriptionTr: string;
}

export interface DimensionAlignment {
  categoryId: CategoryId;
  alignmentScore: number;
  zone: 'green' | 'yellow' | 'red';
  personAScore: number;
  personBScore: number;
  personADealBreaker: boolean;
  personBDealBreaker: boolean;
  hasDealBreakerCollision: boolean;
  summaryEn: string;
  summaryTr: string;
  researchNoteEn: string;
  researchNoteTr: string;
}

export interface ScoreFraming {
  band: 'strong' | 'good' | 'significant' | 'fundamental' | 'critical';
  labelEn: string;
  labelTr: string;
  descriptionEn: string;
  descriptionTr: string;
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
  scoreCeiling: number;
  dealBreakerCollisions: DealBreakerCollision[];
  framing: ScoreFraming;
  dimensionAlignments: DimensionAlignment[];
  asymmetryAlerts: AsymmetryAlert[];
  compromiseRoadmap: CompromiseItem[];
}

export interface ShareableCode {
  version: number;
  data: string;
}
