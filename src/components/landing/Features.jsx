import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  useVelocity,
} from "framer-motion";
import PixelReveal from "./PixelReveal";

const FEATURES = [
  {
    num: "01",
    title: "Adaptive Assessments",
    desc: "Skill checks that adjust to your performance in real time, so every question meets you exactly at your level.",
    img: "/feature2.jpg",
    tag: "Assessment Engine",
  },
  {
    num: "02",
    title: "Personalized Tasks",
    desc: "Practice generated around your exact gaps and goals — no generic worksheets, just what moves you forward.",
    img: "/feature1.jpg",
    tag: "Task Generator",
  },
  {
    num: "03",
    title: "AI Mentor",
    desc: "Contextual hints and guidance tuned to your pace as you work through each task and concept.",
    img: "https://images.unsplash.com/photo-1734597949889-f8e2ec87c8ea?q=80&w=1332&auto=format&fit=crop",
    tag: "AI Mentor",
  },
  {
    num: "04",
    title: "Progress Tracking",
    desc: "Clear, visual insight into your growth over time and a sharp view of what to focus on next.",
    img: "/signup show.jpg",
    tag: "Analytics",
  },
];

const center = (i, total) => (total > 1 ? i / (total - 1) : 0);
const spanOf = (total) => 0.85 / Math.max(total - 1, 1);

/* Huge faint number that crossfades behind the active card. */
function GhostNumber({ index, total, progress, num }) {
  const c = center(index, total);
  const d = spanOf(total);
  const opacity = useTransform(progress, [c - d * 0.9, c, c + d * 0.9], [0, 0.09, 0]);
  const y = useTransform(progress, [c - d, c + d], ["18%", "-18%"]);
  return (
    <motion.span
      style={{ opacity, y }}
      className="pointer-events-none absolute inset-0 grid select-none place-items-center font-display text-[34vw] font-black leading-none text-sui-blue"
    >
      {num}
    </motion.span>
  );
}

/* Right-side rail item that grows + brightens when its card is active. */
function StepBar({ index, total, progress, num }) {
  const c = center(index, total);
  const d = spanOf(total);
  const opacity = useTransform(progress, [c - d * 0.5, c, c + d * 0.5], [0.3, 1, 0.3]);
  const width = useTransform(progress, [c - d * 0.5, c, c + d * 0.5], [16, 44, 16]);
  return (
    <div className="flex items-center justify-end gap-2">
      <motion.span style={{ opacity }} className="font-mono text-[11px] text-slate-500">
        {num}
      </motion.span>
      <motion.span style={{ width, opacity }} className="block h-0.5 bg-sui-blue" />
    </div>
  );
}

/* One card slot — scroll-driven fade/scale/blur + cursor-reactive 3D tilt,
   a rotating glow border and a light-sweep shimmer while active. */
function FeatureCard({ data, index, total, progress, side }) {
  const c = center(index, total);
  const d = spanOf(total);

  const opacity = useTransform(progress, [c - d, c - d * 0.5, c + d * 0.5, c + d], [0, 1, 1, 0]);
  const scale = useTransform(progress, [c - d, c, c + d], [0.85, 1, 0.85]);
  const blurPx = useTransform(progress, [c - d, c - d * 0.55, c + d * 0.55, c + d], [10, 0, 0, 10]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;
  const imgScale = useTransform(progress, [c - d, c + d], [1.2, 1]);
  const glow = useTransform(progress, [c - d * 0.7, c, c + d * 0.7], [0, 1, 0]);

  // cursor-reactive tilt
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 150, damping: 15 });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-9, 9]), { stiffness: 150, damping: 15 });
  const handleMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="relative h-screen [perspective:1400px]">
      {/* horizontal connector to the center line (desktop) */}
      <div
        className={`absolute top-1/2 hidden h-px border-t border-dashed border-slate-300 md:block ${
          side === "right" ? "left-1/2 w-[4%]" : "right-1/2 w-[4%]"
        }`}
      />

      {/* positioning wrapper (kept free of animated transforms) */}
      <div
        className={`absolute top-1/2 left-1/2 w-[88%] -translate-x-1/2 -translate-y-1/2 md:w-[40%] md:max-w-[470px] md:translate-x-0 ${
          side === "right" ? "md:left-[54%]" : "md:left-auto md:right-[54%]"
        }`}
      >
        {/* scroll layer */}
        <motion.div style={{ opacity, scale, filter }} className="relative origin-center">
          {/* rotating glow border */}
          <motion.div
            style={{ opacity: glow }}
            className="pointer-events-none absolute -inset-[1.5px] z-0 overflow-hidden"
          >
            <motion.div
              className="absolute inset-[-60%]"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, #4da2ff 55deg, #cfe4ff 80deg, transparent 130deg, transparent 360deg)",
              }}
            />
          </motion.div>

          {/* cursor-tilt layer */}
          <motion.div
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative z-10 border border-white/10 bg-sui-deep shadow-[0_40px_90px_rgba(0,0,0,0.55)]"
          >
            {/* light-sweep shimmer */}
            <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
              <motion.div
                className="absolute top-0 -left-1/2 h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["0%", "420%"] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }}
              />
            </div>

            {/* header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
              <span className="border border-white/15 px-2 py-1 font-mono text-xs text-sui-blue">
                {data.num}
              </span>
              <span className="font-display text-sm font-semibold uppercase tracking-wide text-white md:text-base">
                {data.title}
              </span>
            </div>

            {/* visual with parallax zoom */}
            <div className="px-5 py-6">
              <div className="relative h-52 overflow-hidden border border-white/10">
                <motion.img
                  src={data.img}
                  alt={data.title}
                  style={{ scale: imgScale }}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-sui-deep/85 via-transparent to-transparent" />
              </div>

              <p className="mt-5 text-sm leading-relaxed text-sui-fog">{data.desc}</p>

              {/* footer item */}
              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
                <span className="grid h-9 w-9 place-items-center bg-sui-blue/15 font-bold text-sui-blue">
                  ◆
                </span>
                <span className="text-sm text-sui-mist">{data.tag}</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Entrance pixel reveal — tracks the section top scrolling into view.
  const entranceRef = useRef(null);
  const { scrollYProgress: entrance } = useScroll({
    target: entranceRef,
    offset: ["start end", "start start"],
  });

  const trackY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vh", `-${(FEATURES.length - 1) * 100}vh`]
  );

  // Marker tail driven by scroll velocity: trails up when scrolling down,
  // down when scrolling up, and collapses to nothing when idle.
  const smoothVel = useSpring(useVelocity(scrollYProgress), {
    stiffness: 350,
    damping: 45,
  });
  const upTail = useTransform(smoothVel, [0, 0.4], [0, 1]);
  const downTail = useTransform(smoothVel, [-0.4, 0], [1, 0]);

  return (
    <section ref={entranceRef} id="features" className="relative w-full bg-white">
      {/* PIXEL REVEAL — blue tiles dissolve center-out to reveal the white section */}
      <PixelReveal progress={entrance} colorClass="bg-sui-blue" />

      {/* INTRO HEADING */}
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-sui-blue">Features</p>
        <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl">
          Learn Faster With Better Flow
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          A composable toolkit that reveals itself as you move — scroll to walk
          through each piece.
        </p>
      </div>

      {/* PINNED SCROLL CARDS */}
      <div
        ref={sectionRef}
        style={{ height: `${FEATURES.length * 100}vh` }}
        className="relative"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* drifting dot grid */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-0 opacity-40"
            style={{
              backgroundImage: "radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
            }}
            animate={{ backgroundPositionY: ["0px", "26px"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />

          {/* soft blue depth glow */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 45%, rgba(77,162,255,0.12), transparent 55%)",
            }}
          />

          {/* giant ghost numbers */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {FEATURES.map((f, i) => (
              <GhostNumber
                key={f.num}
                index={i}
                total={FEATURES.length}
                progress={scrollYProgress}
                num={f.num}
              />
            ))}
          </div>

          {/* center dotted line (desktop) — darker dots under the marker path */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 hidden -translate-x-1/2 border-l border-dotted border-slate-500 md:block" />

          {/* centered marker with velocity tail (desktop) */}
          <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            {/* tail up — grows while scrolling down */}
            <motion.div
              style={{ scaleY: upTail, opacity: upTail }}
              className="absolute bottom-full left-1/2 h-28 w-[3px] -translate-x-1/2 origin-bottom bg-linear-to-t from-sui-blue to-transparent"
            />
            {/* tail down — grows while scrolling up */}
            <motion.div
              style={{ scaleY: downTail, opacity: downTail }}
              className="absolute top-full left-1/2 h-28 w-[3px] -translate-x-1/2 origin-top bg-linear-to-b from-sui-blue to-transparent"
            />
            {/* the box */}
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="h-3.5 w-3.5 bg-sui-blue shadow-[0_0_0_6px_rgba(77,162,255,0.15)]"
            />
          </div>

          {/* right-side step rail (desktop) */}
          <div className="absolute right-8 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 md:flex">
            {FEATURES.map((f, i) => (
              <StepBar
                key={f.num}
                index={i}
                total={FEATURES.length}
                progress={scrollYProgress}
                num={f.num}
              />
            ))}
          </div>

          {/* moving track of cards */}
          <motion.div style={{ y: trackY }} className="absolute inset-x-0 top-0 z-10">
            {FEATURES.map((f, i) => (
              <FeatureCard
                key={f.num}
                data={f}
                index={i}
                total={FEATURES.length}
                progress={scrollYProgress}
                side={i % 2 === 0 ? "right" : "left"}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
