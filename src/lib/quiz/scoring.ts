import { CategoryId, QuizAnswer, Question } from '@/lib/types/quiz';
import { DimensionScore, ProfileResult, BlindSpot } from '@/lib/types/results';
import { categoryOrder, categoryDefinitions } from './categories';
import { questionsByCategory } from './questions';

const RESULT_VERSION = 1;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Normalize a raw score to 0-100 range
 */
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return Math.round(((value - min) / (max - min)) * 100);
}

/**
 * Calculate self-score for a dimension based on answers.
 * Averages all non-dealbreaker question values, normalized to 0-100.
 */
export function calculateSelfScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  const values: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : 0;
    values.push(val);
  }
  if (values.length === 0) return 50;

  // Likert is 1-7, scenario is 1-4, slider is 1-100, etc.
  // Normalize based on question types present
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  // Most scales are 1-7, normalize accordingly
  return normalize(avg, 1, 7);
}

/**
 * Calculate how important this dimension is to the user.
 * Based on deal-breaker flags and high-value answers on importance-related questions.
 */
export function calculateImportanceScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  let totalWeight = 0;
  let count = 0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const val = typeof answer.value === 'number' ? answer.value : 4;

    // Deal-breaker questions strongly indicate importance
    if (answer.dealBreaker) {
      totalWeight += 7;
    } else if (q.dealBreakerFollowUp) {
      // Had the option to mark as deal-breaker but didn't
      totalWeight += val;
    } else {
      totalWeight += val;
    }
    count++;
  }

  if (count === 0) return 50;
  return normalize(totalWeight / count, 1, 7);
}

/**
 * Calculate flexibility score — inverse of how rigid responses are.
 * High flexibility = moderate answers, low deal-breakers.
 * Low flexibility = extreme answers, many deal-breakers.
 */
export function calculateFlexibilityScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  let flexTotal = 0;
  let count = 0;

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const val = typeof answer.value === 'number' ? answer.value : 4;

    // Deal-breakers reduce flexibility
    if (answer.dealBreaker) {
      flexTotal += 1;
    } else {
      // Moderate answers (3-5 on 1-7) indicate flexibility
      const distanceFromCenter = Math.abs(val - 4);
      flexTotal += 7 - distanceFromCenter * 2;
    }
    count++;
  }

  if (count === 0) return 50;
  return normalize(flexTotal / count, 1, 7);
}

/**
 * Check if any question in this dimension is marked as a deal-breaker.
 */
export function hasDealBreaker(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): boolean {
  return questions.some((q) => answers[q.id]?.dealBreaker === true);
}

/**
 * Calculate consistency score for honesty calibration.
 * Uses standard deviation, deal-breaker alignment, honesty pairs, and extreme responding.
 */
export function calculateConsistencyScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  // Collect numeric answer values for answered questions
  const answeredValues: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (val !== null) answeredValues.push(val);
  }

  // If literally no answered questions, return a neutral default
  if (answeredValues.length === 0) return 85;

  let score = 100;

  // 1. Standard deviation check (pattern responding vs scattered)
  const mean = answeredValues.reduce((a, b) => a + b, 0) / answeredValues.length;
  const variance =
    answeredValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / answeredValues.length;
  const sd = Math.sqrt(variance);

  if (sd < 0.5) {
    score -= 12; // Penalty for pattern responding (all answers nearly identical)
  } else if (sd > 2.0) {
    score -= 15; // Penalty for highly scattered answers
  }

  // 2. Deal-breaker vs importance alignment
  // If a question has dealBreakerFollowUp AND user marked dealBreaker BUT answer value is low, that's inconsistent
  let dealBreakerMismatches = 0;
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (q.dealBreakerFollowUp && answer.dealBreaker && val !== null && val < 3) {
      dealBreakerMismatches++;
    }
  }
  score -= dealBreakerMismatches * 10;

  // 3. Honesty pair consistency (bonus check when pairs exist)
  const pairs = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.honestyPairId) {
      const existing = pairs.get(q.honestyPairId) || [];
      existing.push(q);
      pairs.set(q.honestyPairId, existing);
    }
  }

  pairs.forEach((pairedQuestions) => {
    if (pairedQuestions.length < 2) return;

    const vals = pairedQuestions
      .map((q) => {
        const answer = answers[q.id];
        if (!answer) return null;
        return typeof answer.value === 'number' ? answer.value : null;
      })
      .filter((v): v is number => v !== null);

    if (vals.length < 2) return;

    const diff = Math.abs(vals[0] - vals[1]);
    if (diff > 3) {
      score -= 10; // Penalty per inconsistent honesty pair
    }
  });

  // 4. Extreme responding check
  const extremeCount = answeredValues.filter((v) => v === 1 || v === 7).length;
  const extremeRatio = extremeCount / answeredValues.length;
  if (extremeRatio > 0.6) {
    score -= 10;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate social desirability score.
 * Flags if user consistently picks the "virtuous" answer on SD-flagged questions.
 */
export function calculateSocialDesirabilityScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): { score: number; flags: string[]; socialDesirabilityBias: number; extremeRatio: number; midpointRatio: number } {
  const sdQuestions = questions.filter((q) => q.socialDesirabilityFlag);

  let highCount = 0;
  const flags: string[] = [];

  for (const q of sdQuestions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : 4;
    // High values on SD questions suggest idealized answering
    if (val >= 6) {
      highCount++;
      flags.push(q.id);
    }
  }

  const sdBias = sdQuestions.length > 0 ? Math.round((highCount / sdQuestions.length) * 100) : 0;
  // Lower score means more social desirability bias
  const score = sdQuestions.length > 0 ? Math.round((1 - highCount / sdQuestions.length) * 100) : 100;

  // Compute extreme and midpoint ratios across all answered questions
  const answeredValues: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (val !== null) answeredValues.push(val);
  }

  const extremeCount = answeredValues.filter((v) => v === 1 || v === 7).length;
  const midpointCount = answeredValues.filter((v) => v >= 3 && v <= 5).length;
  const total = answeredValues.length || 1; // avoid division by zero

  const extremeRatio = Math.round((extremeCount / total) * 100) / 100;
  const midpointRatio = Math.round((midpointCount / total) * 100) / 100;

  return { score, flags, socialDesirabilityBias: sdBias, extremeRatio, midpointRatio };
}

/**
 * Calculate dimension score for a single category.
 */
export function calculateDimensionScore(
  categoryId: CategoryId,
  answers: Record<string, QuizAnswer>
): DimensionScore {
  const questions = questionsByCategory[categoryId] || [];

  return {
    categoryId,
    selfScore: calculateSelfScore(questions, answers),
    importanceScore: calculateImportanceScore(questions, answers),
    flexibilityScore: calculateFlexibilityScore(questions, answers),
    dealBreaker: hasDealBreaker(questions, answers),
    consistencyScore: calculateConsistencyScore(questions, answers),
  };
}

/**
 * Generate the full profile result from all answers.
 */
export function calculateFullProfile(
  answers: Record<string, QuizAnswer>,
  selectedCategories: CategoryId[] = categoryOrder
): ProfileResult {
  const dimensions = selectedCategories.map((catId) =>
    calculateDimensionScore(catId, answers)
  );

  // Overall consistency
  const allQuestions = selectedCategories.flatMap(
    (catId) => questionsByCategory[catId] || []
  );
  const overallConsistency = calculateConsistencyScore(allQuestions, answers);

  // Honesty calibration
  const honestyCalibration = calculateSocialDesirabilityScore(
    allQuestions,
    answers
  );

  // Generate type description
  const typeDescription = generateTypeDescription(dimensions);

  return {
    id: generateId(),
    version: RESULT_VERSION,
    dimensions,
    overallConsistency,
    honestyCalibration,
    typeDescription,
    completedAt: new Date().toISOString(),
    selectedCategories,
  };
}

/**
 * Generate a descriptive "type" summary based on dimension scores.
 */
function generateTypeDescription(
  dimensions: DimensionScore[]
): { en: string; tr: string } {
  // Find top 3 most important dimensions
  const sorted = [...dimensions].sort(
    (a, b) => b.importanceScore - a.importanceScore
  );
  const top3 = sorted.slice(0, 3);

  const catDefs = categoryDefinitions;

  // Determine overall flexibility
  const avgFlex =
    dimensions.reduce((sum, d) => sum + d.flexibilityScore, 0) /
    dimensions.length;
  const flexLabel =
    avgFlex > 65
      ? { en: 'with high flexibility', tr: 'yüksek esneklikle' }
      : avgFlex > 40
      ? { en: 'with moderate flexibility', tr: 'orta düzeyde esneklikle' }
      : { en: 'with firm convictions', tr: 'sağlam kanaatlerle' };

  const topNames = {
    en: top3.map((d) => catDefs[d.categoryId]?.nameEn || d.categoryId).join(', '),
    tr: top3.map((d) => catDefs[d.categoryId]?.nameTr || d.categoryId).join(', '),
  };

  return {
    en: `You're a partner who prioritizes ${topNames.en}, ${flexLabel.en} on lifestyle details.`,
    tr: `${topNames.tr} konularını önceliklendiren, yaşam tarzı detaylarında ${flexLabel.tr} bir partnersiniz.`,
  };
}

export interface FlaggedQuestion {
  questionId: string;
  reasonEn: string;
  reasonTr: string;
}

/**
 * Return a list of question IDs (with reasons) that contributed to a low
 * authenticity score in the given category. Used to highlight them when
 * the user returns to the quiz for review.
 */
export function getFlaggedQuestions(
  categoryId: CategoryId,
  answers: Record<string, QuizAnswer>,
): FlaggedQuestion[] {
  const questions = questionsByCategory[categoryId] || [];
  const flagged: FlaggedQuestion[] = [];

  // 1. Deal-breaker marked but value is low (< 3) — inconsistent
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (q.dealBreakerFollowUp && answer.dealBreaker && val !== null && val < 3) {
      flagged.push({
        questionId: q.id,
        reasonEn: "You marked this as a deal-breaker but your answer suggests it's not a strong preference — that's an inconsistency worth reviewing.",
        reasonTr: 'Bunu kırmızı çizgi olarak işaretlediniz, ancak cevabınız güçlü bir tercih olmadığını gösteriyor — incelemeye değer bir tutarsızlık.',
      });
    }
  }

  // 2. Honesty pair questions with large difference
  const pairs = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.honestyPairId) {
      const existing = pairs.get(q.honestyPairId) || [];
      existing.push(q);
      pairs.set(q.honestyPairId, existing);
    }
  }
  pairs.forEach((pairedQuestions) => {
    if (pairedQuestions.length < 2) return;
    const vals = pairedQuestions.map((q) => {
      const a = answers[q.id];
      return a && typeof a.value === 'number' ? a.value : null;
    });
    if (vals[0] !== null && vals[1] !== null && Math.abs(vals[0]! - vals[1]!) > 3) {
      pairedQuestions.forEach((q) => {
        if (!flagged.find((f) => f.questionId === q.id)) {
          flagged.push({
            questionId: q.id,
            reasonEn: 'This answer seems inconsistent with another answer about the same topic in this category.',
            reasonTr: 'Bu cevap, bu kategorideki aynı konuyla ilgili başka bir cevapla tutarsız görünüyor.',
          });
        }
      });
    }
  });

  // 3. Social desirability — SD-flagged question answered with extreme high value (≥ 6)
  for (const q of questions) {
    if (!q.socialDesirabilityFlag) continue;
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (val !== null && val >= 6) {
      if (!flagged.find((f) => f.questionId === q.id)) {
        flagged.push({
          questionId: q.id,
          reasonEn: 'You chose the most ideal answer here. Consider whether this reflects your reality or an idealized version of yourself.',
          reasonTr: 'Burada en ideal cevabı seçtiniz. Bunun gerçekliğinizi mi yoksa ideal benliğinizi mi yansıttığını düşünün.',
        });
      }
    }
  }

  return flagged;
}

/**
 * Return flagged question IDs across ALL categories, grouped by category.
 */
export function getAllFlaggedQuestions(
  selectedCategories: CategoryId[],
  answers: Record<string, QuizAnswer>,
): Record<CategoryId, FlaggedQuestion[]> {
  const result = {} as Record<CategoryId, FlaggedQuestion[]>;
  for (const catId of selectedCategories) {
    const flags = getFlaggedQuestions(catId, answers);
    if (flags.length > 0) result[catId] = flags;
  }
  return result;
}

/**
 * Detect blind spots — where stated importance doesn't match answer patterns.
 */
export function detectBlindSpots(
  dimensions: DimensionScore[]
): BlindSpot[] {
  const blindSpots: BlindSpot[] = [];
  const catDefs = categoryDefinitions;

  for (const dim of dimensions) {
    // High importance but high flexibility suggests potential blind spot
    if (dim.importanceScore > 70 && dim.flexibilityScore > 70) {
      blindSpots.push({
        categoryId: dim.categoryId,
        titleEn: `${catDefs[dim.categoryId]?.nameEn}: High Priority, High Flexibility`,
        titleTr: `${catDefs[dim.categoryId]?.nameTr}: Yüksek Öncelik, Yüksek Esneklik`,
        descriptionEn: `You rate ${catDefs[dim.categoryId]?.nameEn} as very important, but your answers suggest you might be more flexible than you realize. This could mean you haven't fully confronted what compromise would feel like here.`,
        descriptionTr: `${catDefs[dim.categoryId]?.nameTr} konusunu çok önemli buluyorsunuz, ancak yanıtlarınız farkında olduğunuzdan daha esnek olabileceğinizi gösteriyor. Bu, burada uzlaşmanın nasıl hissettireceğiyle tam olarak yüzleşmemiş olabileceğiniz anlamına gelebilir.`,
        statedPreference: dim.importanceScore,
        revealedPattern: dim.flexibilityScore,
      });
    }

    // Low consistency suggests internal conflict
    if (dim.consistencyScore < 60) {
      blindSpots.push({
        categoryId: dim.categoryId,
        titleEn: `${catDefs[dim.categoryId]?.nameEn}: Inconsistent Answers`,
        titleTr: `${catDefs[dim.categoryId]?.nameTr}: Tutarsız Yanıtlar`,
        descriptionEn: `Your answers in ${catDefs[dim.categoryId]?.nameEn} show some inconsistency. This might mean you're still working out what you truly think about this, or that you answered some questions with your ideal self.`,
        descriptionTr: `${catDefs[dim.categoryId]?.nameTr} konusundaki yanıtlarınız bazı tutarsızlıklar gösteriyor. Bu, bu konuda gerçekten ne düşündüğünüzü hâlâ netleştiriyor olabileceğiniz veya bazı soruları ideal benliğinizle yanıtlamış olabileceğiniz anlamına gelebilir.`,
        statedPreference: dim.importanceScore,
        revealedPattern: dim.consistencyScore,
      });
    }
  }

  return blindSpots;
}
