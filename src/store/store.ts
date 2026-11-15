// Ein kleiner Spielstand-Speicher für React. Änderungen laufen nur über update().
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { GameState } from '../game/types';
import { load, store as persist, type LoadSource } from './save';

const storage: Storage | null = (() => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
})();

const loaded = storage ? load(storage) : null;
let state: GameState = loaded?.state ?? load({ getItem: () => null, setItem: () => {} }).state;
export const loadSource: LoadSource = loaded?.source ?? 'new';

const listeners = new Set<() => void>();
let saveTimer: number | undefined;

function flush() {
  window.clearTimeout(saveTimer);
  saveTimer = undefined;
  if (storage) persist(storage, state);
}

export function getState(): GameState {
  return state;
}

export function update(fn: (s: GameState) => GameState): void {
  const next = fn(state);
  if (next === state) return;
  state = next;
  listeners.forEach((l) => l());
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(flush, 400);
}

window.addEventListener('pagehide', flush);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush();
});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useGame(): GameState {
  return useSyncExternalStore(subscribe, getState);
}

/** Current time, refreshed every `ms` milliseconds (for timers and the greenhouse). */
export function useNow(ms = 30_000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(t);
  }, [ms]);
  return now;
}
