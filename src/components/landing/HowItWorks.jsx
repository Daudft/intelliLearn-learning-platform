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
      <section id="how-it-works" className="relative w-full bg-white border border-gray-200  overflow-hidden">

        {/* BACKGROUND GRID */}
        <div
          ref={gridRef}
          className="absolute inset-0 opacity-20 pointer-events-auto"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(34,197,94,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(34,197,94,0.4) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 55%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 0%, black 35%, transparent 55%)",
          }}
        ></div>

        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(34,197,94,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(34,197,94,0.2) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* CONTENT */}
        <div className="relative z-10 max-w-7xl mx-auto">

          {/* SECTION HEADING */}
          <div className="pt-28 pb-20 px-6 md:px-10 text-center">
            <motion.p
              className="text-xs tracking-[0.25em] text-gray-500 mb-3"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              HOW IT WORKS
            </motion.p>

            <motion.h2
              className="text-4xl md:text-5xl font-extrabold text-black mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Learn Smarter, Not Harder
            </motion.h2>

            <motion.p
              className="text-gray-700 text-lg max-w-xl mx-auto"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Your learning journey broken into four simple and powerful steps.
            </motion.p>
          </div>

          {/* STEPS GRID */}
          <div className="px-6 md:px-10 pb-32">
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300/20 to-green-300/20 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* CARD */}
                    <motion.div
                      className="relative p-10 bg-white backdrop-blur border border-gray-200 rounded-2xl hover:border-yellow-200 hover:shadow-md transition-all duration-300 h-full"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      {/* Number */}
                      <motion.div
                        className="text-5xl font-bold text-yellow-300/60 mb-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      >
                        {step.number}
                      </motion.div>

                      {/* FIXED ICON */}
                      <motion.div
                        className="mb-4 flex items-center justify-center bg-gradient-to-br from-yellow-200 to-yellow-100 rounded-lg w-16 h-16 text-3xl"
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
                        className="text-xl font-bold text-black mb-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.15 }}
                        viewport={{ once: true }}
                      >
                        {step.title}
                      </motion.h3>

                      {/* DESCRIPTION */}
                      <motion.p
                        className="text-sm text-gray-600 leading-relaxed"
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
                            stroke="#FACC15"
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
