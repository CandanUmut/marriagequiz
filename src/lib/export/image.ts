'use client';

import { ProfileResult } from '@/lib/types/results';
import { categoryDefinitions } from '@/lib/quiz/categories';

type Locale = 'en' | 'tr';

/**
 * Generate a shareable image card from profile results.
 * Creates a canvas-based image suitable for social sharing (1080x1080).
 */
export async function generateShareImage(
  profile: ProfileResult,
  locale: Locale = 'en'
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d')!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
  gradient.addColorStop(0, '#f0faf8');
  gradient.addColorStop(1, '#f3f1ec');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1080, 1080);

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
    locale === 'en' ? 'Marriage Compatibility Profile' : 'Evlilik Uyumu Profili',
    60,
    120
  );

  // Profile type
  ctx.fillStyle = '#1c4f48';
  ctx.font = '20px system-ui, sans-serif';
  const typeText = locale === 'en' ? profile.typeDescription.en : profile.typeDescription.tr;
  wrapText(ctx, typeText, 60, 180, 960, 28);

  // Top dimensions (sorted by importance)
  const sorted = [...profile.dimensions].sort(
    (a, b) => b.importanceScore - a.importanceScore
  );
  const top6 = sorted.slice(0, 6);

  let y = 280;
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#2d9a89';
  ctx.fillText(
    locale === 'en' ? 'Top Priorities' : 'Öncelikler',
    60,
    y
  );
  y += 40;

  for (const dim of top6) {
    const catDef = categoryDefinitions[dim.categoryId];
    const name = locale === 'en' ? catDef?.nameEn : catDef?.nameTr;

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
    ctx.fillText(name || dim.categoryId, 76, y + 28);

    // Score
    ctx.fillStyle = '#5a5046';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`${dim.selfScore}`, 980, y + 28);

    y += 60;
  }

  // Honesty score
  y += 30;
  ctx.fillStyle = '#857563';
  ctx.font = '18px system-ui, sans-serif';
  ctx.fillText(
    `${locale === 'en' ? 'Honesty Score' : 'Dürüstlük Puanı'}: ${profile.honestyCalibration.score}/100`,
    60,
    y
  );

  // Footer
  ctx.fillStyle = '#b0a08a';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(
    locale === 'en'
      ? 'hayirlisi • open-source marriage compatibility tool'
      : 'hayırlısı • açık kaynak evlilik uyumu aracı',
    60,
    1040
  );

  // Deal breaker badge
  const dealBreakers = profile.dimensions.filter((d) => d.dealBreaker);
  if (dealBreakers.length > 0) {
    y += 30;
    ctx.fillStyle = '#dc4020';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(
      `${dealBreakers.length} ${locale === 'en' ? 'deal-breaker(s)' : 'kırmızı çizgi'}`,
      60,
      y
    );
  }

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
