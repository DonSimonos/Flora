// Artendatenbank: verbindet für jede Art Deutschlands
//  - Rote Liste & Gesamtartenliste (Metzing et al. 2018, CC BY-ND 4.0) – src/data/rote-liste-2018.json
//  - Ökologische Zeigerwerte EIVE 1.0 (Dengler et al. 2023, CC BY 4.0) – src/data/eive-1.0.json
//  - Ellenberg-Zeigerwerte Deutschland (Ellenberg et al. 2001), wie in EIVE Supplement 2 (CC BY 4.0) veröffentlicht.
// Beide Dateien werden mit den Werkzeugen in tools/ aus den Originaldateien erzeugt und nicht von Hand geändert.
import EIVE_RAW from '../data/eive-1.0.json';
import { lookupRedList, type RedListEntry } from './redlist';
import type { Eco } from './types';

export const EIVE_CITATION =
  'Dengler, J., Jansen, F., Chusova, O. et al. (2023): Ecological Indicator Values for Europe (EIVE) 1.0. – Vegetation Classification and Survey 4: 7–29.';
export const EIVE_URL = 'https://doi.org/10.3897/VCS.98324';
export const EIVE_LICENSE = 'CC BY 4.0';
export const EIVE_LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/deed.de';
export const ELLENBERG_CITATION =
  'Ellenberg, H., Weber, H. E., Düll, R., Wirth, V. & Werner, W. (2001): Zeigerwerte von Pflanzen in Mitteleuropa. 3. Aufl. – Scripta Geobotanica 18. Übernommen aus EIVE 1.0, Supplementary material 2 (Dengler et al. 2023, CC BY 4.0).';

/** Ellenberg Deutschland: Feuchte (1–12), Nährstoffe, Reaktion, Licht, Temperatur (1–9); null = indifferent (x) oder ohne Angabe. */
export type Ellenberg = [number | null, number | null, number | null, number | null, number | null];

type Raw = Record<string, { e: (number | null)[]; g?: (number | string | null)[] }>;
const DATA = EIVE_RAW as Raw;

/** Typical mid values used where EIVE has no value for a dimension. */
const DEFAULT_POS = 5;
const DEFAULT_WIDTH = 3;

function toEco(e: (number | null)[]): Eco {
  const v = (i: number, d: number) => (typeof e[i] === 'number' ? (e[i] as number) : d);
  return {
    M: v(0, DEFAULT_POS), N: v(1, DEFAULT_POS), R: v(2, DEFAULT_POS), L: v(3, DEFAULT_POS), T: v(4, DEFAULT_POS),
    Mb: v(5, DEFAULT_WIDTH), Nb: v(6, DEFAULT_WIDTH), Rb: v(7, DEFAULT_WIDTH), Lb: v(8, DEFAULT_WIDTH), Tb: v(9, DEFAULT_WIDTH),
  };
}

export interface ArtEintrag {
  redList: RedListEntry;
  eco: Eco | null;
  ellenberg: Ellenberg | null;
}

/** Everything known about a species of Germany, looked up by scientific name. */
export function artInfo(sci: string): ArtEintrag | null {
  const rl = lookupRedList(sci);
  if (!rl) return null;
  const d = DATA[rl.name];
  const g = d?.g ? (d.g.map((x) => (typeof x === 'number' ? x : null)) as Ellenberg) : null;
  return { redList: rl, eco: d ? toEco(d.e) : null, ellenberg: g };
}

export const ARTEN_MIT_ZEIGERWERTEN = Object.keys(DATA).length;
