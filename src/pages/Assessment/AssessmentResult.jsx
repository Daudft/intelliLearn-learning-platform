import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function AssessmentResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  // Redirect safely if no result found
  useEffect(() => {
    if (!result) {
      navigate("/assessment", { replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  const { score, totalQuestions, percentage: rawPercentage, proficiencyLevel } = result;

  // ensure percentage is numeric and clamped 0..100
  const percentage = Math.max(0, Math.min(100, Number.isFinite(+rawPercentage) ? Math.round(+rawPercentage) : 0));

  const levelMessage = {
    Beginner: "Great start! Keep learning and practicing to improve your skills.",
    Intermediate: "Well done! You have a solid foundation. Keep building on it!",
    Advanced: "Excellent work! You have strong knowledge in this language!",
  }[proficiencyLevel] || "Assessment completed successfully!";

  /**
   * SVG circle math:
   * r = 100, circumference = 2 * Math.PI * r
   * fill percent = (percentage / 100) * circumference
   */
  const r = 100;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * r;
  const filled = (percentage / 100) * circumference;

  const stats = [
    { label: "Correct Answers", value: score, mark: "✓" },
    { label: "Incorrect Answers", value: totalQuestions - score, mark: "✗" },
    { label: "Total Questions", value: totalQuestions, mark: "≡" },
  ];

  return (
    <div className="h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
      <motion.div
        className="max-w-5xl w-full"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Result Card */}
        <div className="border border-gray-200 overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)]">

          {/* Header — black block with line texture + drawn emblem */}
          <div className="relative bg-black p-5 md:p-7 text-white text-center overflow-hidden">
            {/* diagonal line texture */}
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 11px)",
              }}
            />
            {/* faint concentric rings behind the emblem */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/5" />

            <div className="relative">
              {/* Line-art emblem: concentric rings + drawn checkmark */}
              <svg viewBox="0 0 100 100" className="mx-auto mb-3 h-12 w-12" fill="none">
                <motion.circle
                  cx="50" cy="50" r="45" stroke="white" strokeWidth="2" opacity="0.25"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="50" cy="50" r="33" stroke="white" strokeWidth="2" opacity="0.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.15, ease: "easeInOut" }}
                />
                <motion.path
                  d="M34 51 l11 11 l21 -25" stroke="white" strokeWidth="5"
                  strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                />
              </svg>

              <p className="mb-1.5 text-xs uppercase tracking-[0.3em] text-white/50">Initial Assessment</p>
              <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-2">
                Assessment Complete
              </h1>
              <p className="text-white/70 text-sm max-w-2xl mx-auto">
                {levelMessage}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-5 md:p-8">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">

              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative mb-5">
                  <svg
                    viewBox="0 0 224 224"
                    className="w-36 h-36 md:w-48 md:h-48"
                    role="img"
                    aria-label={`Score ${percentage} percent`}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="112" cy="112" r={r} stroke="#EDEDED" strokeWidth={strokeWidth} fill="none" />
                    <motion.circle
                      cx="112" cy="112" r={r} stroke="#000000" strokeWidth={strokeWidth} fill="none"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      transform="rotate(-90 112 112)"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset: circumference - filled }}
                      transition={{ duration: 1.4, delay: 0.3, ease: "easeInOut" }}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <motion.div
                      className="font-display text-4xl md:text-5xl font-bold text-black tracking-tight"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      {percentage}%
                    </motion.div>
                    <div className="text-sm md:text-lg text-gray-400 font-medium">
                      {score}/{totalQuestions}
                    </div>
                  </div>
                </div>

                {/* Proficiency Badge */}
                <div className="bg-black text-white px-8 py-2.5 text-center">
                  <div className="text-xs font-medium text-white/60 uppercase tracking-wide">Your Level</div>
                  <div className="font-display text-xl md:text-2xl font-bold">{proficiencyLevel}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-col justify-center gap-3">
                {stats.map((s, i) => (
                  <motion.div
                    key={s.label}
                    className="group border border-gray-200 p-4 md:p-5 flex items-center justify-between transition-colors hover:border-black"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.12 }}
                  >
                    <div>
                      <div className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">{s.label}</div>
                      <div className="font-display text-2xl md:text-3xl font-bold text-black">{s.value}</div>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center border border-gray-200 text-lg text-black transition-colors group-hover:border-black">
                      {s.mark}
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>

            {/* Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="mt-6 w-full bg-black text-white font-semibold py-3.5"
            >
              Go to Dashboard
            </button>

          </div>

        </div>
      </motion.div>
    </div>
  );
}
