// Rote Liste und Gesamtartenliste der Farn- und Blütenpflanzen Deutschlands (Metzing et al. 2018).
// Lizenz CC BY-ND 4.0: Werte werden unverändert angezeigt, die Quelle steht in der App (Quellen).
import RAW from '../data/rote-liste-2018.json';
import type { Bestand, RedListCat } from './types';

export const REDLIST_CITATION =
  'Metzing et al. (2018): Rote Liste und Gesamtartenliste der Farn- und Blütenpflanzen (Trachaeophyta) Deutschlands. – In: Metzing, D.; Hofbauer, N.; Ludwig, G. & Matzke-Hajek, G. (Red.): Rote Liste gefährdeter Tiere, Pflanzen und Pilze Deutschlands. Band 7: Pflanzen. – Münster (Landwirtschaftsverlag). – Naturschutz und Biologische Vielfalt 70 (7): 13-358.';
export const REDLIST_URL = 'https://www.rote-liste-zentrum.de/die-roten-listen/download-pflanzen/';
export const REDLIST_LICENSE = 'CC BY-ND 4.0';
export const REDLIST_LICENSE_URL = 'https://creativecommons.org/licenses/by-nd/4.0/deed.de';

export interface RedListEntry {
  /** scientific name without author, e.g. "Drosera rotundifolia", "Utricularia vulgaris agg." */
  name: string;
  de: string;
  rl: RedListCat;
  bestand: Bestand;
  endemic: boolean;
}

const RL_CODES = new Set(['0', '1', '2', '3', 'G', 'R', 'V', 'D', '*', 'nb']);
const B_CODES = new Set(['ex', 'es', 'ss', 's', 'mh', 'h', 'sh', 'nb', '?']);

export const REDLIST: RedListEntry[] = (RAW as { n: string; d: string; k: string; b: string; e?: number }[]).map((r) => ({
  name: r.n,
  de: r.d,
  rl: (RL_CODES.has(r.k) ? r.k : '?') as RedListCat,
  bestand: (B_CODES.has(r.b) ? r.b : '?') as Bestand,
  endemic: r.e === 1,
}));

const key = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

const exact = new Map<string, RedListEntry>();
const binomial = new Map<string, RedListEntry>();
for (const e of REDLIST) {
  exact.set(key(e.name), e);
  const isAgg = e.name.endsWith(' agg.');
  const t = key(e.name).replace(/ agg\.$/, '').split(' ');
  const bin = t.slice(0, 2).join(' ');
  // the species itself wins over its aggregate ("Artengruppe")
  if (!isAgg || !binomial.has(bin)) binomial.set(bin, e);
}

/** Scientific name without author, same rule as tools/import_rote_liste.py. */
export function plainName(full: string): string {
  const t = full.trim().split(/\s+/);
  const out = [t[0]];
  let i = 1;
  if (t[i] === '×') out.push(t[i++]);
  if (t[i] && ['sect.', 'subsect.', 'ser.', 'subgen.'].includes(t[i])) { out.push(t[i], t[i + 1] ?? ''); i += 2; }
  else if (t[i]) out.push(t[i++]);
  if (t[i] === 'agg.') out.push(t[i++]);
  if (t[i + 1] && ['subsp.', 'var.', 'f.'].includes(t[i])) out.push(t[i], t[i + 1]);
  return out.join(' ').trim();
}

/** Entry for a scientific name (authors are tolerated), or null. */
export function lookupRedList(sci: string): RedListEntry | null {
  if (!sci.trim()) return null;
  const plain = key(plainName(sci));
  const direct = exact.get(plain);
  if (direct) return direct;
  const t = plain.replace(/ agg\.$/, '').split(' ');
  return binomial.get(t.slice(0, 2).join(' ')) ?? null;
}

/** Search by German or scientific name for the species picker. */
export function searchRedList(q: string, limit = 30): RedListEntry[] {
  const n = q.trim().toLowerCase();
  if (n.length < 2) return [];
  const starts: RedListEntry[] = [];
  const contains: RedListEntry[] = [];
  for (const e of REDLIST) {
    const de = e.de.toLowerCase();
    const sci = e.name.toLowerCase();
    if (de.startsWith(n) || sci.startsWith(n) || de.split(/[\s-]/).some((w) => w.startsWith(n))) starts.push(e);
    else if (de.includes(n) || sci.includes(n)) contains.push(e);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
