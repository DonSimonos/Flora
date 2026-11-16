import { useId, type ReactNode } from 'react';
import { HABITATS } from '../data/habitats';
import type { FormEffect, PlantType, Species } from '../game/types';
import { Bell, Drop, Frond, GROUND_Y, Leaf, Radial, Soil, Stem, Water, shade } from './parts';
import { PLANT_ART } from './plants';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Drawing by plant type for species without their own illustration. */
function GenericArt({ type, color }: { type: PlantType; color: string }) {
  const c = color;
  switch (type) {
    case 'farn':
      return (
        <>
          <Soil color="#4a3424" />
          {[[40, 90], [80, 50], [120, 50], [160, 90]].map(([x, y], i) => (
            <Frond key={i} x0={100} y0={218} cx={(100 + x) / 2} cy={150} x1={x} y1={y} fill={i % 2 ? '#5a9a45' : '#4f8a3a'} />
          ))}
        </>
      );
    case 'gras':
      return (
        <>
          <Soil />
          {range(9).map((i) => <Leaf key={i} x={100} y={218} rot={-40 + i * 10} len={90 - Math.abs(i - 4) * 8} wid={4} shape="schmal" fill={i % 2 ? '#7a9a52' : '#8faa60'} />)}
          {[[74, 60], [100, 40], [128, 64]].map(([x, y], i) => (
            <g key={i}>
              <Stem d={`M100,216 Q${(100 + x) / 2},140 ${x},${y + 24}`} w={1.5} c="#9a9a6a" />
              <ellipse cx={x} cy={y + 12} rx={5} ry={14} fill={c} stroke={shade(c, -0.3)} />
            </g>
          ))}
        </>
      );
    case 'zwergstrauch':
      return (
        <>
          <Soil color="#5a4030" w={78} />
          {['M100,220 C88,190 70,160 58,124', 'M100,220 C100,180 100,140 100,96', 'M100,220 C114,190 132,160 144,122'].map((d, i) => <Stem key={i} d={d} w={2.6} c="#6b4a35" />)}
          {range(26).map((i) => {
            const x = 60 + ((i * 37) % 86);
            const y = 110 + ((i * 53) % 90);
            return <Leaf key={i} x={x} y={y} rot={(i * 47) % 360} len={11} wid={5} fill={i % 2 ? '#4f8a3a' : '#6a9a4c'} />;
          })}
          {range(9).map((i) => <circle key={i} cx={62 + ((i * 29) % 80)} cy={112 + ((i * 41) % 70)} r={4.5} fill={c} stroke={shade(c, -0.35)} />)}
        </>
      );
    case 'wasserpflanze':
      return (
        <>
          <Water y={182} />
          {[[60, 198, 30], [140, 200, 26]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r / 3} fill="#4f8a3a" stroke="#2f5d2a" />)}
          <Stem d="M100,198 C100,170 100,140 100,112" w={2.4} c="#6e9a4a" />
          <Radial x={100} y={104} r={16} n={3} petalW={0.6} shape="rund" fill={c} center="#f2c200" centerR={0.25} />
        </>
      );
    case 'karnivore':
      return (
        <>
          <ellipse cx={100} cy={222} rx={70} ry={10} fill="#8aa04a" />
          {[-70, -35, 0, 35, 70].map((r, i) => (
            <g key={i} transform={`translate(100 214) rotate(${r})`}>
              <line x1={0} y1={0} x2={0} y2={-30} stroke="#a7b56a" strokeWidth={2} />
              <ellipse cy={-40} rx={7} ry={11} fill={c} />
              {range(10).map((k) => <circle key={k} cx={Math.cos(k * 0.63) * 9} cy={-40 + Math.sin(k * 0.63) * 13} r={1.4} fill="#ffe2ea" />)}
            </g>
          ))}
        </>
      );
    case 'orchidee':
      return (
        <>
          <Soil />
          {[-35, 35, -10].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={56} wid={13} fill={i % 2 ? '#5f9a4a' : '#6aa652'} />)}
          <Stem d="M100,220 C100,170 100,110 100,48" w={2} c="#7aa058" />
          {range(9).map((i) => {
            const y = 130 - i * 9;
            const x = 100 + (i % 2 ? 7 : -7);
            return (
              <g key={i} transform={`translate(${x} ${y})`}>
                {[-60, 60, 180].map((a) => <Leaf key={a} x={0} y={0} rot={a} len={8} wid={3} fill={shade(c, 0.25)} vein={false} />)}
                <path d="M0,0 C-5,3 -6,9 0,11 C6,9 5,3 0,0Z" fill={c} stroke={shade(c, -0.35)} strokeWidth={0.5} />
              </g>
            );
          })}
        </>
      );
    case 'zwiebel':
      return (
        <>
          <Soil />
          {[-30, -12, 8, 26].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={80} wid={9} shape="schmal" fill={i % 2 ? '#5a9a45' : '#6aa652'} />)}
          <Stem d="M100,220 C100,170 100,120 100,80" w={2.4} c="#6fa25a" />
          {range(7).map((i) => {
            const a = -160 + i * 23;
            const rad = (a * Math.PI) / 180;
            return <Radial key={i} x={100 + Math.cos(rad) * 22} y={72 + Math.sin(rad) * 16} r={9} n={6} petalW={0.34} shape="spitz" fill={c} center="#f2d24a" centerR={0.22} />;
          })}
        </>
      );
    case 'distel':
      return (
        <>
          <Soil />
          {[-50, 50, -20, 20].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={50} wid={14} shape="gezaehnt" fill={i % 2 ? '#7a9a6a' : '#86a876'} />)}
          <Stem d="M100,220 C100,170 98,120 100,86" w={2.6} c="#7a9a5a" />
          <g transform="translate(100 78)">
            <ellipse cy={10} rx={12} ry={10} fill="#7a9a5a" stroke="#4a6a3a" />
            {range(18).map((i) => <line key={i} x1={0} y1={2} x2={Math.cos(-Math.PI * (i / 17)) * 18} y2={2 + Math.sin(-Math.PI * (i / 17)) * 16} stroke={c} strokeWidth={2.6} strokeLinecap="round" />)}
          </g>
        </>
      );
    default:
      return (
        <>
          <Soil />
          {[-60, -25, 25, 60].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={42} wid={13} fill={i % 2 ? '#5f9a4a' : '#6faa58'} />)}
          <Stem d="M100,218 C100,170 98,130 96,88" w={2.4} c="#6f9a52" />
          <Stem d="M99,160 C114,140 126,126 136,118" w={1.8} c="#6f9a52" />
          <Stem d="M99,150 C86,134 76,124 66,120" w={1.8} c="#6f9a52" />
          <Leaf x={99} y={175} rot={-50} len={22} wid={7} fill="#7fb05a" />
          <Leaf x={99} y={190} rot={50} len={22} wid={7} fill="#7fb05a" />
          <Radial x={96} y={82} r={18} n={6} petalW={0.42} fill={c} center="#f2c200" centerR={0.26} />
          <Radial x={136} y={112} r={13} n={6} petalW={0.42} fill={c} center="#f2c200" centerR={0.28} tilt={0.8} />
          <Radial x={66} y={114} r={13} n={6} petalW={0.42} fill={c} center="#f2c200" centerR={0.28} tilt={0.8} />
        </>
      );
  }
}

/** Seedling: the first stage after planting, tinted in the species colour. */
function Seedling({ color }: { color: string }) {
  return (
    <>
      <Soil w={50} />
      <Stem d="M100,220 C100,205 101,190 100,176" w={3} c="#7aa856" />
      <Leaf x={100} y={180} rot={-62} len={30} wid={12} shape="rund" fill="#8cc06a" />
      <Leaf x={100} y={180} rot={62} len={30} wid={12} shape="rund" fill="#7fb05a" />
      <Leaf x={100} y={176} rot={0} len={20} wid={6} fill="#5f9a4a" />
      <circle cx={100} cy={154} r={4} fill={color} stroke={shade(color, -0.35)} />
      {[[78, 160], [124, 158], [100, 140]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.6} fill="#fff8c8" opacity={0.9} />)}
    </>
  );
}

function EffectBack({ effect, id }: { effect: FormEffect; id: string }) {
  switch (effect) {
    case 'mond':
      return (
        <>
          <circle cx={100} cy={110} r={96} fill={`url(#${id}-glow)`} />
          <path d="M160,30 a16,16 0 1,0 12,26 a12,12 0 1,1 -12,-26z" fill="#f4f1d0" />
          {[[30, 40], [50, 80], [170, 100], [150, 60], [28, 120]].map(([x, y], i) => (
            <path key={i} d={`M${x},${y - 4} L${x + 1},${y - 1} L${x + 4},${y} L${x + 1},${y + 1} L${x},${y + 4} L${x - 1},${y + 1} L${x - 4},${y} L${x - 1},${y - 1}Z`} fill="#fffbe0" />
          ))}
        </>
      );
    case 'sonne':
      return (
        <g transform="translate(100 96)">
          {range(16).map((i) => <path key={i} d="M-6,-40 L0,-110 L6,-40Z" transform={`rotate(${i * 22.5})`} fill="#ffd54a" opacity={0.35} />)}
          <circle r={50} fill={`url(#${id}-glow)`} />
        </g>
      );
    case 'gipfel':
      return (
        <>
          <path d="M0,190 L40,100 L70,150 L110,60 L150,140 L180,110 L200,150 L200,200 L0,200Z" fill="#b8c6d8" opacity={0.75} />
          <path d="M40,100 L52,122 L30,122Z M110,60 L126,92 L96,92Z M180,110 L190,128 L170,128Z" fill="#ffffff" />
        </>
      );
    case 'wurzel':
      return (
        <g stroke="#e8b04a" strokeWidth={2} fill="none" opacity={0.85} strokeLinecap="round">
          <path d="M100,220 C96,228 84,232 70,238 M100,220 C104,230 118,234 132,238 M100,220 L100,240 M88,228 C80,234 70,236 60,236 M112,228 C122,234 132,236 142,236" />
        </g>
      );
    default:
      return null;
  }
}

function EffectFront({ effect }: { effect: FormEffect }) {
  switch (effect) {
    case 'tau':
      return (
        <>
          {[[60, 120], [86, 90], [130, 110], [110, 150], [70, 170], [146, 160], [96, 60]].map(([x, y], i) => <Drop key={i} x={x} y={y} r={3.4} color="#bfe8ff" />)}
          {range(10).map((i) => <line key={i} x1={20 + i * 18} y1={10 + (i % 3) * 14} x2={14 + i * 18} y2={30 + (i % 3) * 14} stroke="#bfe8ff" strokeWidth={1.2} opacity={0.6} />)}
        </>
      );
    case 'frost':
      return (
        <>
          {[[40, 50], [160, 70], [60, 150], [150, 170], [100, 30]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} stroke="#e8f6ff" strokeWidth={1.4} strokeLinecap="round">
              {range(3).map((k) => <line key={k} x1={-8} y1={0} x2={8} y2={0} transform={`rotate(${k * 60})`} />)}
            </g>
          ))}
        </>
      );
    case 'nebel':
      return (
        <g opacity={0.55}>
          <ellipse cx={60} cy={200} rx={70} ry={16} fill="#ffffff" />
          <ellipse cx={150} cy={190} rx={60} ry={12} fill="#ffffff" />
          <ellipse cx={100} cy={150} rx={90} ry={10} fill="#ffffff" opacity={0.6} />
        </g>
      );
    case 'bluete':
      return (
        <>
          {[[40, 60, 20], [160, 50, -30], [150, 140, 60], [50, 140, -50], [100, 24, 0]].map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx={4} ry={7} transform={`rotate(${r} ${x} ${y})`} fill="#ffc6dc" opacity={0.9} />
          ))}
          {[[70, 40], [130, 30], [170, 110], [30, 100]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2} fill="#fff6b0" />)}
        </>
      );
    default:
      return null;
  }
}

export type ArtStage = 'samen' | 'keimling' | 'jung' | 'reif';

interface Props {
  species: Species;
  stage?: ArtStage;
  effect?: FormEffect | null;
  silhouette?: boolean;
  background?: boolean;
  master?: boolean;
  className?: string;
  title?: string;
}

/** Plant illustration for cards, herbarium and greenhouse. */
export function PlantArt({ species, stage = 'reif', effect = null, silhouette = false, background = false, master = false, className, title }: Props) {
  const id = useId().replace(/:/g, '');
  const habitat = HABITATS.find((h) => h.id === species.habitats[0]);
  const sky = habitat?.sky ?? ['#a8c6a0', '#e6efd8'];
  const Drawn = species.art ? PLANT_ART[species.art] : null;
  let body: ReactNode;
  if (stage === 'samen') body = <Seedling color={species.color} />;
  else body = Drawn ? <Drawn /> : <GenericArt type={species.type} color={species.color} />;
  const scale = stage === 'keimling' ? 0.55 : stage === 'jung' ? 0.8 : 1;
  const glow = effect === 'mond' ? '#5b6bd8' : effect === 'sonne' ? '#ffd54a' : '#ffffff';
  return (
    <svg viewBox="0 0 200 240" className={className} role="img" aria-label={title ?? species.de}>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor={glow} stopOpacity={0.75} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-master`}>
          <stop offset="0.6" stopColor="#ffd54a" stopOpacity={0} />
          <stop offset="0.85" stopColor="#ffd54a" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffd54a" stopOpacity={0} />
        </radialGradient>
      </defs>
      {background && !silhouette && <rect width="200" height="240" fill={`url(#${id}-sky)`} />}
      {master && !silhouette && <circle cx={100} cy={120} r={110} fill={`url(#${id}-master)`} />}
      {effect && !silhouette && <EffectBack effect={effect} id={id} />}
      <g
        transform={scale !== 1 ? `translate(100 ${GROUND_Y}) scale(${scale}) translate(-100 ${-GROUND_Y})` : undefined}
        style={silhouette ? { filter: 'brightness(0)', opacity: 0.32 } : undefined}
      >
        {body}
      </g>
      {effect && !silhouette && <EffectFront effect={effect} />}
    </svg>
  );
}

export { Bell };
