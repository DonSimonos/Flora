import { RARITIES } from './config';
import type { Bestand, RarityId, RedListCat, Species } from './types';

/**
 * Seltenheit aus Roter Liste Deutschland + Bestandssituation (abgestimmt 2026-11-15):
 * Mythisch = RL 1 und 0 · Legendär = RL 2 und R · Episch = RL 3 und G · Selten = V
 * Ungefährdet (*), D und ohne Daten: nach Bestand – sh/h gewöhnlich, mh/s ungewöhnlich, ss/es selten.
 */
export function rarityFrom(rl: RedListCat, bestand: Bestand): RarityId {
  switch (rl) {
    case '0':
    case '1':
      return 'mythisch';
    case '2':
    case 'R':
      return 'legendaer';
    case '3':
    case 'G':
      return 'episch';
    case 'V':
      return 'selten';
    default:
      if (bestand === 'ss' || bestand === 'es' || bestand === 'ex') return 'selten';
      if (bestand === 'mh' || bestand === 's') return 'ungewoehnlich';
      return 'gewoehnlich';
  }
}

export function rarityOf(sp: Species): RarityId {
  return rarityFrom(sp.rl, sp.bestand);
}

export function rarityInfo(id: RarityId) {
  return RARITIES.find((r) => r.id === id)!;
}

export function rarityRank(id: RarityId): number {
  return RARITIES.findIndex((r) => r.id === id);
}

export const RL_TEXT: Record<RedListCat, string> = {
  '0': 'Ausgestorben oder verschollen',
  '1': 'Vom Aussterben bedroht',
  '2': 'Stark gefährdet',
  '3': 'Gefährdet',
  G: 'Gefährdung unbekannten Ausmaßes',
  R: 'Extrem selten',
  V: 'Vorwarnliste',
  D: 'Daten unzureichend',
  '*': 'Ungefährdet',
  nb: 'Nicht bewertet (z. B. eingebürgert)',
  '?': 'Noch keine Daten',
};

export const BESTAND_TEXT: Record<Bestand, string> = {
  ex: 'ausgestorben',
  es: 'extrem selten',
  ss: 'sehr selten',
  s: 'selten',
  mh: 'mäßig häufig',
  h: 'häufig',
  sh: 'sehr häufig',
  nb: 'nicht bewertet',
  '?': 'unbekannt',
};
