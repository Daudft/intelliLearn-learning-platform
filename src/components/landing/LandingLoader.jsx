import { useEffect, useRef } from "react";
import gsap from "gsap";

/*
  Landing intro loader (GSAP timeline).
  Sequence (flat black screen, no card):
    0. A small blue box with a comet tail sweeps left -> right along a track
       while a counter ticks 0 -> 100%.
    1. "IntelliLearn" — letters flip up in 3D with a blur, elegant + striking.
    2. Once it's fully in, "Learn what matters" wipes in beneath it.
    3. Both hold, then lift + blur away together.
    4. The black screen DISSOLVES into pixels center-out (same look as the
       landing page's PixelReveal), revealing the hero behind.

  Calls onDone() when the timeline finishes (loader then unmounts).
*/

const TAGLINE = "Learn what matters";
const CUBE = 20; // px — the 3D blue cube
const HALF = CUBE / 2;

// Six faces of the cube — shaded to read as 3D.
const FACES = [
  { t: `translateZ(${HALF}px)`, bg: "#4da2ff" }, // front
  { t: `rotateY(180deg) translateZ(${HALF}px)`, bg: "#1f7fe0" }, // back
  { t: `rotateY(90deg) translateZ(${HALF}px)`, bg: "#298dff" }, // right
  { t: `rotateY(-90deg) translateZ(${HALF}px)`, bg: "#3a90ea" }, // left
  { t: `rotateX(90deg) translateZ(${HALF}px)`, bg: "#8fcaf6" }, // top (lit)
  { t: `rotateX(-90deg) translateZ(${HALF}px)`, bg: "#175fbf" }, // bottom (shadow)
];

// Pixel-dissolve grid.
const COLS = 16;
const ROWS = 9;
const TILE_COLOR = "#000000";

export default function LandingLoader({ onDone }) {
  const rootRef = useRef(null);
  const dimRef = useRef(null);
  const preloaderRef = useRef(null);
  const trackRef = useRef(null);
  const cometRef = useRef(null);
  const cubeRef = useRef(null);
  const countRef = useRef(null);
  const stageRef = useRef(null);
  const brandRef = useRef(null);
  const taglineRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const root = rootRef.current;
      const dim = dimRef.current;
      const preloader = preloaderRef.current;
      const comet = cometRef.current;
      const stage = stageRef.current;
      const brandLetters = brandRef.current.querySelectorAll("span");
      const tagline = taglineRef.current;
      const tiles = gridRef.current.querySelectorAll(".pixel-tile");

      const reduced = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )?.matches;

      // Initial hidden states
      gsap.set(brandLetters, { opacity: 0 });
      gsap.set(tagline, { opacity: 0, clipPath: "inset(0 100% 0 0)" });
      gsap.set(gridRef.current, { opacity: 0 });
      gsap.set(comet, { yPercent: -50 }); // keep vertical centering under GSAP's transform

      if (reduced) {
        const tl = gsap.timeline({ onComplete: () => onDone?.() });
        countRef.current.textContent = "100";
        tl.to(preloader, { opacity: 0, duration: 0.4 }, 0.5)
          .to([brandLetters, tagline], { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.5 })
          .to({}, { duration: 0.8 })
          .to(root, { opacity: 0, duration: 0.6 });
        return;
      }

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => onDone?.(),
      });

      // 0. Comet sweep + count 0 -> 100 (run together)
      const trackW = trackRef.current.offsetWidth || 1;
      const counter = { v: 0 };
      tl.fromTo(
        comet,
        { x: 0 },
        { x: trackW - CUBE, duration: 3.3, ease: "power1.inOut" },
        0
      );
      // the cube tumbles in 3D as it travels
      tl.fromTo(
        cubeRef.current,
        { rotationX: -20, rotationY: 0 },
        {
          rotationX: 340,
          rotationY: 720,
          duration: 3.3,
          ease: "power1.inOut",
        },
        0
      );
      tl.to(
        counter,
        {
          v: 100,
          duration: 3.3,
          ease: "power1.inOut",
          onUpdate: () => {
            // Guard: ctx.revert()/unmount can fire this after the ref is nulled.
            if (countRef.current) {
              countRef.current.textContent = Math.round(counter.v);
            }
          },
        },
        0
      );
      tl.to({}, { duration: 0.25 }); // hold at 100
      tl.to(preloader, { opacity: 0, y: -24, duration: 0.5, ease: "power2.in" });

      // 1. "IntelliLearn" — 3D flip-up per letter
      tl.fromTo(
        brandLetters,
        {
          opacity: 0,
          y: 60,
          rotationX: -95,
          scale: 0.85,
          filter: "blur(12px)",
          transformOrigin: "50% 100%",
          transformPerspective: 700,
        },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "back.out(1.6)",
          stagger: 0.055,
        },
        "-=0.1"
      );

      tl.to({}, { duration: 0.35 }); // let it settle fully

      // 2. "Learn what matters" — smooth wipe-in beneath it
      tl.fromTo(
        tagline,
        { opacity: 0, y: 14, clipPath: "inset(0 100% 0 0)" },
        {
          opacity: 1,
          y: 0,
          clipPath: "inset(0 0% 0 0)",
          duration: 0.8,
          ease: "power2.out",
        },
        "+=0.05"
      );

      tl.to({}, { duration: 0.9 }); // both hold

      // 3. Lift + blur away together
      tl.to(stage, {
        y: -40,
        scale: 1.08,
        filter: "blur(14px)",
        opacity: 0,
        duration: 0.65,
        ease: "power2.in",
      });

      // 4. Reveal — dissolve the black into pixels center-out.
      tl.addLabel("reveal");
      tl.set(gridRef.current, { opacity: 1 }, "reveal");
      tl.set(dim, { opacity: 0 }, "reveal");
      tl.to(
        tiles,
        {
          opacity: 0,
          scale: 0.35,
          duration: 0.5,
          ease: "power2.inOut",
          stagger: { grid: [ROWS, COLS], from: "center", amount: 1.15 },
        },
        "reveal+=0.05"
      );
    }, rootRef);

    return () => ctx.revert();
  }, [onDone]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-999 flex items-center justify-center overflow-hidden"
    >
      {/* flat black backdrop (fades away during the reveal) */}
      <div ref={dimRef} className="absolute inset-0 bg-black" />

      {/* 0. PRELOADER — comet sweep + percentage counter */}
      <div
        ref={preloaderRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-10 px-6"
      >
        <div className="heading-font flex items-baseline gap-1.5">
          <span
            ref={countRef}
            className="inline-block bg-linear-to-b from-white via-sui-pale to-sui-blue bg-clip-text text-3xl font-medium text-transparent md:text-5xl"
            style={{
              minWidth: "3ch",
              textAlign: "right",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            0
          </span>
          <span className="text-base font-normal text-sui-mist md:text-lg">%</span>
        </div>

        {/* comet — 3D cube travels; the tail trails behind it (no visible track) */}
        <div ref={trackRef} className="relative h-px w-[min(88vw,1080px)]">
          {/* cometRef is anchored to the CUBE so travel stays symmetric */}
          <div
            ref={cometRef}
            className="absolute left-0 top-1/2 will-change-transform"
            style={{
              width: CUBE,
              height: CUBE,
              perspective: 320,
              filter: "drop-shadow(0 0 10px rgba(77,162,255,0.85))",
            }}
          >
            {/* tail — trails to the left, behind the cube */}
            <div
              style={{
                position: "absolute",
                right: "100%",
                top: "50%",
                marginRight: -1,
                width: 120,
                height: 4,
                transform: "translateY(-50%)",
                borderRadius: 999,
                background:
                  "linear-gradient(to right, rgba(77,162,255,0) 0%, rgba(77,162,255,0.9) 100%)",
              }}
            />
            {/* 3D cube faces */}
            <div
              ref={cubeRef}
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                transformStyle: "preserve-3d",
              }}
            >
              {FACES.map((f, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: CUBE,
                    height: CUBE,
                    background: f.bg,
                    border: "1px solid rgba(255,255,255,0.18)",
                    borderRadius: 3,
                    transform: f.t,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TEXT STAGE — brand on top, tagline beneath; both exit together */}
      <div
        ref={stageRef}
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center will-change-transform"
      >
        {/* IntelliLearn */}
        <h1
          ref={brandRef}
          aria-label="IntelliLearn"
          className="heading-font whitespace-nowrap text-5xl font-semibold text-white md:text-8xl"
          style={{ perspective: 700, letterSpacing: "-0.03em" }}
        >
          {"IntelliLearn".split("").map((ch, i) => (
            <span
              key={i}
              className={`inline-block will-change-transform ${i < 6 ? "text-sui-blue" : "text-white"}`}
              style={{ whiteSpace: "pre" }}
            >
              {ch}
            </span>
          ))}
        </h1>

        {/* tagline */}
        <p
          ref={taglineRef}
          className="heading-font whitespace-nowrap text-xs font-medium uppercase text-sui-mist md:text-sm"
          style={{ letterSpacing: "0.42em", paddingLeft: "0.42em" }}
        >
          {TAGLINE}
        </p>
      </div>

      {/* PIXEL GRID — hidden until the reveal, then dissolves center-out */}
      <div
        ref={gridRef}
        className="pointer-events-none absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, i) => (
          <div
            key={i}
            className="pixel-tile will-change-transform"
            style={{
              background: TILE_COLOR,
              boxShadow: `0 0 0 1px ${TILE_COLOR}`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
