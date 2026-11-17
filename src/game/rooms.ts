// Regeln der Lebensraum-Räume: welche Art passt wohin, wann öffnet ein Raum, wie viele Beete hat er.
import { ROOMS, SALT_TAXA, roomInfo, type RoomId } from '../data/rooms';
import { allSpecies } from './catalog';
import { BALANCE as B } from './config';
import { LAMP_VALUE } from './ecology';
import type { GameState, Level3, Species } from './types';

export type { RoomId };

const startsWithAny = (sci: string, list: string[]) => {
  const s = sci.toLowerCase();
  return list.some((t) => s === t || s.startsWith(t + ' '));
};

/** The room whose conditions are closest to the species' indicator values. */
export function bestRoom(sp: Species): RoomId {
  const names = [sp.sci, ...(sp.synonyms ?? [])];
  for (const r of ROOMS) if (r.kennarten && names.some((n) => startsWithAny(n, r.kennarten!))) return r.id;
  if (names.some((n) => startsWithAny(n, SALT_TAXA)) || sp.habitats.includes('kueste')) return 'salz';
  const w = B.rooms.weights;
  let best: RoomId = 'wiese';
  let bestD = Infinity;
  for (const r of ROOMS) {
    if (r.id === 'anzucht' || r.id === 'salz' || r.kennarten) continue;
    const p = r.profile;
    const e = sp.eco;
    const d =
      w.M * ((e.M - p.M) / (1 + e.Mb / 4)) ** 2 +
      w.N * ((e.N - p.N) / (1 + e.Nb / 4)) ** 2 +
      w.R * ((e.R - p.R) / (1 + e.Rb / 4)) ** 2 +
      w.L * ((e.L - p.L) / (1 + e.Lb / 4)) ** 2 +
      w.T * ((e.T - p.T) / (1 + e.Tb / 4)) ** 2;
    if (d < bestD) { bestD = d; best = r.id; }
  }
  return best;
}

const ENDANGERED = new Set(['0', '1', '2', '3', 'G', 'R']);

export interface RoomStatus {
  id: RoomId;
  /** discovered species that fit this room */
  found: number;
  /** species needed to unlock */
  need: number;
  unlocked: boolean;
  slots: number;
  used: number;
}

export function roomStatuses(state: GameState): RoomStatus[] {
  const fit = new Map<RoomId, number>();
  const rareKenn = new Set<RoomId>();
  for (const id of state.discovered) {
    const sp = allSpecies(state).find((s) => s.id === id);
    if (!sp) continue;
    const r = bestRoom(sp);
    fit.set(r, (fit.get(r) ?? 0) + 1);
    if (roomInfo(r).kennarten && ENDANGERED.has(sp.rl)) rareKenn.add(r);
  }
  return ROOMS.map((r) => {
    const used = state.plants.filter((p) => p.room === r.id).length;
    if (r.id === 'anzucht') return { id: r.id, found: 0, need: 0, unlocked: true, slots: B.greenhouseSlots, used };
    const found = fit.get(r.id) ?? 0;
    // Geheimraum: eine gefährdete Kennart öffnet sofort, sonst zwei Kennarten
    const need = r.kennarten ? (rareKenn.has(r.id) ? 1 : B.rooms.secretUnlockAt) : B.rooms.unlockAt;
    const unlocked = found >= need;
    const slots = unlocked ? Math.min(B.rooms.maxSlots, B.rooms.startSlots + Math.floor((found - need) / B.rooms.extraPer)) : 0;
    return { id: r.id, found, need, unlocked, slots, used };
  });
}

export function roomStatus(state: GameState, id: RoomId): RoomStatus {
  return roomStatuses(state).find((r) => r.id === id)!;
}

export function unlockedRooms(state: GameState): RoomId[] {
  return roomStatuses(state).filter((r) => r.unlocked).map((r) => r.id);
}

export interface Setpoints {
  water: number;
  nutrients: number;
  reaction: number;
  lamp: Level3;
  T: number;
}

/** Conditions a room holds by itself (the Anzuchthaus holds none, except its temperature). */
export function setpoints(id: RoomId): Setpoints {
  const p = roomInfo(id).profile;
  const lamp = ([1, 2, 3] as Level3[]).reduce((a, b) => (Math.abs(LAMP_VALUE[b] - p.L) < Math.abs(LAMP_VALUE[a] - p.L) ? b : a));
  return {
    water: B.eco.waterBase + p.M * B.eco.waterPerM,
    nutrients: B.eco.nutrientBase + p.N * B.eco.nutrientPerN,
    reaction: p.R,
    lamp,
    T: p.T,
  };
}
