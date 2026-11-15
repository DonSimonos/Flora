// Zentrale Spielbalance. Alle Zahlen, die das Spielgefühl bestimmen, stehen hier.
import type { ConditionId, Level3, RarityId, StatId } from './types';

export const SAVE_VERSION = 1;

export const RARITIES: { id: RarityId; name: string; color: string; stars: number }[] = [
  { id: 'gewoehnlich', name: 'Gewöhnlich', color: '#9fb39a', stars: 1 },
  { id: 'ungewoehnlich', name: 'Ungewöhnlich', color: '#5cc27a', stars: 2 },
  { id: 'selten', name: 'Selten', color: '#4aa3ff', stars: 3 },
  { id: 'episch', name: 'Episch', color: '#b36bff', stars: 4 },
  { id: 'legendaer', name: 'Legendär', color: '#ffb02e', stars: 5 },
  { id: 'mythisch', name: 'Mythisch', color: '#ff5fa8', stars: 6 },
];

export const BALANCE = {
  /** Maximum plant level. */
  maxLevel: 50,
  /** xp needed to go from level n to n+1 = xpBase * n ^ xpExp */
  xpBase: 25,
  xpExp: 1.55,
  /** Stat growth: stat = base * (1 + (level-1) * statPerLevel) * genes + training */
  statPerLevel: 0.1,
  /** Rarer plants grow slower but end up stronger. */
  rarityXpFactor: { gewoehnlich: 1, ungewoehnlich: 0.95, selten: 0.9, episch: 0.82, legendaer: 0.75, mythisch: 0.68 } as Record<RarityId, number>,
  rarityStatFactor: { gewoehnlich: 1, ungewoehnlich: 1.06, selten: 1.12, episch: 1.2, legendaer: 1.3, mythisch: 1.42 } as Record<RarityId, number>,
  /** Seltenheitspotenzial base value per rarity (1..10 scale). */
  rarityPotential: { gewoehnlich: 2, ungewoehnlich: 3, selten: 5, episch: 6, legendaer: 8, mythisch: 10 } as Record<RarityId, number>,

  // --- Gewächshaus, echte Zeit, sanft ---
  /** Simulation never runs more than this many hours at once: the plant "waits". */
  maxCatchUpHours: 72,
  /** Passive growth is credited for at most this many hours between visits. */
  passiveXpCapHours: 12,
  waterPerHour: 5,
  nutrientsPerHour: 1.2,
  energyPerHour: 12,
  overgrowthPerHour: 1.5,
  healthRegenPerHour: 3,
  healthLossPerHour: 2,
  soilPerHour: 0.4,
  /** Soft floors: neglect never kills or ruins a plant. */
  floors: { water: 8, nutrients: 8, health: 50, soil: 30 },
  passiveXpPerHour: (level: number) => 4 + level,

  // --- Aktionen ---
  water: { amount: 35, soggyAbove: 15 },
  fertilizer: { amount: 30 },
  soilImprove: { amount: 30, cooldownH: 12 },
  prune: { cooldownH: 8, xpIfOvergrown: 0.5 },
  trainingEnergy: 25,
  trainingMinHealth: 40,
  trainingXp: (level: number) => 20 + 4 * level,
  trainingStatGain: 1,
  breakthroughChance: 0.1, // doubles the training gain
  /** Chance per training to catch a disease when health is below 60. */
  diseaseChance: 0.15,
  /** Extra xp factor for training in the plant's favourite discipline. */
  favouriteBonus: 1.5,

  /** Optimal ranges for water and nutrients per need level. */
  waterBand: { 1: [20, 45], 2: [40, 70], 3: [65, 95] } as Record<Level3, [number, number]>,
  nutrientBand: { 1: [10, 35], 2: [35, 65], 3: [60, 90] } as Record<Level3, [number, number]>,

  // --- Fähigkeiten und Entwicklung ---
  abilityLevels: [5, 15, 30],
  /** Training count in the ability's discipline that unlocks it early. */
  abilityTrainingUnlock: 12,
  evolveLevel: 25,
  stage: { keimling: 1, jung: 10, reif: 25 },

  // --- Entdecken draußen ---
  /** Minimum identification score shown as candidate. */
  minCandidateScore: 0.08,
  /** Score from which a find counts as verified. */
  verifiedScore: 0.3,
  /** Every n-th find of the same species brings another seed. */
  seedEveryNthFind: 5,
  /** Items per find; rarer finds give more. */
  findItems: { duenger: 1, heilmittelChance: 0.35 },
  rarityItemBonus: { gewoehnlich: 0, ungewoehnlich: 0, selten: 1, episch: 1, legendaer: 2, mythisch: 3 } as Record<RarityId, number>,
  /** xp given to greenhouse plants of the same species on a repeat find. */
  repeatFindXp: (level: number) => 30 + 6 * level,
  startItems: { duenger: 5, heilmittel: 2 },
  greenhouseSlots: 12,
} as const;

/** Klima im Gewächshaus: wechselt alle `weatherBlockHours` Stunden, reproduzierbar aus dem Datum. */
export const CLIMATE = {
  weatherBlockHours: 3,
  nightFrom: 21,
  nightTo: 6,
  /** Weights per weather; winter months raise frost, summer raises sun. */
  weatherWeights: {
    sonne: 30,
    bewoelkt: 30,
    regen: 22,
    nebel: 12,
    frost: 6,
  },
};

export const STAT_NAMES: Record<StatId, string> = {
  wachstum: 'Wachstum',
  vitalitaet: 'Vitalität',
  resistenz: 'Widerstandskraft',
  anpassung: 'Anpassung',
  energie: 'Energie',
  potenzial: 'Seltenheitspotenzial',
};

export const CONDITION_NAMES: Record<ConditionId, string> = {
  nacht: 'Nacht',
  regen: 'Regen',
  sonne: 'Sonne',
  nebel: 'Nebel',
  frost: 'Frost',
  hoehe: 'Höhenlage',
};
