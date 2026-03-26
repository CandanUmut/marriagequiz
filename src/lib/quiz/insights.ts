import { CategoryId } from '@/lib/types/quiz';
import { DimensionScore, Insight } from '@/lib/types/results';
import { dimensionWeights } from './weights';
import { categoryDefinitions } from './categories';

/**
 * Generate key insights from quiz results.
 * Designed to always produce 3-4 insights for any profile.
 */
export function generateInsights(dimensions: DimensionScore[]): Insight[] {
  const insights: Insight[] = [];
  if (dimensions.length === 0) return insights;

  const catName = (id: CategoryId, locale: 'en' | 'tr') => {
    const def = categoryDefinitions[id];
    return locale === 'en' ? def?.nameEn : def?.nameTr;
  };

  // 1. Strongest category — highest importance + consistency >= 60
  const sorted = [...dimensions].sort(
    (a, b) => b.importanceScore + b.consistencyScore - (a.importanceScore + a.consistencyScore)
  );
  const strongest = sorted[0];
  if (strongest) {
    insights.push({
      categoryId: strongest.categoryId,
      titleEn: 'Your Strongest Area',
      titleTr: 'En Güçlü Alanınız',
      descriptionEn: `Your strongest alignment area is ${catName(strongest.categoryId, 'en')} (importance: ${strongest.importanceScore}%, consistency: ${strongest.consistencyScore}%). You have clear, well-defined views here — this self-awareness is a strong foundation for finding a compatible partner.`,
      descriptionTr: `En güçlü uyum alanınız ${catName(strongest.categoryId, 'tr')} (önem: ${strongest.importanceScore}%, tutarlılık: ${strongest.consistencyScore}%). Burada net ve tanımlanmış görüşleriniz var — bu öz farkındalık uyumlu bir partner bulmak için güçlü bir temeldir.`,
      severity: 'info',
      researchBasis: 'Self-knowledge predicts mate selection accuracy (Luo & Klohnen, 2005)',
    });
  }

  // 2. Deal-breaker count observation
  const dealBreakerCount = dimensions.filter((d) => d.dealBreaker).length;
  const dbCategoryId = dimensions.find((d) => d.dealBreaker)?.categoryId || 'values';
  if (dealBreakerCount === 0) {
    insights.push({
      categoryId: dbCategoryId,
      titleEn: 'No Deal-Breakers Set',
      titleTr: 'Kırmızı Çizgi Belirlenmedi',
      descriptionEn: "You haven't marked any deal-breakers. Research suggests having 2-5 non-negotiables is healthy — it shows you know what matters most. Consider whether there are truly no areas where compromise is unacceptable.",
      descriptionTr: 'Hiçbir kırmızı çizgi belirlemediniz. Araştırmalar 2-5 arası vazgeçilmez noktanın sağlıklı olduğunu gösteriyor — bu sizin için en önemli olanı bildiğinizi gösterir. Gerçekten uzlaşmanın kabul edilemez olduğu bir alan olup olmadığını düşünün.',
      severity: 'warning',
      researchBasis: 'Stanley et al. (2010): Constraint commitment research',
    });
  } else if (dealBreakerCount <= 5) {
    insights.push({
      categoryId: dbCategoryId,
      titleEn: 'Focused Deal-Breakers',
      titleTr: 'Odaklı Kırmızı Çizgiler',
      descriptionEn: `You have ${dealBreakerCount} deal-breaker${dealBreakerCount > 1 ? 's' : ''} — research suggests this is a healthy range. Having clear non-negotiables helps filter for genuine compatibility rather than settling.`,
      descriptionTr: `${dealBreakerCount} kırmızı çizginiz var — araştırmalar bunun sağlıklı bir aralık olduğunu gösteriyor. Net vazgeçilmezlere sahip olmak, uyumsuzluktan çok gerçek uyumluluğu filtrelemeye yardımcı olur.`,
      severity: 'info',
      researchBasis: 'Stanley et al. (2010): Constraint commitment research',
    });
  } else {
    insights.push({
      categoryId: dbCategoryId,
      titleEn: 'Many Deal-Breakers',
      titleTr: 'Çok Sayıda Kırmızı Çizgi',
      descriptionEn: `You've marked ${dealBreakerCount} deal-breakers across categories. While knowing your standards is valuable, having many non-negotiables may reflect idealization rather than prioritization. Consider which are truly essential versus strong preferences.`,
      descriptionTr: `Kategoriler genelinde ${dealBreakerCount} kırmızı çizgi belirlediniz. Standartlarınızı bilmek değerli olsa da, çok fazla vazgeçilmez, önceliklendirme yerine idealleştirmeyi yansıtabilir. Hangilerinin gerçekten vazgeçilmez olduğunu, hangilerinin güçlü tercih olduğunu düşünün.`,
      severity: 'warning',
      researchBasis: 'Eastwick & Finkel (2008): Idealization vs. realistic standards',
    });
  }

  // 3. Research-weighted category that user ranked low priority
  const weightedDims = dimensions.map((d) => ({
    ...d,
    researchWeight: dimensionWeights[d.categoryId]?.multiplier || 0.5,
  }));
  const highWeightLowPriority = weightedDims
    .filter((d) => d.researchWeight >= 0.85 && d.importanceScore < 45)
    .sort((a, b) => b.researchWeight - a.researchWeight);

  if (highWeightLowPriority.length > 0) {
    const gap = highWeightLowPriority[0];
    insights.push({
      categoryId: gap.categoryId,
      titleEn: 'Research-Priority Gap',
      titleTr: 'Araştırma-Öncelik Farkı',
      descriptionEn: `You ranked ${catName(gap.categoryId, 'en')} as low priority (${gap.importanceScore}%), but research identifies it as one of the strongest predictors of marital satisfaction (weight: ${Math.round(gap.researchWeight * 100)}%). This doesn't mean you're wrong — but it's worth reflecting on.`,
      descriptionTr: `${catName(gap.categoryId, 'tr')} konusunu düşük öncelikli olarak değerlendirdiniz (${gap.importanceScore}%), ancak araştırmalar bunu evlilik tatmininin en güçlü göstergelerinden biri olarak tanımlıyor (ağırlık: ${Math.round(gap.researchWeight * 100)}%). Bu yanlış olduğunuz anlamına gelmez — ama üzerinde düşünmeye değer.`,
      severity: 'warning',
      researchBasis: dimensionWeights[gap.categoryId]?.evidenceBasis || '',
    });
  }

  // 4. Flexibility summary
  const avgFlex = dimensions.reduce((sum, d) => sum + d.flexibilityScore, 0) / dimensions.length;
  const mostRigid = [...dimensions].sort((a, b) => a.flexibilityScore - b.flexibilityScore)[0];
  const flexCatId = mostRigid?.categoryId || 'values';

  if (avgFlex > 65) {
    insights.push({
      categoryId: flexCatId,
      titleEn: 'High Flexibility Profile',
      titleTr: 'Yüksek Esneklik Profili',
      descriptionEn: `Your overall flexibility is high (${Math.round(avgFlex)}%). You tend toward moderate, adaptable positions. This can be a strength in relationships — but ensure your flexibility reflects genuine openness, not avoidance of taking a clear stance.`,
      descriptionTr: `Genel esnekliğiniz yüksek (${Math.round(avgFlex)}%). Ilımlı, uyumlu pozisyonlara eğilim gösteriyorsunuz. Bu ilişkilerde bir güç olabilir — ancak esnekliğinizin net bir duruş almaktan kaçınma değil, gerçek açıklık olduğundan emin olun.`,
      severity: 'info',
      researchBasis: 'Karney & Bradbury (1995): Adaptability meta-analysis',
    });
  } else if (avgFlex < 35) {
    insights.push({
      categoryId: flexCatId,
      titleEn: 'Firm Convictions Profile',
      titleTr: 'Sağlam Kanaatler Profili',
      descriptionEn: `Your overall flexibility is low (${Math.round(avgFlex)}%), with your most firm area being ${catName(flexCatId, 'en')}. You have strong convictions — this clarity helps partners know what to expect, but be mindful that some compromise is essential in any relationship.`,
      descriptionTr: `Genel esnekliğiniz düşük (${Math.round(avgFlex)}%), en katı alanınız ${catName(flexCatId, 'tr')}. Güçlü kanaatleriniz var — bu netlik partnerlerin ne bekleyeceğini bilmesine yardımcı olur, ancak her ilişkide bir miktar uzlaşmanın gerekli olduğunu unutmayın.`,
      severity: 'info',
      researchBasis: 'Karney & Bradbury (1995): Adaptability meta-analysis',
    });
  } else {
    insights.push({
      categoryId: flexCatId,
      titleEn: 'Balanced Flexibility',
      titleTr: 'Dengeli Esneklik',
      descriptionEn: `Your flexibility is balanced (${Math.round(avgFlex)}%). You have firm views in some areas (most firm: ${catName(flexCatId, 'en')}) and flexibility in others. This is a healthy profile — you know your limits while remaining open to differences.`,
      descriptionTr: `Esnekliğiniz dengeli (${Math.round(avgFlex)}%). Bazı alanlarda net görüşleriniz var (en katı: ${catName(flexCatId, 'tr')}) ve diğerlerinde esnekliğiniz mevcut. Bu sağlıklı bir profil — sınırlarınızı bilirken farklılıklara açık kalıyorsunuz.`,
      severity: 'info',
      researchBasis: 'Karney & Bradbury (1995): Adaptability meta-analysis',
    });
  }

  return insights;
}

/**
 * Detect blind spots — patterns the user may not be aware of.
 * Designed to always produce 1-2 blind spots for any profile.
 */
export function generateBlindSpots(dimensions: DimensionScore[]): {
  categoryId: CategoryId;
  titleEn: string;
  titleTr: string;
  descriptionEn: string;
  descriptionTr: string;
  statedPreference: number;
  revealedPattern: number;
}[] {
  const spots: {
    categoryId: CategoryId;
    titleEn: string;
    titleTr: string;
    descriptionEn: string;
    descriptionTr: string;
    statedPreference: number;
    revealedPattern: number;
  }[] = [];
  if (dimensions.length === 0) return spots;

  const catName = (id: CategoryId, locale: 'en' | 'tr') => {
    const def = categoryDefinitions[id];
    return locale === 'en' ? def?.nameEn : def?.nameTr;
  };

  // 1. Most neutral category — the one with the most middling selfScore (closest to 50)
  const byNeutrality = [...dimensions].sort(
    (a, b) => Math.abs(a.selfScore - 50) - Math.abs(b.selfScore - 50)
  );
  const mostNeutral = byNeutrality[0];
  if (mostNeutral && Math.abs(mostNeutral.selfScore - 50) < 15) {
    spots.push({
      categoryId: mostNeutral.categoryId,
      titleEn: `${catName(mostNeutral.categoryId, 'en')}: Mostly Neutral`,
      titleTr: `${catName(mostNeutral.categoryId, 'tr')}: Çoğunlukla Nötr`,
      descriptionEn: `Your answers in ${catName(mostNeutral.categoryId, 'en')} are mostly neutral (score: ${mostNeutral.selfScore}%). You may want to reflect more deeply here — neutrality can mean genuine flexibility, or it can mean you haven't fully explored your preferences yet.`,
      descriptionTr: `${catName(mostNeutral.categoryId, 'tr')} konusundaki yanıtlarınız çoğunlukla nötr (puan: ${mostNeutral.selfScore}%). Burada daha derinlemesine düşünmek isteyebilirsiniz — nötrlük gerçek esneklik anlamına gelebilir ya da tercihlerinizi henüz tam keşfetmediğiniz anlamına gelebilir.`,
      statedPreference: mostNeutral.importanceScore,
      revealedPattern: mostNeutral.selfScore,
    });
  }

  // 2. Under-prioritized high-weight category
  const weightedDims = dimensions.map((d) => ({
    ...d,
    researchWeight: dimensionWeights[d.categoryId]?.multiplier || 0.5,
  }));
  const undervalued = weightedDims
    .filter((d) => d.researchWeight >= 0.80 && d.importanceScore < 50)
    .sort((a, b) => b.researchWeight - a.researchWeight);

  if (undervalued.length > 0) {
    const gap = undervalued[0];
    spots.push({
      categoryId: gap.categoryId,
      titleEn: `${catName(gap.categoryId, 'en')}: Under-Prioritized`,
      titleTr: `${catName(gap.categoryId, 'tr')}: Düşük Öncelikli`,
      descriptionEn: `Research rates ${catName(gap.categoryId, 'en')} as highly predictive of marital satisfaction, but you've rated it as only ${gap.importanceScore}% important. Couples often underestimate this area until it becomes a source of friction.`,
      descriptionTr: `Araştırmalar ${catName(gap.categoryId, 'tr')} konusunun evlilik tatminini güçlü biçimde öngördüğünü gösteriyor, ancak siz bunu yalnızca ${gap.importanceScore}% önemli olarak değerlendirdiniz. Çiftler genellikle bu alanı bir sürtüşme kaynağı olana kadar hafife alır.`,
      statedPreference: gap.importanceScore,
      revealedPattern: Math.round(gap.researchWeight * 100),
    });
  }

  // 3. High importance + high flexibility mismatch (from original)
  for (const dim of dimensions) {
    if (spots.length >= 3) break;
    if (dim.importanceScore > 70 && dim.flexibilityScore > 70) {
      spots.push({
        categoryId: dim.categoryId,
        titleEn: `${catName(dim.categoryId, 'en')}: Priority-Flexibility Gap`,
        titleTr: `${catName(dim.categoryId, 'tr')}: Öncelik-Esneklik Farkı`,
        descriptionEn: `You rate ${catName(dim.categoryId, 'en')} as very important (${dim.importanceScore}%) but your answers are highly flexible (${dim.flexibilityScore}%). This could mean you haven't fully confronted what compromise would feel like here.`,
        descriptionTr: `${catName(dim.categoryId, 'tr')} konusunu çok önemli buluyorsunuz (${dim.importanceScore}%) ancak yanıtlarınız yüksek esneklik gösteriyor (${dim.flexibilityScore}%). Bu, burada uzlaşmanın nasıl hissettireceğiyle tam olarak yüzleşmemiş olabileceğiniz anlamına gelebilir.`,
        statedPreference: dim.importanceScore,
        revealedPattern: dim.flexibilityScore,
      });
    }
  }

  return spots;
}
