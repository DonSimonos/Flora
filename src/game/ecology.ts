// Bedürfnisse einer Art im Gewächshaus, berechnet aus den Zeigerwerten (EIVE, Skala 0–10).
// Lage = was die Art bevorzugt, Nischenbreite = wie tolerant sie ist (breit = verzeiht mehr).
import { BALANCE as B } from './config';
import type { Eco, Level3 } from './types';

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function band(center: number, width: number, cfg: { minHalf: number; maxHalf: number; perWidth: number }): [number, number] {
  const half = clamp(cfg.minHalf + width * cfg.perWidth, cfg.minHalf, cfg.maxHalf);
  return [Math.round(clamp(center - half, 0, 100)), Math.round(clamp(center + half, 0, 100))];
}

/** Optimal water range (0–100) from moisture M. */
export function waterBand(e: Eco): [number, number] {
  return band(B.eco.waterBase + e.M * B.eco.waterPerM, e.Mb, B.eco.band);
}

/** Optimal nutrient range (0–100) from nitrogen N. */
export function nutrientBand(e: Eco): [number, number] {
  return band(B.eco.nutrientBase + e.N * B.eco.nutrientPerN, e.Nb, B.eco.band);
}

/** Optimal soil reaction range (0 = sehr sauer … 10 = stark kalkhaltig) from R. */
export function reactionBand(e: Eco): [number, number] {
  const half = clamp(B.eco.reaction.minHalf + e.Rb * B.eco.reaction.perWidth, B.eco.reaction.minHalf, B.eco.reaction.maxHalf);
  return [Math.round(clamp(e.R - half, 0, 10) * 10) / 10, Math.round(clamp(e.R + half, 0, 10) * 10) / 10];
}

/** Light value of the three lamp settings on the EIVE scale. */
export const LAMP_VALUE: Record<Level3, number> = { 1: 2.5, 2: 5.5, 3: 8.5 };

export function bestLamp(e: Eco): Level3 {
  return ([1, 2, 3] as Level3[]).reduce((a, b) => (Math.abs(LAMP_VALUE[b] - e.L) < Math.abs(LAMP_VALUE[a] - e.L) ? b : a));
}

/** Wellbeing penalty for a lamp setting (0 = fine). Positive diff = too bright. */
export function lightPenalty(e: Eco, lamp: Level3): { penalty: number; diff: number } {
  const tol = clamp(B.eco.light.minTol + e.Lb * B.eco.light.perWidth, B.eco.light.minTol, B.eco.light.maxTol);
  const diff = LAMP_VALUE[lamp] - e.L;
  return { penalty: Math.max(0, Math.abs(diff) - tol) * B.eco.light.perPoint, diff };
}

/** Temperature: the room has a temperature (Alpen cool, others mild); frost hurts warmth-loving species. */
export function temperatureIssues(e: Eco, roomT: number, frost: boolean, frostProof: boolean): { penalty: number; issues: string[] } {
  const t = B.eco.temperature;
  let penalty = 0;
  const issues: string[] = [];
  if (frost && !frostProof) {
    const p = Math.max(0, e.T - t.frostSafeBelow) * t.frostPerPoint;
    if (p > 0) { penalty += p; issues.push('Frost'); }
  }
  const diff = e.T - roomT;
  if (Math.abs(diff) > t.tolerance) {
    penalty += (Math.abs(diff) - t.tolerance) * t.perPoint;
    issues.push(diff < 0 ? 'Zu warm hier' : 'Zu kalt hier');
  }
  return { penalty, issues };
}

// ---------- Wörter für die Oberfläche ----------

export function moistureWord(m: number): string {
  return m < 2 ? 'sehr trocken' : m < 4 ? 'trocken' : m < 6 ? 'frisch' : m < 8 ? 'feucht' : 'nass';
}
export function nutrientWord(n: number): string {
  return n < 2 ? 'sehr nährstoffarm' : n < 4 ? 'nährstoffarm' : n < 6 ? 'mäßig nährstoffreich' : n < 8 ? 'nährstoffreich' : 'sehr nährstoffreich';
}
export function reactionWord(r: number): string {
  return r < 2.5 ? 'sehr sauer' : r < 4.5 ? 'sauer' : r < 6.5 ? 'neutral' : r < 8 ? 'kalkhaltig' : 'stark kalkhaltig';
}
export function lightWord(l: number): string {
  return l < 4 ? 'Schatten' : l < 7 ? 'Halbschatten' : 'Sonne';
}
export function temperatureWord(t: number): string {
  return t < 2.5 ? 'kühl (Gebirge)' : t < 4.5 ? 'gemäßigt' : t < 6.5 ? 'warm' : 'sehr warm';
}

/** One-line summary, e.g. "nass · sehr sauer · nährstoffarm · Sonne · gemäßigt". */
export function needsText(e: Eco): string {
  return [moistureWord(e.M), reactionWord(e.R), nutrientWord(e.N), lightWord(e.L), temperatureWord(e.T)].join(' · ');
}

/** Rough estimate from the old three-step needs, for species without indicator values. */
export function ecoFromLevels(water: Level3, light: Level3, nutrients: Level3): Eco {
  const w = { 1: 2.5, 2: 4.5, 3: 7.5 }[water];
  const l = { 1: 3.5, 2: 6, 3: 8 }[light];
  const n = { 1: 2, 2: 4.5, 3: 7 }[nutrients];
  return { M: w, N: n, R: 5, L: l, T: 4.5, Mb: 3, Nb: 3, Rb: 4, Lb: 3, Tb: 3 };
}
