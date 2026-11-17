// Gezeichnete Stimmung je Lebensraum-Raum (Banner 360 × 110).
import { useId, type ReactNode } from 'react';
import { roomInfo, type RoomId } from '../data/rooms';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const Tree = ({ x, y, s = 1, c = '#2c5a3a' }: { x: number; y: number; s?: number; c?: string }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-2.5} y={-6} width={5} height={22} fill="#4a3424" />
    <ellipse cx={0} cy={-18} rx={16} ry={20} fill={c} />
    <ellipse cx={-6} cy={-24} rx={8} ry={9} fill="#ffffff" opacity={0.08} />
  </g>
);
const Conifer = ({ x, y, s = 1 }: { x: number; y: number; s?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-2} y={-4} width={4} height={10} fill="#4a3424" />
    <path d="M0,-40 L12,-4 L-12,-4Z" fill="#244a33" />
    <path d="M0,-30 L9,-12 L-9,-12Z" fill="#2e5a3e" />
  </g>
);
const Grass = ({ x, y, c = '#5d8a3a', n = 5 }: { x: number; y: number; c?: string; n?: number }) => (
  <g stroke={c} strokeWidth={1.4} strokeLinecap="round">
    {range(n).map((i) => <line key={i} x1={x + i * 2} y1={y} x2={x + i * 2 + (i - n / 2) * 1.5} y2={y - 8 - (i % 3) * 3} />)}
  </g>
);
const Flowers = ({ y, c, n = 14, seed = 1 }: { y: number; c: string; n?: number; seed?: number }) => (
  <g>{range(n).map((i) => <circle key={i} cx={(i * 53 * seed) % 360} cy={y + ((i * 17) % 14)} r={2.2} fill={c} />)}</g>
);
const Water = ({ d, c = '#4e9fbd' }: { d: string; c?: string }) => (
  <g>
    <path d={d} fill={c} />
    <path d={d} fill="#ffffff" opacity={0.12} transform="translate(0 -2)" />
  </g>
);
const Rock = ({ x, y, s = 1, c = '#8a8f94' }: { x: number; y: number; s?: number; c?: string }) => (
  <path d={`M${x - 14 * s},${y} L${x - 8 * s},${y - 12 * s} L${x + 4 * s},${y - 15 * s} L${x + 14 * s},${y - 6 * s} L${x + 16 * s},${y}Z`} fill={c} stroke="#00000022" />
);

function motifs(id: RoomId): ReactNode {
  switch (id) {
    case 'wald':
      return <>{[20, 70, 130, 190, 250, 310, 345].map((x, i) => <Tree key={i} x={x} y={88} s={1.4 - (i % 2) * 0.3} c={i % 2 ? '#2c5a3a' : '#355f40'} />)}{range(8).map((i) => <Grass key={i} x={15 + i * 45} y={104} c="#3f6a35" />)}</>;
    case 'saum':
      return <>{[300, 335].map((x, i) => <Tree key={i} x={x} y={86} s={1.3} />)}<path d="M0,92 Q60,70 140,86 T260,84 L260,110 L0,110Z" fill="#3f6a3a" />{range(9).map((i) => <circle key={i} cx={10 + i * 28} cy={80 + (i % 3) * 4} r={9} fill="#4a7a42" />)}<Flowers y={92} c="#f2f0e6" n={8} /></>;
    case 'moor':
      return <><Water d="M30,96 Q70,88 120,96 Q90,104 30,96Z M200,100 Q250,92 300,100 Q260,108 200,100Z" c="#3e5f5a" />{range(14).map((i) => <g key={i}><line x1={20 + i * 25} y1={98} x2={20 + i * 25} y2={84} stroke="#8a9a5a" /><circle cx={20 + i * 25} cy={82} r={4} fill="#ffffff" /></g>)}<Conifer x={340} y={92} s={0.7} /></>;
    case 'heide':
      return <>{range(20).map((i) => <ellipse key={i} cx={(i * 19) % 360} cy={94 + (i % 3) * 5} rx={14} ry={6} fill={i % 2 ? '#a35ea0' : '#c27bbd'} />)}<Conifer x={60} y={86} s={0.8} /><Conifer x={290} y={88} s={0.9} /></>;
    case 'kalkrasen':
      return <><path d="M0,80 Q120,60 240,78 T360,72 L360,110 L0,110Z" fill="#a8b878" /><Rock x={250} y={88} s={1.2} c="#d6d2c4" /><Rock x={80} y={96} s={0.8} c="#e2ded2" /><Flowers y={84} c="#c78fb0" n={10} /><Flowers y={92} c="#f3c623" n={10} seed={2} /></>;
    case 'wiese':
      return <>{range(18).map((i) => <Grass key={i} x={i * 20} y={100 + (i % 2) * 4} />)}<Flowers y={86} c="#ffffff" n={14} /><Flowers y={90} c="#f5d000" n={10} seed={3} /><Tree x={320} y={84} s={1.1} /><path d="M20,78 L60,78 M24,72 L24,84 M56,72 L56,84" stroke="#8a6a44" strokeWidth={2} /></>;
    case 'feuchtwiese':
      return <><Water d="M90,98 Q140,92 190,98 Q140,104 90,98Z" c="#6fa8c0" />{range(18).map((i) => <Grass key={i} x={i * 20} y={100 + (i % 2) * 4} c="#4f7a3a" />)}<Flowers y={86} c="#e6c8ea" n={14} /><Flowers y={90} c="#8a3a6b" n={6} seed={2} /></>;
    case 'teich':
      return <><Water d="M20,88 Q180,70 340,88 Q300,108 180,106 Q60,108 20,88Z" />{range(5).map((i) => <ellipse key={i} cx={80 + i * 50} cy={92 + (i % 2) * 4} rx={9} ry={3} fill="#4f8a3a" />)}{range(8).map((i) => <g key={i}><line x1={10 + i * 6} y1={92} x2={8 + i * 6} y2={66} stroke="#6b8a3a" strokeWidth={2} /><rect x={5 + i * 6} y={64} width={4} height={10} rx={2} fill="#6b4a2b" /></g>)}</>;
    case 'fluss':
      return <><path d="M0,80 Q80,92 160,84 T360,90 L360,104 Q260,96 160,102 T0,98Z" fill="#4e9fbd" /><path d="M20,90 q20,-4 40,0 M140,94 q20,-4 40,0 M250,96 q20,-4 40,0" stroke="#d8f1fa" strokeWidth={1.5} fill="none" />{[40, 300].map((x, i) => <Tree key={i} x={x} y={76} s={1} c="#3f6a3a" />)}<Rock x={200} y={100} s={0.6} /></>;
    case 'fels':
      return <><path d="M0,110 L0,70 L40,40 L80,62 L120,30 L170,64 L210,50 L260,72 L300,44 L360,68 L360,110Z" fill="#9aa0a6" /><path d="M120,30 L135,60 M40,40 L50,64 M300,44 L310,70" stroke="#7b8086" strokeWidth={2} /><Grass x={60} y={100} c="#7a8a5a" /><Grass x={230} y={102} c="#7a8a5a" /></>;
    case 'alpen':
      return <><path d="M0,110 L0,80 L60,30 L110,70 L170,14 L230,66 L280,36 L360,78 L360,110Z" fill="#8a93a0" /><path d="M60,30 L75,46 L48,44Z M170,14 L190,38 L152,36Z M280,36 L294,52 L268,50Z" fill="#ffffff" /><path d="M0,96 Q180,80 360,96 L360,110 L0,110Z" fill="#7a9a5a" /><Flowers y={98} c="#f4f4ec" n={8} /></>;
    case 'acker':
      return <>{range(7).map((i) => <path key={i} d={`M0,${78 + i * 5} Q180,${74 + i * 5} 360,${78 + i * 5}`} stroke="#b89a5a" strokeWidth={2} fill="none" />)}<Flowers y={80} c="#e0262b" n={12} /><Flowers y={88} c="#3a6fe0" n={8} seed={2} /></>;
    case 'mauer':
      return <><rect x={0} y={58} width={360} height={52} fill="#a39890" />{range(6).map((r) => range(13).map((c) => <rect key={`${r}-${c}`} x={c * 30 - (r % 2) * 15} y={60 + r * 9} width={28} height={7} fill="#b8aea4" />))}<Grass x={90} y={60} c="#6a8a4a" /><Grass x={250} y={60} c="#6a8a4a" /></>;
    case 'salz':
      return <><path d="M0,86 Q90,64 180,84 T360,78 L360,110 L0,110Z" fill="#e6d3a1" /><path d="M0,100 Q180,94 360,100 L360,110 L0,110Z" fill="#6fb3d6" />{range(10).map((i) => <Grass key={i} x={20 + i * 34} y={86} c="#a3b58a" n={6} />)}</>;
    case 'galmei':
      return <><path d="M280,90 L290,40 L300,40 L310,90Z" fill="#6b5a44" /><rect x={286} y={30} width={18} height={12} fill="#8a7a64" /><Rock x={120} y={98} s={1} c="#9a8a70" />{range(14).map((i) => <circle key={i} cx={20 + i * 18} cy={94 + (i % 3) * 4} r={3} fill={i % 2 ? '#f5d000' : '#8a5ac4'} />)}</>;
    case 'hofsaum':
      return <><path d="M220,90 L220,50 L260,30 L300,50 L300,90Z" fill="#a0523a" /><rect x={250} y={64} width={18} height={26} fill="#4a3424" /><path d="M0,90 L200,90" stroke="#8a6a44" strokeWidth={3} />{range(10).map((i) => <line key={i} x1={i * 20} y1={80} x2={i * 20} y2={96} stroke="#8a6a44" strokeWidth={2} />)}{range(10).map((i) => <Grass key={i} x={i * 20} y={102} c="#3f6a35" n={7} />)}</>;
    case 'blaenke':
      return <><Water d="M60,94 Q180,82 300,94 Q180,104 60,94Z" c="#7ab8cf" />{range(16).map((i) => <Grass key={i} x={i * 23} y={102} c="#5f8a3a" />)}<path d="M120,60 q6,-6 12,0 q6,-6 12,0" stroke="#3a3a3a" strokeWidth={1.5} fill="none" /></>;
    case 'wegrand':
      return <><path d="M0,104 Q180,84 360,96 L360,110 L0,110Z" fill="#8a7a5a" /><path d="M0,98 Q180,80 360,90" stroke="#5a7a8a" strokeWidth={4} opacity={0.6} fill="none" /><path d="M0,106 Q180,90 360,100" stroke="#5a7a8a" strokeWidth={4} opacity={0.6} fill="none" />{range(12).map((i) => <Grass key={i} x={i * 30} y={84} c="#5f8a3a" />)}</>;
    case 'heideweiher':
      return <><Water d="M40,94 Q180,78 320,94 Q180,108 40,94Z" c="#6aaac4" />{range(14).map((i) => <ellipse key={i} cx={(i * 27) % 360} cy={84 + (i % 2) * 20} rx={12} ry={5} fill={i % 2 ? '#a35ea0' : '#c27bbd'} />)}{range(6).map((i) => <circle key={i} cx={110 + i * 26} cy={90} r={2.5} fill="#cfe2ff" />)}</>;
    case 'quellflur':
      return <><Rock x={70} y={92} s={1.3} c="#6a7a6a" /><path d="M80,80 Q120,92 200,90 T360,98" stroke="#7ec8e3" strokeWidth={5} fill="none" />{[230, 300].map((x, i) => <Tree key={i} x={x} y={80} s={1.2} c="#2f5a40" />)}{range(10).map((i) => <circle key={i} cx={100 + i * 14} cy={100} r={3} fill="#e8e070" />)}</>;
    case 'kalkacker':
      return <>{range(6).map((i) => <path key={i} d={`M0,${80 + i * 5} Q180,${76 + i * 5} 360,${80 + i * 5}`} stroke="#c8b888" strokeWidth={2} fill="none" />)}{range(20).map((i) => <rect key={i} x={(i * 41) % 360} y={84 + (i % 4) * 5} width={4} height={3} fill="#f2efe6" />)}<Flowers y={82} c="#e04a1a" n={8} /></>;
    case 'schlucht':
      return <><path d="M0,0 L60,0 L80,110 L0,110Z M360,0 L300,0 L280,110 L360,110Z" fill="#3a463e" />{range(6).map((i) => <path key={i} d={`M${66 + i * 2},${30 + i * 14} q10,-8 20,0`} stroke="#5f9a4a" strokeWidth={3} fill="none" />)}{range(6).map((i) => <path key={'b' + i} d={`M${294 - i * 2},${36 + i * 13} q-10,-8 -20,0`} stroke="#5f9a4a" strokeWidth={3} fill="none" />)}<Water d="M90,104 Q180,96 270,104 L270,110 L90,110Z" c="#3e6a7a" /></>;
    case 'schlagflur':
      return <>{range(6).map((i) => <rect key={i} x={30 + i * 55} y={86} width={14} height={8} rx={2} fill="#7a5a3a" />)}{range(14).map((i) => <g key={i}><line x1={10 + i * 26} y1={98} x2={10 + i * 26} y2={70} stroke="#5f7a3a" strokeWidth={1.5} /><ellipse cx={10 + i * 26} cy={72} rx={3} ry={8} fill="#c46aa6" /></g>)}<Conifer x={340} y={90} s={1.1} /></>;
    default:
      return <><path d="M20,40 L180,10 L340,40 L340,100 L20,100Z" fill="#ffffff" opacity={0.08} />{range(6).map((i) => <line key={i} x1={20 + i * 64} y1={40} x2={20 + i * 64} y2={100} stroke="#ffffff" opacity={0.15} />)}</>;
  }
}

export function RoomScene({ id, className }: { id: RoomId; className?: string }) {
  const uid = useId().replace(/:/g, '');
  const r = roomInfo(id);
  return (
    <svg viewBox="0 0 360 110" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={r.colors[0]} />
          <stop offset="1" stopColor={r.colors[1]} />
        </linearGradient>
      </defs>
      <rect width="360" height="110" fill={`url(#${uid}-sky)`} />
      <path d="M0,92 Q90,84 180,90 T360,88 L360,110 L0,110Z" fill={r.colors[2]} />
      {motifs(id)}
    </svg>
  );
}
