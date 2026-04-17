import { useState } from "react";

export default function Navbar() {
  const [hoveredButton, setHoveredButton] = useState(null);

  const smoothScrollTo = (targetY, duration = 900) => {
  const startY = window.scrollY;
  const difference = targetY - startY;
  let startTime = null;

  const easeOutExpo = (t) =>
    t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

  const animation = (currentTime) => {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutExpo(progress);

    window.scrollTo(0, startY + difference * easedProgress);

    if (elapsed < duration) requestAnimationFrame(animation);
  };

  requestAnimationFrame(animation);
};


  return (
    <div className="w-full bg-[#F1F2F4] py-4">

      {/* FULL WIDTH WHITE NAVBAR */}
      <nav className="w-full bg-black rounded-2xl shadow-sm px-8 py-4 flex items-center justify-between">

 {/* Logo (LEFT CORNER) */}
<a href="/">
  <h1 className="cursor-pointer flex items-baseline">
    <span className="text-[26px] font-bold text-[#E6FF03] leading-none">
      Intelli
    </span>
    <span className="text-[24px] font-medium text-[#E6E6E6] leading-none">
      Learn
    </span>
  </h1>
</a>





        {/* Center Links */}
        <ul className="hidden md:flex items-center space-x-10 text-[#F5F5F5] font-medium">
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
      className="relative cursor-pointer overflow-hidden"
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
        <div className="hidden md:flex items-center space-x-4">
          
          {/* Sign In Button */}
          <a href="/signin">
            <button 
              onMouseEnter={() => setHoveredButton("signin")}
              onMouseLeave={() => setHoveredButton(null)}
              className="relative px-5 py-2 bg-[#F5F5F5] rounded-xl text-gray-800 font-medium overflow-hidden cursor-pointer"
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
              className="relative bg-[#E6FF03] font-medium px-6 py-2.5 rounded-xl overflow-hidden cursor-pointer"
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