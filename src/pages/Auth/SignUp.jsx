import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authService from "../../services/authService";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [lang, setLang] = useState("python");
  const [loading, setLoading] = useState(false);

  // Success / Error message
  const [message, setMessage] = useState({ type: "", text: "" });

  // Password strength
  const [strength, setStrength] = useState("");
  const [strengthPercent, setStrengthPercent] = useState(0);

  // Password Strength Logic (Updated with full rules)
  useEffect(() => {
    if (!password) {
      setStrength("");
      setStrengthPercent(0);
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const isLongEnough = password.length >= 8;

    const conditionsMet = [hasUpper, hasLower, hasNumber, hasSymbol].filter(Boolean).length;

    // Weak conditions
    if (password.length < 8 || conditionsMet < 2) {
      setStrength("weak");
      setStrengthPercent(25);
      return;
    }

    // Medium conditions (some requirements met)
    if (conditionsMet >= 2 && conditionsMet < 4) {
      setStrength("medium");
      // Set percent depending on conditions met and length
      const percent = Math.min(45 + conditionsMet * 12 + (isLongEnough ? 10 : 0), 85);
      setStrengthPercent(percent);
      return;
    }

    // Strong conditions (ALL requirements met)
    if (conditionsMet === 4 && isLongEnough) {
      setStrength("strong");
      setStrengthPercent(100);
      return;
    }

    setStrength("medium");
    setStrengthPercent(60);
  }, [password]);

  const codeSamples = {
    python: `

user = {
    "name": "${name || "Guest"}",
    "skills": ["Python", "AI", "Backend"]
}

def start_learning():
    return "Welcome to IntelliLearn"

print(start_learning())
`,
    java: `

class User {
    String name = "${name || "Guest"}";
    String[] skills = {"Java", "OOP", "Spring"};

    void startLearning() {
        System.out.println("Welcome to IntelliLearn");
    }
}
`,
    c: `

#include <stdio.h>

int main() {
    char name[] = "${name || "Guest"}";
    printf("Welcome to IntelliLearn, %s!\\n", name);
    return 0;
}
`,
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName || !normalizedEmail || !password || !passwordConfirm) {
      setMessage({ type: "error", text: "All fields are required." });
      return;
    }

    // Require strong password to align with backend policy.
    if (strength !== "strong") {
      setMessage({
        type: "error",
        text: "Use a strong password: 8+ chars with uppercase, lowercase, number, and symbol.",
      });
      return; // stop function
    }

    // BLOCK IF PASSWORDS DO NOT MATCH
    if (password !== passwordConfirm) {
      setMessage({
        type: "error",
        text: "Passwords do not match.",
      });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.signup({
        name: normalizedName,
        email: normalizedEmail,
        password,
        passwordConfirm,
      });

      // 🎉 SUCCESS stays on same page (NO REDIRECT)
      setMessage({ type: "success", text: response.message });
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black px-4 py-8">

      {/* AMBIENT BACKGROUND — white→blue glow rising from the bottom (hero style) */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 80% at 50% 108%,
              #eaf3ff 0%,
              #a9d0ff 12%,
              #5aa8ff 26%,
              rgba(47,127,224,0.35) 44%,
              rgba(0,0,0,0) 68%),
            #000000
          `,
        }}
      />
      {/* drifting blue orb for depth */}
      <div className="absolute -left-24 top-10 z-0 h-72 w-72 rounded-full bg-sui-blue/20 blur-[110px] animate-sui-float" />

      {/* CARD — dark glass */}
      <div className="relative z-10 w-full max-w-6xl border border-white/10 bg-sui-deep/70 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] flex flex-col md:flex-row overflow-hidden min-h-[640px]">

        {/* hairline divider between panels */}
        <div className="pointer-events-none absolute left-1/2 top-0 hidden md:block h-full w-px bg-linear-to-b from-transparent via-sui-blue/30 to-transparent" />

        {/* LEFT SIDE — FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">

          {/* LOGO */}
          <Link to="/" className="mb-8 flex items-baseline leading-none">
            <span className="text-xl font-bold text-sui-blue font-display tracking-tight">Intelli</span>
            <span className="text-xl font-semibold text-black font-display tracking-tight">Learn</span>
          </Link>

          <h2 className="text-3xl font-bold font-display tracking-tight text-sui-sea">
            Create an account
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">Join IntelliLearn and start improving your skills.</p>

          {/* SUCCESS / ERROR */}
          {message.text && (
            <div
              role="alert"
              aria-live="polite"
              className={`
                mb-4 p-2.5 text-xs
                transition-all duration-300 ease-in-out animate-fadeIn
                ${message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"}
              `}
            >
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignUp}>
            {/* FULL NAME */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 text-sui-sea text-sm
                outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/25 focus:bg-white transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 text-sui-sea text-sm
                outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/25 focus:bg-white transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">Password</label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 pr-11 border ${
                    strength === "weak" ? "border-red-300" : "border-gray-200"
                  } bg-gray-50 text-sui-sea text-sm outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/25 focus:bg-white transition`}
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sui-bright transition"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* PASSWORD RULE — turns red when weak (color only, no layout shift) */}
              <p className={`text-xs mt-1.5 transition-colors ${strength === "weak" ? "text-red-500" : "text-gray-400"}`}>
                Use uppercase, lowercase, number, symbol, and 8+ characters.
              </p>

              {/* PASSWORD STRENGTH BAR — 3-Step Indicator */}
              <div className={`flex gap-2 mt-2 transition-opacity ${password ? "opacity-100" : "opacity-0"}`}>
                {/* Step 1 */}
                <div
                  className={`w-8 h-1 transition-all duration-300 ${
                    strength === "weak" || strength === "medium" || strength === "strong"
                      ? strength === "weak"
                        ? "bg-red-500"
                        : strength === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />

                {/* Step 2 */}
                <div
                  className={`w-8 h-1 transition-all duration-300 ${
                    strength === "medium" || strength === "strong"
                      ? strength === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />

                {/* Step 3 */}
                <div
                  className={`w-8 h-1 transition-all duration-300 ${
                    strength === "strong" ? "bg-green-500" : "bg-white/15"
                  }`}
                />
              </div>

            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">Confirm Password</label>

              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-11 border border-gray-200 bg-gray-50 text-sui-sea text-sm
                  outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/25 focus:bg-white transition"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-sui-bright transition"
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                >
                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sui-blue text-white font-semibold text-sm py-3 mt-1
              hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Sign up"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/signin" className="text-sui-bright font-semibold hover:underline transition">
              Log in
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE — SHOWCASE PANEL */}
        <div className="hidden md:flex w-1/2 relative text-white p-10 overflow-hidden">
          {/* deep gradient base */}
          <div className="absolute inset-0 bg-linear-to-br from-sui-sea via-sui-deep to-black" />
          {/* white→blue glow rising from the bottom */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 100% 70% at 60% 115%,
                rgba(234,243,255,0.35) 0%,
                rgba(90,168,255,0.28) 26%,
                rgba(47,127,224,0.12) 46%,
                rgba(0,0,0,0) 70%)`,
            }}
          />
          {/* subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]
            bg-[linear-gradient(to_right,#ffffff20_1px,transparent_1px),
            linear-gradient(to_bottom,#ffffff20_1px,transparent_1px)]
            bg-size-[34px_34px]"
          />
          {/* corner glow */}
          <div className="absolute -top-16 -right-16 h-72 w-72 rounded-full bg-sui-blue/25 blur-[100px]" />

          <div className="relative z-10 flex w-full flex-col">
            {/* FLOATING CODE CARD */}
            <div className="border border-white/10 bg-white/[0.04] p-4 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md ring-1 ring-sui-blue/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-sui-fog">Live Preview</span>
                <div className="flex gap-1.5">
                  {["python", "java", "c"].map((language) => (
                    <button
                      key={language}
                      type="button"
                      onClick={() => setLang(language)}
                      className={`px-2.5 py-1 text-[11px] font-semibold transition ${
                        lang === language
                          ? "bg-sui-blue text-white"
                          : "bg-white/5 border border-white/10 text-sui-mist hover:bg-white/10"
                      }`}
                    >
                      {language.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="bg-black/50 p-4 font-mono text-[13px] leading-relaxed text-white whitespace-pre-wrap"
                style={{ height: "230px", overflow: "hidden" }}
              >
                {codeSamples[lang]}
              </div>
            </div>

            {/* CAPTION */}
            <div className="mt-auto pt-10 text-center">
              <h3 className="text-2xl font-semibold font-display tracking-tight bg-linear-to-b from-white to-sui-pale bg-clip-text text-transparent">
                Learn. Build. Innovate.
              </h3>
              <p className="mt-2 text-sm text-sui-fog/80 max-w-sm mx-auto">
                Welcome to IntelliLearn — AI-powered practice that adapts to your level and guides every step of your learning path.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
