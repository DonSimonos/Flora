import { useState } from 'react';
import { PlantArt } from '../../art/PlantArt';
import { abilityInfo } from '../../data/abilities';
import { HABITATS } from '../../data/habitats';
import { SPECIES } from '../../data/species';
import { BALANCE, CONDITION_NAMES, RARITIES } from '../../game/config';
import { speciesById } from '../../game/catalog';
import { BESTAND_TEXT, rarityOf, RL_TEXT } from '../../game/rarity';
import type { HabitatId, RarityId, Species } from '../../game/types';
import { useGame } from '../../store/store';
import { precisionFor, precisionText, publicLocation } from '../../game/privacy';
import { REDLIST_LICENSE } from '../../game/redlist';
import { SourcesSheet } from '../components/Sources';
import { EcoPanel } from '../components/EcoPanel';
import { needsText } from '../../game/ecology';
import { bestRoom } from '../../game/rooms';
import { roomInfo } from '../../data/rooms';
import { dateText, Photo, RarityBadge, Sheet, SpeciesCard, TYPE_NAMES } from '../components/common';


export function Herbarium({ focus, onFocusDone }: { focus?: string | null; onFocusDone?: () => void }) {
  const state = useGame();
  const [habitat, setHabitat] = useState<HabitatId | 'alle'>('alle');
  const [rarity, setRarity] = useState<RarityId | 'alle'>('alle');
  const [onlyFound, setOnlyFound] = useState(false);
  const [open, setOpen] = useState<string | null>(focus ?? null);
  const [sources, setSources] = useState(false);
  const found = new Set(state.discovered);

  const list = SPECIES.filter(
    (s) =>
      (habitat === 'alle' || s.habitats.includes(habitat)) &&
      (rarity === 'alle' || rarityOf(s) === rarity) &&
      (!onlyFound || found.has(s.id)),
  );
  const total = SPECIES.length;
  const foundCount = SPECIES.filter((s) => found.has(s.id)).length;

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <h1>Herbarium</h1>
          <div className="sub">{foundCount} von {total} Arten · {state.extraSpecies.length} weitere</div>
        </div>
      </div>
      <div className="bar gold"><span style={{ width: `${(foundCount / total) * 100}%` }} /></div>

      <div className="chips" role="group" aria-label="Lebensraum">
        <button className="chip" aria-pressed={habitat === 'alle'} onClick={() => setHabitat('alle')}>Alle</button>
        {HABITATS.map((h) => {
          const inH = SPECIES.filter((s) => s.habitats.includes(h.id));
          const f = inH.filter((s) => found.has(s.id)).length;
          return (
            <button key={h.id} className="chip" aria-pressed={habitat === h.id} onClick={() => setHabitat(h.id)}>
              {h.icon} {h.short} {f}/{inH.length}
            </button>
          );
        })}
      </div>
      <div className="chips" role="group" aria-label="Seltenheit">
        <button className="chip" aria-pressed={rarity === 'alle'} onClick={() => setRarity('alle')}>Jede Seltenheit</button>
        {RARITIES.map((r) => (
          <button key={r.id} className="chip" aria-pressed={rarity === r.id} onClick={() => setRarity(r.id)}>
            <span className={`dot r-${r.id}`} /> {r.name}
          </button>
        ))}
        <button className="chip" aria-pressed={onlyFound} onClick={() => setOnlyFound(!onlyFound)}>Nur entdeckte</button>
      </div>

      <div className="grid">
        {list.map((s) => {
          const known = found.has(s.id);
          return (
            <button key={s.id} className={`tile r-${rarityOf(s)} ${known ? '' : 'unknown'}`} onClick={() => setOpen(s.id)}>
              <PlantArt species={s} silhouette={!known} background={known} />
              <span className="corner"><span className={`dot r-${rarityOf(s)}`} /></span>
              <span className="tile-name">{known ? s.de : '???'}</span>
            </button>
          );
        })}
      </div>
      {list.length === 0 && <p className="muted">Keine Arten mit diesem Filter.</p>}

      {state.extraSpecies.length > 0 && (
        <section className="stack">
          <h2 style={{ fontSize: 19 }}>Weitere entdeckte Arten</h2>
          <div className="grid">
            {state.extraSpecies.map((s) => {
              const f = state.finds.find((x) => x.speciesId === s.id);
              return (
                <button key={s.id} className={`tile r-${rarityOf(s)}`} onClick={() => setOpen(s.id)}>
                  {f ? <Photo id={f.photoId} className="thumb" /> : <PlantArt species={s} />}
                  <span className="tile-name">{s.de}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <p className="muted tiny">
        Gefährdung nach Metzing et al. (2018), Rote Liste der Farn- und Blütenpflanzen Deutschlands, Rote-Liste-Zentrum, {REDLIST_LICENSE}.{' '}
        <button className="link tiny" onClick={() => setSources(true)}>Quellen</button>
      </p>
      {sources && <SourcesSheet onClose={() => setSources(false)} />}

      {open && (
        <SpeciesSheet
          species={speciesById(state, open)}
          onClose={() => {
            setOpen(null);
            onFocusDone?.();
          }}
        />
      )}
    </div>
  );
}

function SpeciesSheet({ species: s, onClose }: { species: Species; onClose: () => void }) {
  const state = useGame();
  const known = state.discovered.includes(s.id);
  const finds = state.finds.filter((f) => f.speciesId === s.id && f.status === 'confirmed');
  const plants = state.plants.filter((p) => p.speciesId === s.id);
  const reachedForms = new Set(plants.map((p) => p.formId).filter(Boolean));
  const habitatNames = s.habitats.map((h) => HABITATS.find((x) => x.id === h)!.name).join(', ');

  if (!known) {
    return (
      <Sheet title="Unentdeckte Art" onClose={onClose}>
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: 200 }}><PlantArt species={s} silhouette /></div>
          <RarityBadge rarity={rarityOf(s)} />
          <p>
            <b>Hinweis:</b> Diese {TYPE_NAMES[s.type]} wächst in {habitatNames || 'unbekannten Lebensräumen'}.
          </p>
          <p className="muted small">Finde und fotografiere sie draußen, um sie ins Herbarium aufzunehmen.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet title={s.de} onClose={onClose}>
      <div className="stack">
        <div style={{ maxWidth: 300, margin: '0 auto', width: '100%' }}>
          <SpeciesCard species={s} photoId={finds[0]?.photoId} />
        </div>
        <p>{s.description}</p>
        <section className="panel">
          <dl className="facts">
            <dt>Wissenschaftlich</dt><dd><i>{s.sci}</i></dd>
            <dt>Familie</dt><dd>{s.family}</dd>
            <dt>Lebensraum</dt><dd>{habitatNames || '–'}</dd>
            <dt>Typ</dt><dd>{TYPE_NAMES[s.type]}</dd>
            <dt>Rote Liste D</dt><dd>{s.rl !== '?' && s.rl !== 'nb' ? `${s.rl} – ` : ''}{RL_TEXT[s.rl]}{s.rlOfficial ? '' : ' (keine offiziellen Daten)'}</dd>
            <dt>Bestand</dt><dd>{BESTAND_TEXT[s.bestand]}</dd>
            {s.endemic && <><dt>Besonders</dt><dd>Endemit – kommt weltweit nur in Deutschland vor</dd></>}
            <dt>Quelle</dt><dd className="tiny muted">Rote Liste: Metzing et al. (2018), {REDLIST_LICENSE}</dd>
            <dt>Mag</dt><dd>{needsText(s.eco)}</dd>
            <dt>Gewächshaus</dt><dd>{roomInfo(bestRoom(s)).icon} {roomInfo(bestRoom(s)).name}</dd>
          </dl>
        </section>

        <EcoPanel s={s} />

        <section className="panel">
          <h2>Fähigkeiten</h2>
          {s.abilities.map((id, i) => {
            const a = abilityInfo(id);
            return (
              <div key={id} className="ability">
                <div className="ico">✦</div>
                <div>
                  <b>{a.name}</b>
                  <div className="small">{a.description}</div>
                  <div className="muted tiny">Ab Level {BALANCE.abilityLevels[i]} – oder früher durch Training.</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel stack">
          <h2>Entwicklungsformen</h2>
          {s.forms.map((f) => {
            const reached = reachedForms.has(f.id);
            const how = f.trigger.kind === 'condition'
              ? `${f.trigger.count}× Training bei ${CONDITION_NAMES[f.trigger.id]}`
              : `${f.trigger.count}× ${f.trigger.id[0].toUpperCase() + f.trigger.id.slice(1)}training`;
            return (
              <div key={f.id} className="form-card">
                <PlantArt species={s} effect={reached ? f.effect : null} silhouette={!reached} />
                <div>
                  <b>{reached ? f.name : '??? – noch nicht erreicht'}</b>
                  <div className="small">{reached ? f.description : `Ab Level ${BALANCE.evolveLevel} · ${how}`}</div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="panel">
          <h2>Deine Funde ({finds.length})</h2>
          {finds.map((f) => (
            <div key={f.id} className="find-row">
              <Photo id={f.photoId} className="thumb" />
              <div className="grow">
                <b>{dateText(f.createdAt)}</b>
                <div className="muted small">
                  {f.lat != null ? `${f.lat.toFixed(4)}, ${f.lng!.toFixed(4)}` : 'ohne Standort'}
                </div>
                {f.lat != null && precisionFor(s) !== 'genau' && (
                  <div className="tiny muted">🔒 {precisionText(publicLocation(f.lat, f.lng!, s))}</div>
                )}
              </div>
              {f.verified ? <span className="tag good">erkannt</span> : <span className="tag warn">{f.score == null ? 'selbst bestimmt' : 'unsicher'}</span>}
            </div>
          ))}
        </section>
      </div>
    </Sheet>
  );
}
