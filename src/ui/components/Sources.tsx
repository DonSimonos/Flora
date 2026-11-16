import { REDLIST, REDLIST_CITATION, REDLIST_LICENSE, REDLIST_LICENSE_URL, REDLIST_URL } from '../../game/redlist';
import { ARTEN_MIT_ZEIGERWERTEN, EIVE_CITATION, EIVE_LICENSE, EIVE_LICENSE_URL, EIVE_URL, ELLENBERG_CITATION } from '../../game/artendb';
import { Sheet } from './common';

/** Quellen und Lizenzen – die Namensnennung der Roten Liste ist Pflicht (CC BY-ND 4.0). */
export function SourcesSheet({ onClose }: { onClose: () => void }) {
  return (
    <Sheet title="Quellen & Lizenzen" onClose={onClose}>
      <div className="stack small">
        <section className="panel stack">
          <h2>Rote Liste Deutschland</h2>
          <p>Gefährdung, aktuelle Bestandssituation und Artenliste ({REDLIST.length.toLocaleString('de-DE')} Arten und Artengruppen) stammen aus:</p>
          <p className="muted">{REDLIST_CITATION} – URL: <a href={REDLIST_URL} target="_blank" rel="noopener">{REDLIST_URL}</a></p>
          <p>
            Lizenz: <a href={REDLIST_LICENSE_URL} target="_blank" rel="noopener">{REDLIST_LICENSE}</a> (Namensnennung – keine Bearbeitung).
            Die Angaben werden unverändert angezeigt. Die Seltenheitsstufen in FLORA leiten sich daraus ab.
          </p>
        </section>
        <section className="panel stack">
          <h2>Zeigerwerte</h2>
          <p>Die Bedürfnisse der Pflanzen im Gewächshaus (Feuchte, Nährstoffe, Bodenreaktion, Licht, Temperatur) stammen für {ARTEN_MIT_ZEIGERWERTEN.toLocaleString('de-DE')} Arten aus:</p>
          <p className="muted">{EIVE_CITATION} – <a href={EIVE_URL} target="_blank" rel="noopener">{EIVE_URL}</a> – Lizenz <a href={EIVE_LICENSE_URL} target="_blank" rel="noopener">{EIVE_LICENSE}</a>.</p>
          <p>Ellenberg-Zeigerwerte für Deutschland:</p>
          <p className="muted">{ELLENBERG_CITATION}</p>
        </section>
        <section className="panel stack">
          <h2>Pflanzenerkennung</h2>
          <p>Automatische Bestimmung: <a href="https://plantnet.org" target="_blank" rel="noopener">Pl@ntNet</a>.</p>
        </section>
        <section className="panel stack">
          <h2>Karte</h2>
          <p>© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende.</p>
        </section>
        <section className="panel stack">
          <h2>Schutz seltener Fundorte</h2>
          <p>
            Auf Empfehlung des Rote-Liste-Zentrums werden Fundorte von Arten der Kategorie 1 (und 0) sowie extrem seltenen Arten
            für andere nur als TK25-Rasterfeld (ca. 11 × 11 km) gezeigt, übrige gefährdete Arten auf etwa 300 m vergröbert.
            Deine eigenen Fundorte siehst nur du genau.
          </p>
        </section>
      </div>
    </Sheet>
  );
}
