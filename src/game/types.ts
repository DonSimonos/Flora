// Central data model of FLORA. Game rules live in the other files of src/game,
// the UI only reads these structures and calls the pure functions.

export type RarityId = 'gewoehnlich' | 'ungewoehnlich' | 'selten' | 'episch' | 'legendaer' | 'mythisch';

/** Rote-Liste-Kategorie Deutschland (Metzing et al. 2018), '?' = keine Daten. */
export type RedListCat = '0' | '1' | '2' | '3' | 'G' | 'R' | 'V' | 'D' | '*' | 'nb' | '?';

/** Aktuelle Bestandssituation nach Rote-Liste-Methodik. */
export type Bestand = 'ex' | 'es' | 'ss' | 's' | 'mh' | 'h' | 'sh' | 'nb' | '?';

export type HabitatId = 'wald' | 'wiese' | 'moor' | 'heide' | 'kueste' | 'gewaesser' | 'gebirge' | 'acker' | 'stadt';

export type PlantType =
  | 'kraut' | 'orchidee' | 'farn' | 'gras' | 'karnivore'
  | 'zwergstrauch' | 'wasserpflanze' | 'zwiebel' | 'distel';

export type StatId = 'wachstum' | 'vitalitaet' | 'resistenz' | 'anpassung' | 'energie' | 'potenzial';

/** 1 = wenig, 2 = mittel, 3 = viel */
export type Level3 = 1 | 2 | 3;

/** Ökologische Zeigerwerte (EIVE, 0–10): Lage und Nischenbreite (b). */
export interface Eco {
  M: number; // Feuchte
  N: number; // Nährstoffe
  R: number; // Bodenreaktion
  L: number; // Licht
  T: number; // Temperatur
  Mb: number;
  Nb: number;
  Rb: number;
  Lb: number;
  Tb: number;
}

export interface Needs {
  water: Level3;
  light: Level3;
  nutrients: Level3;
}

export type CareId = 'giessen' | 'duengen' | 'boden' | 'schnitt' | 'behandeln' | 'kalken' | 'ansaeuern';
export type TrainingId = 'wachstum' | 'wurzel' | 'licht' | 'resistenz' | 'anpassung';
export type ConditionId = 'nacht' | 'regen' | 'sonne' | 'nebel' | 'frost' | 'hoehe';
export type DiseaseId = 'mehltau' | 'blattlaeuse' | 'wurzelfaeule';
export type ZoneId = 'tal' | 'hoehe';
export type ItemId = 'duenger' | 'heilmittel';

/** What unlocks an evolution form (besides the minimum level). */
export type FormTrigger =
  | { kind: 'condition'; id: ConditionId; count: number }
  | { kind: 'training'; id: TrainingId; count: number };

export interface EvolutionForm {
  id: string;
  name: string;
  description: string;
  trigger: FormTrigger;
  /** Multipliers applied to stats once the form is reached. */
  boost: Partial<Record<StatId, number>>;
  /** Visual effect drawn over the plant art. */
  effect: FormEffect;
}

export type FormEffect = 'mond' | 'tau' | 'frost' | 'sonne' | 'nebel' | 'gipfel' | 'wurzel' | 'bluete';

export interface Species {
  id: string;
  sci: string;
  de: string;
  family: string;
  habitats: HabitatId[];
  type: PlantType;
  rl: RedListCat;
  bestand: Bestand;
  description: string;
  /** Bedürfnisse aus den Zeigerwerten. */
  eco: Eco;
  /** 'eive' = echte Zeigerwerte, 'schaetzung' = aus dem Lebensraum geschätzt. */
  ecoSource: 'eive' | 'schaetzung';
  /** Ellenberg Deutschland (F, N, R, L, T), falls vorhanden. */
  ellenberg?: (number | null)[];
  /** 1..10 per stat, before level, genes and training. */
  baseStats: Record<StatId, number>;
  /** Ability ids, unlocked in this order. */
  abilities: string[];
  forms: [EvolutionForm, EvolutionForm];
  /** Main colour (flower) for generic art and card accents. */
  color: string;
  /** Hand-drawn illustration id, if this is one of the featured species. */
  art?: string;
  /** Other scientific names that should match this species. */
  synonyms?: string[];
  /** Added at runtime from an identification, not part of the built-in list. */
  dynamic?: boolean;
  /** true when rl/bestand come from the official Rote Liste (Metzing et al. 2018). */
  rlOfficial?: boolean;
  /** Endemit Deutschlands laut Roter Liste. */
  endemic?: boolean;
}

export type FindStatus = 'pending' | 'ready' | 'confirmed' | 'failed';

export interface Candidate {
  sci: string;
  de: string | null;
  family: string | null;
  score: number;
  speciesId: string | null; // matched built-in species, null if unknown
}

export interface Find {
  id: string;
  createdAt: string; // ISO
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  locSource: 'gps' | 'exif' | 'none';
  photoId: string;
  status: FindStatus;
  candidates: Candidate[];
  speciesId: string | null;
  /** true when confirmed by automatic identification with enough confidence */
  verified: boolean;
  score: number | null;
  error: string | null;
  attempts: number;
}

export interface Seed {
  id: string;
  speciesId: string;
  findId: string;
  receivedAt: string;
}

export interface GreenPlant {
  id: string;
  speciesId: string;
  seedId: string;
  plantedAt: number; // ms
  lastTick: number; // ms, time up to which the simulation has run
  level: number;
  xp: number; // xp inside the current level
  xpCarry: number; // fractional passive xp not yet credited
  genes: Record<StatId, number>; // 0.85..1.15
  trainBonus: Record<StatId, number>;
  water: number; // 0..100
  nutrients: number; // 0..100
  soil: number; // 0..100
  reaction: number; // Bodenreaktion 0 (sehr sauer) .. 10 (stark kalkhaltig)
  health: number; // 0..100
  energy: number; // 0..100, spent on training
  overgrowth: number; // 0..100, reset by pruning
  light: Level3; // lamp setting
  zone: ZoneId;
  disease: DiseaseId | null;
  trainCount: Record<TrainingId, number>;
  condCount: Record<ConditionId, number>;
  formId: string | null;
  abilities: string[];
  actions: number; // counter feeding the reproducible random generator
  lastSoilAt: number;
  lastPruneAt: number;
}

export interface GameState {
  version: number;
  createdAt: string;
  finds: Find[];
  seeds: Seed[];
  plants: GreenPlant[];
  items: Record<ItemId, number>;
  /** Species learned at runtime (identified, not in the built-in list). */
  extraSpecies: Species[];
  /** Species ids in order of first discovery. */
  discovered: string[];
  /** Total finds per species id (confirmed only). */
  findCount: Record<string, number>;
  /** Discovery reveals not yet shown to the player. */
  revealQueue: Reveal[];
  stats: { careActions: number; trainings: number; evolutions: number };
}

export interface Reveal {
  findId: string;
  speciesId: string;
  isNew: boolean;
  seedGained: boolean;
  items: Partial<Record<ItemId, number>>;
  xpToPlants: number;
}
