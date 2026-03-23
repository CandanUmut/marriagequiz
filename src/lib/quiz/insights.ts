import { CategoryId } from '@/lib/types/quiz';
import { DimensionScore, Insight } from '@/lib/types/results';

type InsightTemplate = {
  condition: (score: DimensionScore) => boolean;
  titleEn: string;
  titleTr: string;
  descriptionEn: (score: DimensionScore) => string;
  descriptionTr: (score: DimensionScore) => string;
  severity: 'info' | 'warning' | 'alert';
  researchBasis: string;
};

const insightTemplates: Partial<Record<CategoryId, InsightTemplate[]>> = {
  values: [
    {
      condition: (s) => s.dealBreaker && s.importanceScore > 80,
      titleEn: 'Values Are Your Foundation',
      titleTr: 'Değerler Temeliniz',
      descriptionEn: () =>
        'You view core values as non-negotiable. Research supports this — same-faith couples have a 13% five-year divorce rate vs. 40% for interfaith couples (Lehrer & Chiswick, 1993). Finding someone who genuinely shares your worldview is worth prioritizing.',
      descriptionTr: () =>
        'Temel değerleri vazgeçilmez olarak görüyorsunuz. Araştırmalar bunu destekliyor — aynı inançtan çiftlerde 5 yıllık boşanma oranı %13 iken, farklı inançlardan çiftlerde %40 (Lehrer & Chiswick, 1993).',
      severity: 'info',
      researchBasis: 'Lehrer & Chiswick (1993); Mahoney et al. (1999)',
    },
    {
      condition: (s) => s.flexibilityScore > 70 && s.importanceScore < 50,
      titleEn: 'Values Flexibility — A Double-Edged Sword',
      titleTr: 'Değer Esnekliği — İki Uçlu Bıçak',
      descriptionEn: () =>
        'You show high flexibility on values. While adaptability is valuable, research shows that actual value similarity (not just tolerance) is the strongest predictor of lasting satisfaction. Consider whether your flexibility reflects genuine openness or avoidance of hard conversations.',
      descriptionTr: () =>
        'Değerler konusunda yüksek esneklik gösteriyorsunuz. Uyum sağlama yeteneği değerli olsa da, araştırmalar gerçek değer benzerliğinin kalıcı tatminin en güçlü göstergesi olduğunu gösteriyor.',
      severity: 'warning',
      researchBasis: 'Luo & Klohnen (2005)',
    },
  ],
  communication: [
    {
      condition: (s) => s.selfScore > 70,
      titleEn: 'Strong Communication Orientation',
      titleTr: 'Güçlü İletişim Yönelimi',
      descriptionEn: () =>
        'You prioritize open communication. Research by Gottman shows that couples who maintain a 5:1 ratio of positive to negative interactions during conflict are significantly more likely to stay together.',
      descriptionTr: () =>
        'Açık iletişimi önceliklendiriyorsunuz. Gottman\'ın araştırması, çatışma sırasında 5:1 pozitif/negatif etkileşim oranını koruyan çiftlerin birlikte kalma olasılığının önemli ölçüde daha yüksek olduğunu gösteriyor.',
      severity: 'info',
      researchBasis: 'Gottman & Levenson',
    },
    {
      condition: (s) => s.selfScore < 40,
      titleEn: 'Communication Patterns to Watch',
      titleTr: 'Dikkat Edilmesi Gereken İletişim Kalıpları',
      descriptionEn: () =>
        'Your responses suggest patterns that could become the "Four Horsemen" of relationship conflict: criticism, contempt, defensiveness, and stonewalling. These are the strongest predictors of divorce — but they are learnable skills, not fixed traits.',
      descriptionTr: () =>
        'Yanıtlarınız ilişki çatışmasının "Dört Atlısı" olabilecek kalıplara işaret ediyor: eleştiri, küçümseme, savunmacılık ve duvar örme. Bunlar boşanmanın en güçlü göstergeleri — ama öğrenilebilir beceriler, sabit özellikler değil.',
      severity: 'alert',
      researchBasis: 'Gottman & Levenson: 93.6% divorce prediction accuracy',
    },
  ],
  financial: [
    {
      condition: (s) => s.dealBreaker,
      titleEn: 'Financial Alignment Is Critical for You',
      titleTr: 'Finansal Uyum Sizin İçin Kritik',
      descriptionEn: () =>
        'You\'ve marked financial behavior as a deal-breaker. Research strongly supports this instinct — financial disagreements predict divorce more powerfully than disagreements about sex, household tasks, or in-laws.',
      descriptionTr: () =>
        'Finansal davranışı kırmızı çizgi olarak işaretlediniz. Araştırmalar bu içgüdünüzü güçlü bir şekilde destekliyor — finansal anlaşmazlıklar cinsellik, ev işleri veya kayınvalide-kayınpeder konularından daha güçlü bir şekilde boşanmayı öngörüyor.',
      severity: 'info',
      researchBasis: 'Dew, Britt & Huston (2012)',
    },
  ],
  family: [
    {
      condition: (s) => s.importanceScore > 80,
      titleEn: 'Family Is Central to Your Vision',
      titleTr: 'Aile Vizyonunuzun Merkezinde',
      descriptionEn: () =>
        'Family matters deeply to you. The decision about whether to have children is one of the few true binary incompatibilities — there is no compromise position. Make sure this conversation happens early and honestly.',
      descriptionTr: () =>
        'Aile sizin için çok önemli. Çocuk sahibi olup olmama kararı, gerçek ikili uyumsuzluklardan biridir — uzlaşma noktası yoktur. Bu konuşmanın erken ve dürüstçe yapıldığından emin olun.',
      severity: 'info',
      researchBasis: 'Carroll & Doherty (2003)',
    },
  ],
  intimacy: [
    {
      condition: (s) => s.importanceScore > 70,
      titleEn: 'Intimacy Is a Priority',
      titleTr: 'Yakınlık Bir Öncelik',
      descriptionEn: () =>
        'You place high importance on intimacy. Research shows a strong correlation (r = .37–.49) between sexual satisfaction and marital satisfaction. Matching on frequency and intensity expectations is crucial.',
      descriptionTr: () =>
        'Yakınlığa yüksek önem veriyorsunuz. Araştırmalar cinsel tatmin ile evlilik tatmini arasında güçlü bir korelasyon gösteriyor. Sıklık ve yoğunluk beklentilerinde uyum kritiktir.',
      severity: 'info',
      researchBasis: 'Meta-analytic r = .37–.49',
    },
  ],
  growth: [
    {
      condition: (s) => s.selfScore > 60,
      titleEn: 'Growth Mindset in Relationships',
      titleTr: 'İlişkilerde Büyüme Zihniyeti',
      descriptionEn: () =>
        'You believe relationships can grow and improve. This "growth belief" predicts better conflict resolution and higher long-term satisfaction compared to "destiny beliefs" that compatibility is fixed.',
      descriptionTr: () =>
        '"Büyüme inancı"na sahipsiniz — ilişkilerin gelişebileceğine inanıyorsunuz. Bu, uyumluluğun sabit olduğuna dair "kader inançları"na kıyasla daha iyi çatışma çözümü ve daha yüksek uzun vadeli tatmin öngörüyor.',
      severity: 'info',
      researchBasis: 'Growth beliefs vs. destiny beliefs research',
    },
  ],
};

export function generateInsights(dimensions: DimensionScore[]): Insight[] {
  const insights: Insight[] = [];

  for (const dim of dimensions) {
    const templates = insightTemplates[dim.categoryId];
    if (!templates) continue;

    for (const template of templates) {
      if (template.condition(dim)) {
        insights.push({
          categoryId: dim.categoryId,
          titleEn: template.titleEn,
          titleTr: template.titleTr,
          descriptionEn: template.descriptionEn(dim),
          descriptionTr: template.descriptionTr(dim),
          severity: template.severity,
          researchBasis: template.researchBasis,
        });
      }
    }
  }

  return insights;
}
