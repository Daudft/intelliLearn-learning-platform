import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
# PYTHON LOGIN
email = "${email || "example@mail.com"}"
password = "●●●●●●●"

def authenticate(email, password):
    return "Login Successful!"

print(authenticate(email, password))
`,
    java: `
/* JAVA LOGIN */
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
/* C LOGIN */
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

      // Non-admin users always land on dashboard after sign-in.
      navigate("/dashboard");
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
    <div className="min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4">

      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-lg 
      flex flex-col md:flex-row overflow-hidden min-h-[500px]">

        {/* LEFT SIDE — MOVED UP */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-start mt-4 space-y-4">

          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your learning journey.</p>

          <div className="flex rounded-lg border border-black/10 p-1 w-fit bg-gray-50">
            <button
              type="button"
              onClick={() => setLoginMode("student")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                loginMode === "student"
                  ? "bg-[#E6FF03] text-black"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => setLoginMode("admin")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                loginMode === "admin"
                  ? "bg-[#E6FF03] text-black"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* ALERT MESSAGE */}
          {message.text && (
            <div
              className={`
                p-2 rounded-md text-xs border 
                transition-all duration-300 animate-fadeIn
                ${
                  message.type === "error"
                    ? "bg-red-100 text-red-700 border-red-300"
                    : "bg-green-100 text-green-700 border-green-300"
                }
              `}
            >
              {message.text}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSignIn}>

            {/* EMAIL */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value.trimStart())}
                autoComplete="email"
                required
                className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-gray-900
                outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block font-medium text-gray-800 mb-1 text-sm">
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
                  className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-gray-900
                  outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition text-sm"
                />

                {/* 👁 PASSWORD TOGGLE */}
                <span
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 cursor-pointer text-gray-600 text-sm"
                >
                  {showPass ? "🙈" : "👁️"}
                </span>
              </div>

              <div className="text-right mt-1">
                <Link
                  to="/forgot-password"
                  className="text-blue-600 hover:underline text-xs font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E6FF03] text-black font-semibold text-base py-2 rounded-lg 
              hover:bg-[#d7ee00] transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-700 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="hidden md:flex w-1/2 bg-[#0A0A0A] relative text-white p-8 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]
            bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),
            linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)]
            bg-size-[30px_30px]" />

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
                    lang === language
                      ? "bg-[#E6FF03] text-black"
                      : "bg-white/10 border border-gray-700 text-gray-300 hover:bg-white/20"
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