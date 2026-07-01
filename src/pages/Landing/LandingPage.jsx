import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Footer from "../../components/landing/Footer";

const LANDING_LOADER_SEEN_KEY = "intellilearn_landing_loader_seen";
let landingLoaderSeenFallback = false;

const hasSeenLandingLoader = () => {
  try {
    return window.sessionStorage.getItem(LANDING_LOADER_SEEN_KEY) === "1";
  } catch {
    return landingLoaderSeenFallback;
  }
};

const markLandingLoaderSeen = () => {
  landingLoaderSeenFallback = true;
  try {
    window.sessionStorage.setItem(LANDING_LOADER_SEEN_KEY, "1");
  } catch {
    // Ignore storage errors in restricted browser modes.
  }
};

const isAuthReferrer = () => {
  try {
    if (!document.referrer) return false;
    const refUrl = new URL(document.referrer);
    return (
      refUrl.origin === window.location.origin &&
      (refUrl.pathname === "/signin" || refUrl.pathname === "/signup")
    );
  } catch {
    return false;
  }
};

const shouldShowLandingLoader = () => {
  if (typeof window === "undefined") {
    return false;
  }

  const navigationEntry = window.performance
    .getEntriesByType("navigation")
    .find((entry) => entry.entryType === "navigation");
  const navigationType = navigationEntry?.type;
  const isReload = navigationType === "reload";
  const isBackForward = navigationType === "back_forward";
  const alreadySeen = hasSeenLandingLoader();
  const historyIndex = Number(window.history?.state?.idx ?? 0);
  const isInAppReturnNavigation = historyIndex > 0;
  const cameFromAuthRoute = isAuthReferrer();

  if (isReload) {
    return true;
  }

  if (isBackForward || isInAppReturnNavigation || cameFromAuthRoute) {
    return false;
  }

  return !alreadySeen;
};

export default function LandingPage() {
  const [showLoader, setShowLoader] = useState(() => shouldShowLandingLoader());

  useEffect(() => {
    markLandingLoaderSeen();

    if (!showLoader) {
      return;
    }

    const timer = window.setTimeout(() => setShowLoader(false), 3200);
    return () => window.clearTimeout(timer);
  }, [showLoader]);

  useEffect(() => {
    if (!showLoader) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }
  }, [showLoader]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#000000_0%,#000000_18%,#010810_100%)] text-sui-fog">
      <AnimatePresence>
        {showLoader && (
          <motion.div
            className="fixed inset-0 z-999 flex items-center justify-center overflow-hidden bg-sui-deep"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(77,162,255,0.14)_0%,transparent_45%)]" />

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
                  className="text-4xl font-bold tracking-tight text-white md:text-6xl"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.9, ease: "easeOut" }}
                >
                  <span className="text-sui-blue">Intelli</span>Learn
                </motion.h1>
              </motion.div>

              <motion.p
                className="mt-4 max-w-xl text-sm leading-relaxed text-sui-mist md:text-base"
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
                  className="h-full rounded-full bg-linear-to-r from-sui-pale via-sui-blue to-sui-bright"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULL-WIDTH STICKY NAVBAR (edge-to-edge, Sui style) */}
      <Navbar />

      {/* HERO — FULL BLEED */}
      <motion.div
        className={showLoader ? "pointer-events-none select-none" : ""}
        initial={{ opacity: 0, y: 18 }}
        animate={showLoader ? { opacity: 0, y: 18 } : { opacity: 1, y: 0 }}
        transition={{ duration: 1.05, ease: "easeOut" }}
      >
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
