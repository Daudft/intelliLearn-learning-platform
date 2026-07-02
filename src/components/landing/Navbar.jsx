import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Plus } from "lucide-react";

/* Simple nav model — each item either scrolls to a section or routes to a page. */
const NAV_ITEMS = [
  { label: "Features", target: "features" },
  { label: "How it Works", target: "how-it-works" },
  { label: "Courses", href: "/courses" },
  { label: "Pricing", href: "#" },
  { label: "Resources", href: "#" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Resolve any action (scroll to section, route, or ignore placeholder "#").
  const handleAction = (item) => {
    setMobileOpen(false);

    if (item.href) {
      if (item.href === "#") return;
      navigate(item.href);
      return;
    }
    if (item.target) {
      const section = document.getElementById(item.target);
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 md:px-5 pt-3 md:pt-4">
      <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between bg-sui-deep/90 px-5 md:px-8 py-4 backdrop-blur-xl">

        {/* LOGO */}
        <a href="/" className="shrink-0">
          <h1 className="flex items-baseline leading-none">
            <span className="text-[22px] font-bold text-white tracking-tight">Intelli</span>
            <span className="text-[22px] font-semibold text-white tracking-tight">Learn</span>
          </h1>
        </a>

        {/* CENTER NAV (desktop) */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => handleAction(item)}
                className="group flex items-center gap-1.5 px-3 py-2"
              >
                <span className="relative block overflow-hidden text-[15px] font-semibold leading-6">
                  <span className="block text-white/90 transition-transform duration-300 group-hover:-translate-y-full">
                    {item.label}
                  </span>
                  <span className="absolute inset-0 block translate-y-full text-sui-blue transition-transform duration-300 group-hover:translate-y-0">
                    {item.label}
                  </span>
                </span>
                <span className="flex h-6 w-6 items-center justify-center bg-white/5 text-white/70 transition-all duration-300 group-hover:bg-sui-blue/20 group-hover:text-sui-blue group-hover:rotate-90 group-hover:scale-110">
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* RIGHT SIDE (desktop) */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate("/signin")}
            className="group relative overflow-hidden px-4 py-2 text-[15px] font-semibold leading-6"
          >
            <span className="block text-white/90 transition-transform duration-300 group-hover:-translate-y-[200%]">
              Sign In
            </span>
            <span className="absolute inset-0 flex items-center justify-center translate-y-[200%] text-sui-blue transition-transform duration-300 group-hover:translate-y-0">
              Sign In
            </span>
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="group relative overflow-hidden bg-sui-blue px-5 py-2.5 text-[15px] font-semibold text-white leading-6 hover:bg-sui-bright transition-colors"
          >
            <span className="block transition-transform duration-300 group-hover:-translate-y-[200%]">
              Get started
            </span>
            <span className="absolute inset-0 flex items-center justify-center translate-y-[200%] transition-transform duration-300 group-hover:translate-y-0">
              Get started
            </span>
          </button>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="lg:hidden flex h-10 w-10 items-center justify-center bg-white/5 text-white"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden mt-2 bg-sui-deep/95 shadow-[0_18px_45px_rgba(1,24,41,0.55)] backdrop-blur-xl"
          >
            <div className="px-5 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleAction(item)}
                  className="block w-full px-4 py-3 text-left text-[15px] font-semibold text-white/90 hover:bg-white/5 hover:text-sui-blue transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <div className="flex flex-col gap-2 pt-3">
                <button
                  onClick={() => handleAction({ href: "/signin" })}
                  className="w-full bg-white/5 px-4 py-3 text-[15px] font-semibold text-white"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAction({ href: "/signup" })}
                  className="w-full bg-sui-blue px-4 py-3 text-[15px] font-semibold text-white"
                >
                  Get started
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
