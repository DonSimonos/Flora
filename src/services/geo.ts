// GPS: läuft, solange der Entdecken-Bereich offen ist, damit beim Foto schon ein Standort bereitsteht.
export interface Fix {
  lat: number;
  lng: number;
  accuracy: number;
  at: number;
}

let best: Fix | null = null;
let watchId: number | null = null;
const listeners = new Set<(f: Fix | null, err: string | null) => void>();
let lastError: string | null = null;

function emit() {
  listeners.forEach((l) => l(best, lastError));
}

export function startGps(): void {
  if (watchId !== null || !('geolocation' in navigator)) {
    if (!('geolocation' in navigator)) { lastError = 'Dieses Gerät kann keinen Standort bestimmen.'; emit(); }
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const f: Fix = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: Date.now() };
      // prefer a fresh fix; replace an older one even if slightly less accurate
      if (!best || Date.now() - best.at > 30_000 || f.accuracy <= best.accuracy) best = f;
      lastError = null;
      emit();
    },
    (err) => {
      lastError = err.code === err.PERMISSION_DENIED ? 'Standort ist nicht freigegeben. Bitte in den Browser-Einstellungen erlauben.' : 'Noch kein GPS-Signal.';
      emit();
    },
    { enableHighAccuracy: true, maximumAge: 5_000, timeout: 30_000 },
  );
}

export function stopGps(): void {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

export function onGps(fn: (f: Fix | null, err: string | null) => void): () => void {
  listeners.add(fn);
  fn(best, lastError);
  return () => listeners.delete(fn);
}

/** A fix from the last two minutes, or a fresh one (max 12 s wait). */
export async function currentFix(): Promise<Fix | null> {
  if (best && Date.now() - best.at < 120_000) return best;
  if (!('geolocation' in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy, at: Date.now() }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 10_000 },
    );
  });
}

export async function exifGps(file: Blob): Promise<{ lat: number; lng: number } | null> {
  try {
    const { gps } = await import('exifr');
    const r = await gps(file);
    if (r && Number.isFinite(r.latitude) && Number.isFinite(r.longitude)) return { lat: r.latitude, lng: r.longitude };
  } catch {
    /* no EXIF */
  }
  return null;
}
