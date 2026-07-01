import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function HowItWorks() {
  const gridRef = useRef(null);

  const steps = [
    {
      number: "01",
      title: "Take Initial Assessment",
      desc: "Start with a quick AI-powered assessment that analyzes your current skill level and learning pattern.",
      icon: "📚",
    },
    {
      number: "02",
      title: "Receive Personalized Tasks",
      desc: "Get tailored learning tasks generated instantly based on your assessment results and unique skill profile.",
      icon: "⚡",
    },
    {
      number: "03",
      title: "Learn With AI Mentor",
      desc: "Follow helpful guidance from your AI mentor as you complete tasks and strengthen your abilities.",
      icon: "📊",
    },
    {
      number: "04",
      title: "Track Your Progress",
      desc: "Monitor your improvement through simple progress charts that highlight growth and guide your next steps.",
      icon: "✓",
    },
  ];

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMove = (e) => {
      const rect = grid.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      grid.style.setProperty("--x", `${x}px`);
      grid.style.setProperty("--y", `${y}px`);
    };

    grid.addEventListener("mousemove", handleMove);
    return () => grid.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <div>
      <section id="how-it-works" className="relative w-full bg-[linear-gradient(180deg,_#011829_0%,_#08243c_100%)] border-y border-sui-line/60 overflow-hidden">

        {/* BACKGROUND GRID */}
        <div
          ref={gridRef}
          className="absolute inset-0 opacity-25 pointer-events-auto"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(77,162,255,0.35) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(77,162,255,0.35) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 55%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 55%)",
          }}
        ></div>

        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(111,188,240,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(111,188,240,0.2) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto">

          {/* SECTION HEADING */}
          <div className="pt-24 pb-16 px-6 md:px-10 text-center">
            <motion.p
              className="text-xs tracking-[0.25em] text-sui-blue mb-3"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              HOW IT WORKS
            </motion.p>

            <motion.h2
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Learn Smarter, Not Harder
            </motion.h2>

            <motion.p
              className="text-sui-fog text-lg max-w-xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Your learning journey broken into four simple and powerful steps.
            </motion.p>
          </div>

          {/* STEPS GRID */}
          <div className="px-6 md:px-10 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 relative">

              {steps.map((step, index) => {
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative group"
                  >
                    {/* Glow */}
                    <div className="absolute -inset-1 bg-linear-to-r from-sui-blue/25 to-sui-light/15 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* CARD */}
                    <motion.div
                      className="relative p-8 bg-sui-navy/50 backdrop-blur border border-sui-line rounded-2xl hover:border-sui-blue/60 hover:shadow-[0_18px_45px_rgba(77,162,255,0.15)] transition-all duration-300 h-full"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      {/* Number */}
                      <motion.div
                        className="text-5xl font-bold text-sui-blue/60 mb-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {step.number}
                      </motion.div>

                      {/* ICON */}
                      <motion.div
                        className="mb-4 flex items-center justify-center bg-linear-to-br from-sui-blue/20 to-sui-light/10 border border-sui-line rounded-lg w-16 h-16 text-3xl"
                        initial={{ scale: 0, rotate: -90 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.1 + 0.1,
                          type: "spring",
                        }}
                        viewport={{ once: true }}
                        whileHover={{ scale: 1.1, rotate: 10 }}
                      >
                        {step.icon}
                      </motion.div>

                      {/* TITLE */}
                      <motion.h3
                        className="text-xl font-bold text-white mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
                        viewport={{ once: true }}
                      >
                        {step.title}
                      </motion.h3>

                      {/* DESCRIPTION */}
                      <motion.p
                        className="text-sm text-sui-mist leading-relaxed"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                        viewport={{ once: true }}
                      >
                        {step.desc}
                      </motion.p>

                      {/* SVG ARROW — PERFECTLY CENTERED */}
                      {index < steps.length - 1 && (
                        <motion.div
                          className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-[-28px] items-center justify-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                          viewport={{ once: true }}
                          whileHover={{ x: 5 }}
                        >
                          <svg
                            width="36"
                            height="36"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#4da2ff"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </motion.div>
                      )}

                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
