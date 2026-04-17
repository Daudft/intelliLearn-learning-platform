import { Link } from "react-router-dom";
import { useState } from "react";

export default function Hero() {
  const [hoveredButton, setHoveredButton] = useState(false);

  return (
    <section className="relative w-full overflow-hidden">

      {/* BACKGROUND DECORATIVE BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-[360px] h-[360px] rounded-full bg-gradient-to-br from-white/70 to-slate-200/40 blur-3xl opacity-80" />
        <div className="absolute bottom-0 left-20 w-[260px] h-[260px] rounded-full bg-gradient-to-tr from-slate-300/40 to-white/20 blur-[100px] opacity-40" />
        <div className="absolute -bottom-20 right-0 w-[350px] h-[350px] rounded-full bg-gradient-to-tl from-white/50 to-slate-200/30 blur-[110px] opacity-50" />
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 grid md:grid-cols-2 gap-10 px-8 md:px-20 py-28">

        {/* LEFT SECTION */}
        <div className="flex flex-col justify-center max-w-xl">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900 tracking-tight">
            Supercharge Your <br /> Skills with AI
          </h1>

          <p className="text-slate-700 mt-6 text-lg leading-relaxed">
            Take a fast assessment, let AI guide your next steps, and enjoy a personalized
            task flow that makes improving your skills feel easy and enjoyable.
          </p>

          {/* CTA BUTTON */}
          <div className="mt-8">
            <a href="/signup">
              <button
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
                className="relative bg-[#E6FF03] text-black font-semibold px-8 py-3 rounded-xl flex items-center gap-2 text-lg overflow-hidden shadow-[0_12px_28px_rgba(180,200,20,0.45)]"
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
          <div className="relative w-[480px] p-6 rounded-3xl bg-white/30 backdrop-blur-2xl border border-white/40 shadow-[0_25px_50px_rgba(0,0,0,0.12)] ring-1 ring-white/20 -translate-x-6">

            {/* MAC DOTS */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-[#ff5f57] rounded-full"></div>
              <div className="w-3 h-3 bg-[#febc2e] rounded-full"></div>
              <div className="w-3 h-3 bg-[#28c840] rounded-full"></div>
            </div>

            {/* LANGUAGE TABS */}
            <div className="flex gap-2 text-xs mb-4">
              <span className="px-3 py-1 rounded bg-purple-100 text-purple-700 font-medium">Python</span>
              <span className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-medium">Java</span>
              <span className="px-3 py-1 rounded bg-green-100 text-green-700 font-medium">C</span>
            </div>

            {/* CODE + PROGRESS CARD */}
            <div className="flex gap-5 relative">

              {/* CODE BLOCK */}
              <pre className="font-mono text-[12px] text-slate-900 leading-relaxed whitespace-pre-wrap w-[60%]">
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
                  absolute right-[-165px] top-[10%]
                  w-[240px] p-6 rounded-3xl
                  bg-white/25 backdrop-blur-2xl
                  border border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.15)]
                "
              >
                {/* HEADER */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-slate-900">Skill Progress</h3>
                  <p className="text-[11px] text-slate-600 mt-1">Last 7 days</p>
                </div>

                {/* PYTHON */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-900 font-medium"> Python</span>
                    <span className="text-[11px] text-slate-700">80%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-300/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-700 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-purple-700">Improving</div>
                </div>

                {/* JAVA */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-900 font-medium"> Java</span>
                    <span className="text-[11px] text-slate-700">60%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-300/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-700 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-blue-700">Stable</div>
                </div>

                {/* C */}
                <div className="mb-5">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-slate-900 font-medium"> C</span>
                    <span className="text-[11px] text-slate-700">40%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-300/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-700 rounded-full" style={{ width: "40%" }}></div>
                  </div>
                  <div className="mt-1 text-[11px] text-green-700">Needs Work</div>
                </div>

                {/* FOOTER */}
                <div className="pt-3 border-t border-white/20">
                  <p className="text-[12px] text-slate-900 font-semibold">
                    Overall Score: <span className="text-black">67%</span>
                  </p>
                  <p className="text-[11px] text-green-600 mt-1">
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
