import { DimensionAlignment, CompromiseItem } from '@/lib/types/compare';
import { CategoryId } from '@/lib/types/quiz';

const compromiseTemplates: Partial<Record<CategoryId, { en: string; tr: string; researchBasis: string }>> = {
  values: {
    en: 'Core value differences require deep, honest conversation — not compromise on the values themselves, but understanding of how they play out in daily life. Consider pre-marital counseling focused on values alignment.',
    tr: 'Temel değer farklılıkları derin, dürüst konuşma gerektirir — değerlerin kendilerinde uzlaşma değil, günlük yaşamda nasıl tezahür ettiklerini anlamak. Değer uyumuna odaklanan evlilik öncesi danışmanlık düşünün.',
    researchBasis: 'Mahoney et al. (1999): Shared sanctification accounts for 42% of marital satisfaction variance.',
  },
  communication: {
    en: 'Communication styles can be learned and improved. Gottman\'s research shows that learning to make and receive "repair attempts" during conflict is one of the most powerful predictors of relationship success.',
    tr: 'İletişim tarzları öğrenilebilir ve geliştirilebilir. Gottman\'ın araştırması, çatışma sırasında "onarım girişimleri" yapma ve almayı öğrenmenin ilişki başarısının en güçlü göstergelerinden biri olduğunu gösteriyor.',
    researchBasis: 'Gottman: Repair attempts are the strongest predictor of relationship stability.',
  },
  financial: {
    en: 'Financial differences are workable with explicit agreements. Consider creating a shared financial plan before marriage — research shows that couples who discuss money openly before marriage have significantly better outcomes.',
    tr: 'Finansal farklılıklar açık anlaşmalarla çözülebilir. Evlilik öncesi ortak bir finansal plan oluşturmayı düşünün — araştırmalar evlilik öncesi para konusunu açıkça tartışan çiftlerin önemli ölçüde daha iyi sonuçlar aldığını gösteriyor.',
    researchBasis: 'Britt & Huston (2012): Financial conflict patterns predict divorce over 25 years.',
  },
  family: {
    en: 'Family planning differences — especially whether to have children — are among the few true binary incompatibilities. If you disagree on this fundamental question, no amount of compromise can bridge the gap.',
    tr: 'Aile planlaması farklılıkları — özellikle çocuk sahibi olup olmama — gerçek ikili uyumsuzluklardan biridir. Bu temel soruda anlaşamıyorsanız, hiçbir uzlaşma bu boşluğu kapatamaz.',
    researchBasis: 'Research identifies children decision as true non-negotiable.',
  },
  goals: {
    en: 'Life goal misalignment often manifests slowly as resentment. Have explicit conversations about 5-year and 10-year visions for your lives — where you\'ll live, career priorities, and what "success" means to each of you.',
    tr: 'Yaşam hedefi uyumsuzluğu genellikle yavaş yavaş kırgınlık olarak tezahür eder. 5 yıllık ve 10 yıllık yaşam vizyonlarınız hakkında açık konuşmalar yapın.',
    researchBasis: 'Huston et al. (2001): PAIR Project — disillusionment from unmet expectations.',
  },
  intimacy: {
    en: 'Intimacy needs can be negotiated, but fundamental mismatches in desire level are difficult. Research shows matching on frequency and intensity is more important than specific preferences.',
    tr: 'Yakınlık ihtiyaçları müzakere edilebilir, ancak arzu düzeyindeki temel uyumsuzluklar zordur. Araştırmalar sıklık ve yoğunluk konusunda eşleşmenin spesifik tercihlerden daha önemli olduğunu gösteriyor.',
    researchBasis: 'Meta-analytic r = .37–.49 between sexual and marital satisfaction.',
  },
  household: {
    en: 'Household labor conflicts are about perceived fairness, not the actual split. Both egalitarian and complementary models work — as long as both partners feel it\'s fair. Have the explicit conversation about expectations.',
    tr: 'Ev işi çatışmaları algılanan adaletle ilgilidir, gerçek bölüşümle değil. Hem eşitlikçi hem tamamlayıcı modeller işler — her iki partner de adil olduğunu hissettikçe.',
    researchBasis: 'Hochschild (1989); Frisco & Williams (2003).',
  },
  health: {
    en: 'Health and substance use concordance matters. Research shows that discrepancies in drinking patterns predict satisfaction decline over 7 years. Align on fundamental health values, not every specific habit.',
    tr: 'Sağlık ve madde kullanım uyumu önemlidir. Araştırmalar içki kullanım farklılıklarının 7 yıl boyunca tatmin düşüşünü öngördüğünü gösteriyor.',
    researchBasis: 'Homish & Leonard (2007).',
  },
  social: {
    en: 'Social needs differences are highly negotiable. Individual agreeableness matters more than matching on introversion/extroversion. Focus on respecting each other\'s social batteries.',
    tr: 'Sosyal ihtiyaç farklılıkları oldukça müzakere edilebilir. Bireysel uyumluluk, içe dönüklük/dışa dönüklük eşleşmesinden daha önemlidir.',
    researchBasis: 'Dyrenforth et al. (2010).',
  },
  growth: {
    en: 'If one partner has a "growth mindset" about relationships and the other has a "destiny mindset," this fundamental difference in how you approach problems will surface repeatedly. Both must believe the relationship can improve through effort.',
    tr: 'Bir partner ilişkiler hakkında "büyüme zihniyeti"ne, diğeri "kader zihniyeti"ne sahipse, problemlere nasıl yaklaştığınızdaki bu temel fark tekrar tekrar ortaya çıkacaktır.',
    researchBasis: 'Growth beliefs vs. destiny beliefs research.',
  },
  worklife: {
    en: 'Work-life balance expectations should be explicitly discussed, including career ambition, travel, working hours, and what "being present" means. Both complementary and dual-career models work when expectations are aligned.',
    tr: 'İş-yaşam dengesi beklentileri açıkça tartışılmalıdır. Beklentiler uyumlu olduğunda hem tamamlayıcı hem çift kariyer modelleri işler.',
    researchBasis: 'Work-family conflict meta-analysis.',
  },
  aesthetic: {
    en: 'Aesthetic preferences are genuinely negotiable — but pay attention to whether disagreements here are actually about respect, control, or cultural identity. The surface issue is rarely the real issue.',
    tr: 'Estetik tercihler gerçekten müzakere edilebilir — ama buradaki anlaşmazlıkların aslında saygı, kontrol veya kültürel kimlikle ilgili olup olmadığına dikkat edin.',
    researchBasis: 'Clinical observation: aesthetic disagreements often proxy for deeper issues.',
  },
};

export function generateCompromiseSuggestions(
  nonGreenAlignments: DimensionAlignment[],
): CompromiseItem[] {
  return nonGreenAlignments.map((alignment) => {
    const template = compromiseTemplates[alignment.categoryId];
    const scoreDiff = Math.abs(alignment.personAScore - alignment.personBScore);

    let difficulty: 'low' | 'medium' | 'high';
    if (alignment.zone === 'red') {
      difficulty = 'high';
    } else if (scoreDiff > 40 || alignment.personADealBreaker || alignment.personBDealBreaker) {
      difficulty = 'high';
    } else if (scoreDiff > 20) {
      difficulty = 'medium';
    } else {
      difficulty = 'low';
    }

    return {
      categoryId: alignment.categoryId,
      suggestionEn: template?.en || 'Discuss this dimension openly and honestly with your partner.',
      suggestionTr: template?.tr || 'Bu boyutu partnerinizle açıkça ve dürüstçe tartışın.',
      difficulty,
      researchBasis: template?.researchBasis || '',
    };
  });
}
