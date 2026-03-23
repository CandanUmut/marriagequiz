import { Question, QuizAnswer } from '@/lib/types/quiz';

/**
 * Honesty calibration system.
 * Detects social desirability bias and inconsistency in responses.
 */

export interface HonestyReport {
  overallScore: number; // 0-100, higher = more honest
  socialDesirabilityBias: number; // 0-100, higher = more bias
  consistencyScore: number; // 0-100, higher = more consistent
  flags: HonestyFlag[];
  recommendation: { en: string; tr: string };
}

export interface HonestyFlag {
  type: 'social_desirability' | 'inconsistency' | 'extreme_responding';
  questionIds: string[];
  descriptionEn: string;
  descriptionTr: string;
}

/**
 * Check if it's time for a periodic honesty nudge.
 * Shows every 15-20 questions.
 */
export function shouldShowHonestyNudge(totalAnswered: number): boolean {
  return totalAnswered > 0 && totalAnswered % 18 === 0;
}

/**
 * Generate the full honesty report from all answers.
 */
export function generateHonestyReport(
  questions: Question[],
  answers: Record<string, QuizAnswer>
): HonestyReport {
  const flags: HonestyFlag[] = [];

  // 1. Social desirability check
  const sdQuestions = questions.filter((q) => q.socialDesirabilityFlag);
  let sdBias = 0;
  if (sdQuestions.length > 0) {
    const sdHighCount = sdQuestions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return false;
      const val = typeof answer.value === 'number' ? answer.value : 0;
      return val >= 6; // Very high on social desirability scale
    }).length;
    sdBias = Math.round((sdHighCount / sdQuestions.length) * 100);

    if (sdBias > 70) {
      flags.push({
        type: 'social_desirability',
        questionIds: sdQuestions.map((q) => q.id),
        descriptionEn:
          'You consistently chose the most socially desirable answers. Consider whether you\'re answering as your true self.',
        descriptionTr:
          'Sürekli olarak en toplumsal olarak arzu edilen cevapları seçtiniz. Gerçek benliğinizle mi cevap verdiğinizi düşünün.',
      });
    }
  }

  // 2. Consistency check via honesty pairs
  const pairs = new Map<string, Question[]>();
  for (const q of questions) {
    if (q.honestyPairId) {
      const existing = pairs.get(q.honestyPairId) || [];
      existing.push(q);
      pairs.set(q.honestyPairId, existing);
    }
  }

  let totalConsistency = 0;
  let pairCount = 0;
  const inconsistentPairs: string[] = [];

  pairs.forEach((pairedQuestions, pairId) => {
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
    const consistency = (1 - diff / 6) * 100;
    totalConsistency += consistency;
    pairCount++;

    if (diff > 3) {
      inconsistentPairs.push(pairId);
    }
  });

  // If honesty pairs exist, use their average. Otherwise, compute from SD + deal-breaker + extreme checks.
  let consistencyScore: number;
  if (pairCount > 0) {
    consistencyScore = Math.round(totalConsistency / pairCount);
  } else {
    // Collect numeric answer values
    const answeredValues: number[] = [];
    for (const q of questions) {
      const answer = answers[q.id];
      if (!answer) continue;
      const val = typeof answer.value === 'number' ? answer.value : null;
      if (val !== null) answeredValues.push(val);
    }

    if (answeredValues.length === 0) {
      consistencyScore = 85;
    } else {
      let csScore = 100;

      // SD check
      const mean = answeredValues.reduce((a, b) => a + b, 0) / answeredValues.length;
      const variance =
        answeredValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / answeredValues.length;
      const sd = Math.sqrt(variance);
      if (sd < 0.5) {
        csScore -= 12;
      } else if (sd > 2.0) {
        csScore -= 15;
      }

      // Deal-breaker mismatch check
      for (const q of questions) {
        const answer = answers[q.id];
        if (!answer) continue;
        const val = typeof answer.value === 'number' ? answer.value : null;
        if (q.dealBreakerFollowUp && answer.dealBreaker && val !== null && val < 3) {
          csScore -= 10;
        }
      }

      // Extreme responding
      const extremeCount = answeredValues.filter((v) => v === 1 || v === 7).length;
      if (answeredValues.length > 0 && extremeCount / answeredValues.length > 0.6) {
        csScore -= 10;
      }

      consistencyScore = Math.max(0, Math.min(100, csScore));
    }
  }

  if (inconsistentPairs.length > 0) {
    flags.push({
      type: 'inconsistency',
      questionIds: inconsistentPairs,
      descriptionEn:
        'Some of your answers contradict each other, which may indicate uncertainty or idealized responding.',
      descriptionTr:
        'Bazı yanıtlarınız birbiriyle çelişiyor, bu belirsizlik veya idealleştirilmiş yanıtlama gösterebilir.',
    });
  }

  // 3. Extreme responding check
  const answeredQuestions = questions.filter((q) => answers[q.id]);
  const extremeCount = answeredQuestions.filter((q) => {
    const val = typeof answers[q.id]?.value === 'number' ? answers[q.id].value as number : 4;
    return val === 1 || val === 7;
  }).length;
  const extremeRatio = answeredQuestions.length > 0 ? extremeCount / answeredQuestions.length : 0;

  if (extremeRatio > 0.6) {
    flags.push({
      type: 'extreme_responding',
      questionIds: answeredQuestions.filter((q) => {
        const val = typeof answers[q.id]?.value === 'number' ? answers[q.id].value as number : 4;
        return val === 1 || val === 7;
      }).map((q) => q.id),
      descriptionEn:
        'You tend to choose extreme positions. While strong opinions are valid, consider whether some answers could be more nuanced.',
      descriptionTr:
        'Aşırı pozisyonlar seçme eğilimindesiniz. Güçlü görüşler geçerli olsa da, bazı yanıtların daha nüanslı olup olamayacağını düşünün.',
    });
  }

  // Overall honesty score
  const overallScore = Math.round(
    (consistencyScore * 0.5 + (100 - sdBias) * 0.3 + (1 - extremeRatio) * 100 * 0.2)
  );

  // Recommendation
  let recommendation: { en: string; tr: string };
  if (overallScore > 80) {
    recommendation = {
      en: 'Your answers appear thoughtful and consistent. Your results should be a reliable reflection of your actual preferences.',
      tr: 'Yanıtlarınız düşünceli ve tutarlı görünüyor. Sonuçlarınız gerçek tercihlerinizin güvenilir bir yansıması olmalı.',
    };
  } else if (overallScore > 60) {
    recommendation = {
      en: 'Some patterns suggest you may be presenting a slightly idealized version of yourself. Consider reviewing your results with an honest friend who knows you well.',
      tr: 'Bazı kalıplar kendinizin hafifçe idealleştirilmiş bir versiyonunu sunuyor olabileceğinizi gösteriyor. Sonuçlarınızı sizi iyi tanıyan dürüst bir arkadaşınızla gözden geçirmeyi düşünün.',
    };
  } else {
    recommendation = {
      en: 'Your answers show significant inconsistency. We strongly recommend retaking the quiz with radical honesty — the results will be much more useful to you.',
      tr: 'Yanıtlarınız önemli tutarsızlık gösteriyor. Testi radikal dürüstlükle tekrar almanızı şiddetle tavsiye ediyoruz — sonuçlar sizin için çok daha yararlı olacaktır.',
    };
  }

  return {
    overallScore,
    socialDesirabilityBias: sdBias,
    consistencyScore,
    flags,
    recommendation,
  };
}
