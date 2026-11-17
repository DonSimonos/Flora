// Robustes Speichern: Spielstand als JSON in localStorage, mit Version, Prüfung und Sicherungskopie.
// Fotos liegen getrennt in IndexedDB (siehe photos.ts), weil localStorage dafür zu klein ist.
import { BALANCE, SAVE_VERSION } from '../game/config';
import { makeDynamicSpecies } from '../game/catalog';
import { newGame } from '../game/game';
import type { GameState, GreenPlant } from '../game/types';

export const SAVE_KEY = 'flora-save';
export const BACKUP_KEY = 'flora-save-backup';

interface SaveFile {
  version: number;
  savedAt: string;
  state: GameState;
}

export function serialize(state: GameState, now = new Date()): string {
  const file: SaveFile = { version: SAVE_VERSION, savedAt: now.toISOString(), state };
  return JSON.stringify(file);
}

/** Upgrades older save files. Add a case for every new SAVE_VERSION. */
function migrate(file: SaveFile): SaveFile {
  let f = file;
  if (f.version < 2) {
    // v2: indicator values (EIVE). Plants get a soil reaction, learned species are rebuilt with the new needs.
    const s = f.state;
    f = {
      ...f,
      version: 2,
      state: {
        ...s,
        plants: (s.plants ?? []).map((p) => ({ ...p, reaction: typeof p.reaction === 'number' ? p.reaction : BALANCE.eco.reaction.neutral })),
        extraSpecies: (s.extraSpecies ?? []).map((x) => ({ ...makeDynamicSpecies(x.sci === 'wissenschaftlicher Name unbekannt' ? '' : x.sci, x.de, x.family), id: x.id })),
      },
    };
  }
  if (f.version < 3) {
    // v3: Lebensraum-Räume. The old Tieflandbeet/Höhenkammer become the Anzuchthaus.
    f = {
      ...f,
      version: 3,
      state: { ...f.state, plants: f.state.plants.map(({ zone: _z, ...p }: GreenPlant & { zone?: string }) => ({ ...p, room: p.room ?? 'anzucht' })) },
    };
  }
  return f;
}

function isValid(s: unknown): s is GameState {
  if (!s || typeof s !== 'object') return false;
  const g = s as Record<string, unknown>;
  return (
    Array.isArray(g.finds) && Array.isArray(g.seeds) && Array.isArray(g.plants) &&
    Array.isArray(g.discovered) && Array.isArray(g.extraSpecies) && Array.isArray(g.revealQueue) &&
    typeof g.items === 'object' && g.items !== null && typeof g.findCount === 'object' && g.findCount !== null
  );
}

/** Parses a save string. Returns null if it is unreadable or from a newer app version. */
export function parse(raw: string | null): GameState | null {
  if (!raw) return null;
  try {
    const file = JSON.parse(raw) as SaveFile;
    if (typeof file.version !== 'number' || file.version > SAVE_VERSION) return null;
    const m = migrate(file);
    if (!isValid(m.state)) return null;
    // fill fields added later with defaults
    const fresh = newGame();
    return { ...fresh, ...m.state, items: { ...fresh.items, ...m.state.items }, stats: { ...fresh.stats, ...m.state.stats } };
  } catch {
    return null;
  }
}

export interface StorageLike {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
}

export type LoadSource = 'save' | 'backup' | 'new';

export function load(storage: StorageLike): { state: GameState; source: LoadSource } {
  const main = parse(safeGet(storage, SAVE_KEY));
  if (main) return { state: main, source: 'save' };
  const backup = parse(safeGet(storage, BACKUP_KEY));
  if (backup) return { state: backup, source: 'backup' };
  return { state: newGame(), source: 'new' };
}

/** Writes the save; the previous good save is kept as backup. */
export function store(storage: StorageLike, state: GameState): boolean {
  try {
    const prev = storage.getItem(SAVE_KEY);
    if (prev && parse(prev)) storage.setItem(BACKUP_KEY, prev);
    storage.setItem(SAVE_KEY, serialize(state));
    return true;
  } catch {
    return false; // quota or private mode – the game keeps running in memory
  }
}

function safeGet(storage: StorageLike, k: string): string | null {
  try {
    return storage.getItem(k);
  } catch {
    return null;
  }
}
