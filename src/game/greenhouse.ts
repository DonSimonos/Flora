// Gewächshaus-Regeln: reine Funktionen, die eine Pflanze in eine neue Pflanze überführen.
import { abilityInfo, type AbilityEffect } from '../data/abilities';
import { BALANCE as B } from './config';
import { activeConditions, climateAt, type Climate } from './climate';
import { rarityOf } from './rarity';
import { rngFor } from './rng';
import type {
  CareId, ConditionId, DiseaseId, EvolutionForm, GreenPlant, Level3, Species, StatId, TrainingId, ZoneId,
} from './types';

export const STATS: StatId[] = ['wachstum', 'vitalitaet', 'resistenz', 'anpassung', 'energie', 'potenzial'];
export const TRAININGS: TrainingId[] = ['wachstum', 'wurzel', 'licht', 'resistenz', 'anpassung'];
const CONDITIONS: ConditionId[] = ['nacht', 'regen', 'sonne', 'nebel', 'frost', 'hoehe'];

export const DISEASE_NAMES: Record<DiseaseId, string> = {
  mehltau: 'Mehltau',
  blattlaeuse: 'Blattläuse',
  wurzelfaeule: 'Wurzelfäule',
};

export type GameEvent =
  | { kind: 'levelUp'; level: number }
  | { kind: 'ability'; id: string }
  | { kind: 'disease'; id: DiseaseId }
  | { kind: 'breakthrough' }
  | { kind: 'info'; text: string }
  | { kind: 'warn'; text: string };

export interface ActionResult {
  ok: boolean;
  plant: GreenPlant;
  events: GameEvent[];
  reason?: string;
}

const zeroStats = (): Record<StatId, number> => ({ wachstum: 0, vitalitaet: 0, resistenz: 0, anpassung: 0, energie: 0, potenzial: 0 });
const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function xpToNext(level: number): number {
  return Math.round(B.xpBase * Math.pow(level, B.xpExp));
}

// ---------- Abilities ----------

function effects(p: GreenPlant): AbilityEffect[] {
  return p.abilities.map((id) => abilityInfo(id).effect);
}

function factorOf(p: GreenPlant, kind: AbilityEffect['kind']): number {
  let f = 1;
  for (const e of effects(p)) {
    if (e.kind === kind && 'factor' in e) f *= e.factor;
  }
  return f;
}

function ignores(p: GreenPlant, c: ConditionId): boolean {
  return effects(p).some((e) => e.kind === 'ignoreCondition' && e.condition === c);
}

function waterFloor(p: GreenPlant): number {
  let f: number = B.floors.water;
  for (const e of effects(p)) if (e.kind === 'waterFloor') f = Math.max(f, e.value);
  return f;
}

export function hasFindBonus(p: GreenPlant): number {
  return effects(p).reduce((s, e) => s + (e.kind === 'findItems' ? e.extra : 0), 0);
}

// ---------- Stats ----------

export function formOf(p: GreenPlant, sp: Species): EvolutionForm | null {
  return sp.forms.find((f) => f.id === p.formId) ?? null;
}

export function plantStats(p: GreenPlant, sp: Species): Record<StatId, number> {
  const rarity = rarityOf(sp);
  const form = formOf(p, sp);
  const out = zeroStats();
  for (const s of STATS) {
    const base = s === 'potenzial' ? B.rarityPotential[rarity] : sp.baseStats[s] * B.rarityStatFactor[rarity];
    const raw = base * (1 + (p.level - 1) * B.statPerLevel) * p.genes[s] + p.trainBonus[s];
    out[s] = Math.round(raw * (form?.boost[s] ?? 1));
  }
  return out;
}

const STAT_TO_TRAINING: Record<Exclude<StatId, 'potenzial'>, TrainingId> = {
  wachstum: 'wachstum',
  vitalitaet: 'wurzel',
  resistenz: 'resistenz',
  anpassung: 'anpassung',
  energie: 'licht',
};

/** The discipline this species enjoys most (its strongest base stat). */
export function favouriteTraining(sp: Species): TrainingId {
  const stats = Object.keys(STAT_TO_TRAINING) as (keyof typeof STAT_TO_TRAINING)[];
  const best = stats.reduce((a, b) => (sp.baseStats[b] > sp.baseStats[a] ? b : a));
  return STAT_TO_TRAINING[best];
}

export type Stage = 'keimling' | 'jung' | 'reif';
export function stageOf(p: GreenPlant): Stage {
  if (p.level >= B.stage.reif) return 'reif';
  if (p.level >= B.stage.jung) return 'jung';
  return 'keimling';
}

// ---------- Wohlbefinden ----------

export interface Wellbeing {
  score: number;
  issues: string[];
}

export function wellbeing(p: GreenPlant, sp: Species, climate: Climate): Wellbeing {
  let score = 100;
  const issues: string[] = [];
  const [wLo, wHi] = B.waterBand[sp.needs.water];
  if (p.water < wLo) { score -= (wLo - p.water) * 1.2; issues.push('Durst'); }
  if (p.water > wHi) { score -= (p.water - wHi) * 1.2; issues.push('Zu nass'); }
  const [nLo, nHi] = B.nutrientBand[sp.needs.nutrients];
  if (p.nutrients < nLo) { score -= (nLo - p.nutrients); issues.push('Hunger'); }
  if (p.nutrients > nHi) { score -= (p.nutrients - nHi) * 1.2; issues.push('Überdüngt'); }
  if (!effects(p).some((e) => e.kind === 'ignoreLight')) {
    const diff = p.light - sp.needs.light;
    if (diff < 0) { score -= 15 * -diff; issues.push('Zu dunkel'); }
    if (diff > 0) { score -= 15 * diff; issues.push('Zu hell'); }
  }
  if (p.soil < 60) { score -= (60 - p.soil) * 0.4; if (p.soil < 45) issues.push('Boden ausgelaugt'); }
  if (p.overgrowth > 60) { score -= (p.overgrowth - 60) * 0.5; issues.push('Wildwuchs'); }
  if (p.disease) { score -= 25; issues.push(DISEASE_NAMES[p.disease]); }
  const mountain = sp.habitats.includes('gebirge');
  if (climate.weather === 'frost' && !ignores(p, 'frost') && !mountain) { score -= 15; issues.push('Frost'); }
  if (p.zone === 'hoehe' && !mountain && !sp.habitats.includes('heide')) { score -= 10; issues.push('Höhenluft ungewohnt'); }
  return { score: Math.round(clamp(score)), issues };
}

function wbFactor(score: number): number {
  if (score >= 60) return 1;
  if (score >= 30) return 0.6;
  return 0.3;
}

// ---------- Creation ----------

export function newPlant(id: string, seedId: string, findId: string, sp: Species, now: number): GreenPlant {
  const rand = rngFor(findId, 'gene');
  const genes = zeroStats();
  for (const s of STATS) genes[s] = Math.round((0.85 + rand() * 0.3) * 100) / 100;
  const [nLo, nHi] = B.nutrientBand[sp.needs.nutrients];
  const plant: GreenPlant = {
    id,
    speciesId: sp.id,
    seedId,
    plantedAt: now,
    lastTick: now,
    level: 1,
    xp: 0,
    xpCarry: 0,
    genes,
    trainBonus: zeroStats(),
    water: 60,
    nutrients: Math.round((nLo + nHi) / 2),
    soil: 70,
    health: 100,
    energy: 100,
    overgrowth: 0,
    light: 2,
    zone: 'tal',
    disease: null,
    trainCount: { wachstum: 0, wurzel: 0, licht: 0, resistenz: 0, anpassung: 0 },
    condCount: { nacht: 0, regen: 0, sonne: 0, nebel: 0, frost: 0, hoehe: 0 },
    formId: null,
    abilities: [],
    actions: 0,
    lastSoilAt: 0,
    lastPruneAt: 0,
  };
  return plant;
}

// ---------- Experience ----------

/** Adds xp, handles level-ups and level-based ability unlocks. */
export function addXp(p: GreenPlant, sp: Species, amount: number, events: GameEvent[]): GreenPlant {
  const out = { ...p, abilities: [...p.abilities] };
  out.xp += Math.max(0, Math.round(amount));
  while (out.level < B.maxLevel && out.xp >= xpToNext(out.level)) {
    out.xp -= xpToNext(out.level);
    out.level += 1;
    events.push({ kind: 'levelUp', level: out.level });
    B.abilityLevels.forEach((lvl, i) => {
      const id = sp.abilities[i];
      if (id && out.level >= lvl && !out.abilities.includes(id)) {
        out.abilities.push(id);
        events.push({ kind: 'ability', id });
      }
    });
  }
  if (out.level >= B.maxLevel) out.xp = 0;
  return out;
}

// ---------- Time ----------

/** Advances the plant simulation to `now`. Gentle: nothing is lost by waiting. */
export function tick(p: GreenPlant, sp: Species, now: number): { plant: GreenPlant; events: GameEvent[] } {
  const events: GameEvent[] = [];
  if (now <= p.lastTick) return { plant: p, events };
  let plant = { ...p };
  let t = Math.max(p.lastTick, now - B.maxCatchUpHours * 3600_000);
  let passiveBudget = B.passiveXpCapHours;
  const rarityXp = B.rarityXpFactor[rarityOf(sp)];
  while (t < now) {
    const stepEnd = Math.min(now, Math.floor(t / 3600_000) * 3600_000 + 3600_000);
    const h = (stepEnd - t) / 3600_000;
    const c = climateAt(t);
    const rain = c.weather === 'regen';
    const sun = c.weather === 'sonne' && !c.night;
    const waterLoss = rain ? 0 : B.waterPerHour * (sun ? 1.2 : 1) * factorOf(plant, 'waterDecay');
    plant.water = Math.max(waterFloor(plant), plant.water - waterLoss * h);
    plant.nutrients = Math.max(B.floors.nutrients, plant.nutrients - B.nutrientsPerHour * factorOf(plant, 'nutrientDecay') * h);
    plant.soil = Math.max(B.floors.soil, plant.soil - B.soilPerHour * h);
    plant.energy = Math.min(100, plant.energy + B.energyPerHour * (sun ? 1.25 : 1) * factorOf(plant, 'energyRegen') * h);
    plant.overgrowth = Math.min(100, plant.overgrowth + B.overgrowthPerHour * h);
    const wb = wellbeing(plant, sp, c);
    if (wb.score >= 60) plant.health = Math.min(100, plant.health + B.healthRegenPerHour * factorOf(plant, 'healthRegen') * h);
    else if (wb.score < 30) plant.health = Math.max(B.floors.health, plant.health - B.healthLossPerHour * h);
    if (passiveBudget > 0 && wb.score >= 30) {
      const hrs = Math.min(h, passiveBudget);
      passiveBudget -= hrs;
      const xp = B.passiveXpPerHour(plant.level) * wbFactor(wb.score) * rarityXp * factorOf(plant, 'allXp') * hrs;
      // fractional xp is carried over, so frequent small ticks still add up
      const total = plant.xpCarry + xp;
      const whole = Math.floor(total);
      plant.xpCarry = total - whole;
      if (whole > 0) plant = addXp(plant, sp, whole, events);
    }
    t = stepEnd;
  }
  plant.lastTick = now;
  return { plant, events };
}

// ---------- Care ----------

export function care(p: GreenPlant, sp: Species, action: CareId, now: number): ActionResult {
  const events: GameEvent[] = [];
  let plant: GreenPlant = { ...p, actions: p.actions + 1 };
  const rand = rngFor(p.id, p.actions, action);
  const careXp = 5 + plant.level;
  switch (action) {
    case 'giessen': {
      const [wLo, wHi] = B.waterBand[sp.needs.water];
      const needed = plant.water < wLo;
      plant.water = clamp(plant.water + B.water.amount);
      if (plant.water > wHi + B.water.soggyAbove) {
        plant.soil = Math.max(B.floors.soil, plant.soil - 10);
        events.push({ kind: 'warn', text: 'Staunässe! Diese Art mag es trockener.' });
        if (!plant.disease && rand() < 0.3 * factorOf(plant, 'diseaseResist')) {
          plant.disease = 'wurzelfaeule';
          events.push({ kind: 'disease', id: 'wurzelfaeule' });
        }
      }
      if (needed) plant = addXp(plant, sp, careXp, events);
      break;
    }
    case 'duengen': {
      const [nLo, nHi] = B.nutrientBand[sp.needs.nutrients];
      const needed = plant.nutrients < nLo;
      plant.nutrients = clamp(plant.nutrients + B.fertilizer.amount);
      if (plant.nutrients > nHi + 10) {
        plant.health = Math.max(B.floors.health, plant.health - 10);
        events.push({ kind: 'warn', text: sp.needs.nutrients === 1 ? 'Diese Art braucht magere Böden – zu viel Dünger schadet ihr!' : 'Überdüngt!' });
      }
      if (needed) plant = addXp(plant, sp, careXp, events);
      break;
    }
    case 'boden': {
      const wait = plant.lastSoilAt + B.soilImprove.cooldownH * 3600_000 - now;
      if (wait > 0) return { ok: false, plant: p, events, reason: `Boden erst wieder in ${hoursText(wait)} verbessern.` };
      const needed = plant.soil < 60;
      plant.soil = clamp(plant.soil + B.soilImprove.amount);
      plant.lastSoilAt = now;
      if (needed) plant = addXp(plant, sp, careXp, events);
      break;
    }
    case 'schnitt': {
      const wait = plant.lastPruneAt + B.prune.cooldownH * 3600_000 - now;
      if (wait > 0) return { ok: false, plant: p, events, reason: `Erst wieder in ${hoursText(wait)} schneiden.` };
      if (plant.overgrowth > 50) plant = addXp(plant, sp, B.trainingXp(plant.level) * B.prune.xpIfOvergrown, events);
      plant.overgrowth = 0;
      plant.lastPruneAt = now;
      break;
    }
    case 'behandeln': {
      if (!plant.disease) return { ok: false, plant: p, events, reason: 'Die Pflanze ist gesund.' };
      events.push({ kind: 'info', text: `${DISEASE_NAMES[plant.disease]} behandelt.` });
      plant.disease = null;
      plant.health = clamp(plant.health + 10);
      break;
    }
  }
  return { ok: true, plant, events };
}

export function setLight(p: GreenPlant, light: Level3): GreenPlant {
  return { ...p, light };
}

export function setZone(p: GreenPlant, zone: ZoneId): GreenPlant {
  return { ...p, zone };
}

// ---------- Training ----------

const TRAINING_GAINS: Record<TrainingId, Partial<Record<StatId, number>>> = {
  wachstum: { wachstum: 1 },
  wurzel: { resistenz: 0.6, vitalitaet: 0.6 },
  licht: { energie: 1 },
  resistenz: { resistenz: 0.7, vitalitaet: 0.4 },
  anpassung: { anpassung: 1 },
};

export function canTrain(p: GreenPlant): string | null {
  if (p.disease) return `Erst ${DISEASE_NAMES[p.disease]} behandeln.`;
  if (p.health < B.trainingMinHealth) return 'Zu schwach zum Trainieren – erst gesund pflegen.';
  if (p.energy < B.trainingEnergy) return 'Keine Energie mehr – sie lädt sich mit der Zeit wieder auf.';
  return null;
}

export function train(p: GreenPlant, sp: Species, kind: TrainingId, now: number): ActionResult {
  const events: GameEvent[] = [];
  const blocked = canTrain(p);
  if (blocked) return { ok: false, plant: p, events, reason: blocked };
  const c = climateAt(now);
  const conds = activeConditions(c, p.zone);
  const rand = rngFor(p.id, p.actions, 'train', kind);
  let plant: GreenPlant = {
    ...p,
    actions: p.actions + 1,
    energy: p.energy - B.trainingEnergy,
    trainCount: { ...p.trainCount, [kind]: p.trainCount[kind] + 1 },
    condCount: { ...p.condCount },
    trainBonus: { ...p.trainBonus },
    abilities: [...p.abilities],
  };
  for (const cd of conds) plant.condCount[cd] += 1;

  // Experience
  let factor = B.rarityXpFactor[rarityOf(sp)] * wbFactor(wellbeing(p, sp, c).score) * factorOf(plant, 'allXp');
  if (favouriteTraining(sp) === kind) factor *= B.favouriteBonus;
  for (const e of effects(plant)) {
    if (e.kind === 'trainingXp' && e.training === kind) factor *= e.factor;
    if (e.kind === 'conditionXp' && conds.includes(e.condition)) factor *= e.factor;
    if (e.kind === 'ignoreCondition' && conds.includes(e.condition)) factor *= 1.3;
  }

  // Stat gain, sometimes a breakthrough
  let gain = B.trainingStatGain;
  if (rand() < B.breakthroughChance) {
    gain *= 2;
    factor *= 1.5;
    events.push({ kind: 'breakthrough' });
  }
  for (const [stat, v] of Object.entries(TRAINING_GAINS[kind]) as [StatId, number][]) {
    plant.trainBonus[stat] = Math.round((plant.trainBonus[stat] + v * gain) * 10) / 10;
  }
  plant.trainBonus.potenzial = Math.round((plant.trainBonus.potenzial + 0.1) * 10) / 10;

  // Training-based ability unlock
  for (const id of sp.abilities) {
    if (!plant.abilities.includes(id) && abilityInfo(id).trainKey === kind && plant.trainCount[kind] >= B.abilityTrainingUnlock) {
      plant.abilities.push(id);
      events.push({ kind: 'ability', id });
      break;
    }
  }

  plant = addXp(plant, sp, B.trainingXp(plant.level) * factor, events);

  // Hard training on a weak plant can make it ill
  const nebel = conds.includes('nebel') ? 1.5 : 1;
  if (!plant.disease && plant.health < 60 && rand() < B.diseaseChance * nebel * factorOf(plant, 'diseaseResist')) {
    const ds: DiseaseId[] = ['mehltau', 'blattlaeuse', 'wurzelfaeule'];
    plant.disease = ds[Math.floor(rand() * ds.length)];
    events.push({ kind: 'disease', id: plant.disease });
  }
  return { ok: true, plant, events };
}

// ---------- Evolution ----------

export function formProgress(p: GreenPlant, f: EvolutionForm): { have: number; need: number } {
  const have = f.trigger.kind === 'condition' ? p.condCount[f.trigger.id] : p.trainCount[f.trigger.id];
  return { have: Math.min(have, f.trigger.count), need: f.trigger.count };
}

export function availableForms(p: GreenPlant, sp: Species): EvolutionForm[] {
  if (p.formId || p.level < B.evolveLevel) return [];
  return sp.forms.filter((f) => {
    const { have, need } = formProgress(p, f);
    return have >= need;
  });
}

export function evolve(p: GreenPlant, sp: Species, formId: string): ActionResult {
  const f = availableForms(p, sp).find((x) => x.id === formId);
  if (!f) return { ok: false, plant: p, events: [], reason: 'Diese Entwicklung ist noch nicht möglich.' };
  return { ok: true, plant: { ...p, formId: f.id, health: 100, energy: 100 }, events: [{ kind: 'info', text: `✨ Entwicklung geschafft: ${sp.de} wird zur Form „${f.name}“!` }] };
}

export function hoursText(ms: number): string {
  const min = Math.ceil(ms / 60000);
  if (min < 60) return `${min} Min.`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} Std. ${m} Min.` : `${h} Std.`;
}

export { CONDITIONS };
