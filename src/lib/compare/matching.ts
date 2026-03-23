import { ProfileResult, DimensionScore } from '@/lib/types/results';
import { ComparisonResult, DimensionAlignment } from '@/lib/types/compare';
import { dimensionWeights } from '@/lib/quiz/weights';
import { generateCompromiseSuggestions } from './compromise';
import { detectAsymmetries } from './asymmetry';

/**
 * Euclidean distance-based compatibility scoring.
 * Based on Conroy-Beam & Buss (2016, 2017): validated across 45 countries.
 * Non-compensatory: large deficit on important trait can't be offset by surplus elsewhere.
 */
function euclideanDistance(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * Calculate alignment score for a single dimension.
 */
function calculateDimensionAlignment(
  dimA: DimensionScore,
  dimB: DimensionScore
): DimensionAlignment {
  // Calculate raw distance on self-scores
  const scoreDiff = euclideanDistance(dimA.selfScore, dimB.selfScore);

  // Weight by importance — both people's importance matters
  // Consider flexibility — if both are flexible, gap matters less
  const avgFlexibility = (dimA.flexibilityScore + dimB.flexibilityScore) / 2;

  // Base alignment from score similarity (closer = higher alignment)
  let alignmentScore = Math.max(0, 100 - scoreDiff);

  // Flexibility bonus — flexible people tolerate differences better
  if (scoreDiff > 20) {
    const flexBonus = (avgFlexibility / 100) * scoreDiff * 0.3;
    alignmentScore = Math.min(100, alignmentScore + flexBonus);
  }

  // Determine zone
  let zone: 'green' | 'yellow' | 'red';
  if (dimA.dealBreaker || dimB.dealBreaker) {
    // Deal-breaker dimensions have stricter thresholds
    zone = alignmentScore > 70 ? 'green' : alignmentScore > 40 ? 'yellow' : 'red';
  } else {
    zone = alignmentScore > 60 ? 'green' : alignmentScore > 35 ? 'yellow' : 'red';
  }

  // If both marked as deal-breaker and scores diverge significantly
  if (dimA.dealBreaker && dimB.dealBreaker && scoreDiff > 40) {
    zone = 'red';
    alignmentScore = Math.min(alignmentScore, 30);
  }

  return {
    categoryId: dimA.categoryId,
    alignmentScore: Math.round(alignmentScore),
    zone,
    personAScore: dimA.selfScore,
    personBScore: dimB.selfScore,
    personADealBreaker: dimA.dealBreaker,
    personBDealBreaker: dimB.dealBreaker,
  };
}

/**
 * Calculate overall alignment with research-based weighting.
 */
export function calculateCompatibility(
  profileA: ProfileResult,
  profileB: ProfileResult
): ComparisonResult {
  // Find common categories
  const commonCategories = profileA.selectedCategories.filter((cat) =>
    profileB.selectedCategories.includes(cat)
  );

  const dimensionAlignments: DimensionAlignment[] = [];

  for (const catId of commonCategories) {
    const dimA = profileA.dimensions.find((d) => d.categoryId === catId);
    const dimB = profileB.dimensions.find((d) => d.categoryId === catId);
    if (!dimA || !dimB) continue;

    dimensionAlignments.push(calculateDimensionAlignment(dimA, dimB));
  }

  // Weighted overall alignment
  let weightedSum = 0;
  let totalWeight = 0;

  for (const alignment of dimensionAlignments) {
    const weight = dimensionWeights[alignment.categoryId]?.multiplier || 1;
    weightedSum += alignment.alignmentScore * weight;
    totalWeight += weight;
  }

  const overallAlignment = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Detect asymmetries
  const asymmetryAlerts = detectAsymmetries(profileA, profileB, commonCategories);

  // Generate compromise suggestions for non-green zones
  const compromiseRoadmap = generateCompromiseSuggestions(
    dimensionAlignments.filter((a) => a.zone !== 'green'),
  );

  return {
    profileA,
    profileB,
    overallAlignment,
    dimensionAlignments,
    asymmetryAlerts,
    compromiseRoadmap,
  };
}
