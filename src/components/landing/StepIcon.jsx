/* Line-art icons (Sui blueprint style) — thin white strokes with blue accents.
   viewBox 0 0 120 120. Every icon is centered on (60,60) with a matching
   footprint so all four cards read at the same visual size. */

const FAINT = "rgba(255,255,255,0.18)";
const BASE = "rgba(255,255,255,0.42)";
const BLUE = "#4da2ff";
const SW = 1.4;

const stroke = { fill: "none", strokeWidth: SW, strokeLinecap: "round", strokeLinejoin: "round" };

// 0 — Assessment: precision radar
function Assessment() {
  const ticks = [];
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    const long = i % 3 === 0;
    const r2 = long ? 28 : 31;
    ticks.push(
      <line
        key={i}
        x1={60 + Math.cos(a) * 34}
        y1={60 + Math.sin(a) * 34}
        x2={60 + Math.cos(a) * r2}
        y2={60 + Math.sin(a) * r2}
        stroke={long ? BASE : FAINT}
        {...stroke}
      />
    );
  }
  return (
    <>
      <circle cx="60" cy="60" r="34" stroke={FAINT} {...stroke} />
      {ticks}
      <circle cx="60" cy="60" r="23" stroke={FAINT} {...stroke} />
      <circle cx="60" cy="60" r="12" stroke={BASE} {...stroke} />
      <circle cx="60" cy="60" r="28" stroke={BLUE} strokeDasharray="44 220" transform="rotate(-55 60 60)" {...stroke} />
      <line x1="60" y1="60" x2={60 + Math.cos(-0.7) * 28} y2={60 + Math.sin(-0.7) * 28} stroke={BLUE} {...stroke} />
      <circle cx="60" cy="60" r="3" fill={BLUE} />
      <circle cx={60 + Math.cos(-0.7) * 28} cy={60 + Math.sin(-0.7) * 28} r="3.2" fill={BLUE} />
    </>
  );
}

// 1 — Personalized Tasks: cards with a check badge
function Tasks() {
  return (
    <>
      <rect x="46" y="50" width="40" height="32" rx="4" stroke={FAINT} {...stroke} />
      <rect x="34" y="38" width="42" height="38" rx="4" stroke={BASE} {...stroke} />
      <line x1="41" y1="48" x2="58" y2="48" stroke={BLUE} {...stroke} />
      <line x1="41" y1="57" x2="69" y2="57" stroke={FAINT} {...stroke} />
      <line x1="41" y1="65" x2="69" y2="65" stroke={FAINT} {...stroke} />
      <circle cx="74" cy="38" r="9" fill="rgba(77,162,255,0.12)" stroke={BLUE} {...stroke} />
      <polyline points="70,38 73,41 78,35" stroke={BLUE} {...stroke} />
    </>
  );
}

// 2 — AI Mentor: processor / chip
function Mentor() {
  const pins = [];
  [50, 60, 70].forEach((p, i) => {
    pins.push(<line key={`t${i}`} x1={p} y1="30" x2={p} y2="40" stroke={BASE} {...stroke} />);
    pins.push(<line key={`b${i}`} x1={p} y1="80" x2={p} y2="90" stroke={BASE} {...stroke} />);
    pins.push(<line key={`l${i}`} x1="30" y1={p} x2="40" y2={p} stroke={BASE} {...stroke} />);
    pins.push(<line key={`r${i}`} x1="80" y1={p} x2="90" y2={p} stroke={BASE} {...stroke} />);
  });
  return (
    <>
      {pins}
      <rect x="40" y="40" width="40" height="40" rx="5" stroke={FAINT} {...stroke} />
      <rect x="50" y="50" width="20" height="20" rx="3" fill="rgba(77,162,255,0.10)" stroke={BLUE} {...stroke} />
      <circle cx="60" cy="60" r="3" fill={BLUE} />
    </>
  );
}

// 3 — Progress: analytics chart
function Progress() {
  const bars = [
    [44, 66],
    [56, 58],
    [68, 48],
    [80, 38],
  ];
  const nodes = [
    [44, 60],
    [56, 52],
    [68, 42],
    [80, 32],
  ];
  return (
    <>
      <line x1="32" y1="28" x2="32" y2="88" stroke={BASE} {...stroke} />
      <line x1="32" y1="88" x2="92" y2="88" stroke={BASE} {...stroke} />
      {[42, 58, 74].map((y, i) => (
        <line key={i} x1="28" y1={y} x2="32" y2={y} stroke={FAINT} {...stroke} />
      ))}
      {bars.map(([x, ty], i) => (
        <rect key={i} x={x - 5} y={ty} width="10" height={88 - ty} rx="2" stroke={FAINT} {...stroke} />
      ))}
      <polyline points={nodes.map((n) => n.join(",")).join(" ")} stroke={BLUE} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {nodes.map(([x, y], i) => (
        <circle key={`d${i}`} cx={x} cy={y} r="2.8" fill={BLUE} />
      ))}
      <polyline points="72,32 80,32 80,40" stroke={BLUE} {...stroke} />
    </>
  );
}

const VARIANTS = [Assessment, Tasks, Mentor, Progress];

export default function StepIcon({ variant = 0, className = "" }) {
  const Icon = VARIANTS[variant % VARIANTS.length];
  return (
    <svg viewBox="0 0 120 120" className={className} preserveAspectRatio="xMidYMid meet">
      <Icon />
    </svg>
  );
}
