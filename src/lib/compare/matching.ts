import { ProfileResult, DimensionScore } from '@/lib/types/results';
import {
  ComparisonResult,
  DimensionAlignment,
  DealBreakerCollision,
  ScoreFraming,
  CollisionSeverity,
} from '@/lib/types/compare';
import { CategoryId, QuizAnswer } from '@/lib/types/quiz';
import { dimensionWeights } from '@/lib/quiz/weights';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { questionsByCategory } from '@/lib/quiz/questions';
import { generateCompromiseSuggestions } from './compromise';
import { detectAsymmetries } from './asymmetry';

// ─── LAYER 1: Deal-Breaker Collision Detection ─────────────────────

/**
 * Detect deal-breaker collisions between two profiles.
 * A collision occurs when one person marks a question as a deal-breaker
 * and the other person's answer is on the opposite side.
 */
export function detectDealBreakerCollisions(
  profileA: ProfileResult,
  profileB: ProfileResult,
  answersA: Record<string, QuizAnswer>,
  answersB: Record<string, QuizAnswer>,
): DealBreakerCollision[] {
  const collisions: DealBreakerCollision[] = [];
  const commonCategories = profileA.selectedCategories.filter((cat) =>
    profileB.selectedCategories.includes(cat),
  );

  for (const catId of commonCategories) {
    const questions = questionsByCategory[catId] || [];

    for (const q of questions) {
      const ansA = answersA[q.id];
      const ansB = answersB[q.id];
      if (!ansA || !ansB) continue;

      const valA = typeof ansA.value === 'number' ? ansA.value : 0;
      const valB = typeof ansB.value === 'number' ? ansB.value : 0;
      const aIsDealBreaker = ansA.dealBreaker === true;
      const bIsDealBreaker = ansB.dealBreaker === true;

      // Only check questions where at least one person marked deal-breaker
      if (!aIsDealBreaker && !bIsDealBreaker) continue;

      // Determine the scale range for this question
      const maxVal = q.options ? Math.max(...q.options.map((o) => o.value)) : 7;
      const minVal = q.options ? Math.min(...q.options.map((o) => o.value)) : 1;
      const range = maxVal - minVal || 1;

      // Normalized distance (0 to 1)
      const distance = Math.abs(valA - valB) / range;

      // Critical: both deal-breakers OR deal-breaker holder's value is opposite to other
      // Serious: deal-breaker holder and other is neutral/mild mismatch
      let severity: CollisionSeverity | null = null;

      if (distance >= 0.6) {
        // Answers are on opposite sides of the spectrum
        severity = 'critical';
      } else if (distance >= 0.35) {
        // Meaningful disagreement but not completely opposite
        severity = 'serious';
      }

      if (severity) {
        const catDef = categoryDefinitions[catId];
        const catNameEn = catDef?.nameEn || catId;
        const catNameTr = catDef?.nameTr || catId;

        collisions.push({
          category: catId,
          questionKey: q.id,
          personAPosition: valA,
          personBPosition: valB,
          personAIsDealBreaker: aIsDealBreaker,
          personBIsDealBreaker: bIsDealBreaker,
          severity,
          descriptionEn: buildCollisionDescription(q.textEn, catNameEn, aIsDealBreaker, bIsDealBreaker, severity, 'en'),
          descriptionTr: buildCollisionDescription(q.textTr || q.textEn, catNameTr, aIsDealBreaker, bIsDealBreaker, severity, 'tr'),
        });
      }
    }
  }

  return collisions;
}

function buildCollisionDescription(
  questionText: string,
  categoryName: string,
  aIsDealBreaker: boolean,
  bIsDealBreaker: boolean,
  severity: CollisionSeverity,
  locale: 'en' | 'tr',
): string {
  if (locale === 'tr') {
    if (aIsDealBreaker && bIsDealBreaker) {
      return `${categoryName}: Her iki taraf da bunu vazgeçilmez olarak işaretledi, ancak zıt pozisyonlarda. Bu kritik bir uyumsuzluk.`;
    }
    const dbPerson = aIsDealBreaker ? 'A' : 'B';
    const otherPerson = aIsDealBreaker ? 'B' : 'A';
    if (severity === 'critical') {
      return `${categoryName}: ${dbPerson} kişisi bunu vazgeçilmez olarak işaretledi. ${otherPerson} kişisinin cevabı doğrudan çelişiyor.`;
    }
    return `${categoryName}: ${dbPerson} kişisi bunu vazgeçilmez olarak işaretledi. ${otherPerson} kişisinin cevabı bu beklentiyi tam karşılamıyor.`;
  }

  if (aIsDealBreaker && bIsDealBreaker) {
    return `${categoryName}: Both partners marked this as non-negotiable but hold opposing positions. This is a critical incompatibility.`;
  }
  const dbPerson = aIsDealBreaker ? 'A' : 'B';
  const otherPerson = aIsDealBreaker ? 'B' : 'A';
  if (severity === 'critical') {
    return `${categoryName}: Person ${dbPerson} marked this as non-negotiable. Person ${otherPerson}'s answer directly conflicts.`;
  }
  return `${categoryName}: Person ${dbPerson} marked this as non-negotiable. Person ${otherPerson}'s answer doesn't fully meet this requirement.`;
}

/**
 * Calculate the hard score ceiling based on deal-breaker collisions.
 */
function getScoreCeiling(collisions: DealBreakerCollision[]): number {
  if (collisions.length === 0) return 100;

  const criticalCount = collisions.filter((c) => c.severity === 'critical').length;
  const seriousCount = collisions.filter((c) => c.severity === 'serious').length;

  // Calculate ceiling from critical collisions
  let criticalCeiling = 100;
  if (criticalCount >= 3) criticalCeiling = 20;
  else if (criticalCount === 2) criticalCeiling = 30;
  else if (criticalCount === 1) criticalCeiling = 45;

  // Calculate ceiling from serious collisions
  let seriousCeiling = 100;
  if (seriousCount >= 2) seriousCeiling = 50;
  else if (seriousCount === 1) seriousCeiling = 60;

  // Use the lowest applicable ceiling
  return Math.min(criticalCeiling, seriousCeiling);
}

// ─── LAYER 2: Category-Level Distance-Based Scoring ────────────────

/**
 * Calculate alignment score for a single dimension using distance-based
 * calculation with importance weighting and deal-breaker amplification.
 */
function calculateDimensionAlignment(
  catId: CategoryId,
  dimA: DimensionScore,
  dimB: DimensionScore,
  answersA: Record<string, QuizAnswer>,
  answersB: Record<string, QuizAnswer>,
  collisions: DealBreakerCollision[],
): DimensionAlignment {
  const questions = questionsByCategory[catId] || [];
  const weightDef = dimensionWeights[catId];

  let weightedDistanceSum = 0;
  let maxPossibleWeightedDistance = 0;
  let answeredCount = 0;

  for (const q of questions) {
    const ansA = answersA[q.id];
    const ansB = answersB[q.id];
    if (!ansA || !ansB) continue;

    const valA = typeof ansA.value === 'number' ? ansA.value : 0;
    const valB = typeof ansB.value === 'number' ? ansB.value : 0;

    // Determine scale range
    const maxVal = q.options ? Math.max(...q.options.map((o) => o.value)) : 7;
    const minVal = q.options ? Math.min(...q.options.map((o) => o.value)) : 1;
    const range = maxVal - minVal || 1;

    // Normalized distance (0 to 1)
    const distance = Math.abs(valA - valB) / range;

    // Importance weight: average of both people's importance for this dimension
    // Normalize to 0.5-2.0 range so it actually affects scores
    const avgImportance = (dimA.importanceScore + dimB.importanceScore) / 2;
    const importanceWeight = 0.5 + (avgImportance / 100) * 1.5;

    // Deal-breaker amplification: if either person marked this as deal-breaker
    const isDealBreakerQ = ansA.dealBreaker || ansB.dealBreaker;
    const dealBreakerMultiplier = isDealBreakerQ ? 2.5 : 1.0;

    const weightedDistance = distance * importanceWeight * dealBreakerMultiplier;
    const maxDistance = 1.0 * importanceWeight * dealBreakerMultiplier;

    weightedDistanceSum += weightedDistance;
    maxPossibleWeightedDistance += maxDistance;
    answeredCount++;
  }

  // If no questions were answered in common, fall back to raw score comparison
  let similarity: number;
  if (answeredCount === 0 || maxPossibleWeightedDistance === 0) {
    const scoreDiff = Math.abs(dimA.selfScore - dimB.selfScore);
    similarity = Math.max(0, 100 - scoreDiff);
  } else {
    similarity = (1 - weightedDistanceSum / maxPossibleWeightedDistance) * 100;
  }

  const alignmentScore = Math.max(0, Math.min(100, Math.round(similarity)));

  // Check for deal-breaker collision in this category
  const catCollisions = collisions.filter((c) => c.category === catId);
  const hasDealBreakerCollision = catCollisions.length > 0;

  // Determine zone with stricter thresholds
  let zone: 'green' | 'yellow' | 'red';
  if (hasDealBreakerCollision) {
    zone = 'red';
  } else if (alignmentScore >= 80) {
    zone = 'green';
  } else if (alignmentScore >= 60) {
    zone = 'yellow';
  } else {
    zone = 'red';
  }

  // Generate specific summary based on actual scores
  const { summaryEn, summaryTr } = generateDimensionSummary(
    catId,
    dimA,
    dimB,
    alignmentScore,
    hasDealBreakerCollision,
  );

  return {
    categoryId: catId,
    alignmentScore,
    zone,
    personAScore: dimA.selfScore,
    personBScore: dimB.selfScore,
    personADealBreaker: dimA.dealBreaker,
    personBDealBreaker: dimB.dealBreaker,
    hasDealBreakerCollision,
    summaryEn,
    summaryTr,
    researchNoteEn: weightDef?.researchNoteEn || '',
    researchNoteTr: weightDef?.researchNoteTr || '',
  };
}

/**
 * Generate a specific, not generic, summary for a dimension comparison.
 */
function generateDimensionSummary(
  catId: CategoryId,
  dimA: DimensionScore,
  dimB: DimensionScore,
  alignmentScore: number,
  hasDealBreakerCollision: boolean,
): { summaryEn: string; summaryTr: string } {
  const catDef = categoryDefinitions[catId];
  const nameEn = catDef?.nameEn || catId;
  const nameTr = catDef?.nameTr || catId;
  const diff = Math.abs(dimA.selfScore - dimB.selfScore);

  if (hasDealBreakerCollision) {
    return {
      summaryEn: `A deal-breaker conflict exists in ${nameEn}. One or both partners have non-negotiable positions that directly clash.`,
      summaryTr: `${nameTr} alanında vazgeçilmez bir çatışma var. Bir veya her iki partnerin de doğrudan çelişen vazgeçilmez pozisyonları var.`,
    };
  }

  if (alignmentScore >= 85) {
    return {
      summaryEn: `Strong alignment on ${nameEn}. You share similar perspectives and priorities in this area.`,
      summaryTr: `${nameTr} konusunda güçlü uyum. Bu alanda benzer bakış açılarını ve öncelikleri paylaşıyorsunuz.`,
    };
  }

  if (alignmentScore >= 70) {
    return {
      summaryEn: `Good alignment on ${nameEn} with some differences worth discussing (gap: ${diff} points).`,
      summaryTr: `${nameTr} konusunda konuşmaya değer bazı farklılıklarla birlikte iyi uyum (fark: ${diff} puan).`,
    };
  }

  if (alignmentScore >= 50) {
    return {
      summaryEn: `Notable differences in ${nameEn} (gap: ${diff} points). Have an honest conversation about what compromise looks like here.`,
      summaryTr: `${nameTr} konusunda kayda değer farklılıklar (fark: ${diff} puan). Burada uzlaşmanın nasıl olacağı hakkında dürüst bir konuşma yapın.`,
    };
  }

  return {
    summaryEn: `Significant divergence in ${nameEn} (gap: ${diff} points). This area needs serious attention before commitment.`,
    summaryTr: `${nameTr} konusunda belirgin ayrışma (fark: ${diff} puan). Bu alan taahhütten önce ciddi ilgi gerektiriyor.`,
  };
}

// ─── LAYER 3: Overall Score Composition ────────────────────────────

/**
 * Get the framing text for a given overall score.
 */
function getScoreFraming(
  score: number,
  collisions: DealBreakerCollision[],
): ScoreFraming {
  if (score >= 85) {
    return {
      band: 'strong',
      labelEn: 'Strong Alignment',
      labelTr: 'Güçlü Uyum',
      descriptionEn: 'Your profiles show strong alignment across the areas that matter most for long-term partnership. This doesn\'t mean there won\'t be challenges, but your foundation is solid.',
      descriptionTr: 'Profilleriniz uzun vadeli bir birliktelik için en önemli alanlarda güçlü bir uyum gösteriyor. Zorluklar olmayacağı anlamına gelmiyor, ancak temeli sağlam.',
    };
  }

  if (score >= 70) {
    return {
      band: 'good',
      labelEn: 'Good Alignment with Notable Differences',
      labelTr: 'Kayda Değer Farklılıklarla İyi Uyum',
      descriptionEn: 'You share common ground on many important dimensions, but there are meaningful differences in some areas. These are worth discussing openly before making commitments.',
      descriptionTr: 'Birçok önemli konuda ortak zemine sahipsiniz, ancak bazı alanlarda kayda değer farklılıklar var. Karar vermeden önce bunları açıkça konuşmanız önemli.',
    };
  }

  if (score >= 50) {
    return {
      band: 'significant',
      labelEn: 'Significant Differences',
      labelTr: 'Belirgin Farklılıklar',
      descriptionEn: 'Your profiles show significant differences in areas that research identifies as important for marital satisfaction. This doesn\'t mean a partnership is impossible, but it requires serious, honest conversation about whether these gaps can be navigated.',
      descriptionTr: 'Profilleriniz, araştırmaların evlilik memnuniyeti için önemli gördüğü alanlarda belirgin farklılıklar gösteriyor. Bu bir birlikteliğin imkansız olduğu anlamına gelmiyor, ancak bu farklılıkların aşılıp aşılamayacağı konusunda ciddi ve dürüst bir konuşma gerektirir.',
    };
  }

  if (score >= 30) {
    return {
      band: 'fundamental',
      labelEn: 'Fundamental Differences',
      labelTr: 'Temel Farklılıklar',
      descriptionEn: collisions.length > 0
        ? 'Your profiles reveal fundamental differences, including areas where one or both of you have marked non-negotiable boundaries. Research strongly suggests that partnerships with this pattern face serious challenges. If you choose to proceed, professional pre-marital counseling is strongly recommended.'
        : 'Your profiles reveal fundamental differences in multiple areas. Research strongly suggests that partnerships with this level of divergence face serious challenges. Professional pre-marital counseling is strongly recommended.',
      descriptionTr: collisions.length > 0
        ? 'Profilleriniz, bir veya iki tarafın vazgeçilmez sınırlar koyduğu alanlar dahil olmak üzere temel farklılıklar ortaya koyuyor. Araştırmalar, bu örüntüye sahip birlikteliklerin ciddi zorluklarla karşılaştığını gösteriyor. Devam etmeyi seçerseniz, profesyonel evlilik öncesi danışmanlık şiddetle tavsiye edilir.'
        : 'Profilleriniz birden fazla alanda temel farklılıklar ortaya koyuyor. Araştırmalar, bu düzeyde ayrışmaya sahip birlikteliklerin ciddi zorluklarla karşılaştığını gösteriyor. Profesyonel evlilik öncesi danışmanlık şiddetle tavsiye edilir.',
    };
  }

  return {
    band: 'critical',
    labelEn: 'Critical Incompatibilities',
    labelTr: 'Kritik Uyumsuzluklar',
    descriptionEn: 'Your profiles show critical incompatibilities in areas that are fundamental to a shared life. Multiple deal-breaker conflicts exist between your profiles. Being honest about this now is far kinder than discovering it after commitment.',
    descriptionTr: 'Profilleriniz, ortak bir yaşam için temel olan alanlarda kritik uyumsuzluklar gösteriyor. Profilleriniz arasında birden fazla vazgeçilmez çatışma mevcut. Bu konuda şimdi dürüst olmak, taahhütten sonra keşfetmekten çok daha merhametli.',
  };
}

// ─── Main Entry Point ──────────────────────────────────────────────

/**
 * Calculate overall alignment with the three-layer scoring architecture:
 * 1. Deal-breaker collision detection (hard gate)
 * 2. Category-level distance-based scoring (weighted & honest)
 * 3. Overall score composition with ceiling enforcement
 */
export function calculateCompatibility(
  profileA: ProfileResult,
  profileB: ProfileResult,
  answersA?: Record<string, QuizAnswer>,
  answersB?: Record<string, QuizAnswer>,
): ComparisonResult {
  const safeAnswersA = answersA || {};
  const safeAnswersB = answersB || {};

  // Find common categories
  const commonCategories = profileA.selectedCategories.filter((cat) =>
    profileB.selectedCategories.includes(cat),
  );

  // Step 1: Detect deal-breaker collisions
  const collisions = detectDealBreakerCollisions(
    profileA,
    profileB,
    safeAnswersA,
    safeAnswersB,
  );
  const scoreCeiling = getScoreCeiling(collisions);

  // Step 2: Calculate per-category scores
  const dimensionAlignments: DimensionAlignment[] = [];

  for (const catId of commonCategories) {
    const dimA = profileA.dimensions.find((d) => d.categoryId === catId);
    const dimB = profileB.dimensions.find((d) => d.categoryId === catId);
    if (!dimA || !dimB) continue;

    dimensionAlignments.push(
      calculateDimensionAlignment(catId, dimA, dimB, safeAnswersA, safeAnswersB, collisions),
    );
  }

  // Step 3: Weighted average with real differentiation
  let weightedSum = 0;
  let totalWeight = 0;

  for (const alignment of dimensionAlignments) {
    const weight = dimensionWeights[alignment.categoryId]?.multiplier || 0.5;
    weightedSum += alignment.alignmentScore * weight;
    totalWeight += weight * 100; // max possible per dimension
  }

  const rawScore = totalWeight > 0 ? (weightedSum / totalWeight) * 100 : 0;

  // Step 4: Apply deal-breaker ceiling
  const finalScore = Math.min(Math.round(rawScore), scoreCeiling);

  // Step 5: Generate honest framing
  const framing = getScoreFraming(finalScore, collisions);

  // Detect asymmetries
  const asymmetryAlerts = detectAsymmetries(profileA, profileB, commonCategories);

  // Generate compromise suggestions for non-green zones
  const compromiseRoadmap = generateCompromiseSuggestions(
    dimensionAlignments.filter((a) => a.zone !== 'green'),
  );

  return {
    profileA,
    profileB,
    overallAlignment: finalScore,
    scoreCeiling,
    dealBreakerCollisions: collisions,
    framing,
    dimensionAlignments,
    asymmetryAlerts,
    compromiseRoadmap,
  };
}
