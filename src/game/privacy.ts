// Schutz der Fundorte gefährdeter Arten, wenn Funde später für andere sichtbar werden.
// Empfehlung des Rote-Liste-Zentrums (Mail vom 16.11.2026): Arten der Kategorie 1 und extrem seltene
// Arten (Bestand „es“) nur verschleiert zeigen, z. B. als TK25-Rasterfeld. Kategorie 0 (Wiederfund!)
// behandeln wir genauso. Übrige Rote-Liste-Arten (2, 3, G, R): auf etwa 300 m vergröbert.
import type { Species } from './types';

export type Precision = 'genau' | 'ca300m' | 'tk25';

export function precisionFor(sp: Pick<Species, 'rl' | 'bestand'>): Precision {
  if (sp.rl === '1' || sp.rl === '0' || sp.bestand === 'es' || sp.bestand === 'ex') return 'tk25';
  if (sp.rl === '2' || sp.rl === '3' || sp.rl === 'G' || sp.rl === 'R') return 'ca300m';
  return 'genau';
}

/** TK25 sheet (Topographische Karte 1:25 000): 10' longitude × 6' latitude, numbered row/column from 55°54' N, 5°50' E. */
export interface Tk25 {
  number: string; // e.g. "3624"
  south: number;
  north: number;
  west: number;
  east: number;
}

const TK_NORTH = 55.9;
const TK_WEST = 5 + 50 / 60;
const TK_DLAT = 0.1;
const TK_DLON = 1 / 6;

export function tk25(lat: number, lng: number): Tk25 {
  const row = Math.floor((TK_NORTH - lat) / TK_DLAT) + 1;
  const col = Math.floor((lng - TK_WEST) / TK_DLON) + 1;
  const north = TK_NORTH - (row - 1) * TK_DLAT;
  const west = TK_WEST + (col - 1) * TK_DLON;
  return {
    number: `${String(row).padStart(2, '0')}${String(col).padStart(2, '0')}`,
    north,
    south: north - TK_DLAT,
    west,
    east: west + TK_DLON,
  };
}

const CELL_M = 420; // grid cell; its centre is at most ~300 m from any point inside

/** Snap to a ~420 m grid so the shown point is never more than ~300 m from the real one, and always the same for the same place. */
export function coarse300(lat: number, lng: number): { lat: number; lng: number } {
  const dLat = CELL_M / 111_320;
  const cLat = (Math.floor(lat / dLat) + 0.5) * dLat;
  const dLng = CELL_M / (111_320 * Math.cos((cLat * Math.PI) / 180));
  return { lat: cLat, lng: (Math.floor(lng / dLng) + 0.5) * dLng };
}

export interface PublicLocation {
  precision: Precision;
  lat: number;
  lng: number;
  /** radius in metres around lat/lng that contains the real place */
  radius: number;
  tk25?: string;
}

/** Location as other players may see it. The player always sees their own exact finds. */
export function publicLocation(lat: number, lng: number, sp: Pick<Species, 'rl' | 'bestand'>): PublicLocation {
  const p = precisionFor(sp);
  if (p === 'tk25') {
    const t = tk25(lat, lng);
    return { precision: p, lat: (t.north + t.south) / 2, lng: (t.west + t.east) / 2, radius: 7000, tk25: t.number };
  }
  if (p === 'ca300m') return { precision: p, ...coarse300(lat, lng), radius: 300 };
  return { precision: p, lat, lng, radius: 0 };
}

export function precisionText(p: PublicLocation): string {
  if (p.precision === 'tk25') return `Für andere nur als TK25-Feld ${p.tk25} sichtbar (ca. 11 × 11 km)`;
  if (p.precision === 'ca300m') return 'Für andere nur auf etwa 300 m genau sichtbar';
  return 'Für andere genau sichtbar';
}
