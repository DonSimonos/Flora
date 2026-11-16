import { useState } from 'react';
import { PlantArt } from '../../art/PlantArt';
import { abilityInfo } from '../../data/abilities';
import { BALANCE, CONDITION_NAMES, STAT_NAMES } from '../../game/config';
import { activeConditions, climateAt, weatherView } from '../../game/climate';
import { bestLamp, nutrientBand, reactionBand, reactionWord, temperatureWord, waterBand } from '../../game/ecology';
import { speciesById } from '../../game/catalog';
import { careAction, evolveAction, lightAction, plantSeed, trainAction, zoneAction } from '../../game/game';
import {
  availableForms, canTrain, DISEASE_NAMES, favouriteTraining, formOf, formProgress, hoursText, plantStats, STATS, stageOf, wellbeing, xpToNext, type GameEvent,
} from '../../game/greenhouse';
import { rarityOf } from '../../game/rarity';
import type { CareId, GameState, GreenPlant, Level3, TrainingId } from '../../game/types';
import { update, useGame, useNow } from '../../store/store';
import { toast } from '../../store/toast';
import { Meter, Sheet } from '../components/common';

const LIGHT_NAMES = ['', 'Schatten', 'Halbschatten', 'Sonne'];

const TRAINING_INFO: Record<TrainingId, { name: string; icon: string; stat: string }> = {
  wachstum: { name: 'Wachstum', icon: '🌱', stat: 'Wachstum' },
  wurzel: { name: 'Wurzeln', icon: '🪴', stat: 'Vitalität & Widerstand' },
  licht: { name: 'Licht', icon: '☀️', stat: 'Energie' },
  resistenz: { name: 'Resistenz', icon: '🛡️', stat: 'Widerstandskraft' },
  anpassung: { name: 'Anpassung', icon: '🌀', stat: 'Anpassung' },
};

export function reportEvents(state: GameState, plantId: string, events: GameEvent[]) {
  const p = state.plants.find((x) => x.id === plantId);
  const name = p ? speciesById(state, p.speciesId).de : 'Pflanze';
  for (const e of events) {
    if (e.kind === 'levelUp') toast(`⬆️ ${name} ist jetzt Level ${e.level}!`, 'good');
    if (e.kind === 'ability') toast(`✦ Neue Fähigkeit: ${abilityInfo(e.id).name}`, 'good', 4500);
    if (e.kind === 'disease') toast(`⚠️ ${name} hat ${DISEASE_NAMES[e.id]}!`, 'warn', 4500);
    if (e.kind === 'breakthrough') toast('💥 Durchbruch! Doppelter Trainingserfolg.', 'good');
    if (e.kind === 'warn') toast(e.text, 'warn', 4500);
    if (e.kind === 'info') toast(e.text, 'info');
  }
}

export function Greenhouse() {
  const state = useGame();
  const now = useNow(15_000);
  const climate = climateAt(now);
  const w = weatherView(climate);
  const [open, setOpen] = useState<string | null>(null);
  const free = BALANCE.greenhouseSlots - state.plants.length;

  function sow(seedId: string) {
    let err: string | undefined;
    update((s) => {
      const r = plantSeed(s, seedId, Date.now());
      err = r.error;
      return r.state;
    });
    if (err) toast(err, 'warn');
    else toast('🌱 Eingepflanzt! Stelle das Licht passend ein.', 'good');
  }

  return (
    <div className={`screen ${climate.night ? 'night' : ''}`}>
      <div className="screen-head">
        <div>
          <h1>Gewächshaus</h1>
          <div className="sub">{state.plants.length} von {BALANCE.greenhouseSlots} Beeten belegt</div>
        </div>
      </div>

      <section className="panel climate-panel">
        <div className="climate">
          <span className="big">{climate.night ? '🌙' : w.icon}</span>
          <div className="grow">
            <b>{climate.night ? 'Nacht' : 'Tag'} · {w.name}</b>
            <div className="small muted">{w.hint}</div>
            <div className="tiny muted">Wetterwechsel in {hoursText(climate.nextChange - now)}</div>
          </div>
        </div>
      </section>

      <div className="inventory">
        <div className="inv"><span style={{ fontSize: 26 }}>🧪</span><div><b>{state.items.duenger}</b><div className="tiny muted">Dünger</div></div></div>
        <div className="inv"><span style={{ fontSize: 26 }}>💊</span><div><b>{state.items.heilmittel}</b><div className="tiny muted">Heilmittel</div></div></div>
      </div>

      {state.seeds.length > 0 && (
        <section className="panel">
          <div className="panel-title"><h2>Samentasche</h2><span className="tag">{state.seeds.length}</span></div>
          <div className="hscroll">
            {state.seeds.map((seed) => {
              const sp = speciesById(state, seed.speciesId);
              return (
                <div key={seed.id} className={`seed r-${rarityOf(sp)}`}>
                  <PlantArt species={sp} stage="samen" />
                  <div>
                    <b className="small">{sp.de}</b>
                    <div><button className="link" onClick={() => sow(seed.id)} disabled={free <= 0}>{free > 0 ? 'Einpflanzen' : 'Kein Beet frei'}</button></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid">
        {state.plants.map((p) => {
          const sp = speciesById(state, p.speciesId);
          const wb = wellbeing(p, sp, climate);
          const form = formOf(p, sp);
          const color = wb.score >= 60 ? 'var(--leaf)' : wb.score >= 30 ? 'var(--warn)' : 'var(--danger)';
          return (
            <button key={p.id} className={`tile bed r-${rarityOf(sp)}`} onClick={() => setOpen(p.id)}>
              <PlantArt species={sp} stage={stageOf(p)} effect={form?.effect} master={p.level >= BALANCE.maxLevel} />
              <span className="lvl">Lv {p.level}</span>
              <span className="status">
                {wb.issues.includes('Durst') && <span>💧</span>}
                {wb.issues.includes('Hunger') && <span>🧪</span>}
                {p.disease && <span>⚠️</span>}
                {!p.disease && availableForms(p, sp).length > 0 && <span>✨</span>}
              </span>
              <div className="wb"><span style={{ width: `${wb.score}%`, background: color }} /></div>
              <span className="tile-name">{sp.de}{form ? ` · ${form.name}` : ''}</span>
            </button>
          );
        })}
        {Array.from({ length: Math.min(free, 3) }, (_, i) => (
          <div key={i} className="tile bed empty">{state.seeds.length ? 'Freies Beet – Samen einpflanzen' : 'Freies Beet – entdecke draußen neue Arten'}</div>
        ))}
      </div>

      {open && state.plants.some((p) => p.id === open) && <PlantSheet plantId={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

function PlantSheet({ plantId, onClose }: { plantId: string; onClose: () => void }) {
  const state = useGame();
  const now = useNow(10_000);
  const p = state.plants.find((x) => x.id === plantId) as GreenPlant;
  const sp = speciesById(state, p.speciesId);
  const climate = climateAt(now);
  const wb = wellbeing(p, sp, climate);
  const stats = plantStats(p, sp);
  const form = formOf(p, sp);
  const fav = favouriteTraining(sp);
  const conds = activeConditions(climate, p.zone);
  const trainBlock = canTrain(p);
  const evolvable = availableForms(p, sp);
  const wBand = waterBand(sp.eco);
  const nBand = nutrientBand(sp.eco);
  const rBand = reactionBand(sp.eco);
  const lamp = bestLamp(sp.eco);
  const coolZone = sp.eco.T < BALANCE.eco.temperature.warmOkAbove;
  const warmOnly = sp.eco.T > BALANCE.eco.temperature.coolOkBelow;

  function doCare(a: CareId) {
    let res: ReturnType<typeof careAction>['result'] | undefined;
    update((s) => {
      const r = careAction(s, plantId, a, Date.now());
      res = r.result;
      return r.state;
    });
    if (res && !res.ok && res.reason) toast(res.reason, 'warn');
    if (res?.ok) {
      if (!res.events.length) toast(CARE_DONE[a], 'info', 1800);
      reportEvents(state, plantId, res.events);
    }
  }

  function doTrain(t: TrainingId) {
    let res: ReturnType<typeof trainAction>['result'] | undefined;
    update((s) => {
      const r = trainAction(s, plantId, t, Date.now());
      res = r.result;
      return r.state;
    });
    if (res && !res.ok && res.reason) toast(res.reason, 'warn');
    if (res?.ok) {
      toast(`${TRAINING_INFO[t].icon} ${TRAINING_INFO[t].name}training erledigt`, 'info', 1600);
      reportEvents(state, plantId, res.events);
    }
  }

  function doEvolve(formId: string) {
    let res: ReturnType<typeof evolveAction>['result'] | undefined;
    update((s) => {
      const r = evolveAction(s, plantId, formId);
      res = r.result;
      return r.state;
    });
    if (res) reportEvents(state, plantId, res.events);
  }

  const soilWait = p.lastSoilAt + BALANCE.soilImprove.cooldownH * 3600_000 - now;
  const pruneWait = p.lastPruneAt + BALANCE.prune.cooldownH * 3600_000 - now;

  return (
    <Sheet title={`${sp.de}${form ? ` · ${form.name}` : ''}`} onClose={onClose}>
      <div className={`stack r-${rarityOf(sp)}`}>
        <div className="plant-hero">
          <div className="art"><PlantArt species={sp} stage={stageOf(p)} effect={form?.effect} background master={p.level >= BALANCE.maxLevel} /></div>
          <div className="stack" style={{ gap: 8 }}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <b style={{ fontFamily: 'var(--display)', fontSize: 26 }}>Level {p.level}</b>
              <span className="tag">{stageName(stageOf(p))}</span>
            </div>
            {p.level < BALANCE.maxLevel ? (
              <>
                <div className="bar gold"><span style={{ width: `${(p.xp / xpToNext(p.level)) * 100}%` }} /></div>
                <span className="tiny muted">{p.xp} / {xpToNext(p.level)} Erfahrung</span>
              </>
            ) : <span className="tag good">Meisterpflanze</span>}
            <div>
              <b>Wohlbefinden {wb.score}</b>
              <div className="row" style={{ gap: 6, marginTop: 4 }}>
                {wb.issues.length ? wb.issues.map((i) => <span key={i} className="tag warn">{i}</span>) : <span className="tag good">Rundum zufrieden</span>}
              </div>
            </div>
          </div>
        </div>

        {evolvable.length > 0 && (
          <section className="panel stack" style={{ borderColor: 'var(--gold)' }}>
            <h2>✨ Entwicklung möglich!</h2>
            {evolvable.map((f) => (
              <div key={f.id} className="form-card">
                <PlantArt species={sp} effect={f.effect} />
                <div className="grow">
                  <b>{f.name}</b>
                  <div className="small">{f.description}</div>
                </div>
                <button className="btn primary" onClick={() => doEvolve(f.id)}>Entwickeln</button>
              </div>
            ))}
            {evolvable.length > 1 && <p className="tiny muted">Du kannst dich nur für eine Form entscheiden.</p>}
          </section>
        )}

        <section className="panel stack">
          <h2>Pflege</h2>
          <Meter label="Wasser" value={p.water} band={wBand} />
          <Meter label="Nährstoffe" value={p.nutrients} band={nBand} />
          <Meter label="Bodenreaktion" value={p.reaction} max={10} band={[rBand[0] * 10, rBand[1] * 10]} display={reactionWord(p.reaction)} />
          <Meter label="Bodenqualität" value={p.soil} />
          <Meter label="Gesundheit" value={p.health} />
          <Meter label="Wildwuchs" value={p.overgrowth} />
          <p className="tiny muted">Die hellen Bereiche zeigen, was diese Art mag.</p>
          <div className="actions">
            <button className="btn" onClick={() => doCare('giessen')}>💧 Gießen</button>
            <button className="btn" onClick={() => doCare('duengen')} disabled={state.items.duenger <= 0}>🧪 Düngen<small>{state.items.duenger} übrig</small></button>
            <button className="btn" onClick={() => doCare('boden')} disabled={soilWait > 0}>🪱 Boden lockern{soilWait > 0 && <small>in {hoursText(soilWait)}</small>}</button>
            <button className="btn" onClick={() => doCare('schnitt')} disabled={pruneWait > 0}>✂️ Schneiden{pruneWait > 0 && <small>in {hoursText(pruneWait)}</small>}</button>
            <button className="btn" onClick={() => doCare('kalken')}>🪨 Kalk streuen<small>Boden kalkiger</small></button>
            <button className="btn" onClick={() => doCare('ansaeuern')}>🍂 Laubhumus geben<small>Boden saurer</small></button>
            {p.disease && <button className="btn" onClick={() => doCare('behandeln')} disabled={state.items.heilmittel <= 0}>💊 {DISEASE_NAMES[p.disease]} behandeln<small>{state.items.heilmittel} übrig</small></button>}
          </div>
          <div>
            <div className="small" style={{ marginBottom: 6 }}>Licht – diese Art mag am liebsten <b>{LIGHT_NAMES[lamp]}</b> <span className="muted">(Zeigerwert {sp.eco.L.toLocaleString('de-DE')})</span></div>
            <div className="seg">
              {([1, 2, 3] as Level3[]).map((l) => (
                <button key={l} aria-pressed={p.light === l} onClick={() => update((s) => lightAction(s, plantId, l))}>{LIGHT_NAMES[l]}</button>
              ))}
            </div>
          </div>
          <div>
            <div className="small" style={{ marginBottom: 6 }}>
              Standort – diese Art mag es <b>{temperatureWord(sp.eco.T)}</b>
              {coolZone ? ': am besten Höhenkammer' : warmOnly ? ': nicht in die Höhenkammer' : ''}
            </div>
            <div className="seg two">
              <button aria-pressed={p.zone === 'tal'} onClick={() => update((s) => zoneAction(s, plantId, 'tal'))}>Tieflandbeet</button>
              <button aria-pressed={p.zone === 'hoehe'} onClick={() => update((s) => zoneAction(s, plantId, 'hoehe'))}>Höhenkammer</button>
            </div>
          </div>
        </section>

        <section className="panel stack">
          <div className="panel-title"><h2>Training</h2><span className="tag">Energie {Math.floor(p.energy)}</span></div>
          <div className="bar"><span style={{ width: `${p.energy}%`, background: 'linear-gradient(90deg,#6cc3e8,#b6ecff)' }} /></div>
          <p className="tiny muted">
            Jedes Training kostet {BALANCE.trainingEnergy} Energie. {conds.length ? `Zählt jetzt auch für: ${conds.map((c) => CONDITION_NAMES[c]).join(', ')}.` : ''}
          </p>
          {trainBlock && <p className="notice small">{trainBlock}</p>}
          <div className="actions">
            {(Object.keys(TRAINING_INFO) as TrainingId[]).map((t) => (
              <button key={t} className={`btn ${t === fav ? 'fav' : ''}`} disabled={!!trainBlock} onClick={() => doTrain(t)}>
                {TRAINING_INFO[t].icon} {TRAINING_INFO[t].name}{t === fav ? ' ★' : ''}
                <small>{TRAINING_INFO[t].stat} · {p.trainCount[t]}×</small>
              </button>
            ))}
          </div>
          <p className="tiny muted">★ Lieblingstraining dieser Art: bringt 50 % mehr Erfahrung.</p>
        </section>

        <section className="panel stack">
          <h2>Werte</h2>
          {STATS.map((s) => <Meter key={s} label={STAT_NAMES[s]} value={stats[s]} max={Math.max(60, ...Object.values(stats))} tone="gold" />)}
        </section>

        <section className="panel">
          <h2>Fähigkeiten</h2>
          {sp.abilities.map((id, i) => {
            const a = abilityInfo(id);
            const has = p.abilities.includes(id);
            return (
              <div key={id} className={`ability ${has ? '' : 'locked'}`}>
                <div className="ico">{has ? '✦' : '🔒'}</div>
                <div>
                  <b>{a.name}</b>
                  <div className="small">{a.description}</div>
                  {!has && <div className="tiny muted">Ab Level {BALANCE.abilityLevels[i]} oder nach {BALANCE.abilityTrainingUnlock}× {TRAINING_INFO[a.trainKey].name}training ({p.trainCount[a.trainKey]}/{BALANCE.abilityTrainingUnlock})</div>}
                </div>
              </div>
            );
          })}
        </section>

        {!form && (
          <section className="panel stack">
            <h2>Entwicklungswege</h2>
            {sp.forms.map((f) => {
              const pr = formProgress(p, f);
              const how = f.trigger.kind === 'condition' ? `Training bei ${CONDITION_NAMES[f.trigger.id]}` : `${TRAINING_INFO[f.trigger.id].name}training`;
              return (
                <div key={f.id}>
                  <div className="row small" style={{ justifyContent: 'space-between' }}>
                    <b>{f.name}</b>
                    <span className="muted">{how}: {pr.have}/{pr.need}</span>
                  </div>
                  <div className="bar"><span style={{ width: `${(pr.have / pr.need) * 100}%` }} /></div>
                </div>
              );
            })}
            <p className="tiny muted">Entwicklung ab Level {BALANCE.evolveLevel}. Nur eine Form ist möglich – wähle mit Bedacht.</p>
          </section>
        )}
      </div>
    </Sheet>
  );
}

const CARE_DONE: Record<CareId, string> = {
  giessen: '💧 Gegossen',
  duengen: '🧪 Gedüngt',
  boden: '🪱 Boden gelockert',
  schnitt: '✂️ Geschnitten',
  behandeln: '💊 Behandelt',
  kalken: '🪨 Kalk gestreut',
  ansaeuern: '🍂 Laubhumus gegeben',
};

function stageName(s: ReturnType<typeof stageOf>): string {
  return s === 'keimling' ? 'Keimling' : s === 'jung' ? 'Jungpflanze' : 'Ausgewachsen';
}
