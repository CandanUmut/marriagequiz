import { CategoryId, CategoryWeight } from '@/lib/types/quiz';

/**
 * Research-based dimension weights for scoring.
 * Based on effect sizes from longitudinal studies.
 */
export const dimensionWeights: Record<CategoryId, { weight: CategoryWeight; multiplier: number; evidenceBasis: string }> = {
  values: {
    weight: 'CRITICAL',
    multiplier: 3.0,
    evidenceBasis: 'Luo & Klohnen (2005); Lehrer & Chiswick (1993): Value congruence is the strongest assortative mating signal.',
  },
  communication: {
    weight: 'CRITICAL',
    multiplier: 3.0,
    evidenceBasis: 'Gottman & Levenson: Four Horsemen predict divorce with 93.6% accuracy.',
  },
  financial: {
    weight: 'HIGH',
    multiplier: 2.0,
    evidenceBasis: 'Dew, Britt & Huston (2012): Financial disagreements predict divorce more than sex, chores, or in-laws.',
  },
  family: {
    weight: 'HIGH',
    multiplier: 2.0,
    evidenceBasis: 'Children decision is a true binary incompatibility. Carroll & Doherty (2003).',
  },
  goals: {
    weight: 'HIGH',
    multiplier: 2.0,
    evidenceBasis: 'Huston et al. (2001) PAIR Project: Disillusionment from unmet life goals.',
  },
  intimacy: {
    weight: 'HIGH',
    multiplier: 2.0,
    evidenceBasis: 'Meta-analytic r = .37–.49 between sexual and marital satisfaction.',
  },
  household: {
    weight: 'MEDIUM',
    multiplier: 1.0,
    evidenceBasis: 'Hochschild (1989); Frisco & Williams (2003): Perceived fairness matters.',
  },
  health: {
    weight: 'MEDIUM',
    multiplier: 1.0,
    evidenceBasis: 'Homish & Leonard (2007): Substance use discrepancy effects over 7 years.',
  },
  social: {
    weight: 'MEDIUM',
    multiplier: 1.0,
    evidenceBasis: 'Dyrenforth et al. (2010): Individual agreeableness > personality similarity.',
  },
  growth: {
    weight: 'MEDIUM',
    multiplier: 1.0,
    evidenceBasis: 'Growth beliefs vs. destiny beliefs research.',
  },
  worklife: {
    weight: 'MEDIUM',
    multiplier: 1.0,
    evidenceBasis: 'Work-family conflict meta-analysis: r = –.19 with relationship quality.',
  },
  aesthetic: {
    weight: 'LOW',
    multiplier: 0.5,
    evidenceBasis: 'Acknowledged research gap. Often proxy for deeper control/respect issues.',
  },
};
