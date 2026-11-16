import { onGps, type Fix } from '../../services/geo';

let last: Fix | null = null;
onGps((f) => {
  if (f) last = f;
});

export function lastFixOrNull(): Fix | null {
  return last;
}
