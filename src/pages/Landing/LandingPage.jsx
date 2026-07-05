import { useEffect, useState } from "react";
import Navbar from "../../components/landing/Navbar";
import Hero from "../../components/landing/Hero";
import Features from "../../components/landing/Features";
import HowItWorks from "../../components/landing/HowItWorks";
import Footer from "../../components/landing/Footer";
import LandingLoader from "../../components/landing/LandingLoader";

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
    // Don't let the browser restore a previous scroll position under the loader.
    const prevRestoration = window.history.scrollRestoration;
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      // ignore in restricted modes
    }
    // Hide the page scrollbar for the landing page only (scroll still works).
    document.documentElement.classList.add("no-scrollbar");
    document.body.classList.add("no-scrollbar");
    return () => {
      try {
        window.history.scrollRestoration = prevRestoration || "auto";
      } catch {
        // ignore
      }
      document.documentElement.classList.remove("no-scrollbar");
      document.body.classList.remove("no-scrollbar");
    };
  }, []);

  useEffect(() => {
    if (showLoader) {
      // Pin to the top and freeze scrolling for the whole intro so the hero is
      // always revealed at its top (not a scrolled-away, faded-out state).
      window.scrollTo(0, 0);
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
        window.scrollTo(0, 0);
      };
    }
  }, [showLoader]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#000000_0%,#000000_18%,#010810_100%)] text-sui-fog">
      {showLoader && (
        <LandingLoader onDone={() => setShowLoader(false)} />
      )}

      {/* FULL-WIDTH STICKY NAVBAR (edge-to-edge, Sui style) */}
      <Navbar />

      {/* HERO — FULL BLEED (sits behind the loader; revealed as the text zooms open) */}
      <div>
        <Hero />
      </div>

      {/* DARK SECTIONS - FULL WIDTH (NO SIDE PADDING) */}
      <Features />
      <HowItWorks />

      {/* FOOTER WITH NORMAL PADDING */}
      
        <Footer />
      

    </div>
  );
}
