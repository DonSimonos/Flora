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

  it('selbst eingetragene Arten zählen, auch ohne wissenschaftlichen Namen', () => {
    let s = game.addFind(game.newGame(), find('f1'));
    s = game.confirmFind(s, 'f1', { sci: '', de: 'Kleiner Wasserschlauch', family: null, score: null, verified: false });
    expect(s.discovered).toEqual(['x_kleiner_wasserschlauch']);
    expect(s.finds[0]).toMatchObject({ verified: false, score: null });
    // ein eingetippter Name der Liste wird der eingebauten Art zugeordnet
    s = game.addFind(s, find('f2'));
    s = game.confirmFind(s, 'f2', { sci: 'Utricularia vulgaris', de: 'Wasserschlauch', family: null, score: null, verified: false });
    expect(s.discovered).toContain('wasserschlauch');
    expect(s.extraSpecies).toHaveLength(1);
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

describe('Rote Liste (Metzing et al. 2018)', () => {
  it('liefert offizielle Werte für eingebaute Arten', async () => {
    const { SPECIES } = await import('../data/species');
    const by = (id: string) => SPECIES.find((s) => s.id === id)!;
    expect(by('sonnentau')).toMatchObject({ rl: '3', rlOfficial: true });
    expect(by('wasserschlauch')).toMatchObject({ rl: '3', bestand: 'mh' });
    expect(by('edelweiss').rlOfficial).toBe(true); // über Synonym Leontopodium alpinum
    expect(by('wasserfenchel')).toMatchObject({ rl: '1', endemic: true });
    expect(SPECIES.every((s) => s.rlOfficial)).toBe(true);
  });

  it('findet Namen mit Autor, Artengruppen und gibt unbekannten Namen nichts', async () => {
    const { lookupRedList, searchRedList } = await import('./redlist');
    expect(lookupRedList('Utricularia minor L.')?.de).toBe('Kleiner Wasserschlauch');
    expect(lookupRedList('Utricularia vulgaris')?.rl).toBe('3'); // Art schlägt Artengruppe
    expect(lookupRedList('Utricularia vulgaris agg.')?.rl).toBe('V');
    expect(lookupRedList('Phantasia inventa')).toBeNull();
    expect(searchRedList('wassersch').some((e) => e.name === 'Utricularia minor')).toBe(true);
  });

  it('neue Arten außerhalb der Liste bekommen die offizielle Seltenheit', () => {
    let s = game.addFind(game.newGame(), find('f1'));
    s = game.confirmFind(s, 'f1', { sci: 'Utricularia minor', de: null, family: null, score: null, verified: false });
    const sp = speciesById(s, s.discovered[0]);
    expect(sp).toMatchObject({ de: 'Kleiner Wasserschlauch', rl: '3', rlOfficial: true });
    expect(rarityOf(sp)).toBe('episch');
  });
});

describe('Schutz der Fundorte', () => {
  it('TK25-Feld für Kategorie 1 und extrem seltene Arten', async () => {
    const { publicLocation, precisionFor, tk25 } = await import('./privacy');
    expect(tk25(52.374, 9.738).number).toBe('3624'); // Hannover
    expect(precisionFor({ rl: '1', bestand: 'ss' })).toBe('tk25');
    expect(precisionFor({ rl: '*', bestand: 'es' })).toBe('tk25');
    expect(precisionFor({ rl: '3', bestand: 'mh' })).toBe('ca300m');
    expect(precisionFor({ rl: 'V', bestand: 'mh' })).toBe('genau');
    const p = publicLocation(52.374, 9.738, { rl: '1', bestand: 'es' });
    expect(p.tk25).toBe('3624');
    // the cell centre, not the real place
    expect(Math.abs(p.lat - 52.374) + Math.abs(p.lng - 9.738)).toBeGreaterThan(0.01);
  });

  it('300-m-Vergröberung bleibt innerhalb von 300 m und ist stabil', async () => {
    const { coarse300 } = await import('./privacy');
    const dist = (a: number, b: number, c: number, d: number) =>
      Math.hypot((a - c) * 111_320, (b - d) * 111_320 * Math.cos((a * Math.PI) / 180));
    for (let i = 0; i < 200; i++) {
      const lat = 47.5 + (i * 0.0377) % 7.5;
      const lng = 6 + (i * 0.0613) % 9;
      const c = coarse300(lat, lng);
      expect(dist(lat, lng, c.lat, c.lng)).toBeLessThanOrEqual(300);
      expect(coarse300(lat, lng)).toEqual(c); // same place, same shown point
    }
  });
});

describe('Artendatenbank und Zeigerwerte (EIVE 1.0)', () => {
  it('alle eingebauten Arten haben echte Zeigerwerte', async () => {
    const { SPECIES } = await import('../data/species');
    const missing = SPECIES.filter((s) => s.ecoSource !== 'eive').map((s) => s.id);
    expect(missing).toEqual([]);
    const sonnentau = SPECIES.find((s) => s.id === 'sonnentau')!;
    expect(sonnentau.eco.R).toBeLessThan(2); // Moor: sehr sauer
    expect(sonnentau.ellenberg?.[0]).toBe(9); // Ellenberg F 9
  });

  it('artInfo verbindet Rote Liste, EIVE und Ellenberg', async () => {
    const { artInfo } = await import('./artendb');
    const a = artInfo('Arnica montana L.')!;
    expect(a.redList.rl).toBe('3');
    expect(a.eco!.N).toBeLessThan(3);
    expect(a.ellenberg).toEqual([5, 2, 3, 9, 4]);
    expect(artInfo('Phantasia inventa')).toBeNull();
  });

  it('neu gefundene Arten bekommen ihre Zeigerwerte', () => {
    let s = game.addFind(game.newGame(), find('f1'));
    s = game.confirmFind(s, 'f1', { sci: 'Bromus erectus', de: null, family: null, score: 0.8, verified: true });
    const sp = speciesById(s, s.discovered[0]);
    expect(sp.ecoSource).toBe('eive');
    expect(sp.eco.R).toBeGreaterThan(6); // Kalk-Magerrasen
  });
});

describe('Ökologie im Gewächshaus', () => {
  it('Bänder folgen den Zeigerwerten', async () => {
    const eco = await import('./ecology');
    const { SPECIES } = await import('../data/species');
    const by = (id: string) => SPECIES.find((s) => s.id === id)!.eco;
    expect(eco.waterBand(by('wasserfenchel'))[0]).toBeGreaterThan(eco.waterBand(by('stranddistel'))[1] - 20);
    expect(eco.nutrientBand(by('brennnessel'))[0]).toBeGreaterThan(eco.nutrientBand(by('sonnentau'))[1]);
    expect(eco.bestLamp(by('wurmfarn'))).toBeLessThan(eco.bestLamp(by('arnika')));
    expect(eco.reactionBand(by('frauenschuh'))[0]).toBeGreaterThan(eco.reactionBand(by('sonnentau'))[1]);
  });

  it('Sonnentau braucht sauren Boden: Laubhumus hilft, Kalk schadet', () => {
    const { s, plantId } = withPlant('sonnentau');
    const sp = speciesById(s, 'sonnentau');
    const climate = climateAt(T0);
    const before = gh.wellbeing(s.plants[0], sp, climate);
    expect(before.issues).toContain('Boden zu kalkig');
    let st = s;
    for (let i = 0; i < 3; i++) st = game.careAction(st, plantId, 'ansaeuern', T0 + i).state;
    expect(gh.wellbeing(st.plants[0], sp, climate).issues).not.toContain('Boden zu kalkig');
    const lime = game.careAction(st, plantId, 'kalken', T0 + 10);
    expect(lime.state.plants[0].reaction).toBeGreaterThan(st.plants[0].reaction);
  });

  it('Bodenreaktion kehrt langsam zu neutral zurück', () => {
    const { s, plantId } = withPlant('sonnentau');
    let st = s;
    for (let i = 0; i < 3; i++) st = game.careAction(st, plantId, 'ansaeuern', T0 + i).state;
    const acid = st.plants[0].reaction;
    const later = game.tickAll(st, T0 + 24 * H).state.plants[0].reaction;
    expect(later).toBeGreaterThan(acid);
    expect(later).toBeLessThanOrEqual(BALANCE_NEUTRAL);
  });

  it('Edelweiß fühlt sich in den Alpen wohler als im Anzuchthaus', () => {
    const { s, plantId } = withPlant('edelweiss');
    const sp = speciesById(s, 'edelweiss');
    const c = climateAt(T0);
    const anzucht = gh.wellbeing(s.plants[0], sp, c);
    const alpen = gh.wellbeing({ ...s.plants.find((p) => p.id === plantId)!, room: 'alpen' }, sp, c);
    expect(anzucht.issues).toContain('Zu warm hier');
    expect(alpen.score).toBeGreaterThan(anzucht.score);
  });

  it('alte Spielstände (Version 1) werden umgestellt', () => {
    const { s } = withPlant('arnika');
    const old = { ...s, plants: s.plants.map(({ reaction: _r, ...p }) => p) };
    const loaded = parse(JSON.stringify({ version: 1, savedAt: '', state: old }))!;
    expect(loaded.plants[0].reaction).toBe(BALANCE_NEUTRAL);
  });
});

const BALANCE_NEUTRAL = B.eco.reaction.neutral;

describe('Lebensraum-Räume', () => {
  function discover(ids: string[]): GameState {
    let s = game.newGame();
    ids.forEach((id, i) => {
      s = game.addFind(s, find('r' + i));
      s = game.confirmFind(s, 'r' + i, { speciesId: id, score: 0.9, verified: true });
    });
    return s;
  }

  it('ordnet Arten über die Zeigerwerte passenden Räumen zu', async () => {
    const { bestRoom } = await import('./rooms');
    const { SPECIES } = await import('../data/species');
    const room = (id: string) => bestRoom(SPECIES.find((x) => x.id === id)!);
    expect(room('sonnentau')).toBe('moor');
    expect(room('teichrose')).toBe('teich');
    expect(room('edelweiss')).toBe('alpen');
    expect(room('stranddistel')).toBe('salz');
    expect(room('besenheide')).toBe('heide');
    expect(room('fliegenragwurz')).toBe('kalkrasen');
    expect(room('ackerrittersporn')).toBe('kalkacker'); // Kennart
  });

  it('ein Raum öffnet sich nach 3 passenden Arten und wächst mit', async () => {
    const { roomStatus } = await import('./rooms');
    let s = discover(['sonnentau', 'wollgras']);
    expect(roomStatus(s, 'moor').unlocked).toBe(false);
    s = discover(['sonnentau', 'wollgras', 'moorlilie']);
    expect(roomStatus(s, 'moor')).toMatchObject({ unlocked: true, slots: 2 });
    expect(s.revealQueue.at(-1)?.newRooms).toEqual(['moor']);
    s = discover(['sonnentau', 'wollgras', 'moorlilie', 'glockenheide', 'moosbeere', 'sumpfporst']);
    expect(roomStatus(s, 'moor').slots).toBe(3);
  });

  it('Geheimraum: eine gefährdete Kennart öffnet sofort, sonst zwei', async () => {
    const { roomStatus } = await import('./rooms');
    let s = game.addFind(game.newGame(), find('k1'));
    s = game.confirmFind(s, 'k1', { sci: 'Malva neglecta', de: null, family: null, score: 0.9, verified: true }); // RL *
    expect(roomStatus(s, 'hofsaum').unlocked).toBe(false);
    s = game.addFind(s, find('k2'));
    s = game.confirmFind(s, 'k2', { sci: 'Ballota nigra', de: null, family: null, score: 0.9, verified: true });
    expect(roomStatus(s, 'hofsaum').unlocked).toBe(true);
    let t = game.addFind(game.newGame(), find('k3'));
    t = game.confirmFind(t, 'k3', { sci: 'Lobelia dortmanna', de: null, family: null, score: 0.9, verified: true }); // RL 1
    expect(roomStatus(t, 'heideweiher').unlocked).toBe(true);
    expect(t.revealQueue.at(-1)?.newRooms).toEqual(['heideweiher']);
  });

  it('Samen kommen in ihren Raum, wenn er offen ist; der Raum hält seine Bedingungen', async () => {
    const { setpoints } = await import('./rooms');
    const s = discover(['sonnentau', 'wollgras', 'moorlilie']);
    const seed = s.seeds.find((x) => x.speciesId === 'sonnentau')!;
    const r = game.plantSeed(s, seed.id, T0);
    const plant = r.state.plants[0];
    expect(plant.room).toBe('moor');
    const later = game.tickAll(r.state, T0 + 24 * H).state.plants[0];
    const sp = setpoints('moor');
    expect(Math.abs(later.reaction - sp.reaction)).toBeLessThan(0.5);
    expect(Math.abs(later.water - sp.water)).toBeLessThan(10);
    expect(gh.wellbeing(later, speciesById(s, 'sonnentau'), climateAt(T0 + 24 * H)).issues).not.toContain('Boden zu kalkig');
  });

  it('Umziehen nur in offene Räume mit freiem Beet', () => {
    const { s, plantId } = withPlant('sonnentau');
    expect(game.moveAction(s, plantId, 'moor').error).toMatch(/nicht freigeschaltet/);
  });

  it('Spielstände der Version 2 kommen ins Anzuchthaus', () => {
    const { s } = withPlant('arnika');
    const old = { ...s, plants: s.plants.map(({ room: _r, ...p }) => ({ ...p, zone: 'hoehe' })) };
    const loaded = parse(JSON.stringify({ version: 2, savedAt: '', state: old }))!;
    expect(loaded.plants[0].room).toBe('anzucht');
    expect('zone' in loaded.plants[0]).toBe(false);
  });
});

