// Fotos liegen in IndexedDB (idb-keyval), getrennt vom Spielstand.
import { createStore, del, get, set } from 'idb-keyval';

const store = createStore('flora-fotos', 'fotos');

export interface StoredPhoto {
  full: Blob;
  thumb: Blob;
}

export async function savePhoto(id: string, photo: StoredPhoto): Promise<void> {
  await set(id, photo, store);
}

export async function loadPhoto(id: string): Promise<StoredPhoto | undefined> {
  return get<StoredPhoto>(id, store);
}

export async function deletePhoto(id: string): Promise<void> {
  await del(id, store);
}

const urlCache = new Map<string, string>();

/** Object URL for a photo (thumb or full), cached for the session. */
export async function photoUrl(id: string, kind: 'thumb' | 'full' = 'thumb'): Promise<string | null> {
  const key = `${id}:${kind}`;
  const hit = urlCache.get(key);
  if (hit) return hit;
  const p = await loadPhoto(id);
  if (!p) return null;
  const url = URL.createObjectURL(kind === 'thumb' ? p.thumb : p.full);
  urlCache.set(key, url);
  return url;
}
