import { lightWord, moistureWord, nutrientWord, reactionWord, temperatureWord } from '../../game/ecology';
import type { Species } from '../../game/types';

const ROWS: { key: 'M' | 'N' | 'R' | 'L' | 'T'; name: string; ell: string; word: (v: number) => string; scale: string }[] = [
  { key: 'M', name: 'Feuchte', ell: 'F', word: moistureWord, scale: 'trocken → nass' },
  { key: 'N', name: 'Nährstoffe', ell: 'N', word: nutrientWord, scale: 'arm → reich' },
  { key: 'R', name: 'Bodenreaktion', ell: 'R', word: reactionWord, scale: 'sauer → kalkhaltig' },
  { key: 'L', name: 'Licht', ell: 'L', word: lightWord, scale: 'Schatten → Sonne' },
  { key: 'T', name: 'Temperatur', ell: 'T', word: temperatureWord, scale: 'kühl → warm' },
];

/** Zeigerwerte einer Art: EIVE (0–10, mit Toleranz) und – falls vorhanden – Ellenberg Deutschland. */
export function EcoPanel({ s }: { s: Species }) {
  const e = s.eco;
  const fmt = (v: number) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return (
    <section className="panel stack">
      <h2>Zeigerwerte</h2>
      {s.ecoSource !== 'eive' && <p className="small muted">Für diese Art gibt es keine Zeigerwerte. Die Werte sind aus ihrem Lebensraum geschätzt.</p>}
      {ROWS.map((r) => {
        const v = e[r.key];
        const w = e[`${r.key}b` as const];
        return (
          <div key={r.key}>
            <div className="row small" style={{ justifyContent: 'space-between' }}>
              <b>{r.name}</b>
              <span>{r.word(v)} · {fmt(v)}</span>
            </div>
            <div className="eco-scale" title={r.scale}>
              <i style={{ left: `${Math.max(0, (v - w / 2) * 10)}%`, width: `${Math.min(100, w * 10)}%` }} />
              <b style={{ left: `${v * 10}%` }} />
            </div>
          </div>
        );
      })}
      <p className="tiny muted">Punkt = Optimum, heller Bereich = wie tolerant die Art ist (EIVE 1.0, Skala 0–10).</p>
      {s.ellenberg && (
        <div className="small">
          <b>Ellenberg-Zeigerwerte (Deutschland):</b>{' '}
          {ROWS.map((r, i) => `${r.ell} ${s.ellenberg![i] ?? 'x'}`).join(' · ')}
          <div className="tiny muted">F 1–12, sonst 1–9; x = indifferent oder ohne Angabe.</div>
        </div>
      )}
    </section>
  );
}
