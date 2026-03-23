export type CategoryId =
  | 'values'
  | 'communication'
  | 'financial'
  | 'family'
  | 'goals'
  | 'intimacy'
  | 'household'
  | 'health'
  | 'social'
  | 'growth'
  | 'worklife'
  | 'aesthetic';

export type CategoryWeight = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type QuestionType =
  | 'likert'
  | 'scenario'
  | 'ranking'
  | 'thisOrThat'
  | 'slider'
  | 'dealbreaker';

export interface QuestionOption {
  id: string;
  textEn: string;
  textTr: string;
  value: number;
}

export interface Question {
  id: string;
  categoryId: CategoryId;
  type: QuestionType;
  textEn: string;
  textTr: string;
  options?: QuestionOption[];
  sliderLabels?: { minEn: string; minTr: string; maxEn: string; maxTr: string };
  likertLabels?: { lowEn: string; lowTr: string; highEn: string; highTr: string };
  honestyPairId?: string;
  socialDesirabilityFlag: boolean;
  dealBreakerFollowUp: boolean;
}

export interface Category {
  id: CategoryId;
  nameEn: string;
  nameTr: string;
  descriptionEn: string;
  descriptionTr: string;
  iconName: string;
  weight: CategoryWeight;
  color: string;
  researchCitationEn: string;
  researchCitationTr: string;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  value: number | number[];
  dealBreaker?: boolean;
  timestamp: number;
}

export interface QuizProgress {
  currentCategoryIndex: number;
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer>;
  startedAt: string;
  selectedCategories: CategoryId[];
}
