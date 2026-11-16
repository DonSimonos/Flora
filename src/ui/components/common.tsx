import { useEffect, useState, type ReactNode } from 'react';
import { HABITATS } from '../../data/habitats';
import { rarityInfo, rarityOf } from '../../game/rarity';
import type { PlantType, RarityId, Species } from '../../game/types';
import { photoUrl } from '../../services/photos';
import { useToasts } from '../../store/toast';
import { PlantArt } from '../../art/PlantArt';

export const TYPE_NAMES: Record<PlantType, string> = {
  kraut: 'Kraut',
  orchidee: 'Orchidee',
  farn: 'Farn',
  gras: 'Gras',
  karnivore: 'Fleischfressend',
  zwergstrauch: 'Zwergstrauch',
  wasserpflanze: 'Wasserpflanze',
  zwiebel: 'Zwiebelpflanze',
  distel: 'Distelartig',
};

export function RarityBadge({ rarity }: { rarity: RarityId }) {
  const r = rarityInfo(rarity);
  return (
    <span className={`rarity-badge r-${rarity}`}>
      <span className="stars">{'★'.repeat(r.stars)}</span>
      {r.name}
    </span>
  );
}

export function Photo({ id, kind = 'thumb', className, alt = '' }: { id: string; kind?: 'thumb' | 'full'; className?: string; alt?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    photoUrl(id, kind).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [id, kind]);
  return url ? <img src={url} className={className} alt={alt} /> : <div className={className} aria-hidden />;
}

/** Sammelkarte: drawing (or own photo) with rarity frame. */
export function SpeciesCard({ species, photoId, shine = false }: { species: Species; photoId?: string | null; shine?: boolean }) {
  const rarity = rarityOf(species);
  const habitat = HABITATS.find((h) => h.id === species.habitats[0]);
  const photoMain = !species.art && photoId;
  return (
    <div className={`card r-${rarity}`}>
      <div className="card-inner">
        <div className="card-art">
          {photoMain ? <Photo id={photoId} kind="full" /> : <PlantArt species={species} background />}
          {species.art && photoId && (
            <div className="card-photo-inset">
              <Photo id={photoId} />
            </div>
          )}
        </div>
        <div className="card-body">
          <div className="card-name">{species.de}</div>
          <div className="card-sci">{species.sci}</div>
          <div className="card-meta">
            <RarityBadge rarity={rarity} />
            <span className="tag">{TYPE_NAMES[species.type]}</span>
            {habitat && <span className="tag">{habitat.icon} {habitat.short}</span>}
          </div>
        </div>
      </div>
      {shine && <div className="card-shine" />}
    </div>
  );
}

export function Sheet({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h2>{title}</h2>
          <button className="close" onClick={onClose} aria-label="Schließen">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Meter({ label, value, max = 100, band, tone, display }: { label: string; value: number; max?: number; band?: [number, number]; tone?: 'gold'; display?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="meter">
      <span>{label}</span>
      <div className={`bar ${tone ?? ''}`}>
        {band && <i className="band" style={{ left: `${band[0]}%`, width: `${band[1] - band[0]}%` }} />}
        <span style={{ width: `${pct}%` }} />
      </div>
      <b>{display ?? Math.round(value)}</b>
    </div>
  );
}

export function Toasts() {
  const toasts = useToasts();
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.tone}`}>{t.text}</div>
      ))}
    </div>
  );
}

export function dateText(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' });
}
