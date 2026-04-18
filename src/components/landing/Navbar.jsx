import { useState } from "react";

export default function Navbar() {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div className="w-full py-4 md:py-5">

      {/* FULL WIDTH NAVBAR */}
      <nav className="w-full rounded-3xl border border-slate-800/20 bg-slate-950 px-5 md:px-8 py-4 flex items-center justify-between shadow-[0_18px_45px_rgba(15,23,42,0.35)] backdrop-blur-xl">

 {/* Logo (LEFT CORNER) */}
<a href="/">
  <h1 className="cursor-pointer flex items-baseline">
    <span className="text-[26px] font-bold text-lime-300 leading-none tracking-tight">
      Intelli
    </span>
    <span className="text-[24px] font-medium text-slate-100 leading-none">
      Learn
    </span>
  </h1>
</a>





        {/* Center Links */}
        <ul className="hidden md:flex items-center space-x-8 text-slate-100/90 font-medium">
  {[
    { label: "Features", target: "features" },
    { label: "How it Works", target: "how-it-works" },
    { label: "Pricing", target: "pricing" },
    { label: "Courses", target: "courses" },
  ].map((item) => (
    <li
      key={item.label}
      onMouseEnter={() => setHoveredButton(item.label)}
      onMouseLeave={() => setHoveredButton(null)}
      onClick={() => {
        // <<< MINIMAL CHANGE: if the item is the Courses link, go to the route.
        if (item.target === "courses") {
          // Use a full route navigation so /courses page opens.
          // We use window.location to avoid changing other code (no imports added).
          window.location.href = "/courses";
          return;
        }

        // existing scroll behavior for other links
        const section = document.getElementById(item.target);
        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
      className="relative cursor-pointer overflow-hidden hover:text-lime-300 transition-colors"
    >
      {/* Default text */}
      <span
        className={`inline-block transition-all duration-500 ${
          hoveredButton === item.label
            ? "-translate-y-6 opacity-0"
            : "translate-y-0 opacity-100"
        }`}
      >
        {item.label}
      </span>

      {/* Hover text */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          hoveredButton === item.label
            ? "translate-y-0 opacity-100"
            : "translate-y-6 opacity-0"
        }`}
      >
        {item.label}
      </span>
    </li>
  ))}
</ul>



        {/* RIGHT SIDE BUTTONS */}
        <div className="hidden md:flex items-center space-x-3">
          
          {/* Sign In Button */}
          <a href="/signin">
            <button 
              onMouseEnter={() => setHoveredButton("signin")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative px-5 py-2 border border-slate-400/40 bg-white/90 rounded-xl text-slate-800 font-medium overflow-hidden cursor-pointer"
            >
              <span className={`inline-block transition-all duration-500 ${hoveredButton === "signin" ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"}`}>
                Sign In
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hoveredButton === "signin" ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
                Sign In
              </span>
            </button>
          </a>

          {/* Sign Up Button */}
          <a href="/signup">
            <button 
              onMouseEnter={() => setHoveredButton("signup")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative bg-lime-300 hover:bg-lime-200 text-slate-900 font-semibold px-6 py-2.5 rounded-xl overflow-hidden cursor-pointer transition-colors"
            >
              <span className={`inline-block transition-all duration-500 ${hoveredButton === "signup" ? "-translate-y-6 opacity-0" : "translate-y-0 opacity-100"}`}>
                Sign Up
              </span>
              <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hoveredButton === "signup" ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
                Sign Up
              </span>
            </button>
          </a>

        </div>

        {/* Mobile Menu Icon */}
        <div className="md:hidden">
          <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="7" x2="23" y2="7" />
            <line x1="3" y1="13" x2="23" y2="13" />
            <line x1="3" y1="19" x2="23" y2="19" />
          </svg>
        </div>

      </nav>
    </div>
  );
}