// Funde ohne Internet warten hier und werden erkannt, sobald wieder Netz da ist.
import { updateFind, withCandidates } from '../game/game';
import { getState, update } from '../store/store';
import { loadPhoto } from './photos';
import { identify, IdentifyError, plantnetConfigured } from './plantnet';

let running = false;

/** Identify one find now. Returns true when the find got candidates (or a final error). */
export async function identifyFind(findId: string): Promise<boolean> {
  const f = getState().finds.find((x) => x.id === findId);
  if (!f || f.status === 'confirmed') return true;
  if (!plantnetConfigured) {
    update((s) => updateFind(s, findId, { status: 'ready', candidates: [], error: null }));
    return true;
  }
  const photo = await loadPhoto(f.photoId);
  if (!photo) {
    update((s) => updateFind(s, findId, { status: 'failed', error: 'Das Foto fehlt.' }));
    return true;
  }
  try {
    const raw = await identify(photo.full);
    const candidates = withCandidates(raw);
    update((s) =>
      updateFind(s, findId, {
        status: 'ready',
        candidates,
        attempts: f.attempts + 1,
        error: candidates.length ? null : 'Keine Pflanze sicher erkannt.',
      }),
    );
    return true;
  } catch (e) {
    const err = e instanceof IdentifyError ? e : new IdentifyError('Erkennung fehlgeschlagen.', true);
    update((s) => updateFind(s, findId, { status: err.retry ? 'pending' : 'failed', error: err.message, attempts: f.attempts + 1 }));
    return !err.retry;
  }
}

export async function processQueue(): Promise<void> {
  if (running || !navigator.onLine) return;
  running = true;
  try {
    const pending = getState().finds.filter((f) => f.status === 'pending');
    for (const f of pending) {
      const done = await identifyFind(f.id);
      if (!done) break; // network or quota problem – try again later
    }
  } finally {
    running = false;
  }
}
