// Zeichen-Bausteine für die Pflanzenfiguren (SVG, Zeichenfläche 200 × 240, Boden bei y = 220).
import type { ReactNode } from 'react';

export const GROUND_Y = 220;

/** Mix a hex colour with white (f > 0) or black (f < 0). */
export function shade(hex: string, f: number): string {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  const t = f < 0 ? 0 : 255;
  const p = Math.abs(f);
  r = Math.round((t - r) * p + r);
  g = Math.round((t - g) * p + g);
  b = Math.round((t - b) * p + b);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export type LeafShape = 'lanzett' | 'rund' | 'herz' | 'schmal' | 'gezaehnt' | 'nadel' | 'spatel';

/** Leaf path pointing up from (0,0) to (0,-len). */
export function leafD(len: number, wid: number, shape: LeafShape): string {
  const L = len;
  const W = wid;
  switch (shape) {
    case 'rund':
      return `M0,0 C${W * 1.15},${-L * 0.08} ${W * 1.15},${-L * 0.95} 0,${-L} C${-W * 1.15},${-L * 0.95} ${-W * 1.15},${-L * 0.08} 0,0Z`;
    case 'spatel':
      return `M0,0 C${W * 0.25},${-L * 0.3} ${W * 1.1},${-L * 0.55} ${W * 0.8},${-L * 0.9} C${W * 0.5},${-L * 1.02} ${-W * 0.5},${-L * 1.02} ${-W * 0.8},${-L * 0.9} C${-W * 1.1},${-L * 0.55} ${-W * 0.25},${-L * 0.3} 0,0Z`;
    case 'herz':
      return `M0,${-L * 0.12} C${W * 0.5},${-L * 0.02} ${W * 1.15},${-L * 0.15} ${W * 1.05},${-L * 0.5} C${W * 0.95},${-L * 0.8} ${W * 0.3},${-L * 0.92} 0,${-L} C${-W * 0.3},${-L * 0.92} ${-W * 0.95},${-L * 0.8} ${-W * 1.05},${-L * 0.5} C${-W * 1.15},${-L * 0.15} ${-W * 0.5},${-L * 0.02} 0,${-L * 0.12}Z`;
    case 'schmal':
      return `M${-W / 2},0 Q${-W / 2},${-L * 0.6} 0,${-L} Q${W / 2},${-L * 0.6} ${W / 2},0Z`;
    case 'nadel':
      return `M${-W / 2},0 L0,${-L} L${W / 2},0Z`;
    case 'gezaehnt': {
      const teeth = 5;
      let right = '';
      let left = '';
      for (let i = 1; i <= teeth; i++) {
        const y = -L * (i / (teeth + 1));
        const w = W * Math.sin((Math.PI * i) / (teeth + 1.2));
        right += ` L${w * 0.45},${y + L * 0.05} L${w},${y - L * 0.04}`;
        left = ` L${-w},${y - L * 0.04} L${-w * 0.45},${y + L * 0.05}` + left;
      }
      return `M0,0${right} L0,${-L}${left} Z`;
    }
    default:
      return `M0,0 C${W},${-L * 0.3} ${W * 0.6},${-L * 0.8} 0,${-L} C${-W * 0.6},${-L * 0.8} ${-W},${-L * 0.3} 0,0Z`;
  }
}

interface LeafProps {
  x: number;
  y: number;
  rot?: number;
  len: number;
  wid: number;
  shape?: LeafShape;
  fill: string;
  vein?: boolean;
  opacity?: number;
}

export function Leaf({ x, y, rot = 0, len, wid, shape = 'lanzett', fill, vein = true, opacity }: LeafProps) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
      <path d={leafD(len, wid, shape)} fill={fill} stroke={shade(fill, -0.35)} strokeWidth={0.8} strokeLinejoin="round" />
      {vein && shape !== 'schmal' && shape !== 'nadel' && (
        <path d={`M0,0 L0,${-len * 0.88}`} stroke={shade(fill, -0.3)} strokeWidth={0.7} opacity={0.6} />
      )}
    </g>
  );
}

export function Stem({ d, w = 3, c = '#4c7a35' }: { d: string; w?: number; c?: string }) {
  return <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
}

export type PetalShape = 'oval' | 'spitz' | 'zunge' | 'rund';

function petalD(r: number, w: number, shape: PetalShape): string {
  switch (shape) {
    case 'spitz':
      return `M0,0 C${w},${-r * 0.35} ${w * 0.6},${-r * 0.8} 0,${-r} C${-w * 0.6},${-r * 0.8} ${-w},${-r * 0.35} 0,0Z`;
    case 'zunge':
      return `M${-w * 0.45},0 L${-w * 0.55},${-r * 0.85} Q0,${-r * 1.08} ${w * 0.55},${-r * 0.85} L${w * 0.45},0Z`;
    case 'rund':
      return `M0,0 C${w * 1.3},${-r * 0.1} ${w * 1.2},${-r} 0,${-r} C${-w * 1.2},${-r} ${-w * 1.3},${-r * 0.1} 0,0Z`;
    default:
      return `M0,0 C${w * 1.1},${-r * 0.25} ${w * 0.9},${-r} 0,${-r} C${-w * 0.9},${-r} ${-w * 1.1},${-r * 0.25} 0,0Z`;
  }
}

interface RadialProps {
  x: number;
  y: number;
  r: number;
  n: number;
  fill: string;
  petalW?: number;
  shape?: PetalShape;
  center?: string;
  centerR?: number;
  rot?: number;
  /** Squash vertically to show the flower in perspective (1 = face on). */
  tilt?: number;
  stroke?: string;
  jitter?: number;
}

/** Radial flower (daisy, anemone, star …). */
export function Radial({ x, y, r, n, fill, petalW = 0.3, shape = 'oval', center, centerR = 0.28, rot = 0, tilt = 1, stroke, jitter = 0 }: RadialProps) {
  const petals: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n + (jitter ? Math.sin(i * 12.9898) * jitter : 0);
    const rr = r * (jitter ? 1 - Math.abs(Math.sin(i * 78.233)) * 0.18 : 1);
    petals.push(
      <path key={i} d={petalD(rr, r * petalW, shape)} transform={`rotate(${a})`} fill={fill} stroke={stroke ?? shade(fill, -0.25)} strokeWidth={0.7} />,
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(1 ${tilt})`}>
      {petals}
      {center && (
        <>
          <circle r={r * centerR} fill={center} stroke={shade(center, -0.3)} strokeWidth={0.8} />
          <circle r={r * centerR * 0.45} cx={-r * centerR * 0.25} cy={-r * centerR * 0.3} fill="#fff" opacity={0.35} />
        </>
      )}
    </g>
  );
}

/** Hanging bell flower; (x,y) is the attachment point, the bell opens downward. */
export function Bell({ x, y, s, fill, rot = 0, lip = 0.15, spots }: { x: number; y: number; s: number; fill: string; rot?: number; lip?: number; spots?: string }) {
  const w = s * 0.55;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M${-w * 0.3},0 C${-w * 0.9},${s * 0.2} ${-w * 1.05},${s * 0.7} ${-w * (1 + lip)},${s} Q0,${s * 0.9} ${w * (1 + lip)},${s} C${w * 1.05},${s * 0.7} ${w * 0.9},${s * 0.2} ${w * 0.3},0Z`}
        fill={fill}
        stroke={shade(fill, -0.3)}
        strokeWidth={0.8}
      />
      <ellipse cx={0} cy={s * 0.96} rx={w * 0.85} ry={s * 0.1} fill={shade(fill, -0.35)} />
      {spots && [0.25, 0.45, 0.65].map((k, i) => <circle key={i} cx={(i - 1) * w * 0.35} cy={s * (0.55 + k * 0.4)} r={s * 0.045} fill={spots} />)}
      <path d={`M${-w * 0.45},${s * 0.15} Q${-w * 0.75},${s * 0.55} ${-w * 0.7},${s * 0.85}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={1.2} fill="none" />
    </g>
  );
}

export function Drop({ x, y, r, color = '#ffffff' }: { x: number; y: number; r: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill={color} opacity={0.75} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#fff" />
    </g>
  );
}

/** Soil mound at the plant base. */
export function Soil({ color = '#5b4330', w = 70 }: { color?: string; w?: number }) {
  return <ellipse cx={100} cy={GROUND_Y + 2} rx={w} ry={9} fill={color} opacity={0.9} />;
}

/** Water surface band for aquatic plants. */
export function Water({ y = 190 }: { y?: number }) {
  return (
    <g>
      <ellipse cx={100} cy={y + 12} rx={92} ry={20} fill="#3c86a6" opacity={0.85} />
      <ellipse cx={100} cy={y + 8} rx={86} ry={14} fill="#6cb6cf" opacity={0.7} />
      <path d={`M30,${y + 6} q10,-4 20,0 t20,0 M120,${y + 12} q10,-4 20,0 t20,0`} stroke="#d8f1fa" strokeWidth={1.2} fill="none" opacity={0.8} />
    </g>
  );
}

/** Pinnate frond along a quadratic curve from (x0,y0) via (cx,cy) to (x1,y1). */
export function Frond({ x0, y0, cx, cy, x1, y1, fill, pinnae = 14, size = 14 }: { x0: number; y0: number; cx: number; cy: number; x1: number; y1: number; fill: string; pinnae?: number; size?: number }) {
  const items: ReactNode[] = [];
  for (let i = 1; i < pinnae; i++) {
    const t = i / pinnae;
    const px = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * cx + t * t * x1;
    const py = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * cy + t * t * y1;
    const dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x1 - cx);
    const dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y1 - cy);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    const len = size * (1 - t * 0.75) * (t < 0.15 ? 0.7 : 1);
    items.push(<Leaf key={`a${i}`} x={px} y={py} rot={ang - 70} len={len} wid={len * 0.28} fill={fill} vein={false} />);
    items.push(<Leaf key={`b${i}`} x={px} y={py} rot={ang + 70} len={len} wid={len * 0.28} fill={fill} vein={false} />);
  }
  return (
    <g>
      {items}
      <path d={`M${x0},${y0} Q${cx},${cy} ${x1},${y1}`} stroke={shade(fill, -0.35)} strokeWidth={1.4} fill="none" />
    </g>
  );
}
