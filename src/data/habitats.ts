import type { HabitatId } from '../game/types';

export interface Habitat {
  id: HabitatId;
  name: string;
  short: string;
  /** Card / tile background gradient (top, bottom). */
  sky: [string, string];
  ground: string;
  icon: string;
}

export const HABITATS: Habitat[] = [
  { id: 'wald', name: 'Wald', short: 'Wald', sky: ['#2f5d43', '#183326'], ground: '#3b2a1c', icon: '🌲' },
  { id: 'wiese', name: 'Wiese & Magerrasen', short: 'Wiese', sky: ['#9fd3e8', '#d9efc4'], ground: '#5d8a3a', icon: '🌼' },
  { id: 'moor', name: 'Moor & Sumpf', short: 'Moor', sky: ['#6f7f6a', '#2c3a2c'], ground: '#4a3b26', icon: '💧' },
  { id: 'heide', name: 'Heide', short: 'Heide', sky: ['#c9a7c7', '#f0dcc4'], ground: '#6b4f3a', icon: '🟣' },
  { id: 'kueste', name: 'Küste & Dünen', short: 'Küste', sky: ['#8fd0f0', '#f3e7c4'], ground: '#d8c38f', icon: '🌊' },
  { id: 'gewaesser', name: 'Gewässer & Ufer', short: 'Gewässer', sky: ['#7cc3d6', '#2f6f86'], ground: '#2a4f5c', icon: '🪷' },
  { id: 'gebirge', name: 'Gebirge & Alpen', short: 'Gebirge', sky: ['#a9c9ef', '#e9f1fb'], ground: '#7b7f86', icon: '⛰️' },
  { id: 'acker', name: 'Acker & Wegrand', short: 'Acker', sky: ['#f6d58c', '#f7ecd0'], ground: '#8a6a3c', icon: '🌾' },
  { id: 'stadt', name: 'Stadt & Siedlung', short: 'Stadt', sky: ['#b8c3cc', '#e5e9ec'], ground: '#7a7470', icon: '🏘️' },
];

export function habitatInfo(id: HabitatId): Habitat {
  return HABITATS.find((h) => h.id === id)!;
}
