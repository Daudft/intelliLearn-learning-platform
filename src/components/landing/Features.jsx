import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

/* One card slot (full viewport height). Fades in/out based on how close its
   position is to the centered marker as the track scrolls past. */
function FeatureCard({ data, index, total, progress, side }) {
  const center = total > 1 ? index / (total - 1) : 0;
  const d = 0.85 / Math.max(total - 1, 1);
  const opacity = useTransform(
    progress,
    [center - d, center - d * 0.5, center + d * 0.5, center + d],
    [0, 1, 1, 0]
  );

  return (
    <div className="relative h-screen">
      {/* horizontal connector to the center line (desktop only) */}
      <div
        className={`absolute top-1/2 hidden h-px border-t border-dashed border-slate-300 md:block ${
          side === "right" ? "left-1/2 w-[5%]" : "right-1/2 w-[5%]"
        }`}
      />

      <motion.div
        style={{ opacity }}
        className={`absolute top-1/2 w-[88%] -translate-x-1/2 -translate-y-1/2 left-1/2 md:w-[38%] md:max-w-[440px] md:translate-x-0 ${
          side === "right" ? "md:left-[55%]" : "md:left-auto md:right-[55%]"
        }`}
      >
        <div className="border border-white/10 bg-sui-deep shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <span className="font-mono text-xs text-sui-blue border border-white/15 px-2 py-1">
              {data.num}
            </span>
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-white md:text-base">
              {data.title}
            </span>
          </div>

          {/* visual */}
          <div className="px-5 py-6">
            <div className="relative h-48 overflow-hidden border border-white/10">
              <img
                src={data.img}
                alt={data.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-sui-deep/80 via-transparent to-transparent" />
            </div>

            <p className="mt-5 text-sm leading-relaxed text-sui-fog">
              {data.desc}
            </p>

            {/* footer item */}
            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
              <span className="grid h-9 w-9 place-items-center bg-sui-blue/15 font-bold text-sui-blue">
                ◆
              </span>
              <span className="text-sm text-sui-mist">{data.tag}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function Features() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The stack of cards translates upward through the pinned viewport.
  const trackY = useTransform(
    scrollYProgress,
    [0, 1],
    ["0vh", `-${(FEATURES.length - 1) * 100}vh`]
  );

  return (
    <section id="features" className="relative w-full bg-white">
      {/* INTRO HEADING */}
      <div className="mx-auto max-w-3xl px-6 pt-28 pb-10 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.25em] text-sui-blue">
          Features
        </p>
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
          {/* center dotted line (desktop) */}
          <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden -translate-x-1/2 border-l border-dashed border-slate-300 md:block" />

          {/* centered marker (desktop) */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-20 hidden h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 bg-sui-blue shadow-[0_0_0_6px_rgba(77,162,255,0.15)] md:block"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* moving track of cards */}
          <motion.div style={{ y: trackY }} className="absolute inset-x-0 top-0">
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
