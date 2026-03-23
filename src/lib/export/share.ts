import LZString from 'lz-string';
import { ProfileResult } from '@/lib/types/results';
import { ShareableCode } from '@/lib/types/compare';

const CURRENT_VERSION = 1;

/**
 * Encode a profile result into a shareable compressed string.
 * Only includes scores, not raw answers — privacy by design.
 */
export function encodeProfile(profile: ProfileResult): string {
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
  };

  const json = JSON.stringify(minimalData);
  const compressed = LZString.compressToEncodedURIComponent(json);
  return compressed;
}

/**
 * Decode a shareable code back into a ProfileResult.
 */
export function decodeProfile(code: string): ProfileResult | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(code);
    if (!json) return null;

    const data = JSON.parse(json);
    if (!data.v || !data.d) return null;

    return {
      id: data.id || 'imported',
      version: data.v,
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
  } catch {
    return null;
  }
}

/**
 * Generate a shareable URL with the profile data encoded as a query parameter.
 */
export function generateShareURL(profile: ProfileResult, basePath: string = ''): string {
  const code = encodeProfile(profile);
  return `${basePath}/results?data=${code}`;
}

/**
 * Create a ShareableCode object.
 */
export function createShareableCode(profile: ProfileResult): ShareableCode {
  return {
    version: CURRENT_VERSION,
    data: encodeProfile(profile),
  };
}
