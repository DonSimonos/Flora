import { useState } from 'react';
import { PlantArt } from '../../art/PlantArt';
import { abilityInfo } from '../../data/abilities';
import { BALANCE, CONDITION_NAMES, STAT_NAMES } from '../../game/config';
import { activeConditions, climateAt, weatherView } from '../../game/climate';
import { bestLamp, moistureWord, nutrientBand, nutrientWord, reactionBand, reactionWord, temperatureWord, waterBand } from '../../game/ecology';
import { speciesById } from '../../game/catalog';
import { careAction, defaultRoom, evolveAction, lightAction, moveAction, plantSeed, trainAction } from '../../game/game';
import { bestRoom, roomStatuses, setpoints } from '../../game/rooms';
import { ROOMS, roomInfo, type RoomId } from '../../data/rooms';
import { RoomScene } from '../../art/RoomScene';
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
  const [roomId, setRoomId] = useState<RoomId>(() => {
    try {
      return (localStorage.getItem('flora-room') as RoomId) || 'anzucht';
    } catch {
      return 'anzucht';
    }
  });
  const statuses = roomStatuses(state);
  const st = statuses.find((r) => r.id === roomId) ?? statuses[0];
  const room = roomInfo(st.id);
  const plants = state.plants.filter((p) => p.room === st.id);
  const free = Math.max(0, st.slots - st.used);
  const totalSlots = statuses.reduce((n, r) => n + r.slots, 0);
  const secretsLeft = ROOMS.filter((r) => r.kennarten && !statuses.find((x) => x.id === r.id)!.unlocked).length;

  function choose(id: RoomId) {
    setRoomId(id);
    try {
      localStorage.setItem('flora-room', id);
    } catch {
      /* private mode */
    }
  }

  function sow(seedId: string, speciesId: string) {
    let err: string | undefined;
    let target: RoomId = 'anzucht';
    update((s) => {
      target = defaultRoom(s, speciesId);
      const r = plantSeed(s, seedId, Date.now(), target);
      err = r.error;
      return r.state;
    });
    if (err) toast(err, 'warn');
    else {
      toast(`🌱 Eingepflanzt im ${roomInfo(target).name}!`, 'good');
      choose(target);
    }
  }

  const tabs = statuses.filter((r) => r.unlocked || !roomInfo(r.id).kennarten);

  return (
    <div className={`screen ${climate.night ? 'night' : ''}`}>
      <div className="screen-head">
        <div>
          <h1>Gewächshaus</h1>
          <div className="sub">{state.plants.length} von {totalSlots} Beeten belegt · {statuses.filter((r) => r.unlocked).length - 1} Lebensräume offen</div>
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
              const target = defaultRoom(state, seed.speciesId);
              const best = bestRoom(sp);
              const tst = statuses.find((r) => r.id === target)!;
              return (
                <div key={seed.id} className={`seed r-${rarityOf(sp)}`}>
                  <PlantArt species={sp} stage="samen" />
                  <div>
                    <b className="small">{sp.de}</b>
                    <div className="tiny muted">passt in: {roomInfo(best).icon} {roomInfo(best).name}</div>
                    <div>
                      <button className="link" onClick={() => sow(seed.id, seed.speciesId)} disabled={tst.used >= tst.slots}>
                        {tst.used >= tst.slots ? 'Kein Beet frei' : `Einpflanzen${target !== best ? ' (Anzuchthaus)' : ''}`}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="chips room-tabs" role="tablist" aria-label="Räume">
        {tabs.map((r) => {
          const info = roomInfo(r.id);
          return (
            <button key={r.id} role="tab" className="chip" aria-pressed={r.id === st.id} onClick={() => choose(r.id)}>
              {r.unlocked ? info.icon : '🔒'} {info.name}
              {r.unlocked ? ` ${r.used}/${r.slots}` : ` ${r.found}/${r.need}`}
            </button>
          );
        })}
        {secretsLeft > 0 && <span className="chip" aria-disabled>✨ {secretsLeft} Geheimräume</span>}
      </div>

      <section className="room-card">
        <RoomScene id={st.id} className="room-scene" />
        <div className="room-info">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <h2>{room.icon} {room.name}</h2>
            <span className="tag">{room.code}</span>
          </div>
          <p className="small">{room.description}</p>
          {st.id !== 'anzucht' && (
            <p className="tiny muted">
              Hält von selbst: {moistureWord(room.profile.M)} · {reactionWord(room.profile.R)} · {nutrientWord(room.profile.N)} · Licht {LIGHT_NAMES[setpoints(st.id).lamp]} · {temperatureWord(room.profile.T)}
            </p>
          )}
        </div>
      </section>

      {!st.unlocked ? (
        <p className="notice">
          🔒 Noch verschlossen. Entdecke draußen <b>{st.need - st.found}</b> weitere {st.need - st.found === 1 ? 'Art' : 'Arten'}, die hierher passen.
        </p>
      ) : (
        <div className="grid">
          {plants.map((p) => {
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
          {Array.from({ length: st.id === 'anzucht' ? Math.min(free, 3) : free }, (_, i) => (
            <div key={i} className="tile bed empty">{state.seeds.length ? 'Freies Beet – Samen einpflanzen' : 'Freies Beet – entdecke draußen neue Arten'}</div>
          ))}
        </div>
      )}
      {st.unlocked && st.id !== 'anzucht' && st.slots < BALANCE.rooms.maxSlots && (
        <p className="tiny muted">Mehr Beete: Für je {BALANCE.rooms.extraPer} weitere passende Arten wächst dieser Raum um ein Beet (bis {BALANCE.rooms.maxSlots}).</p>
      )}

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
  const conds = activeConditions(climate, p.room);
  const trainBlock = canTrain(p);
  const evolvable = availableForms(p, sp);
  const wBand = waterBand(sp.eco);
  const nBand = nutrientBand(sp.eco);
  const rBand = reactionBand(sp.eco);
  const lamp = bestLamp(sp.eco);
  const best = bestRoom(sp);
  const statusesNow = roomStatuses(state);
  const bestSt = statusesNow.find((r) => r.id === best)!;
  const others = statusesNow.filter((r) => r.unlocked && r.id !== p.room && r.id !== best && r.used < r.slots);

  function move(room: RoomId) {
    let err: string | undefined;
    update((s) => {
      const r = moveAction(s, plantId, room);
      err = r.error;
      return r.state;
    });
    if (err) toast(err, 'warn');
    else if (room !== p.room) toast(`🏠 Umgezogen ins ${roomInfo(room).name}`, 'info');
  }

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
          {p.room === 'anzucht' ? (
            <div>
              <div className="small" style={{ marginBottom: 6 }}>Licht – diese Art mag am liebsten <b>{LIGHT_NAMES[lamp]}</b> <span className="muted">(Zeigerwert {sp.eco.L.toLocaleString('de-DE')})</span></div>
              <div className="seg">
                {([1, 2, 3] as Level3[]).map((l) => (
                  <button key={l} aria-pressed={p.light === l} onClick={() => update((s) => lightAction(s, plantId, l))}>{LIGHT_NAMES[l]}</button>
                ))}
              </div>
            </div>
          ) : (
            <p className="small">Licht: <b>{LIGHT_NAMES[setpoints(p.room).lamp]}</b> – stellt der Raum ein. Die Art mag am liebsten {LIGHT_NAMES[lamp]}.</p>
          )}
        </section>

        <section className="panel stack">
          <h2>Raum</h2>
          <p className="small">
            Steht im <b>{roomInfo(p.room).icon} {roomInfo(p.room).name}</b>.{' '}
            {p.room !== 'anzucht' ? 'Der Raum hält Wasser, Nährstoffe und Bodenreaktion von selbst.' : 'Hier stellst du Wasser, Boden und Licht selbst ein.'}
          </p>
          {p.room === best ? (
            <p className="tag good">✓ Steht schon im passenden Raum</p>
          ) : (
            <div className="move-box">
              <div className="small">Passt am besten in:</div>
              <b>{bestSt.unlocked || !roomInfo(best).kennarten ? `${roomInfo(best).icon} ${roomInfo(best).name}` : '✨ einen Geheimraum'}</b>
              {bestSt.unlocked && bestSt.used < bestSt.slots ? (
                <button className="btn primary block" onClick={() => move(best)}>Jetzt umziehen ★</button>
              ) : !bestSt.unlocked ? (
                <p className="small muted">
                  🔒 Noch verschlossen. Entdecke draußen noch {bestSt.need - bestSt.found} {roomInfo(best).kennarten ? (bestSt.need - bestSt.found === 1 ? 'Kennart' : 'Kennarten') : bestSt.need - bestSt.found === 1 ? 'passende Art' : 'passende Arten'}, dann öffnet sich der Raum und du kannst hierher umziehen.
                </p>
              ) : (
                <p className="small muted">Alle {bestSt.slots} Beete sind belegt. Mit weiteren passenden Funden bekommt der Raum mehr Beete.</p>
              )}
            </div>
          )}
          {others.length > 0 && (
            <>
              <div className="small">Oder umziehen nach:</div>
              <div className="chips">
                {others.map((r) => (
                  <button key={r.id} className="chip" onClick={() => move(r.id)}>
                    {roomInfo(r.id).icon} {roomInfo(r.id).name}
                  </button>
                ))}
              </div>
            </>
          )}
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
