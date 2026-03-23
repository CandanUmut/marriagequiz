'use client';

import { ProfileResult } from '@/lib/types/results';
import { categoryDefinitions } from '@/lib/quiz/categories';

type Locale = 'en' | 'tr';

/**
 * Generate a shareable image card from profile results.
 * Creates a canvas-based image suitable for social sharing (1080x1080+).
 * Dynamically adjusts height to fit deal-breaker section without overlap.
 */
export async function generateShareImage(
  profile: ProfileResult,
  locale: Locale = 'en'
): Promise<Blob> {
  const t = (en: string, tr: string) => (locale === 'en' ? en : tr);

  const dealBreakers = profile.dimensions.filter((d) => d.dealBreaker);

  // Top dimensions (sorted by importance)
  const sorted = [...profile.dimensions].sort(
    (a, b) => b.importanceScore - a.importanceScore
  );
  const top6 = sorted.slice(0, 6);

  // Calculate dynamic canvas height based on content
  const headerHeight = 140;
  const typeTextHeight = 60;
  const prioritiesHeaderHeight = 50;
  const barsHeight = top6.length * 60;
  const honestyHeight = 50;
  const dealBreakerSectionHeight =
    dealBreakers.length > 0
      ? 50 + Math.min(dealBreakers.length, 3) * 32 + (dealBreakers.length > 3 ? 28 : 0)
      : 0;
  const footerHeight = 60;
  const padding = 80;

  const canvasHeight = Math.max(
    1080,
    headerHeight +
      typeTextHeight +
      prioritiesHeaderHeight +
      barsHeight +
      honestyHeight +
      dealBreakerSectionHeight +
      footerHeight +
      padding
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d')!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, canvasHeight);
  gradient.addColorStop(0, '#f0faf8');
  gradient.addColorStop(1, '#f3f1ec');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, canvasHeight);

  // Header accent bar
  ctx.fillStyle = '#2d9a89';
  ctx.fillRect(0, 0, 1080, 6);

  // Title
  ctx.fillStyle = '#2d9a89';
  ctx.font = 'bold 48px system-ui, sans-serif';
  ctx.fillText('Hayırlısı', 60, 80);

  ctx.fillStyle = '#857563';
  ctx.font = '24px system-ui, sans-serif';
  ctx.fillText(
    t('Marriage Compatibility Profile', 'Evlilik Uyumu Profili'),
    60,
    120
  );

  // Profile type
  ctx.fillStyle = '#1c4f48';
  ctx.font = '20px system-ui, sans-serif';
  const typeText = t(profile.typeDescription.en, profile.typeDescription.tr);
  wrapText(ctx, typeText, 60, 180, 960, 28);

  // Top dimensions
  let y = 280;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#2d9a89';
  ctx.fillText(t('Top Priorities', 'Öncelikler'), 60, y);
  y += 40;

  for (const dim of top6) {
    const catDef = categoryDefinitions[dim.categoryId];
    const name = t(catDef?.nameEn ?? dim.categoryId, catDef?.nameTr ?? dim.categoryId);

    // Dimension bar background
    ctx.fillStyle = '#e8e4db';
    ctx.beginPath();
    ctx.roundRect(60, y, 960, 44, 8);
    ctx.fill();

    // Score bar
    ctx.fillStyle = catDef?.color || '#2d9a89';
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.roundRect(60, y, (960 * dim.selfScore) / 100, 44, 8);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = '#1c4f48';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText(name, 76, y + 28);

    // Score
    ctx.fillStyle = '#5a5046';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`${dim.selfScore}`, 980, y + 28);

    y += 60;
  }

  // Honesty score
  y += 20;
  ctx.fillStyle = '#857563';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(
    `${t('Honesty Score', 'Dürüstlük Puanı')}: ${profile.honestyCalibration.score}/100`,
    60,
    y
  );
  y += 16;

  // Deal-breakers section
  if (dealBreakers.length > 0) {
    y += 24;

    // Section header
    ctx.fillStyle = '#dc4020';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(
      `⚠ ${dealBreakers.length} ${t('Deal-Breakers', 'Kırmızı Çizgi')}`,
      60,
      y
    );
    y += 32;

    // List top 3 deal-breaker category names
    const showCount = Math.min(dealBreakers.length, 3);
    for (let i = 0; i < showCount; i++) {
      const dim = dealBreakers[i];
      const catDef = categoryDefinitions[dim.categoryId];
      const name = t(catDef?.nameEn ?? dim.categoryId, catDef?.nameTr ?? dim.categoryId);

      ctx.fillStyle = '#dc4020';
      ctx.font = '18px system-ui, sans-serif';
      ctx.fillText(`• ${name}`, 76, y);
      y += 32;
    }

    // "and Y more..." if there are more than 3
    if (dealBreakers.length > 3) {
      const moreCount = dealBreakers.length - 3;
      ctx.fillStyle = '#857563';
      ctx.font = 'italic 16px system-ui, sans-serif';
      ctx.fillText(
        t(`and ${moreCount} more...`, `ve ${moreCount} tane daha...`),
        76,
        y
      );
      y += 28;
    }
  }

  // Footer — always at bottom of canvas
  const footerY = canvasHeight - 40;
  ctx.fillStyle = '#b0a08a';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(
    t(
      'hayirlisi • open-source marriage compatibility tool',
      'hayırlısı • açık kaynak evlilik uyumu aracı'
    ),
    60,
    footerY
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png');
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
