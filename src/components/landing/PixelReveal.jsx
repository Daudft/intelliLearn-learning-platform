import { motion, useTransform } from "framer-motion";

/* A full-width grid of tiles that covers the top of a section and dissolves
   center-out as `progress` (a scroll MotionValue 0→1) advances — revealing the
   section behind it pixel by pixel, from the middle outward. */
const COLS = 14;
const ROWS = 8;
const cx = (COLS - 1) / 2;
const cy = (ROWS - 1) / 2;
const maxD = Math.hypot(cx, cy);

// Center tiles clear first, edges last (+ a little jitter for organic feel).
const THRESHOLDS = Array.from({ length: COLS * ROWS }, (_, i) => {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  const d = Math.hypot(col - cx, row - cy) / maxD;
  return Math.min(d * 0.62 + Math.random() * 0.12, 0.82);
});

function Tile({ progress, threshold, colorClass }) {
  const opacity = useTransform(progress, [threshold, threshold + 0.12], [1, 0]);
  const scale = useTransform(progress, [threshold, threshold + 0.12], [1, 0.6]);
  return <motion.div style={{ opacity, scale }} className={colorClass} />;
}

export default function PixelReveal({ progress, colorClass = "bg-white" }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-40 grid h-screen"
      style={{
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
      }}
    >
      {THRESHOLDS.map((t, i) => (
        <Tile key={i} progress={progress} threshold={t} colorClass={colorClass} />
      ))}
    </div>
  );
}
