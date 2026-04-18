import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <section className="relative w-full overflow-hidden">

      {/* BACKGROUND DECORATIVE BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-16 -left-16 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-lime-200/60 to-cyan-200/20 blur-3xl opacity-80" />
        <div className="absolute bottom-10 left-20 w-[320px] h-[320px] rounded-full bg-gradient-to-tr from-emerald-200/40 to-white/30 blur-[120px] opacity-60" />
        <div className="absolute -bottom-24 right-0 w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-sky-200/40 to-white/30 blur-[130px] opacity-60" />
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 grid md:grid-cols-2 gap-10 lg:gap-16 px-4 md:px-10 lg:px-16 py-16 md:py-20 lg:py-24">

        {/* LEFT SECTION */}
        <div className="flex flex-col justify-center max-w-xl">
          <p className="text-xs tracking-[0.25em] uppercase font-semibold text-slate-600 mb-4">Adaptive Learning Platform</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] text-slate-900 tracking-tight">
            Learn Faster With <br /> Intelligent Practice
          </h1>

          <p className="text-slate-700 mt-6 text-base md:text-lg leading-relaxed">
            Take a fast assessment, let AI guide your next steps, and enjoy a personalized
            task flow that makes improving your skills feel easy and enjoyable.
          </p>

          {/* CTA BUTTON */}
          <div className="mt-8">
            <a href="/signup">
              <button
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className="relative bg-lime-300 text-slate-900 font-semibold px-8 py-3.5 rounded-2xl flex items-center gap-2 text-lg overflow-hidden shadow-[0_12px_28px_rgba(132,204,22,0.35)] hover:shadow-[0_16px_36px_rgba(132,204,22,0.45)] transition-shadow"
              >
                <span className={`transition-all duration-500 ${hoveredButton ? "-translate-y-10 opacity-0" : "translate-y-0 opacity-100"}`}>
                  Get Started →
                </span>

                <span className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${hoveredButton ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
                  Get Started →
                </span>
              </button>
            </a>
          </div>

          {/* SOCIAL PROOF */}
          <div className="flex items-center gap-4 mt-10">
            <div className="flex -space-x-4">
              <img src="https://i.pravatar.cc/50?img=1" className="w-12 h-12 bg-cover rounded-full border-2 border-white shadow" />
              <img src="https://i.pravatar.cc/50?img=2" className="w-12 h-12 rounded-full border-2 border-white shadow" />
              <img src="https://i.pravatar.cc/50?img=3" className="w-12 h-12 rounded-full border-2 border-white shadow" />
            </div>
            <p className="text-slate-700 font-medium">
              <span className="font-bold">100+</span> students trust our platform.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center justify-center relative">

          {/* MAIN CODE CARD */}
          <div className="relative w-full max-w-[520px] p-6 rounded-3xl bg-white/55 backdrop-blur-2xl border border-white/70 shadow-[0_25px_50px_rgba(15,23,42,0.16)] ring-1 ring-white/50">

            {/* MAC DOTS */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-[#ff5f57] rounded-full"></div>
              <div className="w-3 h-3 bg-[#febc2e] rounded-full"></div>
              <div className="w-3 h-3 bg-[#28c840] rounded-full"></div>
            </div>

            {/* LANGUAGE TABS */}
            <div className="flex gap-2 text-xs mb-4">
              <span className="px-3 py-1 rounded bg-lime-100 text-lime-800 font-medium">Python</span>
              <span className="px-3 py-1 rounded bg-cyan-100 text-cyan-800 font-medium">Java</span>
              <span className="px-3 py-1 rounded bg-amber-100 text-amber-800 font-medium">C</span>
            </div>

            {/* CODE + PROGRESS CARD */}
            <div className="flex gap-5 relative">

              {/* CODE BLOCK */}
                <pre className="font-mono text-[12px] text-slate-900 leading-relaxed whitespace-pre-wrap w-[62%]">
{`# Python
def greet(name):
    print("Hello,", name)

greet("Student")

// Java
public class Hello {
  public static void main(String[] args) {
    System.out.println("Hello from Java!");
  }
}

// C
#include <stdio.h>
int main() {
  printf("Hello from C!\\n");
  return 0;
}`}
              </pre>

              {/* NEW PROGRESS CARD (ENHANCED) */}
              <div
                className="
                  absolute right-[-70px] top-[12%]
                  w-[240px] p-6 rounded-3xl
                  bg-slate-950/90 backdrop-blur-2xl
                  border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.35)]
                "
              >
                {/* HEADER */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-white">Skill Progress</h3>
                  <p className="text-[11px] text-slate-300 mt-1">Last 7 days</p>
                </div>

                {/* PYTHON */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-100 font-medium"> Python</span>
                    <span className="text-[11px] text-slate-300">80%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-lime-300 to-emerald-400 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-lime-300">Improving</div>
                </div>

                {/* JAVA */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-100 font-medium"> Java</span>
                    <span className="text-[11px] text-slate-300">60%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-300 to-sky-500 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-cyan-300">Stable</div>
                </div>

                {/* C */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-100 font-medium"> C</span>
                    <span className="text-[11px] text-slate-300">40%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-300 to-orange-500 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-amber-300">Needs Work</div>
                </div>

                {/* FOOTER */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-[12px] text-slate-100 font-semibold">
                    Overall Score: <span className="text-white">67%</span>
                  </p>
                  <p className="text-[11px] text-emerald-300 mt-1">
                    ↑ 12% improvement this week
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
