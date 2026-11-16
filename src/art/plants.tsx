// Handgezeichnete Figuren der 30 besonderen Arten (SVG, 200 × 240, Boden bei y = 220).
// Jede Art ist eine eigene Komposition. Später können sie durch Profi-Zeichnungen ersetzt werden.
import type { ReactNode } from 'react';
import { Bell, Drop, Frond, Leaf, Radial, Soil, Stem, Water, shade } from './parts';

const G = '#4f8a3a';
const GD = '#3b6a2c';
const GL = '#7fb05a';

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

function Loewenzahn() {
  return (
    <>
      <Soil />
      {[-70, -40, -12, 15, 42, 72].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={62 - Math.abs(r) * 0.2} wid={14} shape="gezaehnt" fill={i % 2 ? G : GL} />)}
      <Stem d="M98,218 C92,170 78,130 82,98" w={3.5} c="#7aa856" />
      <Stem d="M104,218 C112,160 126,110 128,78" w={3} c="#7aa856" />
      <Radial x={82} y={92} r={27} n={30} petalW={0.16} shape="zunge" fill="#f5c518" center="#e6a800" centerR={0.22} />
      <Radial x={82} y={92} r={17} n={22} petalW={0.2} shape="zunge" fill="#ffd93b" rot={8} />
      <g transform="translate(128 70)">
        {range(26).map((i) => {
          const a = (i * 360) / 26;
          return (
            <g key={i} transform={`rotate(${a})`}>
              <line x1={0} y1={0} x2={0} y2={-22} stroke="#ffffff" strokeWidth={0.7} opacity={0.9} />
              <circle cy={-23} r={2.6} fill="#ffffff" opacity={0.85} />
            </g>
          );
        })}
        <circle r={4} fill="#c9b98a" />
      </g>
    </>
  );
}

function Gaensebluemchen() {
  return (
    <>
      <Soil />
      {[-75, -50, -25, 0, 25, 50, 75].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={34} wid={11} shape="spatel" fill={i % 2 ? G : GL} />)}
      <Stem d="M95,215 C88,180 76,150 70,128" w={2.4} c="#6f9d4c" />
      <Stem d="M102,215 C104,170 108,120 112,96" w={2.4} c="#6f9d4c" />
      <Stem d="M106,215 C120,190 138,170 146,150" w={2.4} c="#6f9d4c" />
      <Radial x={70} y={124} r={20} n={26} petalW={0.17} shape="zunge" fill="#ffffff" stroke="#f3a6c0" center="#f5c518" centerR={0.3} tilt={0.85} />
      <Radial x={112} y={92} r={24} n={28} petalW={0.16} shape="zunge" fill="#ffffff" stroke="#f3a6c0" center="#f5c518" centerR={0.3} />
      <Radial x={146} y={146} r={14} n={20} petalW={0.18} shape="zunge" fill="#fff4f8" stroke="#f08fb2" center="#f5c518" centerR={0.34} tilt={0.7} />
    </>
  );
}

function Klatschmohn() {
  return (
    <>
      <Soil />
      {[-60, -30, 30, 62].map((r, i) => <Leaf key={i} x={100} y={218} rot={r} len={48} wid={13} shape="gezaehnt" fill={i % 2 ? G : GD} />)}
      <Stem d="M100,218 C96,180 104,140 98,96" w={3} c="#5e8f3f" />
      <Stem d="M101,180 C120,160 140,140 140,118" w={2.2} c="#5e8f3f" />
      {range(14).map((i) => <line key={i} x1={98 + (i % 2 ? 2 : -2)} y1={210 - i * 8} x2={98 + (i % 2 ? 6 : -6)} y2={207 - i * 8} stroke="#5e8f3f" strokeWidth={0.7} />)}
      <g transform="translate(98 84)">
        <path d="M0,10 C-40,14 -46,-30 -8,-34 C-2,-20 -2,0 0,10Z" fill="#d81f26" stroke="#9e1218" strokeWidth={0.8} />
        <path d="M0,10 C40,14 46,-30 8,-34 C2,-20 2,0 0,10Z" fill="#e0262b" stroke="#9e1218" strokeWidth={0.8} />
        <path d="M0,12 C-34,24 -30,-18 0,-22 C30,-18 34,24 0,12Z" fill="#ef3a33" stroke="#9e1218" strokeWidth={0.8} />
        <path d="M-14,-8 Q0,-14 14,-8" stroke="#fff" strokeOpacity={0.3} strokeWidth={2} fill="none" />
        <circle cy={-4} r={8} fill="#1e1a1a" />
        <circle cy={-4} r={4.5} fill="#5b6a3a" />
        {range(12).map((i) => <circle key={i} cx={Math.cos(i / 1.9) * 7.5} cy={-4 + Math.sin(i / 1.9) * 7.5} r={1} fill="#2b2b55" />)}
      </g>
      <g transform="translate(140 112) rotate(150)">
        <ellipse rx={6} ry={10} fill="#6e9f48" stroke="#4a7a2f" />
        {range(6).map((i) => <line key={i} x1={-6} y1={-6 + i * 2.5} x2={-9} y2={-7 + i * 2.5} stroke="#4a7a2f" strokeWidth={0.6} />)}
      </g>
    </>
  );
}

function Buschwindroeschen() {
  return (
    <>
      <Soil color="#4a3424" />
      <Stem d="M100,220 C98,190 102,160 100,128" w={2.4} c="#7b5a46" />
      {[-55, 0, 55].map((r, i) => (
        <g key={i}>
          <Leaf x={100} y={150} rot={r - 18} len={34} wid={8} shape="gezaehnt" fill={G} />
          <Leaf x={100} y={150} rot={r + 18} len={30} wid={7} shape="gezaehnt" fill={GL} />
        </g>
      ))}
      <Stem d="M100,150 C101,130 100,118 100,104" w={1.8} c="#7b5a46" />
      <Radial x={100} y={92} r={26} n={6} petalW={0.42} shape="oval" fill="#fbf8ff" stroke="#e2c4e6" center="#f2d24a" centerR={0.2} rot={15} tilt={0.9} />
      {range(10).map((i) => <circle key={i} cx={100 + Math.cos(i) * 6} cy={92 + Math.sin(i) * 5} r={1.4} fill="#e8b800" />)}
      <g opacity={0.8}>
        <Stem d="M60,220 C62,200 58,186 60,176" w={1.6} c="#7b5a46" />
        <Radial x={60} y={170} r={11} n={6} petalW={0.42} fill="#f6eefc" stroke="#d9b5df" center="#f2d24a" centerR={0.25} tilt={0.6} rot={10} />
      </g>
    </>
  );
}

function Wurmfarn() {
  return (
    <>
      <Soil color="#4a3424" />
      <Frond x0={100} y0={218} cx={70} cy={150} x1={30} y1={100} fill={G} />
      <Frond x0={100} y0={218} cx={130} cy={150} x1={170} y1={100} fill={G} />
      <Frond x0={100} y0={218} cx={84} cy={130} x1={70} y1={52} fill={GL} pinnae={16} size={16} />
      <Frond x0={100} y0={218} cx={118} cy={130} x1={132} y1={52} fill={GL} pinnae={16} size={16} />
      <Frond x0={100} y0={218} cx={60} cy={190} x1={18} y1={170} fill={GD} pinnae={10} size={12} />
      <Frond x0={100} y0={218} cx={140} cy={190} x1={182} y1={170} fill={GD} pinnae={10} size={12} />
      <path d="M100,218 C100,180 104,160 108,150 C114,138 104,128 98,136 C94,142 100,146 103,142" stroke="#8a6a3a" strokeWidth={3} fill="none" strokeLinecap="round" />
      {range(8).map((i) => <circle key={i} cx={101 + Math.sin(i) * 2} cy={210 - i * 8} r={1.4} fill="#a07a48" />)}
    </>
  );
}

function Besenheide() {
  const branches = ['M100,220 C90,190 70,160 56,120', 'M100,220 C100,180 98,140 100,90', 'M100,220 C112,190 130,160 146,118', 'M100,220 C80,205 52,192 34,170', 'M100,220 C122,206 150,194 168,172'];
  const spikes: [number, number, number][] = [[56, 120, -25], [100, 90, 0], [146, 118, 25], [34, 170, -50], [168, 172, 50], [78, 150, -15], [124, 148, 15]];
  return (
    <>
      <Soil color="#5a4030" w={78} />
      {branches.map((d, i) => <Stem key={i} d={d} w={2.4} c="#6b4a35" />)}
      {spikes.map(([x, y, r], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${r})`}>
          {range(9).map((k) => (
            <g key={k}>
              <ellipse cx={k % 2 ? 3 : -3} cy={k * 5} rx={3.2} ry={2.6} fill={k < 3 ? '#e39bd8' : '#c25bb5'} stroke="#8c3a84" strokeWidth={0.5} />
              <line x1={0} y1={k * 5} x2={k % 2 ? -4 : 4} y2={k * 5 + 2} stroke="#5f8a3e" strokeWidth={1} />
            </g>
          ))}
        </g>
      ))}
    </>
  );
}

function Fingerhut() {
  return (
    <>
      <Soil />
      {[-65, -35, 35, 65].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={50} wid={18} fill={i % 2 ? '#5f8f4a' : '#6d9d55'} />)}
      <Stem d="M100,218 C100,170 102,110 100,28" w={3} c="#6d8a4a" />
      {range(8).map((i) => {
        const y = 158 - i * 15;
        const s = 25 - i * 1.9;
        return <Bell key={i} x={101} y={y} s={s} fill={i > 5 ? '#c46aa6' : '#b0428f'} rot={-48 + i * 2} lip={0.25} spots="#5a1645" />;
      })}
      {range(4).map((i) => <ellipse key={i} cx={100 + (i % 2 ? 3 : -3)} cy={36 - i * 4} rx={2.5} ry={3.5} fill="#a8c070" />)}
    </>
  );
}

function Baerlauch() {
  return (
    <>
      <Soil color="#4a3424" />
      <Leaf x={100} y={220} rot={-32} len={110} wid={26} fill="#4f9a3e" />
      <Leaf x={100} y={220} rot={28} len={102} wid={24} fill="#5aa847" />
      <Leaf x={100} y={220} rot={-6} len={70} wid={20} fill="#3f8a32" />
      <Stem d="M100,220 C98,170 100,120 100,86" w={2.4} c="#6fa25a" />
      {range(11).map((i) => {
        const a = -150 + i * 12;
        const rad = (a * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 26;
        const y = 80 + Math.sin(rad) * 20;
        return (
          <g key={i}>
            <line x1={100} y1={86} x2={x} y2={y} stroke="#8ab872" strokeWidth={0.9} />
            <Radial x={x} y={y} r={8} n={6} petalW={0.34} shape="spitz" fill="#ffffff" stroke="#cfd8c8" center="#f4f1c8" centerR={0.22} rot={i * 9} />
          </g>
        );
      })}
    </>
  );
}

function Teichrose() {
  return (
    <>
      <Water y={180} />
      <g transform="translate(58 196)">
        <ellipse rx={34} ry={11} fill="#4f8a3a" stroke="#2f5d2a" />
        <path d="M0,0 L-6,-11 L6,-11Z" fill="#6cb6cf" />
        <path d="M0,0 L-24,-5 M0,0 L-20,6 M0,0 L22,-6 M0,0 L24,5" stroke="#3b6a2c" strokeWidth={0.8} />
      </g>
      <g transform="translate(146 202)">
        <ellipse rx={28} ry={9} fill="#5a9a42" stroke="#2f5d2a" />
        <path d="M0,0 L8,-9 L-2,-9Z" fill="#6cb6cf" />
      </g>
      <Stem d="M106,200 C108,170 104,140 102,118" w={4} c="#6e9a4a" />
      <g transform="translate(102 106)">
        {[-56, -20, 20, 56, 0].map((r, i) => (
          <path key={i} d="M0,10 C-15,6 -16,-18 0,-22 C16,-18 15,6 0,10Z" transform={`rotate(${r}) scale(${i === 4 ? 0.8 : 1})`} fill={i === 4 ? '#ffd52e' : '#f2c200'} stroke="#b08700" strokeWidth={0.8} />
        ))}
        <ellipse cy={-4} rx={7} ry={5} fill="#d69a00" />
        <path d="M-6,-10 Q0,-14 6,-10" stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5} fill="none" />
      </g>
    </>
  );
}

function Strandhafer() {
  return (
    <>
      <path d="M0,240 L0,214 C40,196 80,198 100,206 C130,196 170,196 200,212 L200,240Z" fill="#e6d3a1" />
      <path d="M20,222 q20,-6 40,0 M120,220 q20,-6 40,0" stroke="#cdb67e" strokeWidth={1.2} fill="none" />
      {[-48, -36, -24, -12, 0, 12, 24, 36, 48].map((r, i) => <Leaf key={i} x={100} y={212} rot={r * 0.9} len={100 - Math.abs(r) * 0.6} wid={5} shape="schmal" fill={i % 2 ? '#8faf8a' : '#a3c09a'} />)}
      {[[78, 54, -12], [100, 36, 0], [124, 58, 12]].map(([x, y, r], i) => (
        <g key={i}>
          <Stem d={`M100,210 Q${(100 + x) / 2},130 ${x},${y + 40}`} w={1.8} c="#b8b48a" />
          <g transform={`translate(${x} ${y}) rotate(${r})`}>
            <path d="M0,40 C-7,30 -7,8 0,0 C7,8 7,30 0,40Z" fill="#e3d29a" stroke="#b39d5e" strokeWidth={0.8} />
            {range(6).map((k) => <line key={k} x1={-4} y1={6 + k * 5} x2={4} y2={8 + k * 5} stroke="#c7b37a" strokeWidth={0.7} />)}
          </g>
        </g>
      ))}
    </>
  );
}

function Siebenstern() {
  return (
    <>
      <Soil color="#4a3424" w={44} />
      <Stem d="M100,220 C100,195 98,170 100,140" w={1.8} c="#6f9a52" />
      {[-80, -50, -20, 10, 40, 70, 100].map((r, i) => <Leaf key={i} x={100} y={140} rot={r - 10} len={40} wid={11} fill={i % 2 ? G : GL} />)}
      <Stem d="M100,140 C100,120 104,104 104,90" w={1.2} c="#8ab872" />
      <Radial x={104} y={82} r={20} n={7} petalW={0.42} shape="spitz" fill="#ffffff" stroke="#d8e0e8" center="#f5e27a" centerR={0.18} rot={8} />
      {range(7).map((i) => <circle key={i} cx={104 + Math.cos((i * 2 * Math.PI) / 7) * 5} cy={82 + Math.sin((i * 2 * Math.PI) / 7) * 5} r={1} fill="#e0b000" />)}
    </>
  );
}

function Tuerkenbund() {
  const flower = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-150, -110, -70, -30, 10, 50].map((r, i) => (
        <path key={i} d="M0,0 C6,-10 18,-12 20,-4 C21,2 16,4 14,0" transform={`rotate(${r})`} fill="#c46a9a" stroke="#8d3d6a" strokeWidth={0.8} />
      ))}
      {range(6).map((i) => <circle key={i} cx={Math.cos(i) * 6} cy={-4 + Math.sin(i) * 4} r={1.1} fill="#5a1d3e" />)}
      {[-12, -6, 0, 6, 12].map((dx, i) => (
        <g key={i}>
          <line x1={0} y1={0} x2={dx} y2={22} stroke="#d68fb5" strokeWidth={0.8} />
          <ellipse cx={dx} cy={23} rx={1.6} ry={3} fill="#c4561e" />
        </g>
      ))}
    </g>
  );
  return (
    <>
      <Soil />
      <Stem d="M100,220 C100,160 100,90 100,40" w={3} c="#6a7a3a" />
      {[0, 60, 120, 180, 240, 300].map((a, i) => <Leaf key={i} x={100} y={165} rot={a > 180 ? -70 + i * 6 : 70 - i * 6} len={34} wid={9} fill={i % 2 ? G : GD} />)}
      {range(4).map((i) => <Leaf key={i} x={100} y={120 - i * 10} rot={i % 2 ? 50 : -50} len={18} wid={5} fill={GL} />)}
      <Stem d="M100,80 C80,72 70,80 66,92" w={1.4} c="#6a7a3a" />
      <Stem d="M100,60 C120,52 132,60 136,72" w={1.4} c="#6a7a3a" />
      <Stem d="M100,42 C92,34 84,40 82,50" w={1.2} c="#6a7a3a" />
      {flower(66, 96, 1)}
      {flower(136, 76, 1)}
      {flower(82, 54, 0.75)}
    </>
  );
}

function Schluesselblume() {
  return (
    <>
      <Soil />
      {[-60, -30, 0, 30, 60].map((r, i) => (
        <g key={i}>
          <Leaf x={100} y={220} rot={r} len={46} wid={16} shape="spatel" fill={i % 2 ? '#78a85a' : '#6a9a4c'} />
          <path d={`M0,-10 L6,-14 M0,-20 L-6,-24 M0,-30 L6,-34`} transform={`translate(100 220) rotate(${r})`} stroke="#4f7a38" strokeWidth={0.6} />
        </g>
      ))}
      <Stem d="M100,218 C100,170 98,120 100,76" w={2.6} c="#86a860" />
      {range(7).map((i) => {
        const a = 30 + i * 18;
        const rad = (a * Math.PI) / 180;
        const x = 100 + Math.cos(rad) * 24;
        const y = 82 + Math.sin(rad) * 18;
        return (
          <g key={i}>
            <line x1={100} y1={76} x2={x} y2={y} stroke="#86a860" strokeWidth={1} />
            <g transform={`translate(${x} ${y}) rotate(${a - 90})`}>
              <path d="M-4,0 L-5,14 L5,14 L4,0Z" fill="#c3d88a" stroke="#86a860" strokeWidth={0.6} />
              <Radial x={0} y={18} r={7} n={5} petalW={0.55} shape="rund" fill="#f3c623" center="#e57d00" centerR={0.25} />
            </g>
          </g>
        );
      })}
    </>
  );
}

function Glockenheide() {
  const cluster = (x: number, y: number) => (
    <g transform={`translate(${x} ${y})`}>
      {[-30, -10, 10, 30].map((r, i) => (
        <g key={i} transform={`rotate(${r})`}>
          <ellipse cx={0} cy={9} rx={4.5} ry={6.5} fill={i % 2 ? '#f08bb0' : '#f6a6c4'} stroke="#c25f88" strokeWidth={0.6} />
          <ellipse cx={0} cy={15} rx={2} ry={1} fill="#b04c78" />
        </g>
      ))}
    </g>
  );
  const twigs: [string, number, number][] = [['M100,220 C88,190 74,160 66,110', 66, 104], ['M100,220 C104,180 104,140 110,84', 110, 78], ['M100,220 C118,196 136,170 146,124', 146, 118], ['M100,220 C80,206 56,196 40,168', 40, 162]];
  return (
    <>
      <Soil color="#4a3b26" />
      {twigs.map(([d, x, y], i) => (
        <g key={i}>
          <Stem d={d} w={2} c="#7a5a40" />
          {range(5).map((k) => (
            <g key={k} transform={`translate(${x + (100 - x) * (0.2 + k * 0.15)} ${y + (220 - y) * (0.2 + k * 0.15)})`}>
              {[0, 90, 180, 270].map((a) => <Leaf key={a} x={0} y={0} rot={a + 45} len={7} wid={2} shape="nadel" fill="#7f9a7a" vein={false} />)}
            </g>
          ))}
          {cluster(x, y)}
        </g>
      ))}
    </>
  );
}

function Akelei() {
  const flower = (x: number, y: number, s: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      {[-50, -25, 0, 25, 50].map((a, i) => (
        <path key={i} d="M0,0 C-6,-6 -5,-20 -2,-26 C2,-30 6,-26 3,-22" transform={`rotate(${a})`} fill="none" stroke="#3f308f" strokeWidth={3.2} strokeLinecap="round" />
      ))}
      {[-60, -30, 0, 30, 60].map((a, i) => <Leaf key={i} x={0} y={0} rot={a + 180} len={20} wid={7} fill="#5b4bb7" vein={false} />)}
      <path d="M-9,4 Q0,16 9,4 L6,0 L-6,0Z" fill="#7a6ad0" stroke="#3f308f" strokeWidth={0.7} />
      <circle cy={10} r={2.5} fill="#f2d24a" />
    </g>
  );
  return (
    <>
      <Soil />
      {[-60, -25, 25, 60].map((r, i) => (
        <g key={i} transform={`translate(100 220) rotate(${r})`}>
          <line x1={0} y1={0} x2={0} y2={-30} stroke="#6e9a54" strokeWidth={1.4} />
          {[-28, 0, 28].map((a) => <Leaf key={a} x={0} y={-30} rot={a} len={16} wid={9} shape="rund" fill="#88a87a" />)}
        </g>
      ))}
      <Stem d="M100,218 C100,170 98,120 100,70" w={2} c="#6e7a54" />
      <Stem d="M100,110 C80,96 70,90 64,96" w={1.4} c="#6e7a54" />
      <Stem d="M100,90 C118,76 130,74 138,80" w={1.4} c="#6e7a54" />
      {flower(64, 104, 1, 180)}
      {flower(138, 88, 0.9, 170)}
      {flower(100, 78, 1.05, 190)}
    </>
  );
}

function Wollgras() {
  const tuft = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {range(14).map((i) => {
        const a = i * 2.4;
        return <ellipse key={i} cx={Math.cos(a) * 9} cy={Math.sin(a) * 9 - 4} rx={10} ry={8} fill="#ffffff" opacity={0.75} />;
      })}
      {range(16).map((i) => {
        const a = (i / 16) * Math.PI * 2;
        return <line key={i} x1={0} y1={0} x2={Math.cos(a) * 18} y2={Math.sin(a) * 15 - 4} stroke="#f2f2f2" strokeWidth={0.6} />;
      })}
      <circle r={2.5} fill="#7a6a4a" />
    </g>
  );
  return (
    <>
      <Soil color="#4a3b26" />
      {[-40, -28, -16, -6, 6, 16, 28, 40].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={70 - Math.abs(r) * 0.4} wid={3.5} shape="schmal" fill={i % 2 ? '#7a9a52' : '#8faa60'} />)}
      {[[70, 70], [98, 44], [128, 66], [150, 98]].map(([x, y], i) => (
        <g key={i}>
          <Stem d={`M100,218 Q${(100 + x) / 2},${(218 + y) / 2 + 10} ${x},${y}`} w={1.5} c="#8f9a5a" />
          {tuft(x, y, i === 3 ? 0.8 : 1)}
        </g>
      ))}
    </>
  );
}

function Sonnentau() {
  const leaf = (r: number, len: number) => (
    <g transform={`translate(100 212) rotate(${r})`}>
      <line x1={0} y1={0} x2={0} y2={-len} stroke="#a7b56a" strokeWidth={2} />
      <g transform={`translate(0 ${-len - 9})`}>
        {range(18).map((i) => {
          const a = (i / 18) * Math.PI * 2;
          return (
            <g key={i}>
              <line x1={Math.cos(a) * 7} y1={Math.sin(a) * 7} x2={Math.cos(a) * 13} y2={Math.sin(a) * 13} stroke="#d6304a" strokeWidth={1} />
              <circle cx={Math.cos(a) * 13.5} cy={Math.sin(a) * 13.5} r={1.7} fill="#ffd6e0" opacity={0.95} />
            </g>
          );
        })}
        <circle r={9} fill="#c33a3a" stroke="#8c1f2c" strokeWidth={0.8} />
        <circle r={9} fill="#e8a060" opacity={0.25} />
        {range(6).map((i) => <circle key={i} cx={Math.cos(i) * 4.5} cy={Math.sin(i) * 4.5} r={1.4} fill="#ffe2ea" />)}
      </g>
    </g>
  );
  return (
    <>
      <ellipse cx={100} cy={222} rx={80} ry={12} fill="#8aa04a" opacity={0.8} />
      {range(10).map((i) => <circle key={i} cx={30 + i * 15} cy={220 + (i % 3) * 2} r={5} fill="#9fb85a" opacity={0.8} />)}
      {[-80, -50, -20, 15, 48, 80].map((r, i) => <g key={i}>{leaf(r, 26 + (i % 2) * 8)}</g>)}
      <Stem d="M100,212 C102,170 98,120 104,70 C108,56 118,58 116,66" w={1.4} c="#c46a6a" />
      {range(4).map((i) => <circle key={i} cx={104 + i * 2.8} cy={74 - i * 5} r={2.8} fill="#ffffff" stroke="#e0c0c8" strokeWidth={0.5} />)}
    </>
  );
}

function Arnika() {
  return (
    <>
      <Soil />
      {[-62, -26, 26, 62].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={44} wid={15} fill={i % 2 ? '#5f9a4a' : '#6faa58'} />)}
      <Stem d="M100,218 C100,170 98,120 96,82" w={2.8} c="#7a9a52" />
      <Leaf x={99} y={150} rot={-60} len={22} wid={7} fill={GL} />
      <Leaf x={99} y={150} rot={60} len={22} wid={7} fill={GL} />
      <Stem d="M98,140 C116,124 132,116 144,110" w={2} c="#7a9a52" />
      <Radial x={96} y={74} r={32} n={13} petalW={0.22} shape="zunge" fill="#f5a300" center="#e08000" centerR={0.3} jitter={9} rot={4} />
      {range(16).map((i) => <circle key={i} cx={96 + Math.cos(i * 2.4) * (i / 2.2)} cy={74 + Math.sin(i * 2.4) * (i / 2.2)} r={1.2} fill="#b85e00" />)}
      <Radial x={146} y={104} r={18} n={12} petalW={0.24} shape="zunge" fill="#f7b324" center="#e08000" centerR={0.32} jitter={7} tilt={0.75} />
    </>
  );
}

function Frauenschuh() {
  return (
    <>
      <Soil />
      {[[-38, 64, 26], [32, 60, 24], [-12, 48, 20]].map(([r, len, wid], i) => (
        <g key={i}>
          <Leaf x={100} y={210 - i * 20} rot={r} len={len} wid={wid} fill={i % 2 ? '#5f9a4a' : '#6aa652'} vein={false} />
          {[-0.4, 0, 0.4].map((k) => <path key={k} d={`M0,0 Q${wid * k},${-len * 0.5} 0,${-len * 0.95}`} transform={`translate(100 ${210 - i * 20}) rotate(${r})`} stroke="#4a7a38" strokeWidth={0.7} fill="none" />)}
        </g>
      ))}
      <Stem d="M100,220 C100,170 102,120 104,84" w={2.6} c="#6a8a4a" />
      <g transform="translate(104 84)">
        <path d="M0,-4 C-4,-24 -2,-40 4,-48 C8,-38 6,-20 2,-4Z" fill="#6a2a1e" stroke="#3e150e" strokeWidth={0.7} />
        <path d="M-2,2 C-14,0 -26,10 -36,22 C-32,26 -28,22 -26,26 C-22,18 -14,10 -2,8Z" fill="#7a3324" stroke="#3e150e" strokeWidth={0.7} />
        <path d="M2,2 C14,0 26,10 36,22 C32,26 28,22 26,26 C22,18 14,10 2,8Z" fill="#7a3324" stroke="#3e150e" strokeWidth={0.7} />
        <path d="M-15,12 C-18,40 18,40 15,12 C10,8 -10,8 -15,12Z" fill="#f2d21b" stroke="#b39600" strokeWidth={1} />
        <ellipse cx={0} cy={13} rx={9} ry={4} fill="#8a6a00" />
        <path d="M-9,20 Q-10,30 -4,34" stroke="#fff" strokeOpacity={0.55} strokeWidth={2} fill="none" />
        {range(5).map((i) => <circle key={i} cx={-6 + i * 3} cy={16} r={0.8} fill="#a0401e" />)}
      </g>
    </>
  );
}

function Fliegenragwurz() {
  const flower = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {[-120, 0, 120].map((r) => <Leaf key={r} x={0} y={0} rot={r} len={13} wid={4} fill="#9cbf6a" vein={false} />)}
      <path d="M-3,-2 C-8,-10 -10,-14 -9,-18" stroke="#3a1a12" strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M3,-2 C8,-10 10,-14 9,-18" stroke="#3a1a12" strokeWidth={2} strokeLinecap="round" fill="none" />
      <path d="M0,0 C-7,4 -8,12 -10,20 L-4,18 L0,24 L4,18 L10,20 C8,12 7,4 0,0Z" fill="#5a2a1e" stroke="#2e120c" strokeWidth={0.6} />
      <rect x={-4} y={6} width={8} height={4} rx={1.5} fill="#7fa8e0" />
      <rect x={-3} y={6.5} width={4} height={1.4} rx={0.7} fill="#cfe2ff" opacity={0.8} />
    </g>
  );
  return (
    <>
      <Soil />
      {[-40, -15, 18, 42].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={46} wid={9} fill={i % 2 ? '#6a9a4c' : '#5f8f42'} />)}
      <Stem d="M100,220 C100,170 98,110 100,40" w={1.8} c="#7aa058" />
      {flower(100, 150, 1.25)}
      {flower(100, 112, 1.15)}
      {flower(100, 76, 1)}
      <ellipse cx={100} cy={44} rx={3} ry={5} fill="#9cbf6a" />
    </>
  );
}

function Krebsschere() {
  const sword = (r: number, len: number, c: string) => (
    <g transform={`translate(100 198) rotate(${r})`}>
      <path d={`M-5,0 L0,${-len} L5,0Z`} fill={c} stroke={shade(c, -0.35)} strokeWidth={0.7} />
      {range(6).map((i) => <line key={i} x1={4.5 - i * 0.7} y1={-i * (len / 7) - 4} x2={7 - i * 0.7} y2={-i * (len / 7) - 7} stroke={shade(c, -0.35)} strokeWidth={0.7} />)}
    </g>
  );
  return (
    <>
      <Water y={186} />
      {[-70, -50, -30, -12, 8, 26, 46, 66].map((r, i) => <g key={i}>{sword(r, 62 - Math.abs(r) * 0.3, i % 2 ? '#4f8a3a' : '#5fa046')}</g>)}
      <g transform="translate(100 150)">
        {[0, 120, 240].map((r) => <path key={r} d="M0,0 C14,-4 18,-18 0,-22 C-18,-18 -14,-4 0,0Z" transform={`rotate(${r})`} fill="#ffffff" stroke="#d0d0d0" strokeWidth={0.8} />)}
        <circle r={4} fill="#f2c200" />
      </g>
    </>
  );
}

function Moorlilie() {
  return (
    <>
      <Soil color="#4a3b26" />
      {[-30, -18, -6, 6, 18, 30].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={56 - Math.abs(r) * 0.5} wid={8} shape="schmal" fill={i % 2 ? '#5f8f42' : '#6a9a4c'} />)}
      <Stem d="M100,220 C100,180 101,120 100,56" w={2} c="#9a8a4a" />
      {range(10).map((i) => {
        const y = 120 - i * 7;
        const x = 100 + (i % 2 ? 8 : -8);
        return (
          <g key={i}>
            <line x1={100} y1={y + 4} x2={x} y2={y} stroke="#9a8a4a" strokeWidth={0.8} />
            <Radial x={x} y={y} r={8 - i * 0.3} n={6} petalW={0.32} shape="spitz" fill="#f6c10a" center="#e86a00" centerR={0.25} rot={i * 10} />
            {range(6).map((k) => <line key={k} x1={x} y1={y} x2={x + Math.cos(k) * 4} y2={y + Math.sin(k) * 4} stroke="#ff9a2a" strokeWidth={0.8} />)}
          </g>
        );
      })}
    </>
  );
}

function Stranddistel() {
  const spinyLeaf = (x: number, y: number, r: number, len: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={`M0,0 L-14,${-len * 0.2} L-8,${-len * 0.35} L-18,${-len * 0.55} L-8,${-len * 0.62} L-12,${-len * 0.85} L0,${-len} L12,${-len * 0.85} L8,${-len * 0.62} L18,${-len * 0.55} L8,${-len * 0.35} L14,${-len * 0.2}Z`} fill="#a9c2d6" stroke="#6f8ea8" strokeWidth={0.9} strokeLinejoin="round" />
      <path d={`M0,0 L0,${-len * 0.9} M0,${-len * 0.3} L-12,${-len * 0.5} M0,${-len * 0.3} L12,${-len * 0.5}`} stroke="#e8f2fa" strokeWidth={1} opacity={0.8} />
    </g>
  );
  const head = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {range(8).map((i) => <Leaf key={i} x={0} y={0} rot={i * 45 + 22} len={24} wid={7} shape="gezaehnt" fill="#9cb8d4" vein={false} />)}
      <circle r={12} fill="#8fa8d8" stroke="#5a74a8" />
      {range(20).map((i) => <circle key={i} cx={Math.cos(i * 2.4) * (i * 0.55)} cy={Math.sin(i * 2.4) * (i * 0.55)} r={1.5} fill="#c9d6f2" />)}
    </g>
  );
  return (
    <>
      <path d="M0,240 L0,216 C50,204 150,204 200,216 L200,240Z" fill="#e6d3a1" />
      {spinyLeaf(100, 214, -55, 58)}
      {spinyLeaf(100, 214, 55, 58)}
      {spinyLeaf(100, 214, -20, 66)}
      {spinyLeaf(100, 214, 22, 64)}
      <Stem d="M100,214 C98,170 90,130 76,96" w={3} c="#8ea8c0" />
      <Stem d="M100,180 C112,150 124,130 134,110" w={2.6} c="#8ea8c0" />
      {spinyLeaf(92, 150, -40, 28)}
      {spinyLeaf(110, 160, 45, 26)}
      {head(76, 88, 1)}
      {head(134, 104, 0.8)}
    </>
  );
}

function Schachblume() {
  const bell = (x: number, y: number, s: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-6,0 C-20,6 -24,32 -18,44 Q0,50 18,44 C24,32 20,6 6,0Z" fill="url(#schach)" stroke="#4a1a36" strokeWidth={1} />
      <path d="M-14,10 C-18,22 -18,32 -14,40" stroke="#fff" strokeOpacity={0.35} strokeWidth={2.2} fill="none" />
      <path d="M-18,44 L-12,50 L-4,46 L4,50 L12,46 L18,44" fill="#7a2a5a" stroke="#4a1a36" strokeWidth={0.8} />
    </g>
  );
  return (
    <>
      <defs>
        <pattern id="schach" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#e8c8dc" />
          <rect width="4" height="4" fill="#8a3a6b" />
          <rect x="4" y="4" width="4" height="4" fill="#8a3a6b" />
        </pattern>
      </defs>
      <Soil />
      {[-30, -14, 10, 26].map((r, i) => <Leaf key={i} x={100} y={220} rot={r} len={60} wid={5} shape="schmal" fill={i % 2 ? '#7a9a6a' : '#86a876'} />)}
      <Stem d="M100,220 C98,170 96,120 100,70 C104,58 116,56 122,62" w={2} c="#7a8a5a" />
      <Leaf x={99} y={150} rot={-25} len={36} wid={4} shape="schmal" fill="#86a876" />
      <Leaf x={98} y={120} rot={20} len={30} wid={4} shape="schmal" fill="#86a876" />
      <Stem d="M98,140 C80,120 70,110 64,112" w={1.6} c="#7a8a5a" />
      {bell(122, 64, 1, -12)}
      {bell(64, 112, 0.75, 10)}
    </>
  );
}

function Glanzkraut() {
  const flower = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      {[-60, 60, 180].map((a) => <path key={a} d="M0,0 L-1.2,-12 L1.2,-12Z" transform={`rotate(${a})`} fill="#c9d86a" stroke="#8a9a3a" strokeWidth={0.4} />)}
      <path d="M0,0 C-6,4 -7,12 0,14 C7,12 6,4 0,0Z" fill="#d8e27a" stroke="#8a9a3a" strokeWidth={0.6} />
      <path d="M-8,-2 C-10,-6 -9,-10 -7,-12 M8,-2 C10,-6 9,-10 7,-12" stroke="#b0c050" strokeWidth={1} fill="none" />
    </g>
  );
  return (
    <>
      <ellipse cx={100} cy={222} rx={70} ry={10} fill="#7a9a4a" opacity={0.8} />
      <g>
        <Leaf x={98} y={220} rot={-22} len={70} wid={22} fill="#b6cf4e" vein={false} />
        <Leaf x={102} y={220} rot={20} len={66} wid={20} fill="#a8c444" vein={false} />
        <path d="M70,170 Q78,150 86,140" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M122,172 Q118,156 116,148" stroke="#ffffff" strokeOpacity={0.6} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      </g>
      <Stem d="M100,220 C100,180 100,140 100,88" w={2} c="#9ab04a" />
      {flower(108, 150, 20)}
      {flower(92, 132, -20)}
      {flower(108, 114, 15)}
      {flower(93, 98, -15)}
      {flower(102, 84, 0)}
    </>
  );
}

function Edelweiss() {
  const star = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {range(9).map((i) => <Leaf key={i} x={0} y={0} rot={i * 40 + 5} len={i % 2 ? 26 : 30} wid={7} fill="#f4f4ec" vein={false} />)}
      {range(9).map((i) => <Leaf key={'b' + i} x={0} y={0} rot={i * 40 + 5} len={i % 2 ? 22 : 26} wid={4} fill="#ffffff" vein={false} opacity={0.6} />)}
      {range(7).map((i) => <circle key={i} cx={i === 0 ? 0 : Math.cos(i) * 6} cy={i === 0 ? 0 : Math.sin(i) * 6} r={3.6} fill="#e8dfaa" stroke="#c9bd7a" strokeWidth={0.6} />)}
    </g>
  );
  return (
    <>
      <path d="M0,240 L0,212 L30,196 L58,206 L84,190 L118,204 L150,186 L200,206 L200,240Z" fill="#9aa0a8" />
      <path d="M30,196 L44,214 M84,190 L96,212 M150,186 L162,210" stroke="#7b7f86" strokeWidth={1.5} />
      {[-60, -30, 0, 30, 60].map((r, i) => <Leaf key={i} x={100} y={210} rot={r} len={34} wid={6} fill="#c6cfc0" />)}
      <Stem d="M100,210 C98,170 92,130 84,96" w={2.4} c="#c6cfc0" />
      <Stem d="M100,200 C110,170 126,146 138,128" w={2} c="#c6cfc0" />
      <Leaf x={95} y={160} rot={-50} len={18} wid={4} fill="#d4dccc" />
      <Leaf x={110} y={168} rot={50} len={16} wid={4} fill="#d4dccc" />
      {star(84, 90, 1.1)}
      {star(138, 124, 0.75)}
    </>
  );
}

function Lungenenzian() {
  const trumpet = (x: number, y: number, r: number, s: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-4,0 C-6,-12 -10,-24 -13,-34 L13,-34 C10,-24 6,-12 4,0Z" fill="#2c5fd1" stroke="#1a3a8a" strokeWidth={0.9} />
      {[-6, 0, 6].map((dx) => <path key={dx} d={`M${dx * 0.3},-2 L${dx},-32`} stroke="#5a9a5a" strokeWidth={1.2} opacity={0.7} />)}
      <path d="M-13,-34 L-9,-40 L-4,-35 L0,-41 L4,-35 L9,-40 L13,-34Z" fill="#3a74e8" stroke="#1a3a8a" strokeWidth={0.8} />
      <ellipse cx={0} cy={-34} rx={10} ry={2.6} fill="#163068" />
      <path d="M-8,-8 C-9,-18 -10,-24 -10,-30" stroke="#fff" strokeOpacity={0.35} strokeWidth={1.6} fill="none" />
    </g>
  );
  return (
    <>
      <Soil color="#4a3b26" />
      <Stem d="M100,220 C100,180 98,130 100,84" w={2.4} c="#5f8a3a" />
      {range(6).map((i) => (
        <g key={i}>
          <Leaf x={100} y={205 - i * 18} rot={-58} len={24} wid={4.5} fill={i % 2 ? G : GD} />
          <Leaf x={100} y={205 - i * 18} rot={58} len={24} wid={4.5} fill={i % 2 ? GD : G} />
        </g>
      ))}
      {trumpet(100, 86, 0, 1.15)}
      {trumpet(98, 116, -28, 0.95)}
      {trumpet(102, 132, 30, 0.9)}
      <Stem d="M100,150 C86,140 78,130 74,120" w={1.4} c="#5f8a3a" />
      {trumpet(74, 122, -15, 0.75)}
    </>
  );
}

function Wasserfenchel() {
  const umbel = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {range(7).map((i) => {
        const a = -160 + i * 23;
        const rad = (a * Math.PI) / 180;
        const ex = Math.cos(rad) * 24;
        const ey = Math.sin(rad) * 14;
        return (
          <g key={i}>
            <line x1={0} y1={14} x2={ex} y2={ey} stroke="#8aa868" strokeWidth={0.9} />
            {range(7).map((k) => <circle key={k} cx={ex + Math.cos(k * 0.9 - 2.5) * 5} cy={ey + Math.sin(k * 0.9 - 2.5) * 3.5 - 1} r={1.9} fill="#ffffff" stroke="#d8e2d0" strokeWidth={0.4} />)}
          </g>
        );
      })}
    </g>
  );
  const fineLeaf = (x: number, y: number, r: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <line x1={0} y1={0} x2={0} y2={-34} stroke="#5f8a3a" strokeWidth={1} />
      {range(5).map((i) => (
        <g key={i}>
          <Leaf x={0} y={-8 - i * 6} rot={-55} len={9} wid={3} shape="gezaehnt" fill={G} vein={false} />
          <Leaf x={0} y={-8 - i * 6} rot={55} len={9} wid={3} shape="gezaehnt" fill={GL} vein={false} />
        </g>
      ))}
    </g>
  );
  return (
    <>
      <path d="M0,240 L0,214 C60,206 140,206 200,214 L200,240Z" fill="#6b5a40" />
      <path d="M0,226 C50,220 150,220 200,226 L200,240 L0,240Z" fill="#5c8aa0" opacity={0.75} />
      <path d="M20,230 q15,-4 30,0 M120,232 q15,-4 30,0" stroke="#cfe6f0" strokeWidth={1} fill="none" />
      {[-60, -30, 30, 60].map((r) => <g key={r}>{fineLeaf(100, 214, r)}</g>)}
      <Stem d="M100,214 C98,170 100,110 98,74" w={3.4} c="#7a9a5a" />
      <Stem d="M99,140 C116,120 128,104 134,96" w={2.2} c="#7a9a5a" />
      {[0, 1, 2].map((i) => <line key={i} x1={97} y1={200 - i * 30} x2={101} y2={200 - i * 30} stroke="#5f7a40" strokeWidth={2} />)}
      {fineLeaf(99, 150, -45)}
      {umbel(98, 60, 1.1)}
      {umbel(134, 84, 0.75)}
    </>
  );
}

function BoehmischerEnzian() {
  const flower = (x: number, y: number, r: number, s: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-3,0 L-5,-18 L5,-18 L3,0Z" fill="#7a3fb4" stroke="#4a1f7a" strokeWidth={0.6} />
      <Radial x={0} y={-20} r={8} n={5} petalW={0.4} shape="spitz" fill="#9b5fd4" center="#f2e8ff" centerR={0.22} tilt={0.55} />
      {range(5).map((i) => <line key={i} x1={Math.cos(i * 1.256) * 2} y1={-20 + Math.sin(i * 1.256) * 1} x2={Math.cos(i * 1.256) * 3.5} y2={-23} stroke="#f2e8ff" strokeWidth={0.5} />)}
    </g>
  );
  const branches: [string, number, number][] = [['M100,220 C100,180 98,140 100,96', 100, 96], ['M100,190 C86,170 76,150 70,128', 70, 128], ['M100,180 C114,160 124,146 132,124', 132, 124], ['M100,160 C90,146 84,136 82,112', 82, 112], ['M100,150 C110,136 116,124 118,104', 118, 104]];
  return (
    <>
      <Soil />
      {branches.map(([d], i) => <Stem key={i} d={d} w={1.8} c="#7a5a7a" />)}
      {[200, 176, 150].map((y, i) => (
        <g key={i}>
          <Leaf x={100} y={y} rot={-55} len={18} wid={4} fill={G} />
          <Leaf x={100} y={y} rot={55} len={18} wid={4} fill={GL} />
        </g>
      ))}
      {branches.map(([, x, y], i) => <g key={i}>{flower(x, y + 4, (x - 100) * 0.3, 1.05)}</g>)}
      {flower(92, 140, -20, 0.8)}
      {flower(110, 132, 20, 0.8)}
    </>
  );
}

function BodenseeVergissmeinnicht() {
  const flowers: [number, number, number][] = [[70, 170, 1], [86, 158, 1.1], [104, 152, 1.15], [122, 160, 1], [138, 172, 0.9], [78, 184, 0.9], [96, 172, 1], [116, 176, 1], [132, 188, 0.85], [60, 186, 0.8], [104, 190, 0.9], [148, 190, 0.75]];
  return (
    <>
      <path d="M0,240 L0,214 C60,206 140,206 200,214 L200,240Z" fill="#b8b0a2" />
      {range(14).map((i) => <ellipse key={i} cx={10 + i * 14} cy={218 + (i % 3) * 4} rx={7} ry={4.5} fill={['#d2cabb', '#a89e8e', '#c4bcaf'][i % 3]} />)}
      <path d="M0,232 C60,226 140,226 200,232 L200,240 L0,240Z" fill="#5fa8d0" opacity={0.6} />
      <ellipse cx={100} cy={200} rx={62} ry={22} fill="#4f8a3a" />
      {range(16).map((i) => <Leaf key={i} x={50 + i * 6.5} y={210} rot={-60 + i * 8} len={20} wid={6} fill={i % 2 ? G : GL} />)}
      {flowers.map(([x, y, s], i) => (
        <Radial key={i} x={x} y={y} r={8 * s} n={5} petalW={0.6} shape="rund" fill={i % 3 ? '#5fa8f0' : '#78b8f5'} stroke="#3a78c0" center="#f5d000" centerR={0.28} rot={i * 13} />
      ))}
      {[[90, 140], [116, 144]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="#e89ac0" />)}
    </>
  );
}

function Wasserschlauch() {
  const shoot = (x: number, y: number, r: number, len: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <line x1={0} y1={0} x2={0} y2={-len} stroke="#6f9a4a" strokeWidth={1.4} />
      {range(Math.floor(len / 8)).map((i) => (
        <g key={i} transform={`translate(0 ${-6 - i * 8})`}>
          {[-1, 1].map((d) => (
            <g key={d}>
              <path d={`M0,0 q${d * 6},-3 ${d * 11},-1 M${d * 5},-2 q${d * 3},-5 ${d * 6},-7 M${d * 7},-1 q${d * 4},3 ${d * 8},4`} stroke="#5f9a4a" strokeWidth={1} fill="none" />
              <circle cx={d * 11} cy={-1} r={1.8} fill="#cfe0a0" stroke="#6f8a3a" strokeWidth={0.5} />
            </g>
          ))}
        </g>
      ))}
    </g>
  );
  const flower = (x: number, y: number, s: number) => (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-9,0 C-11,-12 11,-12 9,0 C6,4 -6,4 -9,0Z" fill="#f2c41a" stroke="#b38a00" strokeWidth={0.8} />
      <path d="M-12,2 C-14,14 14,14 12,2 C6,6 -6,6 -12,2Z" fill="#f7d23a" stroke="#b38a00" strokeWidth={0.8} />
      <path d="M-5,4 Q0,8 5,4" stroke="#d6700a" strokeWidth={1.6} fill="none" />
      <path d="M8,8 Q14,14 10,18" stroke="#e0b020" strokeWidth={2} fill="none" strokeLinecap="round" />
    </g>
  );
  return (
    <>
      <rect x={0} y={150} width={200} height={90} fill="#2f6f86" opacity={0.55} />
      <path d="M0,150 q25,-5 50,0 t50,0 t50,0 t50,0" stroke="#d8f1fa" strokeWidth={1.4} fill="none" opacity={0.8} />
      {shoot(100, 228, -70, 72)}
      {shoot(100, 228, 70, 72)}
      {shoot(100, 228, -35, 64)}
      {shoot(100, 228, 35, 64)}
      {shoot(100, 228, 0, 56)}
      <Stem d="M100,170 C100,140 98,110 100,64" w={2.2} c="#7a6a3a" />
      {flower(100, 66, 1.05)}
      {flower(92, 90, 0.9)}
      {flower(108, 112, 0.85)}
      {flower(94, 132, 0.75)}
    </>
  );
}

export const PLANT_ART: Record<string, () => ReactNode> = {
  wasserschlauch: Wasserschlauch,
  loewenzahn: Loewenzahn,
  gaensebluemchen: Gaensebluemchen,
  klatschmohn: Klatschmohn,
  buschwindroeschen: Buschwindroeschen,
  wurmfarn: Wurmfarn,
  besenheide: Besenheide,
  fingerhut: Fingerhut,
  baerlauch: Baerlauch,
  teichrose: Teichrose,
  strandhafer: Strandhafer,
  siebenstern: Siebenstern,
  tuerkenbund: Tuerkenbund,
  schluesselblume: Schluesselblume,
  glockenheide: Glockenheide,
  akelei: Akelei,
  wollgras: Wollgras,
  sonnentau: Sonnentau,
  arnika: Arnika,
  frauenschuh: Frauenschuh,
  fliegenragwurz: Fliegenragwurz,
  krebsschere: Krebsschere,
  moorlilie: Moorlilie,
  stranddistel: Stranddistel,
  schachblume: Schachblume,
  glanzkraut: Glanzkraut,
  edelweiss: Edelweiss,
  lungenenzian: Lungenenzian,
  wasserfenchel: Wasserfenchel,
  boehmischer_enzian: BoehmischerEnzian,
  bodensee_vergissmeinnicht: BodenseeVergissmeinnicht,
};

export { Drop };
