import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Hero() {
  // Blue while resting on the hero; fades to white as the user scrolls through it.
  // Tied to the hero's own scroll progress so it always completes before the seam.
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const whiteFade = useTransform(scrollYProgress, [0.28, 0.58], [0, 1]);
  // Fade + lift the content out as the section scrolls away.
  const contentOpacity = useTransform(scrollYProgress, [0.24, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0.24, 0.5], [0, -60]);

  return (
    <section ref={heroRef} className="relative isolate w-full overflow-hidden">

      {/* BACKGROUND — pure black with a white+blue glow rising from the bottom */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 110% 95% at 50% 102%,
              #eaf3ff 0%,
              #a9d0ff 14%,
              #5aa8ff 30%,
              #2f7fe0 44%,
              rgba(35,110,200,0.35) 58%,
              rgba(0,0,0,0) 76%),
            #000000
          `,
        }}
      />

      {/* soft top vignette so the navbar blends into pure black */}
      <div className="absolute inset-x-0 top-0 h-40 z-0 bg-linear-to-b from-black to-transparent" />

      {/* bottom fade — stays blue at rest, fades to white as the user scrolls into Features */}
      <motion.div
        style={{ opacity: whiteFade }}
        className="absolute inset-x-0 bottom-0 z-0 h-[60%] bg-linear-to-b from-white/0 via-white/80 to-white"
      />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 mx-auto flex min-h-[90vh] max-w-[1250px] flex-col items-center justify-center px-4 text-center py-28"
      >

        {/* BIG GLOWING HEADLINE */}
        <motion.h1
          className="relative font-display font-bold tracking-tight leading-[0.92] text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* crisp white-to-blue gradient text */}
          <span className="relative bg-linear-to-b from-white via-white to-sui-pale bg-clip-text text-transparent">
            Master Code Faster
          </span>
        </motion.h1>

        {/* SUBHEADING */}
        <motion.p
          className="mt-8 max-w-xl text-base md:text-xl font-medium leading-relaxed text-white/90"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        >
          IntelliLearn delivers AI-powered practice that adapts to your level
          and guides every step of your learning path.
        </motion.p>

        {/* BUTTON PAIR — joined black + white, sharp corners (Sui style) */}
        <motion.div
          className="mt-11 flex items-stretch"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <Link to="/signup">
            <button className="group relative h-full overflow-hidden bg-black px-8 py-4 text-[15px] font-semibold text-white leading-6">
              <span className="block transition-transform duration-300 group-hover:-translate-y-[200%]">
                Get Started
              </span>
              <span className="absolute inset-0 flex items-center justify-center translate-y-[200%] transition-transform duration-300 group-hover:translate-y-0">
                Get Started
              </span>
            </button>
          </Link>

          <Link to="/assessment">
            <button className="group relative h-full overflow-hidden bg-white px-8 py-4 text-[15px] font-semibold text-slate-900 leading-6">
              <span className="block transition-transform duration-300 group-hover:-translate-y-[200%]">
                Take Assessment
              </span>
              <span className="absolute inset-0 flex items-center justify-center translate-y-[200%] transition-transform duration-300 group-hover:translate-y-0">
                Take Assessment
              </span>
            </button>
          </Link>
        </motion.div>

        {/* SUBTLE TRUST LINE */}
        <motion.div
          className="mt-8 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.45 }}
        >
          <div className="flex -space-x-3">
            <img src="https://i.pravatar.cc/50?img=1" className="h-8 w-8 rounded-full ring-2 ring-black/40" />
            <img src="https://i.pravatar.cc/50?img=2" className="h-8 w-8 rounded-full ring-2 ring-black/40" />
            <img src="https://i.pravatar.cc/50?img=3" className="h-8 w-8 rounded-full ring-2 ring-black/40" />
          </div>
          <p className="text-sm text-white/80">
            Trusted by <span className="font-semibold text-white">100+</span> learners
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
