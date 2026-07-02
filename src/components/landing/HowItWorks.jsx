import { useRef, useState, useLayoutEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import PixelReveal from "./PixelReveal";
import StepIcon from "./StepIcon";

/* Premium step card — cursor-reactive 3D tilt, rotating glow border on hover,
   light-sweep shimmer and a line-art icon. */
function HowStepCard({ step, index }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), {
    stiffness: 150,
    damping: 15,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), {
    stiffness: 150,
    damping: 15,
  });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div className="relative h-[56vh] w-[82vw] shrink-0 [perspective:1400px] md:w-[54vw] lg:w-[40vw]">
      {/* cursor-tilt layer */}
      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 flex h-full flex-col overflow-hidden border border-white/10 bg-white/[0.04] p-8 md:p-10"
      >
        {/* top row */}
        <div className="flex items-center justify-between">
          <p className="font-mono text-sm tracking-[0.3em] text-sui-blue">
            STEP {step.number}
          </p>
          <span className="h-2.5 w-2.5 bg-sui-blue shadow-[0_0_0_5px_rgba(77,162,255,0.15)]" />
        </div>

        {/* visual panel — fixed height so every card's box matches */}
        <div
          className="relative mt-6 h-[22vh] shrink-0 overflow-hidden border border-white/10"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <span className="pointer-events-none absolute -bottom-8 -right-2 select-none font-display text-[10rem] font-black leading-none text-white/[0.05]">
            {step.number}
          </span>
          <div className="absolute inset-0 grid place-items-center">
            <StepIcon variant={index} className="h-[15vh] w-[15vh]" />
          </div>
        </div>

        {/* text */}
        <div className="mt-6 flex-1">
          <h3 className="font-display text-2xl font-bold text-white md:text-3xl">
            {step.title}
          </h3>
          <p className="mt-3 max-w-sm leading-relaxed text-sui-fog">{step.desc}</p>
        </div>
      </motion.div>
    </div>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Take Initial Assessment",
    desc: "A quick AI check that maps your current level and learning style.",
  },
  {
    number: "02",
    title: "Receive Personalized Tasks",
    desc: "Tailored tasks generated from your results — no generic worksheets.",
  },
  {
    number: "03",
    title: "Learn With AI Mentor",
    desc: "Contextual hints and guidance tuned to your pace as you learn.",
  },
  {
    number: "04",
    title: "Track Your Progress",
    desc: "Visual insight into your growth and what to focus on next.",
  },
];

export default function HowItWorks() {
  const coverRef = useRef(null);
  const railRef = useRef(null);
  const trackRef = useRef(null);
  const [shift, setShift] = useState(0);

  // Pixel-reveal entrance driven by the section top entering the viewport.
  const { scrollYProgress: entrance } = useScroll({
    target: coverRef,
    offset: ["start end", "start start"],
  });

  // Horizontal scroll driven by progress through the tall rail container.
  const { scrollYProgress: rail } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });

  // Measure how far the track must slide so the last card lands in view.
  useLayoutEffect(() => {
    const measure = () => {
      if (trackRef.current) {
        setShift(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const xRaw = useTransform(rail, [0, 1], [0, -shift]);
  const x = useSpring(xRaw, { stiffness: 120, damping: 30, mass: 0.4 });

  // Vertical scroll length = one screen + the horizontal distance, so the
  // slide is 1:1 with scroll — no dead space, always moving.
  const railHeight = `calc(100vh + ${shift}px)`;

  return (
    <div ref={coverRef} className="relative z-30">
      <section id="how-it-works" className="relative w-full bg-black">
        {/* PIXEL REVEAL — white tiles dissolve center-out to reveal the black section */}
        <PixelReveal progress={entrance} colorClass="bg-white" />

        {/* HORIZONTAL SCROLL RAIL */}
        <div ref={railRef} style={{ height: railHeight }} className="relative z-10">
          <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
            {/* heading (pushed clear of the floating navbar) */}
            <div className="px-6 pt-28 text-center md:pt-32">
              <p className="mb-3 text-xs uppercase tracking-[0.25em] text-sui-blue">
                How It Works
              </p>
              <h2 className="text-4xl font-extrabold text-white md:text-5xl">
                Learn Smarter, Not Harder
              </h2>
            </div>

            {/* horizontal track */}
            <div className="flex flex-1 items-center overflow-hidden">
              <motion.div
                ref={trackRef}
                style={{ x }}
                className="flex gap-6 px-6 md:gap-8 md:px-14"
              >
                {STEPS.map((step, i) => (
                  <HowStepCard key={step.number} step={step} index={i} />
                ))}
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
