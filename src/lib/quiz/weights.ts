import { CategoryId, CategoryWeight } from '@/lib/types/quiz';

/**
 * Research-based dimension weights for scoring.
 * Based on effect sizes from longitudinal studies.
 *
 * The numeric multipliers now create REAL differentiation:
 * - Core values mismatch hurts ~1.7x more than home environment mismatch
 * - The gap between 0.95 and 0.55 actually matters in weighted averages
 */
export const dimensionWeights: Record<CategoryId, { weight: CategoryWeight; multiplier: number; evidenceBasis: string; researchNoteEn: string; researchNoteTr: string }> = {
  values: {
    weight: 'CRITICAL',
    multiplier: 0.95,
    evidenceBasis: 'Luo & Klohnen (2005); Lehrer & Chiswick (1993): Value congruence is the strongest assortative mating signal.',
    researchNoteEn: 'Value congruence is the strongest assortative mating signal. Same-faith couples have 13% 5-year divorce rate vs. 40% for interfaith couples.',
    researchNoteTr: 'Değer uyumu en güçlü eş seçimi sinyalidir. Aynı inançtan çiftlerde 5 yıllık boşanma oranı %13 iken, farklı inançlardan çiftlerde %40\'tır.',
  },
  communication: {
    weight: 'CRITICAL',
    multiplier: 0.92,
    evidenceBasis: 'Gottman & Levenson: Four Horsemen predict divorce with 93.6% accuracy.',
    researchNoteEn: 'How you fight matters more than what you fight about. Contempt alone is the strongest single predictor of divorce.',
    researchNoteTr: 'Nasıl tartıştığınız, ne hakkında tartıştığınızdan daha önemlidir. Küçümseme tek başına boşanmanın en güçlü göstergesidir.',
  },
  financial: {
    weight: 'HIGH',
    multiplier: 0.88,
    evidenceBasis: 'Dew, Britt & Huston (2012): Financial disagreements predict divorce more than sex, chores, or in-laws.',
    researchNoteEn: 'Financial disagreements are the #2 predictor of divorce in the first 5 years.',
    researchNoteTr: 'Finansal anlaşmazlıklar, ilk 5 yılda boşanmanın 2 numaralı göstergesidir.',
  },
  intimacy: {
    weight: 'HIGH',
    multiplier: 0.88,
    evidenceBasis: 'Meta-analytic r = .37–.49 between sexual and marital satisfaction.',
    researchNoteEn: 'Sexual satisfaction correlates r = .37–.49 with marital satisfaction. Frequency and intensity matching matters most.',
    researchNoteTr: 'Cinsel tatmin ile evlilik tatmini arasındaki korelasyon r = ,37–,49. Sıklık ve yoğunluk uyumu en önemlisidir.',
  },
  family: {
    weight: 'HIGH',
    multiplier: 0.87,
    evidenceBasis: 'Children decision is a true binary incompatibility. Carroll & Doherty (2003).',
    researchNoteEn: 'Whether to have children is one of the few true binary incompatibilities — there is no compromise position.',
    researchNoteTr: 'Çocuk sahibi olup olmamak, uzlaşma noktası olmayan gerçek ikili uyumsuzluklardan biridir.',
  },
  goals: {
    weight: 'HIGH',
    multiplier: 0.82,
    evidenceBasis: 'Huston et al. (2001) PAIR Project: Disillusionment from unmet life goals.',
    researchNoteEn: 'Misaligned life goals create silent resentment that builds over years.',
    researchNoteTr: 'Uyumsuz yaşam hedefleri yıllar içinde biriken sessiz bir kırgınlık yaratır.',
  },
  growth: {
    weight: 'MEDIUM',
    multiplier: 0.75,
    evidenceBasis: 'Growth beliefs vs. destiny beliefs research.',
    researchNoteEn: '"Growth beliefs" — believing relationships improve through effort — predict better long-term outcomes.',
    researchNoteTr: '"Büyüme inançları" — ilişkilerin çabayla gelişebileceğine inanmak — daha iyi uzun vadeli sonuçlar öngörür.',
  },
  household: {
    weight: 'MEDIUM',
    multiplier: 0.70,
    evidenceBasis: 'Hochschild (1989); Frisco & Williams (2003): Perceived fairness matters.',
    researchNoteEn: 'Perceived fairness in household labor matters more than the actual division.',
    researchNoteTr: 'Ev işlerinde algılanan adalet, gerçek bölüşümden daha önemlidir.',
  },
  health: {
    weight: 'MEDIUM',
    multiplier: 0.65,
    evidenceBasis: 'Homish & Leonard (2007): Substance use discrepancy effects over 7 years.',
    researchNoteEn: 'Substance use discrepancies predict significant satisfaction decline over 7 years.',
    researchNoteTr: 'Madde kullanım farklılıkları 7 yıl boyunca önemli tatmin düşüşü öngörür.',
  },
  social: {
    weight: 'MEDIUM',
    multiplier: 0.65,
    evidenceBasis: 'Dyrenforth et al. (2010): Individual agreeableness > personality similarity.',
    researchNoteEn: 'Individual agreeableness matters more than matching on introversion/extroversion.',
    researchNoteTr: 'Bireysel uyumluluk, içe dönüklük/dışa dönüklük eşleşmesinden daha önemlidir.',
  },
  worklife: {
    weight: 'MEDIUM',
    multiplier: 0.58,
    evidenceBasis: 'Work-family conflict meta-analysis: r = –.19 with relationship quality.',
    researchNoteEn: 'Work-family conflict negatively predicts relationship quality (r = –.19).',
    researchNoteTr: 'İş-aile çatışması ilişki kalitesini olumsuz yönde etkiler (r = –,19).',
  },
  aesthetic: {
    weight: 'LOW',
    multiplier: 0.55,
    evidenceBasis: 'Acknowledged research gap. Often proxy for deeper control/respect issues.',
    researchNoteEn: 'Aesthetic disagreements are often symptoms of deeper respect or control issues.',
    researchNoteTr: 'Estetik anlaşmazlıklar genellikle daha derin saygı veya kontrol sorunlarının belirtileridir.',
  },
};
