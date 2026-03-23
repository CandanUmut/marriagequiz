import { ProfileResult } from '@/lib/types/results';
import { AsymmetryAlert } from '@/lib/types/compare';
import { CategoryId } from '@/lib/types/quiz';
import { categoryDefinitions } from '@/lib/quiz/categories';

/**
 * Detect asymmetric preferences: where one person cares deeply and the other doesn't.
 * These are high-risk areas that need explicit conversation.
 */
export function detectAsymmetries(
  profileA: ProfileResult,
  profileB: ProfileResult,
  commonCategories: CategoryId[]
): AsymmetryAlert[] {
  const alerts: AsymmetryAlert[] = [];

  for (const catId of commonCategories) {
    const dimA = profileA.dimensions.find((d) => d.categoryId === catId);
    const dimB = profileB.dimensions.find((d) => d.categoryId === catId);
    if (!dimA || !dimB) continue;

    const importanceDiff = Math.abs(dimA.importanceScore - dimB.importanceScore);
    const catDef = categoryDefinitions[catId];

    // Significant asymmetry: one person rates much higher importance than the other
    if (importanceDiff > 30) {
      const highPerson = dimA.importanceScore > dimB.importanceScore ? 'A' : 'B';
      const lowPerson = highPerson === 'A' ? 'B' : 'A';

      alerts.push({
        categoryId: catId,
        descriptionEn: `Person ${highPerson} rates ${catDef?.nameEn || catId} as highly important (${Math.max(dimA.importanceScore, dimB.importanceScore)}%), while Person ${lowPerson} rates it much lower (${Math.min(dimA.importanceScore, dimB.importanceScore)}%). This gap needs an honest conversation — the person who cares less may need to understand why this matters so much to their partner.`,
        descriptionTr: `${highPerson} kişisi ${catDef?.nameTr || catId} konusunu çok önemli buluyor (%${Math.max(dimA.importanceScore, dimB.importanceScore)}), ${lowPerson} kişisi ise çok daha düşük buluyor (%${Math.min(dimA.importanceScore, dimB.importanceScore)}). Bu fark dürüst bir konuşma gerektiriyor.`,
        personAImportance: dimA.importanceScore,
        personBImportance: dimB.importanceScore,
      });
    }

    // One person has deal-breaker, the other doesn't
    if (dimA.dealBreaker !== dimB.dealBreaker) {
      const dbPerson = dimA.dealBreaker ? 'A' : 'B';
      const ndbPerson = dbPerson === 'A' ? 'B' : 'A';

      alerts.push({
        categoryId: catId,
        descriptionEn: `Person ${dbPerson} considers ${catDef?.nameEn || catId} a deal-breaker, but Person ${ndbPerson} does not. This is a critical asymmetry — Person ${ndbPerson} needs to understand that this is non-negotiable for their partner.`,
        descriptionTr: `${dbPerson} kişisi ${catDef?.nameTr || catId} konusunu kırmızı çizgi olarak görüyor, ancak ${ndbPerson} kişisi görmüyor. Bu kritik bir asimetri — ${ndbPerson} kişisinin bunun partneri için vazgeçilmez olduğunu anlaması gerekiyor.`,
        personAImportance: dimA.importanceScore,
        personBImportance: dimB.importanceScore,
      });
    }
  }

  return alerts;
}
