import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { RARITIES } from '../../game/config';
import { speciesById } from '../../game/catalog';
import { rarityOf } from '../../game/rarity';
import { lastFixOrNull } from './mapHelpers';
import { useGame } from '../../store/store';

export function MapScreen({ openSpecies }: { openSpecies: (id: string) => void }) {
  const state = useGame();
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, attributionControl: true }).setView([51.2, 10.4], 6);
    m.attributionControl.setPrefix(false);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    }).addTo(m);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  const finds = state.finds.filter((f) => f.status === 'confirmed' && f.lat != null && f.speciesId);

  useEffect(() => {
    const m = map.current;
    const g = layer.current;
    if (!m || !g) return;
    g.clearLayers();
    const pts: L.LatLngExpression[] = [];
    for (const f of finds) {
      const sp = speciesById(state, f.speciesId!);
      const color = RARITIES.find((r) => r.id === rarityOf(sp))!.color;
      const mk = L.circleMarker([f.lat!, f.lng!], { radius: 9, color: '#0c1d15', weight: 2, fillColor: color, fillOpacity: 0.95 });
      const btn = document.createElement('button');
      btn.className = 'link';
      btn.textContent = `${sp.de} ansehen →`;
      btn.onclick = () => openSpecies(sp.id);
      const box = document.createElement('div');
      box.innerHTML = `<b>${sp.de}</b><br><i>${sp.sci}</i><br>${new Date(f.createdAt).toLocaleDateString('de-DE')}<br>`;
      box.appendChild(btn);
      mk.bindPopup(box);
      mk.addTo(g);
      pts.push([f.lat!, f.lng!]);
    }
    if (pts.length) m.fitBounds(L.latLngBounds(pts).pad(0.3), { maxZoom: 15 });
    else {
      const fix = lastFixOrNull();
      if (fix) m.setView([fix.lat, fix.lng], 13);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finds.length]);

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Karte</h1>
          <div className="sub">{finds.length} Fundorte · nur für dich sichtbar</div>
        </div>
      </div>
      <div ref={el} className="map-wrap" />
      <div className="row" style={{ gap: 8 }}>
        {RARITIES.map((r) => <span key={r.id} className={`rarity-badge r-${r.id}`}>{r.name}</span>)}
      </div>
    </div>
  );
}
