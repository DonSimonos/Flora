import { useState } from 'react';
import { PlantArt } from '../../art/PlantArt';
import { SPECIES } from '../../data/species';
import { RARITIES } from '../../game/config';
import { climateAt, weatherView } from '../../game/climate';
import { speciesById } from '../../game/catalog';
import { stageOf, wellbeing } from '../../game/greenhouse';
import { rarityOf } from '../../game/rarity';
import { useGame, useNow } from '../../store/store';
import { SpeciesCard } from '../components/common';
import type { Tab } from '../App';
import { SourcesSheet } from '../components/Sources';

export function Home({ go }: { go: (t: Tab) => void }) {
  const state = useGame();
  const [sources, setSources] = useState(false);
  const now = useNow();
  const climate = climateAt(now);
  const builtIn = SPECIES.length;
  const foundBuiltIn = state.discovered.filter((id) => !id.startsWith('x_')).length;
  const confirmed = state.finds.filter((f) => f.status === 'confirmed').length;
  const ready = state.finds.filter((f) => f.status === 'ready' || f.status === 'failed').length;
  const waiting = state.finds.filter((f) => f.status === 'pending').length;
  const needy = state.plants
    .map((p) => {
      const sp = speciesById(state, p.speciesId);
      return { p, sp, wb: wellbeing(p, sp, climate) };
    })
    .filter((x) => x.wb.issues.length > 0 || x.p.energy >= 100)
    .sort((a, b) => a.wb.score - b.wb.score)
    .slice(0, 3);
  const recent = [...state.discovered].reverse().slice(0, 8);
  const byRarity = RARITIES.map((r) => ({
    ...r,
    count: state.discovered.filter((id) => rarityOf(speciesById(state, id)) === r.id).length,
  }));

  return (
    <div className="screen">
      <section className="panel hero">
        <div className="logo">FLORA</div>
        <div className="tagline">Die Hüter der vergessenen Pflanzen</div>
        <div className="stats3">
          <div className="stat"><b>{state.discovered.length}</b><span>Arten entdeckt</span></div>
          <div className="stat"><b>{confirmed}</b><span>Funde</span></div>
          <div className="stat"><b>{state.plants.length}</b><span>im Gewächshaus</span></div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div className="row small" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="muted">Herbarium</span>
            <b>{foundBuiltIn} / {builtIn}</b>
          </div>
          <div className="bar gold"><span style={{ width: `${(foundBuiltIn / builtIn) * 100}%` }} /></div>
        </div>
      </section>

      {(ready > 0 || waiting > 0) && (
        <section className="panel stack">
          {ready > 0 && (
            <div className="row">
              <span className="grow"><b>{ready} {ready === 1 ? 'Fund wartet' : 'Funde warten'}</b> auf deine Bestimmung.</span>
              <button className="btn primary" onClick={() => go('entdecken')}>Ansehen</button>
            </div>
          )}
          {waiting > 0 && <p className="muted small">{waiting} {waiting === 1 ? 'Fund wird' : 'Funde werden'} erkannt, sobald du wieder Internet hast.</p>}
        </section>
      )}

      <button className="btn leaf block" style={{ minHeight: 60, fontSize: 18 }} onClick={() => go('entdecken')}>
        📷 Pflanze entdecken
      </button>

      <section className="panel">
        <div className="panel-title">
          <h2>Gewächshaus</h2>
          <span className="tag">{climate.night ? '🌙 Nacht' : '🌤️ Tag'} · {weatherView(climate).icon} {weatherView(climate).name}</span>
        </div>
        {state.plants.length === 0 && state.seeds.length === 0 && (
          <p className="muted">Jede neu entdeckte Art schenkt dir einen Samen. Daraus wächst hier deine eigene Pflanze.</p>
        )}
        {state.plants.length === 0 && state.seeds.length > 0 && (
          <div className="row">
            <span className="grow">Du hast {state.seeds.length} {state.seeds.length === 1 ? 'Samen' : 'Samen'} zum Einpflanzen.</span>
            <button className="btn primary" onClick={() => go('gewaechshaus')}>Einpflanzen</button>
          </div>
        )}
        {needy.map(({ p, sp, wb }) => (
          <div key={p.id} className="alert-row">
            <PlantArt species={sp} stage={stageOf(p)} className="mini-art" />
            <div className="grow">
              <b>{sp.de}</b> <span className="muted small">Lv {p.level}</span>
              <div className="row" style={{ gap: 6, marginTop: 4 }}>
                {wb.issues.map((i) => <span key={i} className="tag warn">{i}</span>)}
                {p.energy >= 100 && <span className="tag good">Bereit zum Training</span>}
              </div>
            </div>
          </div>
        ))}
        {state.plants.length > 0 && needy.length === 0 && <p className="muted">Allen Pflanzen geht es gut. 🌿</p>}
        {state.plants.length > 0 && (
          <button className="link" onClick={() => go('gewaechshaus')}>Zum Gewächshaus →</button>
        )}
      </section>

      {recent.length > 0 && (
        <section className="stack">
          <h2 style={{ fontSize: 19 }}>Zuletzt entdeckt</h2>
          <div className="hscroll">
            {recent.map((id) => {
              const sp = speciesById(state, id);
              const f = state.finds.find((x) => x.speciesId === id && x.status === 'confirmed');
              return <SpeciesCard key={id} species={sp} photoId={f?.photoId} />;
            })}
          </div>
        </section>
      )}

      <section className="panel">
        <h2>Deine Sammlung</h2>
        <div className="row" style={{ gap: 8 }}>
          {byRarity.map((r) => (
            <span key={r.id} className={`rarity-badge r-${r.id}`}>{r.name}: {r.count}</span>
          ))}
        </div>
      </section>

      <p className="notice">
        <b>Naturschutz zuerst:</b> Gesammelt wird nur per Foto. Nichts pflücken oder ausgraben, in Schutzgebieten auf den Wegen bleiben.
      </p>
      <button className="link small" onClick={() => setSources(true)}>Quellen & Lizenzen</button>
      {sources && <SourcesSheet onClose={() => setSources(false)} />}
    </div>
  );
}
