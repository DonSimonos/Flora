import { SPECIES } from '../data/species';
import type { GameState, Species } from './types';

/** Normalise a scientific name to "genus species" for matching. */
export function normSci(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[×x]\s+/g, '')
    .replace(/[^a-z\s.-]/g, ' ')
    .trim()
    .split(/\s+/);
  if (cleaned[1] === 'sect.' || cleaned[1] === 'subsp.' || cleaned[1] === 'agg.') return cleaned[0];
  return cleaned.slice(0, 2).join(' ');
}

const bySci = new Map<string, Species>();
for (const s of SPECIES) {
  bySci.set(normSci(s.sci), s);
  for (const syn of s.synonyms ?? []) bySci.set(normSci(syn), s);
}

/** Built-in species matching a scientific name, if any. */
export function matchSpecies(sci: string): Species | null {
  const n = normSci(sci);
  const direct = bySci.get(n);
  if (direct) return direct;
  // Taraxacum is identified as many micro-species; the section entry covers the genus.
  const genus = n.split(' ')[0];
  const genusEntry = bySci.get(genus);
  return genusEntry ?? null;
}

export function allSpecies(state: GameState): Species[] {
  return [...SPECIES, ...state.extraSpecies];
}

export function speciesById(state: GameState, id: string): Species {
  const s = SPECIES.find((x) => x.id === id) ?? state.extraSpecies.find((x) => x.id === id);
  if (!s) throw new Error(`Unbekannte Art ${id}`);
  return s;
}

export function findSpecies(state: GameState, id: string): Species | undefined {
  return SPECIES.find((x) => x.id === id) ?? state.extraSpecies.find((x) => x.id === id);
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * A species identified outside the built-in list. It still counts for the collection.
 * Without official data its rarity is derived as "Gewöhnlich" until the Rote-Liste data arrive.
 */
export function makeDynamicSpecies(sci: string, de: string | null, family: string | null): Species {
  const base = SPECIES.find((s) => s.id === 'spitzwegerich')!; // neutral template
  return {
    ...base,
    id: 'x_' + slug(normSci(sci)),
    sci: normSci(sci).replace(/^./, (c) => c.toUpperCase()),
    de: de ?? sci,
    family: family ?? 'unbekannt',
    habitats: [],
    rl: '?',
    bestand: '?',
    description: 'Diese Art steht noch nicht in der FLORA-Artenliste. Gefährdung und Seltenheit werden ergänzt, sobald die offiziellen Daten eingebunden sind.',
    color: '#9fb39a',
    art: undefined,
    synonyms: undefined,
    dynamic: true,
  };
}
