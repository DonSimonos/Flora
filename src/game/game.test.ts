import { describe, expect, it } from 'vitest';
import { SPECIES } from '../data/species';
import { ABILITIES } from '../data/abilities';
import { BALANCE as B } from './config';
import { climateAt } from './climate';
import { matchSpecies, speciesById } from './catalog';
import * as game from './game';
import * as gh from './greenhouse';
import { rarityFrom, rarityOf } from './rarity';
import { rngFor } from './rng';
import type { Find, GameState } from './types';
import { load, parse, serialize, store } from '../store/save';

const H = 3600_000;
const T0 = new Date('2026-06-15T10:00:00').getTime();

function find(id: string): Find {
  return {
    id, createdAt: new Date(T0).toISOString(), lat: 52.4, lng: 9.7, accuracy: 8, locSource: 'gps', photoId: 'p' + id,
    status: 'pending', candidates: [], speciesId: null, verified: false, score: null, error: null, attempts: 0,
  };
}

function withPlant(speciesId: string): { s: GameState; plantId: string } {
  let s = game.addFind(game.newGame(), find('f1'));
  s = game.confirmFind(s, 'f1', { speciesId, score: 0.9, verified: true });
  const r = game.plantSeed(s, s.seeds[0].id, T0);
  return { s: r.state, plantId: r.state.plants[0].id };
}

describe('Daten', () => {
  it('hat mindestens 30 gezeichnete Arten mit gültigen Fähigkeiten und eindeutigen ids', () => {
    expect(SPECIES.filter((s) => s.art).length).toBeGreaterThanOrEqual(30);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(SPECIES.length);
    const ids = new Set(ABILITIES.map((a) => a.id));
    for (const s of SPECIES) {
      expect(s.abilities.length).toBe(3);
      for (const a of s.abilities) expect(ids.has(a), `${s.id}: ${a}`).toBe(true);
      expect(s.forms.length).toBe(2);
    }
  });

  it('deckt alle Seltenheitsstufen ab', () => {
    const rs = new Set(SPECIES.filter((s) => s.art).map(rarityOf));
    expect(rs.size).toBe(6);
  });
});

describe('Seltenheit', () => {
  it('folgt der abgestimmten Zuordnung', () => {
    expect(rarityFrom('1', 'es')).toBe('mythisch');
    expect(rarityFrom('0', 'ex')).toBe('mythisch');
    expect(rarityFrom('2', 'ss')).toBe('legendaer');
    expect(rarityFrom('R', 'es')).toBe('legendaer');
    expect(rarityFrom('3', 's')).toBe('episch');
    expect(rarityFrom('G', 's')).toBe('episch');
    expect(rarityFrom('V', 'mh')).toBe('selten');
    expect(rarityFrom('*', 'sh')).toBe('gewoehnlich');
    expect(rarityFrom('*', 's')).toBe('ungewoehnlich');
    expect(rarityFrom('D', 'ss')).toBe('selten');
  });
});

describe('Namensabgleich', () => {
  it('erkennt Arten, Synonyme und Autorenangaben', () => {
    expect(matchSpecies('Drosera rotundifolia L.')?.id).toBe('sonnentau');
    expect(matchSpecies('Leontopodium alpinum')?.id).toBe('edelweiss');
    expect(matchSpecies('Taraxacum officinale')?.id).toBe('loewenzahn');
    expect(matchSpecies('Taraxacum rubicundum')?.id).toBe('loewenzahn');
    expect(matchSpecies('Quercus robur')).toBeNull();
  });
});

describe('Zufall', () => {
  it('ist reproduzierbar', () => {
    const a = rngFor('x', 1);
    const b = rngFor('x', 1);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
    expect(climateAt(T0)).toEqual(climateAt(T0 + 1000));
  });
});

describe('Entdecken', () => {
  it('neue Art bringt Samen, Gegenstände und eine Enthüllung', () => {
    let s = game.addFind(game.newGame(), find('f1'));
    s = game.confirmFind(s, 'f1', { speciesId: 'arnika', score: 0.8, verified: true });
    expect(s.discovered).toEqual(['arnika']);
    expect(s.seeds).toHaveLength(1);
    expect(s.items.duenger).toBe(B.startItems.duenger + 2); // 1 + episch bonus 1
    expect(s.revealQueue[0]).toMatchObject({ isNew: true, seedGained: true });
    expect(s.finds[0]).toMatchObject({ status: 'confirmed', verified: true });
    // doppeltes Bestätigen ändert nichts
    expect(game.confirmFind(s, 'f1', { speciesId: 'arnika', score: 0.8, verified: true })).toBe(s);
  });

  it('Wiederfunde geben Erfahrung an Pflanzen derselben Art und jeder 5. Fund einen Samen', () => {
    let { s } = withPlant('loewenzahn');
    for (let i = 2; i <= 5; i++) {
      s = game.addFind(s, find('f' + i));
      s = game.confirmFind(s, 'f' + i, { speciesId: 'loewenzahn', score: 0.7, verified: true });
    }
    expect(s.findCount.loewenzahn).toBe(5);
    expect(s.seeds).toHaveLength(1); // 1st seed planted, 5th find gave a new one
    expect(s.plants[0].level).toBeGreaterThan(1);
    expect(s.revealQueue.at(-1)?.isNew).toBe(false);
  });

  it('unbekannte Arten werden als neue Art aufgenommen', () => {
    let s = game.addFind(game.newGame(), find('f1'));
    s = game.confirmFind(s, 'f1', { sci: 'Quercus robur L.', de: 'Stiel-Eiche', family: 'Fagaceae', score: 0.6, verified: true });
    expect(s.extraSpecies).toHaveLength(1);
    expect(s.discovered[0]).toBe('x_quercus_robur');
    expect(speciesById(s, 'x_quercus_robur').de).toBe('Stiel-Eiche');
  });

  it('Kandidaten werden gefiltert und abgeglichen', () => {
    const c = game.withCandidates([
      { sci: 'Drosera rotundifolia', de: null, family: null, score: 0.7 },
      { sci: 'Drosera anglica', de: 'Langblättriger Sonnentau', family: null, score: 0.1 },
      { sci: 'Pinguicula vulgaris', de: null, family: null, score: 0.01 },
    ]);
    expect(c).toHaveLength(2);
    expect(c[0]).toMatchObject({ speciesId: 'sonnentau', de: 'Rundblättriger Sonnentau' });
    expect(c[1].speciesId).toBeNull();
  });
});

describe('Gewächshaus', () => {
  it('Zeit läuft sanft: nach einer Woche Pause ist nichts verloren', () => {
    const { s, plantId } = withPlant('sonnentau');
    const r = game.tickAll(s, T0 + 7 * 24 * H);
    const p = r.state.plants.find((x) => x.id === plantId)!;
    expect(p.health).toBeGreaterThanOrEqual(B.floors.health);
    expect(p.water).toBeGreaterThanOrEqual(B.floors.water);
    expect(p.level).toBeGreaterThanOrEqual(1);
  });

  it('häufige kleine Ticks ergeben trotzdem Wachstum', () => {
    const { s } = withPlant('loewenzahn');
    let st = s;
    for (let i = 1; i <= 240; i++) st = game.tickAll(st, T0 + i * 60_000).state; // 4 Stunden in Minutenschritten
    const p = st.plants[0];
    expect(p.level > 1 || p.xp > 0).toBe(true);
  });

  it('Training kostet Energie, steigert Werte und braucht Erholung', () => {
    const { s, plantId } = withPlant('arnika');
    const sp = speciesById(s, 'arnika');
    const before = gh.plantStats(s.plants[0], sp);
    let st = s;
    for (let i = 0; i < 4; i++) st = game.trainAction(st, plantId, 'anpassung', T0 + i * 1000).state;
    const r = game.trainAction(st, plantId, 'anpassung', T0 + 5000);
    expect(r.result.ok).toBe(false);
    expect(r.result.reason).toMatch(/Energie/);
    const after = gh.plantStats(st.plants[0], sp);
    expect(after.anpassung).toBeGreaterThan(before.anpassung);
    expect(st.plants[0].trainCount.anpassung).toBe(4);
  });

  it('Dünger schadet Arten magerer Böden', () => {
    const { s, plantId } = withPlant('arnika');
    let st = s;
    st = game.careAction(st, plantId, 'duengen', T0).state;
    const r = game.careAction(st, plantId, 'duengen', T0 + 1000);
    expect(r.result.events.some((e) => e.kind === 'warn')).toBe(true);
    expect(r.state.items.duenger).toBe(s.items.duenger - 2);
  });

  it('Pflege ohne Vorrat ist nicht möglich', () => {
    const { s, plantId } = withPlant('loewenzahn');
    const empty = { ...s, items: { duenger: 0, heilmittel: 0 } };
    expect(game.careAction(empty, plantId, 'duengen', T0).result.ok).toBe(false);
  });

  it('Level, Fähigkeiten und Entwicklung', () => {
    const { s, plantId } = withPlant('sonnentau');
    const sp = speciesById(s, 'sonnentau');
    const p0 = s.plants[0];
    const events: gh.GameEvent[] = [];
    let p = gh.addXp(p0, sp, 10_000_000, events);
    expect(p.level).toBe(B.maxLevel);
    expect(p.abilities).toEqual(sp.abilities);
    expect(events.filter((e) => e.kind === 'levelUp')).toHaveLength(B.maxLevel - 1);
    expect(gh.availableForms(p, sp)).toHaveLength(0);
    p = { ...p, condCount: { ...p.condCount, regen: 8 } };
    expect(gh.availableForms(p, sp).map((f) => f.id)).toEqual(['rubintau']);
    const st = game.evolveAction({ ...s, plants: [p] }, plantId, 'rubintau').state;
    expect(st.plants[0].formId).toBe('rubintau');
    expect(gh.plantStats(st.plants[0], sp).vitalitaet).toBeGreaterThan(gh.plantStats(p, sp).vitalitaet);
  });

  it('Fortschritt bis Level 50 dauert Wochen, nicht Stunden', () => {
    let total = 0;
    for (let l = 1; l < B.maxLevel; l++) total += gh.xpToNext(l);
    const perDayLate = 12 * B.trainingXp(40) + 24 * B.passiveXpPerHour(40);
    expect(total / perDayLate).toBeGreaterThan(30);
    // ein neues Level in den ersten Minuten ist möglich
    expect(gh.xpToNext(1)).toBeLessThan(B.trainingXp(1) * 2);
  });
});

describe('Speichern', () => {
  it('schreibt, liest und fällt auf die Sicherung zurück', () => {
    const mem = new Map<string, string>();
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    const { s } = withPlant('arnika');
    store(storage, game.newGame());
    store(storage, s);
    expect(load(storage)).toMatchObject({ source: 'save' });
    expect(load(storage).state.plants).toHaveLength(1);
    mem.set('flora-save', '{kaputt');
    expect(load(storage).source).toBe('backup');
    expect(parse(serialize(s))?.discovered).toEqual(['arnika']);
    expect(parse(JSON.stringify({ version: 999, state: s }))).toBeNull();
  });
});
