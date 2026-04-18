import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Footer from "../../components/landing/Footer";

export default function LandingPage() {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowLoader(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showLoader) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [showLoader]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#f8ffe2_0%,#ecf0f6_38%,#e6ebf2_100%)] text-slate-900">
      <AnimatePresence>
        {showLoader && (
          <motion.div
            className="fixed inset-0 z-999 flex items-center justify-center overflow-hidden bg-slate-950"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,255,3,0.08)_0%,transparent_42%)]" />

            <motion.div
              className="relative flex flex-col items-center px-6 text-center"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <motion.div
                className="overflow-hidden"
              >
                <motion.h1
                  className="text-4xl font-black tracking-tight text-white md:text-6xl"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.9, ease: "easeOut" }}
                >
                  <span className="text-lime-300">Intelli</span>Learn
                </motion.h1>
              </motion.div>

              <motion.p
                className="mt-4 max-w-xl text-sm leading-relaxed text-slate-300 md:text-base"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
              >
                AI-powered learning that adapts to your level and guides you through a personalized path.
              </motion.p>

              <motion.div
                className="mt-10 h-1.5 w-64 overflow-hidden rounded-full bg-white/10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="h-full rounded-full bg-linear-to-r from-lime-300 via-emerald-300 to-cyan-300"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIGHT SECTIONS WITH PADDING */}
      <motion.div
        className={`px-4 md:px-6 ${showLoader ? "pointer-events-none select-none" : ""}`}
        initial={{ opacity: 0, y: 18 }}
        animate={showLoader ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: "easeOut" }}
      >
        <Navbar />
        <Hero />
      </motion.div>

      {/* DARK SECTIONS - FULL WIDTH (NO SIDE PADDING) */}
      <Features />
      <HowItWorks />

      {/* FOOTER WITH NORMAL PADDING */}
      
        <Footer />
      

    </div>
  );
}
