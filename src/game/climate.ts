import { CLIMATE } from './config';
import { rngFor, weighted } from './rng';
import type { ConditionId, RoomId } from './types';

export type Weather = keyof typeof CLIMATE.weatherWeights;

export interface Climate {
  night: boolean;
  weather: Weather;
  /** Start of the current weather block (ms). */
  blockStart: number;
  /** When the weather changes next (ms). */
  nextChange: number;
}

export const WEATHER_INFO: Record<Weather, { name: string; icon: string; hint: string }> = {
  sonne: { name: 'Sonne', icon: '☀️', hint: 'Mehr Licht: Energie lädt schneller.' },
  bewoelkt: { name: 'Bewölkt', icon: '⛅', hint: 'Ruhiges Wetter.' },
  regen: { name: 'Regen', icon: '🌧️', hint: 'Die Beregnung läuft: Wasser sinkt nicht.' },
  nebel: { name: 'Nebel', icon: '🌫️', hint: 'Feucht und trüb: Krankheiten etwas häufiger.' },
  frost: { name: 'Frost', icon: '❄️', hint: 'Kälte belastet Pflanzen ohne Frostschutz.' },
};

const BLOCK_MS = CLIMATE.weatherBlockHours * 3600_000;

/** Greenhouse climate at a given time. Same time => same weather on every device. */
export function climateAt(t: number): Climate {
  const d = new Date(t);
  const hour = d.getHours();
  const night = hour >= CLIMATE.nightFrom || hour < CLIMATE.nightTo;
  const blockStart = Math.floor(t / BLOCK_MS) * BLOCK_MS;
  const month = d.getMonth(); // 0 = Januar
  const winter = month <= 1 || month >= 10;
  const summer = month >= 5 && month <= 7;
  const w = { ...CLIMATE.weatherWeights };
  if (winter) { w.frost *= 4; w.sonne *= 0.6; }
  if (summer) { w.frost = 0; w.sonne *= 1.5; }
  const weather = weighted(rngFor('wetter', blockStart), w);
  return { night, weather, blockStart, nextChange: blockStart + BLOCK_MS };
}

/** Display name/icon; a sunny block at night is shown as a clear night. */
export function weatherView(c: Climate): { name: string; icon: string; hint: string } {
  if (c.night && c.weather === 'sonne') return { name: 'Sternenklar', icon: '✨', hint: 'Klare Nacht: ideal für Nachttraining.' };
  return WEATHER_INFO[c.weather];
}

/** Conditions active for a plant right now (used for evolution and abilities). */
export function activeConditions(c: Climate, room: RoomId): ConditionId[] {
  const out: ConditionId[] = [];
  if (c.night) out.push('nacht');
  if (c.weather === 'regen') out.push('regen');
  if (c.weather === 'sonne' && !c.night) out.push('sonne');
  if (c.weather === 'nebel') out.push('nebel');
  if (c.weather === 'frost') out.push('frost');
  if (room === 'alpen') out.push('hoehe');
  return out;
}
