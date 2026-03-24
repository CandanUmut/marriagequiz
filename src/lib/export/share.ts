import LZString from 'lz-string';
import { ProfileResult } from '@/lib/types/results';
import { ShareableCode } from '@/lib/types/compare';
import { QuizAnswer } from '@/lib/types/quiz';

const CURRENT_VERSION = 2;

interface MinimalAnswer {
  q: string;   // question id
  v: number;   // value
  db?: 1;      // deal-breaker flag
}

/**
 * Encode a profile result into a shareable compressed string.
 * V2 includes per-question values and deal-breaker flags for accurate comparison.
 */
export function encodeProfile(
  profile: ProfileResult,
  answers?: Record<string, QuizAnswer>,
): string {
  const minimalAnswers: MinimalAnswer[] = [];
  if (answers) {
    for (const [qId, ans] of Object.entries(answers)) {
      const val = typeof ans.value === 'number' ? ans.value : 0;
      const entry: MinimalAnswer = { q: qId, v: val };
      if (ans.dealBreaker) entry.db = 1;
      minimalAnswers.push(entry);
    }
  }

  const minimalData = {
    v: CURRENT_VERSION,
    id: profile.id,
    d: profile.dimensions.map((dim) => ({
      c: dim.categoryId,
      s: dim.selfScore,
      i: dim.importanceScore,
      f: dim.flexibilityScore,
      db: dim.dealBreaker ? 1 : 0,
      cs: dim.consistencyScore,
    })),
    oc: profile.overallConsistency,
    hc: profile.honestyCalibration.score,
    sc: profile.selectedCategories,
    ca: profile.completedAt,
    ...(minimalAnswers.length > 0 ? { a: minimalAnswers } : {}),
  };

  const json = JSON.stringify(minimalData);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

/**
 * Decode a shareable code back into a ProfileResult and optionally answers.
 */
export function decodeProfile(code: string): { profile: ProfileResult; answers: Record<string, QuizAnswer> } | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(code);
    if (!json) return null;

    const data = JSON.parse(json);
    if (!data.d) return null;

    const profile: ProfileResult = {
      id: data.id || 'imported',
      version: data.v || 1,
      dimensions: data.d.map((d: { c: string; s: number; i: number; f: number; db: number; cs: number }) => ({
        categoryId: d.c,
        selfScore: d.s,
        importanceScore: d.i,
        flexibilityScore: d.f,
        dealBreaker: d.db === 1,
        consistencyScore: d.cs,
      })),
      overallConsistency: data.oc || 0,
      honestyCalibration: { score: data.hc || 0, flags: [], socialDesirabilityBias: 0, extremeRatio: 0, midpointRatio: 0 },
      typeDescription: { en: '', tr: '' },
      completedAt: data.ca || new Date().toISOString(),
      selectedCategories: data.sc || [],
    };

    // Reconstruct answers if present (v2+)
    const answers: Record<string, QuizAnswer> = {};
    if (data.a && Array.isArray(data.a)) {
      for (const entry of data.a as MinimalAnswer[]) {
        answers[entry.q] = {
          questionId: entry.q,
          value: entry.v,
          dealBreaker: entry.db === 1,
          timestamp: 0,
        };
      }
    }

    return { profile, answers };
  } catch {
    return null;
  }
}

/**
 * Legacy decode that returns just the profile (for backwards compatibility).
 */
export function decodeProfileLegacy(code: string): ProfileResult | null {
  const result = decodeProfile(code);
  return result?.profile ?? null;
}

/**
 * Generate a shareable URL with the profile data encoded as a query parameter.
 */
export function generateShareURL(
  profile: ProfileResult,
  answers?: Record<string, QuizAnswer>,
  basePath: string = '',
): string {
  const code = encodeProfile(profile, answers);
  return `${basePath}/results?data=${code}`;
}

/**
 * Create a ShareableCode object.
 */
export function createShareableCode(
  profile: ProfileResult,
  answers?: Record<string, QuizAnswer>,
): ShareableCode {
  return {
    version: CURRENT_VERSION,
    data: encodeProfile(profile, answers),
  };
}
