'use client';

import { ComparisonResult, DealBreakerCollision } from '@/lib/types/compare';
import { QuizAnswer, CategoryId } from '@/lib/types/quiz';
import { categoryDefinitions } from '@/lib/quiz/categories';
import { questionsByCategory } from '@/lib/quiz/questions';
import { dimensionWeights } from '@/lib/quiz/weights';

type Locale = 'en' | 'tr';

function t(locale: Locale, en: string, tr: string) {
  return locale === 'en' ? en : tr;
}

function scoreColorHex(score: number): string {
  if (score >= 70) return '#059669';
  if (score >= 50) return '#d97706';
  if (score >= 30) return '#ea580c';
  return '#dc2626';
}

/** Get the text of the answer chosen for a question */
function getAnswerText(
  questionId: string,
  answers: Record<string, QuizAnswer>,
  locale: Locale,
): { text: string; value: number; isDealBreaker: boolean } {
  const answer = answers[questionId];
  if (!answer) return { text: locale === 'en' ? '(skipped)' : '(atlandı)', value: 0, isDealBreaker: false };

  const val = typeof answer.value === 'number' ? answer.value : 0;

  // Find the question to get option text
  for (const catQuestions of Object.values(questionsByCategory)) {
    const q = catQuestions.find((qu) => qu.id === questionId);
    if (!q) continue;

    if (q.options) {
      const opt = q.options.find((o) => o.value === val);
      if (opt) {
        return {
          text: locale === 'en' ? opt.textEn : opt.textTr,
          value: val,
          isDealBreaker: answer.dealBreaker === true,
        };
      }
    }

    // Likert/slider — show the numeric value with label context
    const lowLabel = locale === 'en'
      ? (q.likertLabels?.lowEn || q.sliderLabels?.minEn || '1')
      : (q.likertLabels?.lowTr || q.sliderLabels?.minTr || '1');
    const highLabel = locale === 'en'
      ? (q.likertLabels?.highEn || q.sliderLabels?.maxEn || '7')
      : (q.likertLabels?.highTr || q.sliderLabels?.maxTr || '7');

    return {
      text: `${val}/7 (${lowLabel} ← → ${highLabel})`,
      value: val,
      isDealBreaker: answer.dealBreaker === true,
    };
  }

  return { text: String(val), value: val, isDealBreaker: answer.dealBreaker === true };
}

function renderQuestionComparison(
  catId: CategoryId,
  answersA: Record<string, QuizAnswer>,
  answersB: Record<string, QuizAnswer>,
  collisions: DealBreakerCollision[],
  locale: Locale,
  labelA: string,
  labelB: string,
): string {
  const questions = questionsByCategory[catId] || [];
  if (questions.length === 0) return '';

  return questions.map((q) => {
    const questionText = locale === 'en' ? q.textEn : (q.textTr || q.textEn);
    const ansA = getAnswerText(q.id, answersA, locale);
    const ansB = getAnswerText(q.id, answersB, locale);
    const collision = collisions.find((c) => c.questionKey === q.id);
    const borderColor = collision
      ? (collision.severity === 'critical' ? '#dc2626' : '#ea580c')
      : '#e8e4db';

    return `
      <div style="margin-bottom: 10px; padding: 8px 12px; border-left: 3px solid ${borderColor}; background: ${collision ? '#fef2f2' : '#fafaf8'}; border-radius: 0 6px 6px 0;">
        <p style="margin: 0 0 6px 0; font-size: 11px; color: #1c4f48; font-weight: 600;">
          ${questionText}
          ${collision ? `<span style="color: ${borderColor}; font-size: 9px; font-weight: bold;"> ⚠ ${collision.severity === 'critical' ? t(locale, 'CRITICAL', 'KRİTİK') : t(locale, 'SERIOUS', 'CİDDİ')}</span>` : ''}
        </p>
        <div style="display: flex; gap: 16px;">
          <div style="flex: 1;">
            <span style="font-size: 9px; color: #857563; text-transform: uppercase; letter-spacing: 0.5px;">${labelA}</span>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #5a5046;">
              ${ansA.text}${ansA.isDealBreaker ? ' <span style="color: #dc2626;">⚠ ' + t(locale, 'Deal-Breaker', 'Kırmızı Çizgi') + '</span>' : ''}
            </p>
          </div>
          <div style="flex: 1;">
            <span style="font-size: 9px; color: #857563; text-transform: uppercase; letter-spacing: 0.5px;">${labelB}</span>
            <p style="margin: 2px 0 0 0; font-size: 10px; color: #5a5046;">
              ${ansB.text}${ansB.isDealBreaker ? ' <span style="color: #dc2626;">⚠ ' + t(locale, 'Deal-Breaker', 'Kırmızı Çizgi') + '</span>' : ''}
            </p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Generate and download a comprehensive comparison PDF report.
 */
export async function generateComparisonPDF(
  comparison: ComparisonResult,
  answersA: Record<string, QuizAnswer>,
  answersB: Record<string, QuizAnswer>,
  locale: Locale = 'en',
  labelA?: string,
  labelB?: string,
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const nameA = labelA || t(locale, 'Person A', 'Kişi A');
  const nameB = labelB || t(locale, 'Person B', 'Kişi B');

  const {
    overallAlignment,
    scoreCeiling,
    dealBreakerCollisions,
    framing,
    dimensionAlignments,
  } = comparison;

  const framingLabel = locale === 'en' ? framing.labelEn : framing.labelTr;
  const framingDesc = locale === 'en' ? framing.descriptionEn : framing.descriptionTr;
  const scoreColor = scoreColorHex(overallAlignment);

  // Sort alignments by score (worst first)
  const sortedAlignments = [...dimensionAlignments].sort((a, b) => a.alignmentScore - b.alignmentScore);

  // Top 3 strengths and challenges
  const strengths = [...dimensionAlignments].sort((a, b) => b.alignmentScore - a.alignmentScore).slice(0, 3);
  const challenges = sortedAlignments.slice(0, 3);

  // Build HTML
  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute; left: -9999px; top: 0; width: 794px;
    background: #ffffff; font-family: system-ui, -apple-system, sans-serif;
    color: #1c4f48; padding: 40px; box-sizing: border-box;
  `;

  // Conversation starters for challenges
  const conversationStarters: Record<CategoryId, { en: string; tr: string }> = {
    values: { en: '"What values would you want to teach our children?"', tr: '"Çocuklarımıza hangi değerleri öğretmek istersiniz?"' },
    communication: { en: '"When we disagree, what does repair look like for you?"', tr: '"Anlaşamadığımızda sizin için onarım neye benzer?"' },
    financial: { en: '"How would you feel about a monthly money meeting?"', tr: '"Aylık bir para toplantısı hakkında ne düşünürsünüz?"' },
    family: { en: '"What role do you see your parents playing in our life?"', tr: '"Ailelerinizin hayatımızdaki rolünü nasıl görüyorsunuz?"' },
    goals: { en: '"Where do you see us in 10 years?"', tr: '"10 yıl sonra bizi nerede görüyorsunuz?"' },
    intimacy: { en: '"What makes you feel most loved and connected?"', tr: '"Kendinizi en çok sevilen ve bağlı hissettiren nedir?"' },
    household: { en: '"What household tasks feel most important to you?"', tr: '"Sizin için en önemli ev işleri hangileri?"' },
    health: { en: '"What does a healthy lifestyle look like to you?"', tr: '"Sizin için sağlıklı bir yaşam tarzı neye benzer?"' },
    social: { en: '"How much time with friends feels right to you?"', tr: '"Arkadaşlarla ne kadar zaman geçirmek size doğru geliyor?"' },
    growth: { en: '"How would you feel about couples therapy as a tune-up?"', tr: '"Bir bakım olarak çift terapisi hakkında ne düşünürsünüz?"' },
    worklife: { en: '"What does work-life balance mean to you specifically?"', tr: '"İş-yaşam dengesi sizin için özellikle ne anlama geliyor?"' },
    aesthetic: { en: '"How important is our home environment to your happiness?"', tr: '"Ev ortamımız mutluluğunuz için ne kadar önemli?"' },
  };

  container.innerHTML = `
    <!-- PAGE 1: Cover & Summary -->
    <div style="border-bottom: 4px solid #2d9a89; padding-bottom: 20px; margin-bottom: 28px;">
      <h1 style="margin: 0 0 4px 0; font-size: 32px; color: #2d9a89;">Hayırlısı</h1>
      <p style="margin: 0 0 4px 0; font-size: 18px; color: #5a5046;">
        ${t(locale, 'Compatibility Report', 'Uyumluluk Raporu')} — ${nameA} & ${nameB}
      </p>
      <p style="margin: 0; font-size: 11px; color: #857563;">
        ${t(locale, `Generated: ${new Date().toLocaleDateString('en-US')}`, `Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}`)}
      </p>
    </div>

    <!-- Overall Score -->
    <div style="text-align: center; margin-bottom: 24px; padding: 20px; background: #f8f7f4; border-radius: 12px;">
      <p style="margin: 0 0 6px 0; font-size: 12px; color: #857563; text-transform: uppercase; letter-spacing: 1px;">
        ${t(locale, 'Overall Alignment', 'Genel Uyum')}
      </p>
      <p style="margin: 0 0 6px 0; font-size: 42px; font-weight: bold; color: ${scoreColor};">
        ${overallAlignment}%
      </p>
      <p style="margin: 0 0 6px 0; font-size: 15px; font-weight: bold; color: ${scoreColor};">
        ${framingLabel}
      </p>
      ${dealBreakerCollisions.length > 0 ? `
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #dc2626;">
          ⚠ ${dealBreakerCollisions.length} ${t(locale, 'deal-breaker conflict(s) detected', 'vazgeçilmez çatışma tespit edildi')}
          ${scoreCeiling < 100 ? ` — ${t(locale, `${scoreCeiling}% of base score retained`, `baz puanın %${scoreCeiling}'i korundu`)}` : ''}
        </p>
      ` : ''}
    </div>

    <p style="margin: 0 0 24px 0; font-size: 12px; color: #5a5046; line-height: 1.6;">
      ${framingDesc}
    </p>

    <!-- Deal-Breaker Analysis -->
    ${dealBreakerCollisions.length > 0 ? `
      <div style="margin-bottom: 24px; padding: 14px; background: #fef2f2; border-radius: 10px; border: 2px solid #fca5a5;">
        <h2 style="margin: 0 0 10px 0; font-size: 15px; color: #dc2626; font-weight: bold;">
          ⚠ ${t(locale, 'Deal-Breaker Conflicts', 'Vazgeçilmez Çatışmalar')}
        </h2>
        ${dealBreakerCollisions.map((c) => {
          const ansA = getAnswerText(c.questionKey, answersA, locale);
          const ansB = getAnswerText(c.questionKey, answersB, locale);
          const catDef = categoryDefinitions[c.category];
          const catName = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
          // Get question text
          const questions = questionsByCategory[c.category] || [];
          const q = questions.find((qu) => qu.id === c.questionKey);
          const qText = q ? (locale === 'en' ? q.textEn : (q.textTr || q.textEn)) : c.questionKey;

          return `
            <div style="margin-bottom: 10px; padding: 10px 12px; background: white; border-radius: 6px; border-left: 4px solid ${c.severity === 'critical' ? '#dc2626' : '#ea580c'};">
              <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="font-size: 11px; font-weight: bold; color: #1c4f48;">${catName}</span>
                <span style="font-size: 9px; font-weight: bold; color: ${c.severity === 'critical' ? '#dc2626' : '#ea580c'}; text-transform: uppercase;">
                  ${c.severity === 'critical' ? t(locale, 'CRITICAL', 'KRİTİK') : t(locale, 'SERIOUS', 'CİDDİ')}
                </span>
              </div>
              <p style="margin: 0 0 6px 0; font-size: 10px; color: #5a5046; font-style: italic;">${qText}</p>
              <div style="display: flex; gap: 16px; font-size: 10px;">
                <div style="flex: 1;">
                  <span style="color: #857563;">${nameA}:</span>
                  <span style="color: #1c4f48;"> ${ansA.text}</span>
                  ${c.personAIsDealBreaker ? '<span style="color: #dc2626;"> ⚠ DB</span>' : ''}
                </div>
                <div style="flex: 1;">
                  <span style="color: #857563;">${nameB}:</span>
                  <span style="color: #1c4f48;"> ${ansB.text}</span>
                  ${c.personBIsDealBreaker ? '<span style="color: #dc2626;"> ⚠ DB</span>' : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    ` : ''}

    <!-- Category Comparison Table -->
    <h2 style="margin: 0 0 12px 0; font-size: 16px; color: #2d9a89;">
      ${t(locale, 'Category Comparison', 'Kategori Karşılaştırması')}
    </h2>
    <div style="margin-bottom: 24px;">
      ${sortedAlignments.map((da) => {
        const catDef = categoryDefinitions[da.categoryId];
        const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
        const weight = dimensionWeights[da.categoryId];
        const barColor = scoreColorHex(da.alignmentScore);
        const summary = locale === 'en' ? da.summaryEn : da.summaryTr;

        return `
          <div style="margin-bottom: 8px; padding: 8px 12px; background: ${da.hasDealBreakerCollision ? '#fef2f2' : '#f8f7f4'}; border-radius: 6px; border-left: 3px solid ${da.hasDealBreakerCollision ? '#dc2626' : barColor};">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: bold; color: #1c4f48;">
                ${name}
                ${da.hasDealBreakerCollision ? '<span style="color: #dc2626; font-size: 10px;"> ⚠ CONFLICT</span>' : ''}
              </span>
              <span style="font-size: 13px; font-weight: bold; color: ${barColor};">${da.alignmentScore}%</span>
            </div>
            <div style="font-size: 10px; color: #857563; margin-top: 2px;">
              ${nameA}: ${da.personAScore} | ${nameB}: ${da.personBScore} | ${t(locale, 'Weight', 'Ağırlık')}: ${weight ? Math.round(weight.multiplier * 100) : '—'}%
            </div>
            ${summary ? `<div style="font-size: 10px; color: #5a5046; margin-top: 3px;">${summary}</div>` : ''}
          </div>
        `;
      }).join('')}
    </div>

    <!-- Top Strengths & Challenges -->
    <div style="display: flex; gap: 16px; margin-bottom: 24px;">
      <div style="flex: 1; padding: 12px; background: #ecfdf5; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #059669;">
          ${t(locale, '✓ Top Strengths', '✓ En Güçlü Alanlar')}
        </h3>
        ${strengths.map((s) => {
          const catDef = categoryDefinitions[s.categoryId];
          const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
          return `<p style="margin: 0 0 4px 0; font-size: 10px; color: #065f46;">• ${name} (${s.alignmentScore}%)</p>`;
        }).join('')}
      </div>
      <div style="flex: 1; padding: 12px; background: #fef2f2; border-radius: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; color: #dc2626;">
          ${t(locale, '⚠ Key Challenges', '⚠ Temel Zorluklar')}
        </h3>
        ${challenges.map((c) => {
          const catDef = categoryDefinitions[c.categoryId];
          const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
          const starter = conversationStarters[c.categoryId];
          return `
            <div style="margin-bottom: 6px;">
              <p style="margin: 0; font-size: 10px; color: #991b1b;">• ${name} (${c.alignmentScore}%)</p>
              ${starter ? `<p style="margin: 2px 0 0 8px; font-size: 9px; color: #b91c1c; font-style: italic;">${t(locale, 'Ask', 'Sorun')}: ${locale === 'en' ? starter.en : starter.tr}</p>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- Detailed Category Breakdowns with Questions & Answers -->
    <h2 style="margin: 0 0 14px 0; font-size: 16px; color: #2d9a89; border-top: 2px solid #2d9a89; padding-top: 16px;">
      ${t(locale, 'Detailed Comparison — Questions & Answers', 'Detaylı Karşılaştırma — Sorular ve Cevaplar')}
    </h2>

    ${sortedAlignments.map((da) => {
      const catDef = categoryDefinitions[da.categoryId];
      const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;
      const barColor = scoreColorHex(da.alignmentScore);
      const researchNote = locale === 'en' ? da.researchNoteEn : da.researchNoteTr;
      const catCollisions = dealBreakerCollisions.filter((c) => c.category === da.categoryId);

      return `
        <div style="margin-bottom: 20px; page-break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; padding: 6px 10px; background: ${catDef?.color || '#2d9a89'}15; border-radius: 6px;">
            <span style="font-size: 13px; font-weight: bold; color: ${catDef?.color || '#2d9a89'};">${name}</span>
            <span style="font-size: 14px; font-weight: bold; color: ${barColor};">${da.alignmentScore}% ${t(locale, 'alignment', 'uyum')}</span>
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 6px; font-size: 10px; color: #857563;">
            <span>${nameA}: ${da.personAScore}%${da.personADealBreaker ? ' ⚠ DB' : ''}</span>
            <span>|</span>
            <span>${nameB}: ${da.personBScore}%${da.personBDealBreaker ? ' ⚠ DB' : ''}</span>
          </div>
          ${researchNote ? `<p style="margin: 0 0 8px 0; font-size: 9px; color: #857563; font-style: italic;">📚 ${researchNote}</p>` : ''}
          ${renderQuestionComparison(da.categoryId, answersA, answersB, catCollisions, locale, nameA, nameB)}
        </div>
      `;
    }).join('')}

    <!-- Footer -->
    <div style="margin-top: 32px; padding-top: 12px; border-top: 1px solid #e8e4db;">
      <p style="margin: 0 0 4px 0; font-size: 10px; color: #b0a08a;">
        ${t(locale,
          'Generated by Hayırlısı — Open Source Marriage Compatibility Tool',
          'Hayırlısı tarafından oluşturuldu — Açık Kaynak Evlilik Uyumu Aracı'
        )}
      </p>
      <p style="margin: 0; font-size: 9px; color: #c0b6a6; font-style: italic;">
        ${t(locale,
          'This report is for self-awareness and discussion purposes. It is not professional counseling.',
          'Bu rapor öz farkındalık ve tartışma amaçlıdır. Profesyonel danışmanlık değildir.'
        )}
      </p>
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const pdfWidth = 210;
    const pdfHeight = 297;
    const contentWidth = pdfWidth;
    const contentHeight = (imgHeight * contentWidth) / imgWidth;

    const doc = new jsPDF('p', 'mm', 'a4');

    if (contentHeight <= pdfHeight) {
      doc.addImage(imgData, 'PNG', 0, 0, contentWidth, contentHeight);
    } else {
      const pageCanvasHeight = (pdfHeight * imgWidth) / contentWidth;
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = imgWidth;
        pageCanvas.height = sliceHeight;
        const pageCtx = pageCanvas.getContext('2d')!;
        pageCtx.drawImage(
          canvas,
          0, sourceY, imgWidth, sliceHeight,
          0, 0, imgWidth, sliceHeight,
        );

        const pageImgData = pageCanvas.toDataURL('image/png');
        const sliceDisplayHeight = (sliceHeight * contentWidth) / imgWidth;

        if (sourceY > 0) doc.addPage();
        doc.addImage(pageImgData, 'PNG', 0, 0, contentWidth, sliceDisplayHeight);

        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
      }
    }

    doc.save(`hayirlisi-comparison-${nameA}-${nameB}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
