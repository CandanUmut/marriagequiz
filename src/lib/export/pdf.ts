'use client';

import { ProfileResult } from '@/lib/types/results';
import { categoryDefinitions } from '@/lib/quiz/categories';

type Locale = 'en' | 'tr';

/**
 * Generate and download a PDF report of the profile results.
 * Uses html2canvas to render HTML content as an image-based PDF,
 * which preserves all browser font rendering including Turkish characters.
 */
export async function generatePDF(
  profile: ProfileResult,
  locale: Locale = 'en'
): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const { default: jsPDF } = await import('jspdf');

  const t = (en: string, tr: string) => (locale === 'en' ? en : tr);

  // Build the HTML content in a hidden container
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

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;

    const contentWidth = pdfWidth;
    const contentHeight = (imgHeight * contentWidth) / imgWidth;

    const doc = new jsPDF('p', 'mm', 'a4');

    // If content fits on one page
    if (contentHeight <= pdfHeight) {
      doc.addImage(imgData, 'PNG', 0, 0, contentWidth, contentHeight);
    } else {
      // Split across multiple pages
      const pageCanvasHeight = (pdfHeight * imgWidth) / contentWidth;
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const sliceHeight = Math.min(pageCanvasHeight, remainingHeight);

        // Create a slice canvas for this page
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
