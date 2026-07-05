import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import authService from "../../services/authService";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState("student");

  const [showPass, setShowPass] = useState(false);

  const [lang, setLang] = useState("python");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  const codeSamples = {
    python: `

email = "${email || "example@mail.com"}"
password = "●●●●●●●"

def authenticate(email, password):
    return "Login Successful!"

print(authenticate(email, password))
`,
    java: `

class Auth {
    static String email = "${email || "user@mail.com"}";
    static String password = "********";

    static void login() {
        System.out.println("Login Successful!");
    }
}

public class Main {
    public static void main(String[] args) {
        Auth.login();
    }
}
`,
    c: `

#include <stdio.h>

int main() {
    char email[] = "${email || "user@mail.com"}";
    char password[] = "********";

    printf("Login Successful!\\n");
    return 0;
}
`,
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setMessage({ type: "error", text: "Email and password are required." });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.signin({ email: normalizedEmail, password });

      if (loginMode === "admin" && response.user.role !== "admin") {
        await authService.logout();
        setMessage({
          type: "error",
          text: "This account does not have admin access. Use Student Login or contact an admin.",
        });
        return;
      }

      if (response.user.role === "admin") {
        navigate("/admin");
        return;
      }

      const hasCompletedAssessment = Boolean(response?.user?.hasCompletedAssessment);

      if (hasCompletedAssessment) {
        navigate("/dashboard");
        return;
      }

      // First-time student users must complete initial assessment.
      navigate("/assessment");
    } catch (err) {
      // ❌ Only show error for actual login failures
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
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
      <div className="relative z-10 w-full max-w-6xl border border-white/10 bg-sui-deep/70 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] flex flex-col md:flex-row overflow-hidden min-h-[560px]">

        {/* hairline divider between panels */}
        <div className="pointer-events-none absolute left-1/2 top-0 hidden md:block h-full w-px bg-linear-to-b from-transparent via-sui-blue/30 to-transparent" />

        {/* LEFT SIDE — FORM */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">

          {/* LOGO */}
          <Link to="/" className="mb-8 flex items-baseline leading-none">
            <span className="text-xl font-bold text-sui-blue font-display tracking-tight">Intelli</span>
            <span className="text-xl font-semibold text-black font-display tracking-tight">Learn</span>
          </Link>

          <h2 className="text-3xl font-bold font-display tracking-tight text-sui-sea">Welcome back</h2>
          <p className="text-sm text-gray-500 mt-1.5 mb-6">Sign in to continue your learning journey.</p>

          {/* STUDENT / ADMIN TOGGLE */}
          <div className="flex border border-gray-200 p-1 w-fit bg-gray-50 mb-5">
            <button
              type="button"
              onClick={() => setLoginMode("student")}
              className={`px-4 py-1.5 text-sm font-medium transition ${
                loginMode === "student"
                  ? "bg-sui-blue text-white"
                  : "text-gray-500 hover:text-sui-sea"
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("admin")}
              className={`px-4 py-1.5 text-sm font-medium transition ${
                loginMode === "admin"
                  ? "bg-sui-blue text-white"
                  : "text-gray-500 hover:text-sui-sea"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* ALERT MESSAGE */}
          {message.text && (
            <div
              role="alert"
              aria-live="polite"
              className={`
                mb-4 p-2.5 text-xs border
                transition-all duration-300 ease-in-out animate-fadeIn
                ${
                  message.type === "error"
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }
              `}
            >
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignIn}>

            {/* EMAIL */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 bg-gray-50 text-sui-sea text-sm
                outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/20 focus:bg-white transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-medium text-gray-700 mb-1.5 text-sm">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full px-3.5 py-2.5 pr-11 border border-gray-200 bg-gray-50 text-sui-sea text-sm
                  outline-none placeholder:text-gray-400 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/20 focus:bg-white transition"
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

              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sui-bright hover:underline text-xs font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sui-blue text-white font-semibold text-sm py-3 mt-1
              hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-sui-bright font-semibold hover:underline transition">
              Create Account
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