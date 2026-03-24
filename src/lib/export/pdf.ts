'use client';

import { ProfileResult } from '@/lib/types/results';
import { ComparisonResult, DealBreakerCollision } from '@/lib/types/compare';
import { categoryDefinitions } from '@/lib/quiz/categories';

type Locale = 'en' | 'tr';

/**
 * Generate deal-breaker collision HTML section for PDF exports.
 */
function renderDealBreakerCollisions(
  collisions: DealBreakerCollision[],
  locale: Locale,
): string {
  if (collisions.length === 0) return '';

  const t = (en: string, tr: string) => (locale === 'en' ? en : tr);
  const criticalCount = collisions.filter((c) => c.severity === 'critical').length;
  const seriousCount = collisions.filter((c) => c.severity === 'serious').length;

  let subtitle = '';
  if (criticalCount > 0 && seriousCount > 0) {
    subtitle = t(
      `${criticalCount} critical, ${seriousCount} serious`,
      `${criticalCount} kritik, ${seriousCount} ciddi`,
    );
  } else if (criticalCount > 0) {
    subtitle = t(`${criticalCount} critical`, `${criticalCount} kritik`);
  } else if (seriousCount > 0) {
    subtitle = t(`${seriousCount} serious`, `${seriousCount} ciddi`);
  }

  return `
    <div style="margin-bottom: 28px; padding: 16px; background: #fef2f2; border-radius: 10px; border: 2px solid #fca5a5;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <span style="font-size: 20px;">⚠</span>
        <h2 style="margin: 0; font-size: 18px; color: #dc2626; font-weight: bold;">
          ${t('DEAL-BREAKER CONFLICTS DETECTED', 'VAZGEÇİLMEZ ÇATIŞMALAR TESPİT EDİLDİ')}
        </h2>
      </div>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #dc2626;">
        ${t(
          `${collisions.length} fundamental conflict${collisions.length > 1 ? 's' : ''} found (${subtitle})`,
          `${collisions.length} temel çatışma bulundu (${subtitle})`,
        )}
      </p>
      ${collisions
        .map(
          (c) => `
        <div style="margin-bottom: 8px; padding: 8px 12px; background: white; border-radius: 6px; border-left: 4px solid ${c.severity === 'critical' ? '#dc2626' : '#ea580c'};">
          <span style="font-size: 10px; font-weight: bold; color: ${c.severity === 'critical' ? '#dc2626' : '#ea580c'}; text-transform: uppercase; letter-spacing: 0.5px;">
            ${c.severity === 'critical' ? t('CRITICAL', 'KRİTİK') : t('SERIOUS', 'CİDDİ')}
          </span>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #5a5046;">
            ${locale === 'en' ? c.descriptionEn : c.descriptionTr}
          </p>
        </div>
      `,
        )
        .join('')}
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #b91c1c; font-style: italic;">
        ${t(
          'These are areas where research shows compromise is rarely sustainable long-term.',
          'Bunlar, araştırmaların uzlaşmanın nadiren uzun vadeli sürdürülebilir olduğunu gösterdiği alanlardır.',
        )}
      </p>
    </div>
  `;
}

/**
 * Generate and download a PDF report of the profile results.
 */
export async function generatePDF(
  profile: ProfileResult,
  locale: Locale = 'en',
  comparison?: ComparisonResult,
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const t = (en: string, tr: string) => (locale === 'en' ? en : tr);

  const container = document.createElement('div');
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 794px;
    background: #ffffff;
    font-family: system-ui, -apple-system, sans-serif;
    color: #1c4f48;
    padding: 48px;
    box-sizing: border-box;
  `;

  const dealBreakers = profile.dimensions.filter((d) => d.dealBreaker);

  // Build comparison section if present
  let comparisonSection = '';
  if (comparison) {
    const collisionSection = renderDealBreakerCollisions(
      comparison.dealBreakerCollisions,
      locale,
    );

    const framingLabel = locale === 'en' ? comparison.framing.labelEn : comparison.framing.labelTr;
    const framingDesc = locale === 'en' ? comparison.framing.descriptionEn : comparison.framing.descriptionTr;

    const scoreColor =
      comparison.overallAlignment >= 70
        ? '#059669'
        : comparison.overallAlignment >= 50
        ? '#d97706'
        : comparison.overallAlignment >= 30
        ? '#ea580c'
        : '#dc2626';

    comparisonSection = `
      <div style="margin-bottom: 32px; padding-top: 24px; border-top: 3px solid #2d9a89;">
        <h2 style="margin: 0 0 16px 0; font-size: 22px; color: #2d9a89;">
          ${t('Compatibility Comparison', 'Uyumluluk Karşılaştırması')}
        </h2>

        ${collisionSection}

        <div style="text-align: center; margin-bottom: 20px; padding: 16px; background: #f8f7f4; border-radius: 10px;">
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #857563; text-transform: uppercase; letter-spacing: 1px;">
            ${t('Overall Alignment', 'Genel Uyum')}
          </p>
          <p style="margin: 0 0 4px 0; font-size: 36px; font-weight: bold; color: ${scoreColor};">
            ${comparison.overallAlignment}%
          </p>
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: ${scoreColor};">
            ${framingLabel}
          </p>
          ${comparison.scoreCeiling < 100
            ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #dc2626; font-style: italic;">
                ${t(
                  `Score capped at ${comparison.scoreCeiling}% due to deal-breaker conflicts.`,
                  `Puan, vazgeçilmez çatışmalar nedeniyle %${comparison.scoreCeiling} ile sınırlandırıldı.`,
                )}
              </p>`
            : ''}
        </div>

        <p style="margin: 0 0 20px 0; font-size: 13px; color: #5a5046; line-height: 1.5;">
          ${framingDesc}
        </p>

        ${comparison.dimensionAlignments
          .map((da) => {
            const catDef = categoryDefinitions[da.categoryId];
            const name = t(catDef?.nameEn ?? da.categoryId, catDef?.nameTr ?? da.categoryId);
            const barColor =
              da.alignmentScore >= 80
                ? '#059669'
                : da.alignmentScore >= 60
                ? '#d97706'
                : da.alignmentScore >= 40
                ? '#ea580c'
                : '#dc2626';
            const summary = locale === 'en' ? da.summaryEn : da.summaryTr;

            return `
              <div style="margin-bottom: 12px; padding: 10px 14px; background: ${da.hasDealBreakerCollision ? '#fef2f2' : '#f8f7f4'}; border-radius: 8px; border-left: 4px solid ${da.hasDealBreakerCollision ? '#dc2626' : barColor};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 13px; font-weight: bold; color: #1c4f48;">
                    ${name}
                    ${da.hasDealBreakerCollision ? '<span style="color: #dc2626; font-size: 11px;"> ⚠ CONFLICT</span>' : ''}
                    ${!da.hasDealBreakerCollision && (da.personADealBreaker || da.personBDealBreaker) ? '<span style="color: #ea580c; font-size: 11px;"> ⚠ Deal-breaker</span>' : ''}
                  </span>
                  <span style="font-size: 14px; font-weight: bold; color: ${barColor};">${da.alignmentScore}%</span>
                </div>
                <div style="font-size: 11px; color: #857563;">A: ${da.personAScore} | B: ${da.personBScore}</div>
                ${summary ? `<div style="font-size: 11px; color: #5a5046; margin-top: 4px;">${summary}</div>` : ''}
              </div>
            `;
          })
          .join('')}
      </div>
    `;
  }

  container.innerHTML = `
    <div style="border-bottom: 4px solid #2d9a89; padding-bottom: 24px; margin-bottom: 32px;">
      <h1 style="margin: 0 0 8px 0; font-size: 36px; color: #2d9a89;">Hayırlısı</h1>
      <p style="margin: 0 0 4px 0; font-size: 20px; color: #5a5046;">
        ${t('Marriage Compatibility Profile', 'Evlilik Uyumu Profili')}
      </p>
      <p style="margin: 0; font-size: 13px; color: #857563;">
        ${t(
          `Generated: ${new Date(profile.completedAt).toLocaleDateString('en-US')}`,
          `Oluşturulma: ${new Date(profile.completedAt).toLocaleDateString('tr-TR')}`
        )}
      </p>
    </div>

    ${comparisonSection}

    <div style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #2d9a89;">
        ${t('Your Profile Type', 'Profil Tipiniz')}
      </h2>
      <p style="margin: 0; font-size: 14px; color: #5a5046; line-height: 1.5;">
        ${t(profile.typeDescription.en, profile.typeDescription.tr)}
      </p>
    </div>

    <div style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #2d9a89;">
        ${t('Honesty Calibration', 'Dürüstlük Kalibrasyonu')}
      </h2>
      <p style="margin: 0 0 4px 0; font-size: 14px; color: #5a5046;">
        ${t('Score', 'Puan')}: ${profile.honestyCalibration.score}/100
      </p>
      <p style="margin: 0; font-size: 14px; color: #5a5046;">
        ${t('Consistency', 'Tutarlılık')}: ${profile.overallConsistency}/100
      </p>
    </div>

    <div style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #2d9a89;">
        ${t('Dimension Breakdown', 'Boyut Detayları')}
      </h2>
      ${profile.dimensions
        .map((dim) => {
          const catDef = categoryDefinitions[dim.categoryId];
          const name = t(catDef?.nameEn ?? dim.categoryId, catDef?.nameTr ?? dim.categoryId);
          const labels = t(
            'Position|Importance|Flexibility|Consistency',
            'Pozisyon|Önem|Esneklik|Tutarlılık'
          ).split('|');
          return `
            <div style="margin-bottom: 16px; padding: 12px 16px; background: #f8f7f4; border-radius: 8px; border-left: 4px solid ${catDef?.color || '#2d9a89'};">
              <div style="font-size: 15px; font-weight: bold; color: ${catDef?.color || '#2d9a89'}; margin-bottom: 6px;">
                ${name}${dim.dealBreaker ? ' <span style="color: #dc4020; font-size: 13px;">⚠ ' + t('Deal-Breaker', 'Kırmızı Çizgi') + '</span>' : ''}
              </div>
              <div style="font-size: 12px; color: #5a5046;">
                ${labels[0]}: ${dim.selfScore} &nbsp;|&nbsp; ${labels[1]}: ${dim.importanceScore} &nbsp;|&nbsp; ${labels[2]}: ${dim.flexibilityScore} &nbsp;|&nbsp; ${labels[3]}: ${dim.consistencyScore}
              </div>
            </div>
          `;
        })
        .join('')}
    </div>

    <div style="margin-bottom: 28px;">
      <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #dc4020;">
        ${t('Deal-Breakers', 'Kırmızı Çizgiler')}
      </h2>
      ${
        dealBreakers.length > 0
          ? dealBreakers
              .map((dim) => {
                const catDef = categoryDefinitions[dim.categoryId];
                const name = t(catDef?.nameEn ?? dim.categoryId, catDef?.nameTr ?? dim.categoryId);
                return `
                  <div style="margin-bottom: 10px; padding: 10px 14px; background: #fef2f2; border-radius: 6px; border-left: 4px solid #dc4020;">
                    <div style="font-size: 14px; font-weight: bold; color: #dc4020; margin-bottom: 2px;">⚠ ${name}</div>
                    <div style="font-size: 12px; color: #5a5046;">
                      ${t('This is non-negotiable for you.', 'Bu sizin için vazgeçilmezdir.')}
                    </div>
                  </div>
                `;
              })
              .join('')
          : `<p style="margin: 0; font-size: 14px; color: #5a5046; line-height: 1.5;">
               ${t(
                 'No absolute deal-breakers selected. Your profile shows high flexibility.',
                 'Kesin kırmızı çizgi seçilmedi. Profiliniz yüksek esneklik gösteriyor.'
               )}
             </p>`
      }
    </div>

    <div style="margin-top: 40px; padding-top: 16px; border-top: 1px solid #e8e4db;">
      <p style="margin: 0; font-size: 11px; color: #b0a08a;">
        ${t(
          'Generated by Hayırlısı — Open Source Marriage Compatibility Tool',
          'Hayırlısı tarafından oluşturuldu — Açık Kaynak Evlilik Uyumu Aracı'
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
          0, 0, imgWidth, sliceHeight
        );

        const pageImgData = pageCanvas.toDataURL('image/png');
        const sliceDisplayHeight = (sliceHeight * contentWidth) / imgWidth;

        if (sourceY > 0) doc.addPage();
        doc.addImage(pageImgData, 'PNG', 0, 0, contentWidth, sliceDisplayHeight);

        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
      }
    }

    doc.save(`hayirlisi-profile-${profile.id}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}
