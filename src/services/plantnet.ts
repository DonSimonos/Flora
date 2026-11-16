// Automatische Bestimmung über Pl@ntNet (https://my.plantnet.org).
// Der Schlüssel kommt beim Bauen aus VITE_PLANTNET_KEY (GitHub-Secret PLANTNET_KEY).
// Er ist bei Pl@ntNet auf die Adresse der App beschränkt („Authorized domains“).

// trim: a space or line break copied along with the key makes Pl@ntNet reject it
const KEY = ((import.meta.env.VITE_PLANTNET_KEY as string | undefined) ?? '').trim();
const PROJECT = 'all';
const ENDPOINT = `https://my-api.plantnet.org/v2/identify/${PROJECT}`;

export const plantnetConfigured = Boolean(KEY);

export interface RawCandidate {
  sci: string;
  de: string | null;
  family: string | null;
  score: number;
}

export class IdentifyError extends Error {
  constructor(message: string, readonly retry: boolean) {
    super(message);
  }
}

export async function identify(photo: Blob): Promise<RawCandidate[]> {
  if (!KEY) throw new IdentifyError('Automatische Erkennung ist noch nicht eingerichtet.', false);
  if (!navigator.onLine) throw new IdentifyError('Kein Internet.', true);
  const fd = new FormData();
  fd.append('images', photo, 'fund.jpg');
  fd.append('organs', 'auto');
  const url = `${ENDPOINT}?include-related-images=false&no-reject=false&nb-results=5&lang=de&api-key=${encodeURIComponent(KEY)}`;
  let res: Response;
  try {
    res = await fetch(url, { method: 'POST', body: fd });
  } catch {
    throw new IdentifyError('Keine Verbindung zu Pl@ntNet.', true);
  }
  if (res.status === 404) return []; // no plant recognised
  if (res.status === 401 || res.status === 403) {
    const why = await reason(res);
    throw new IdentifyError(`Pl@ntNet lehnt den Zugang ab (Fehler ${res.status}${why ? `: „${why}“` : ''}). Schlüssel oder erlaubte Domain prüfen.`, false);
  }
  if (res.status === 429) throw new IdentifyError('Tageskontingent der Erkennung ist aufgebraucht. Morgen geht es weiter.', true);
  if (!res.ok) throw new IdentifyError(`Pl@ntNet-Fehler ${res.status}.`, true);
  const data = (await res.json()) as {
    results?: { score: number; species: { scientificNameWithoutAuthor: string; commonNames?: string[]; family?: { scientificNameWithoutAuthor?: string } } }[];
  };
  return (data.results ?? []).map((r) => ({
    sci: r.species.scientificNameWithoutAuthor,
    de: r.species.commonNames?.[0] ?? null,
    family: r.species.family?.scientificNameWithoutAuthor ?? null,
    score: r.score,
  }));
}

/** Short reason text from a Pl@ntNet error response, if any. */
async function reason(res: Response): Promise<string> {
  try {
    const text = await res.text();
    try {
      const j = JSON.parse(text) as { message?: string; error?: string };
      return (j.message ?? j.error ?? '').slice(0, 140);
    } catch {
      return text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
    }
  } catch {
    return '';
  }
}
