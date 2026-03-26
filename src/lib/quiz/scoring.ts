import { CategoryId, QuizAnswer, Question } from '@/lib/types/quiz';
import { DimensionScore, ProfileResult, BlindSpot } from '@/lib/types/results';
import { categoryOrder, categoryDefinitions } from './categories';
import { questionsByCategory } from './questions';

const RESULT_VERSION = 1;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Get the actual value range for a question based on its type and options.
 * Scenario/thisOrThat questions have options with explicit values (typically 1-4),
 * while likert/dealbreaker questions use a 1-7 scale.
 */
function getQuestionRange(q: Question): { min: number; max: number } {
  if (q.options && q.options.length > 0) {
    const values = q.options.map((o) => o.value);
    return { min: Math.min(...values), max: Math.max(...values) };
  }
  // Likert, dealbreaker, slider all use 1-7
  return { min: 1, max: 7 };
}

/**
 * Normalize a single answer value to 0-1 based on its question's actual range.
 */
function normalizeAnswer(val: number, q: Question): number {
  const range = getQuestionRange(q);
  if (range.max === range.min) return 0.5;
  return Math.max(0, Math.min(1, (val - range.min) / (range.max - range.min)));
}

/**
 * Calculate self-score for a dimension based on answers.
 * Each answer is normalized to 0-1 based on its question's actual scale,
 * then averaged and scaled to 0-100.
 */
export function calculateSelfScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  const normalized: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : 0;
    normalized.push(normalizeAnswer(val, q));
  }
  if (normalized.length === 0) return 50;
  return Math.round((normalized.reduce((a, b) => a + b, 0) / normalized.length) * 100);
}

/**
 * Calculate how important this dimension is to the user.
 * Based on deal-breaker flags and high-value answers on importance-related questions.
 */
export function calculateImportanceScore(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): number {
  const scores: number[] = [];

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const val = typeof answer.value === 'number' ? answer.value : 0;

    // Deal-breaker questions strongly indicate importance (max score)
    if (answer.dealBreaker) {
      scores.push(1.0);
    } else {
      scores.push(normalizeAnswer(val, q));
    }
  }

  if (scores.length === 0) return 50;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
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
  const scores: number[] = [];

  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    const val = typeof answer.value === 'number' ? answer.value : 0;

    // Deal-breakers = minimum flexibility
    if (answer.dealBreaker) {
      scores.push(0);
    } else {
      // Flexibility = how close the answer is to the midpoint of the question's scale
      const range = getQuestionRange(q);
      const center = (range.min + range.max) / 2;
      const maxDist = (range.max - range.min) / 2;
      const distance = Math.abs(val - center);
      // 1.0 at center, 0.0 at extremes
      scores.push(maxDist > 0 ? 1 - distance / maxDist : 0.5);
    }
  }

  if (scores.length === 0) return 50;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
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

  // 4. Extreme responding check — only count likert/dealbreaker questions (1-7 scale)
  // Scenario questions (1-4 scale) selecting 1 or 4 is a valid categorical choice, not "extreme"
  const likertValues: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (val === null) continue;
    // Only flag extreme responding on 1-7 scale questions (likert, dealbreaker, slider)
    if (!q.options || q.options.length === 0) {
      likertValues.push(val);
    }
  }
  const extremeCount = likertValues.filter((v) => v === 1 || v === 7).length;
  const extremeRatio = likertValues.length > 0 ? extremeCount / likertValues.length : 0;
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
    const val = typeof answer.value === 'number' ? answer.value : 0;
    // High values on SD questions suggest idealized answering
    // Use per-question normalization to handle different scales (likert 1-7, scenario 1-4)
    const normalized = normalizeAnswer(val, q);
    if (normalized >= 0.8) {
      highCount++;
      flags.push(q.id);
    }
  }

  const sdBias = sdQuestions.length > 0 ? Math.round((highCount / sdQuestions.length) * 100) : 0;
  // Lower score means more social desirability bias
  const score = sdQuestions.length > 0 ? Math.round((1 - highCount / sdQuestions.length) * 100) : 100;

  // Compute extreme and midpoint ratios across likert-scale questions only
  // Scenario/categorical questions are excluded — selecting 1 or max is a valid choice
  const likertValues: number[] = [];
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const val = typeof answer.value === 'number' ? answer.value : null;
    if (val === null) continue;
    if (!q.options || q.options.length === 0) {
      likertValues.push(val);
    }
  }

  const likertTotal = likertValues.length || 1;
  const extremeCount = likertValues.filter((v) => v === 1 || v === 7).length;
  const midpointCount = likertValues.filter((v) => v >= 3 && v <= 5).length;

  const extremeRatio = Math.round((extremeCount / likertTotal) * 100) / 100;
  const midpointRatio = Math.round((midpointCount / likertTotal) * 100) / 100;

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
