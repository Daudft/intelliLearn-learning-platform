import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
    if (password.length < 6 || conditionsMet < 2) {
      setStrength("weak");
      setStrengthPercent(25);
      return;
    }

    // Medium conditions (some requirements met)
    if (conditionsMet >= 2 && conditionsMet < 4) {
      setStrength("medium");
      // Set percent depending on conditions met and length
      const percent = Math.min(50 + conditionsMet * 10 + (isLongEnough ? 10 : 0), 85);
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

    // BLOCK SIGNUP IF PASSWORD IS WEAK
    if (strength === "weak") {
      setMessage({
        type: "error",
        text: "Your password is too weak. Use uppercase, lowercase, numbers, symbols, and minimum 8 characters.",
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
        name,
        email,
        password,
        passwordConfirm,
      });

      // 🎉 SUCCESS stays on same page (NO REDIRECT)
      setMessage({ type: "success", text: response.message });
    } catch (err) {
      const msg = err?.response?.data?.message || "Signup failed.";
      setMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4">
      <div
        className="bg-white w-full max-w-6xl
 rounded-3xl shadow-lg flex flex-col md:flex-row overflow-hidden min-h-[620px]"
      >
        {/* LEFT SIDE */}
        <div className="w-full md:w-1/2 p-6 md:p-8 space-y-3">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600">Join IntelliLearn and start improving your skills.</p>

          {/* SUCCESS / ERROR */}
          {message.text && (
            <div
              role="alert"
              aria-live="polite"
              className={`
    p-2 rounded-md text-xs 
    transition-all duration-300 ease-in-out
    ${message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-300 animate-fadeIn"
                  : "bg-red-100 text-red-700 border border-red-300 animate-fadeIn"}
  `}
            >
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignUp}>
            {/* FULL NAME */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-gray-900
                outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-gray-900
                outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">Password</label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 rounded-lg border ${
                    strength === "weak" ? "border-red-400" : "border-black/10"
                  } bg-white text-gray-900 outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm`}
                />

                {/* 👁 EYE ICON */}
                <span
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600 text-sm"
                >
                  {showPass ? "🙈" : "👁️"}
                </span>
              </div>

              {/* PASSWORD RULE */}
              <p className="text-xs text-gray-500 mt-1">Use uppercase, lowercase, and numbers.</p>

              {/* PASSWORD STRENGTH BAR */}
              {/* 3–Step Password Strength Indicator */}
              <div className={`flex gap-2 mt-2 transition-opacity ${password ? "opacity-100" : "opacity-0"}`}>
                {/* Step 1 */}
                <div
                  className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    strength === "weak" || strength === "medium" || strength === "strong"
                      ? strength === "weak"
                        ? "bg-red-500"
                        : strength === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />

                {/* Step 2 */}
                <div
                  className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    strength === "medium" || strength === "strong"
                      ? strength === "medium"
                        ? "bg-yellow-500"
                        : "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />

                {/* Step 3 */}
                <div
                  className={`w-8 h-1 rounded-full transition-all duration-300 ${
                    strength === "strong" ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              </div>

              {/* Inline weak helper */}
              {strength === "weak" && (
                <p className="text-xs text-red-600 mt-2">
                  Password is too weak. Use uppercase, lowercase, numbers, symbols and at least 8 characters.
                </p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">Confirm Password</label>

              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-gray-900
                  outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm"
                />

                {/* 👁 CONFIRM EYE */}
                <span
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600 text-sm"
                >
                  {showConfirmPass ? "🙈" : "👁️"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E6FF03] text-black font-semibold text-base py-2 rounded-lg 
              hover:bg-[#d7ee00] transition shadow disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-gray-700 text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="text-blue-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE VISUALS (unchanged) */}
        <div className="hidden md:flex w-1/2 bg-[#0A0A0A] relative text-white p-8 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]
            bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),
            linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]
            bg-[size:30px_30px]"
          />

          <div className="absolute top-8 left-8 w-16 h-16 border border-gray-600 rounded-lg opacity-30"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-gray-600 rounded-full opacity-20"></div>
          <div className="absolute top-1/2 right-14 w-14 h-14 border border-gray-600 rotate-45 opacity-30"></div>

          <div className="relative z-10 w-full">
            <h3 className="text-3xl font-semibold mb-5">Learn. Build. Innovate.</h3>

            <div className="flex gap-2 mb-4">
              {["python", "java", "c"].map((language) => (
                <button
                  key={language}
                  onClick={() => setLang(language)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    lang === language ? "bg-[#E6FF03] text-black" : "bg-white/10 border border-gray-700 text-gray-300 hover:bg-white/20"
                  }`}
                >
                  {language.toUpperCase()}
                </button>
              ))}
            </div>

            <div
              className="bg-black/40 rounded-lg p-4 shadow-lg font-mono text-sm text-[#E6FF03] whitespace-pre-wrap"
              style={{ height: "220px", overflow: "hidden" }}
            >
              {codeSamples[lang]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
