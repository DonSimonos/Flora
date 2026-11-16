import type { ConditionId, TrainingId } from '../game/types';

/**
 * Fähigkeiten. Jede hat eine echte Wirkung in src/game/greenhouse.ts oder discovery.ts.
 * trainKey: wer diese Disziplin oft trainiert, schaltet die Fähigkeit früher frei.
 */
export interface Ability {
  id: string;
  name: string;
  description: string;
  trainKey: TrainingId;
  effect: AbilityEffect;
}

export type AbilityEffect =
  | { kind: 'energyRegen'; factor: number }
  | { kind: 'waterDecay'; factor: number }
  | { kind: 'nutrientDecay'; factor: number }
  | { kind: 'conditionXp'; condition: ConditionId; factor: number }
  | { kind: 'ignoreCondition'; condition: ConditionId }
  | { kind: 'healthRegen'; factor: number }
  | { kind: 'trainingXp'; training: TrainingId; factor: number }
  | { kind: 'allXp'; factor: number }
  | { kind: 'ignoreLight' }
  | { kind: 'waterFloor'; value: number }
  | { kind: 'findItems'; extra: number }
  | { kind: 'diseaseResist'; factor: number };

export const ABILITIES: Ability[] = [
  { id: 'photosynthese', name: 'Photosynthese-Boost', description: 'Energie lädt sich 30 % schneller auf.', trainKey: 'licht', effect: { kind: 'energyRegen', factor: 1.3 } },
  { id: 'tiefenwurzler', name: 'Tiefenwurzler', description: 'Verliert 40 % langsamer Wasser.', trainKey: 'wurzel', effect: { kind: 'waterDecay', factor: 0.6 } },
  { id: 'nachtbluete', name: 'Nachtblüte', description: 'Training bei Nacht bringt 50 % mehr Erfahrung.', trainKey: 'anpassung', effect: { kind: 'conditionXp', condition: 'nacht', factor: 1.5 } },
  { id: 'frostschutz', name: 'Frostschutz', description: 'Frost schadet nicht; Training bei Frost bringt 30 % mehr Erfahrung.', trainKey: 'resistenz', effect: { kind: 'ignoreCondition', condition: 'frost' } },
  { id: 'regeneration', name: 'Regenerationskraft', description: 'Erholt sich doppelt so schnell.', trainKey: 'resistenz', effect: { kind: 'healthRegen', factor: 2 } },
  { id: 'bluetenmagnet', name: 'Blütenmagnet', description: 'Jeder Fund draußen bringt 1 Dünger extra.', trainKey: 'wachstum', effect: { kind: 'findItems', extra: 1 } },
  { id: 'fallensteller', name: 'Fallensteller', description: 'Holt sich Nährstoffe selbst: verbraucht halb so viel.', trainKey: 'anpassung', effect: { kind: 'nutrientDecay', factor: 0.5 } },
  { id: 'salztoleranz', name: 'Salztoleranz', description: 'Anpassungstraining bringt 50 % mehr Erfahrung.', trainKey: 'anpassung', effect: { kind: 'trainingXp', training: 'anpassung', factor: 1.5 } },
  { id: 'schwimmblatt', name: 'Schwimmblatt', description: 'Das Wasser sinkt nie unter 60.', trainKey: 'wurzel', effect: { kind: 'waterFloor', value: 60 } },
  { id: 'duftlockstoff', name: 'Duftlockstoff', description: '10 % mehr Erfahrung aus allem.', trainKey: 'wachstum', effect: { kind: 'allXp', factor: 1.1 } },
  { id: 'schattenkuenstler', name: 'Schattenkünstler', description: 'Die Lampenstufe ist egal.', trainKey: 'licht', effect: { kind: 'ignoreLight' } },
  { id: 'pionier', name: 'Pionierpflanze', description: 'Wachstumstraining bringt 50 % mehr Erfahrung.', trainKey: 'wachstum', effect: { kind: 'trainingXp', training: 'wachstum', factor: 1.5 } },
  { id: 'immergruen', name: 'Immergrün', description: 'Verbraucht 30 % weniger Nährstoffe.', trainKey: 'resistenz', effect: { kind: 'nutrientDecay', factor: 0.7 } },
  { id: 'nebelkind', name: 'Nebelkind', description: 'Training bei Nebel bringt 50 % mehr Erfahrung.', trainKey: 'anpassung', effect: { kind: 'conditionXp', condition: 'nebel', factor: 1.5 } },
  { id: 'regentaenzer', name: 'Regentänzer', description: 'Training bei Regen bringt 50 % mehr Erfahrung.', trainKey: 'wurzel', effect: { kind: 'conditionXp', condition: 'regen', factor: 1.5 } },
  { id: 'sonnenanbeter', name: 'Sonnenanbeter', description: 'Training bei Sonne bringt 50 % mehr Erfahrung.', trainKey: 'licht', effect: { kind: 'conditionXp', condition: 'sonne', factor: 1.5 } },
  { id: 'gipfelstuermer', name: 'Gipfelstürmer', description: 'Training in der Höhenkammer bringt 50 % mehr Erfahrung.', trainKey: 'anpassung', effect: { kind: 'conditionXp', condition: 'hoehe', factor: 1.5 } },
  { id: 'abwehrkraft', name: 'Abwehrkraft', description: 'Wird viel seltener krank.', trainKey: 'resistenz', effect: { kind: 'diseaseResist', factor: 0.3 } },
];

export function abilityInfo(id: string): Ability {
  const a = ABILITIES.find((x) => x.id === id);
  if (!a) throw new Error(`Unbekannte Fähigkeit ${id}`);
  return a;
}
