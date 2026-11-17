// Spielstand-Operationen: verbinden Funde, Samen, Gegenstände und Gewächshaus.
// Jede Funktion nimmt einen GameState und gibt einen neuen zurück (keine Mutation).
import { BALANCE as B, SAVE_VERSION } from './config';
import { findSpecies, makeDynamicSpecies, matchSpecies, speciesById } from './catalog';
import * as gh from './greenhouse';
import { rarityOf } from './rarity';
import { rngFor } from './rng';
import { bestRoom, roomStatus, unlockedRooms } from './rooms';
import { roomInfo } from '../data/rooms';
import type {
  Candidate, CareId, Find, GameState, ItemId, Level3, Reveal, RoomId, Seed, TrainingId,
} from './types';

export function newGame(now = new Date()): GameState {
  return {
    version: SAVE_VERSION,
    createdAt: now.toISOString(),
    finds: [],
    seeds: [],
    plants: [],
    items: { ...B.startItems },
    extraSpecies: [],
    discovered: [],
    findCount: {},
    revealQueue: [],
    stats: { careActions: 0, trainings: 0, evolutions: 0 },
  };
}

export function uid(): string {
  return crypto.randomUUID();
}

// ---------- Funde ----------

export function addFind(state: GameState, find: Find): GameState {
  return { ...state, finds: [find, ...state.finds] };
}

export function updateFind(state: GameState, id: string, patch: Partial<Find>): GameState {
  return { ...state, finds: state.finds.map((f) => (f.id === id ? { ...f, ...patch } : f)) };
}

/** Attach identification results; matches them against the built-in list. */
export function withCandidates(raw: Omit<Candidate, 'speciesId'>[]): Candidate[] {
  return raw
    .filter((c) => c.score >= B.minCandidateScore)
    .map((c) => {
      const m = matchSpecies(c.sci);
      return { ...c, de: m?.de ?? c.de, speciesId: m?.id ?? null };
    });
}

export type Choice =
  | { speciesId: string; score: number | null; verified: boolean }
  | { sci: string; de: string | null; family: string | null; score: number | null; verified: boolean };

/**
 * Confirms which species a find shows. Grants the rewards and queues the discovery reveal.
 * Seeds: first find of a species, then every n-th find. Repeat finds feed the greenhouse plants.
 */
export function confirmFind(state: GameState, findId: string, choice: Choice): GameState {
  const find = state.finds.find((f) => f.id === findId);
  if (!find || find.status === 'confirmed') return state;
  let s = state;
  let speciesId: string;
  if ('speciesId' in choice) {
    speciesId = choice.speciesId;
  } else {
    const known = choice.sci.trim() ? matchSpecies(choice.sci) : null;
    if (known) speciesId = known.id;
    else {
      const dyn = makeDynamicSpecies(choice.sci, choice.de, choice.family);
      speciesId = dyn.id;
      if (!findSpecies(s, dyn.id)) s = { ...s, extraSpecies: [...s.extraSpecies, dyn] };
    }
  }
  const sp = speciesById(s, speciesId);
  const isNew = !s.discovered.includes(speciesId);
  const count = (s.findCount[speciesId] ?? 0) + 1;
  const seedGained = isNew || count % B.seedEveryNthFind === 0;

  const rand = rngFor(findId, 'beute');
  const rarity = rarityOf(sp);
  const bonus = s.plants.reduce((n, p) => n + gh.hasFindBonus(p), 0) > 0 ? 1 : 0;
  const items: Partial<Record<ItemId, number>> = {
    duenger: B.findItems.duenger + B.rarityItemBonus[rarity] + bonus,
  };
  if (rand() < B.findItems.heilmittelChance) items.heilmittel = 1 + (B.rarityItemBonus[rarity] >= 2 ? 1 : 0);

  const seeds: Seed[] = seedGained ? [...s.seeds, { id: uid(), speciesId, findId, receivedAt: new Date().toISOString() }] : s.seeds;

  // Repeat finds give knowledge xp to plants of the same species
  let xpToPlants = 0;
  let plants = s.plants;
  if (!isNew) {
    plants = s.plants.map((p) => {
      if (p.speciesId !== speciesId) return p;
      const amount = B.repeatFindXp(p.level);
      xpToPlants = Math.max(xpToPlants, amount);
      return gh.addXp(p, sp, amount, []);
    });
  }

  const roomsBefore = unlockedRooms(s);
  const roomsAfter = isNew ? unlockedRooms({ ...s, discovered: [...s.discovered, speciesId] }) : roomsBefore;
  const newRooms = roomsAfter.filter((r) => !roomsBefore.includes(r));
  const reveal: Reveal = { findId, speciesId, isNew, seedGained, items, xpToPlants, ...(newRooms.length ? { newRooms } : {}) };
  return {
    ...s,
    finds: s.finds.map((f) =>
      f.id === findId
        ? { ...f, status: 'confirmed', speciesId, verified: choice.verified, score: choice.score, error: null }
        : f,
    ),
    discovered: isNew ? [...s.discovered, speciesId] : s.discovered,
    findCount: { ...s.findCount, [speciesId]: count },
    seeds,
    plants,
    items: addItems(s.items, items),
    revealQueue: [...s.revealQueue, reveal],
  };
}

export function deleteFind(state: GameState, findId: string): GameState {
  return { ...state, finds: state.finds.filter((f) => f.id !== findId || f.status === 'confirmed') };
}

export function popReveal(state: GameState): GameState {
  return { ...state, revealQueue: state.revealQueue.slice(1) };
}

function addItems(base: Record<ItemId, number>, add: Partial<Record<ItemId, number>>): Record<ItemId, number> {
  const out = { ...base };
  for (const [k, v] of Object.entries(add) as [ItemId, number][]) out[k] += v;
  return out;
}

// ---------- Gewächshaus ----------

/** Room a seed would go to: its own habitat room if open and free, otherwise the Anzuchthaus. */
export function defaultRoom(state: GameState, speciesId: string): RoomId {
  const r = bestRoom(speciesById(state, speciesId));
  const st = roomStatus(state, r);
  return st.unlocked && st.used < st.slots ? r : 'anzucht';
}

function roomFull(state: GameState, room: RoomId): string | null {
  const st = roomStatus(state, room);
  if (!st.unlocked) return `${roomInfo(room).name} ist noch nicht freigeschaltet.`;
  if (st.used >= st.slots) return `Im ${roomInfo(room).name} ist kein Beet mehr frei.`;
  return null;
}

export function plantSeed(state: GameState, seedId: string, now: number, room?: RoomId): { state: GameState; error?: string } {
  const seed = state.seeds.find((x) => x.id === seedId);
  if (!seed) return { state, error: 'Samen nicht gefunden.' };
  const target = room ?? defaultRoom(state, seed.speciesId);
  const full = roomFull(state, target);
  if (full) return { state, error: full };
  const sp = speciesById(state, seed.speciesId);
  const plant = gh.newPlant(uid(), seed.id, seed.findId, sp, now, target);
  return {
    state: { ...state, seeds: state.seeds.filter((x) => x.id !== seedId), plants: [...state.plants, plant] },
  };
}

function replacePlant(state: GameState, plant: gh.ActionResult['plant']): GameState {
  return { ...state, plants: state.plants.map((p) => (p.id === plant.id ? plant : p)) };
}

export function tickAll(state: GameState, now: number): { state: GameState; events: { plantId: string; event: gh.GameEvent }[] } {
  const events: { plantId: string; event: gh.GameEvent }[] = [];
  let changed = false;
  const plants = state.plants.map((p) => {
    const r = gh.tick(p, speciesById(state, p.speciesId), now);
    if (r.plant !== p) changed = true;
    r.events.forEach((event) => events.push({ plantId: p.id, event }));
    return r.plant;
  });
  return { state: changed ? { ...state, plants } : state, events };
}

const CARE_ITEM: Partial<Record<CareId, ItemId>> = { duengen: 'duenger', behandeln: 'heilmittel' };

export function careAction(state: GameState, plantId: string, action: CareId, now: number): { state: GameState; result: gh.ActionResult } {
  const p = state.plants.find((x) => x.id === plantId)!;
  const item = CARE_ITEM[action];
  if (item && state.items[item] <= 0) {
    return { state, result: { ok: false, plant: p, events: [], reason: item === 'duenger' ? 'Kein Dünger mehr. Finde draußen Pflanzen, um neuen zu bekommen.' : 'Kein Heilmittel mehr. Funde draußen bringen manchmal welches.' } };
  }
  const result = gh.care(p, speciesById(state, p.speciesId), action, now);
  if (!result.ok) return { state, result };
  let s = replacePlant(state, result.plant);
  if (item) s = { ...s, items: { ...s.items, [item]: s.items[item] - 1 } };
  s = { ...s, stats: { ...s.stats, careActions: s.stats.careActions + 1 } };
  return { state: s, result };
}

export function trainAction(state: GameState, plantId: string, kind: TrainingId, now: number): { state: GameState; result: gh.ActionResult } {
  const p = state.plants.find((x) => x.id === plantId)!;
  const result = gh.train(p, speciesById(state, p.speciesId), kind, now);
  if (!result.ok) return { state, result };
  const s = replacePlant(state, result.plant);
  return { state: { ...s, stats: { ...s.stats, trainings: s.stats.trainings + 1 } }, result };
}

export function lightAction(state: GameState, plantId: string, light: Level3): GameState {
  const p = state.plants.find((x) => x.id === plantId)!;
  return replacePlant(state, gh.setLight(p, light));
}

export function moveAction(state: GameState, plantId: string, room: RoomId): { state: GameState; error?: string } {
  const p = state.plants.find((x) => x.id === plantId)!;
  if (p.room === room) return { state };
  const full = roomFull(state, room);
  if (full) return { state, error: full };
  return { state: replacePlant(state, gh.setRoom(p, room)) };
}

export function evolveAction(state: GameState, plantId: string, formId: string): { state: GameState; result: gh.ActionResult } {
  const p = state.plants.find((x) => x.id === plantId)!;
  const result = gh.evolve(p, speciesById(state, p.speciesId), formId);
  if (!result.ok) return { state, result };
  const s = replacePlant(state, result.plant);
  return { state: { ...s, stats: { ...s.stats, evolutions: s.stats.evolutions + 1 } }, result };
}
