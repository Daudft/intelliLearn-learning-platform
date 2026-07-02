import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await authService.forgotPassword({ email: normalizedEmail });
      setSuccess(true);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
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
      <div className="relative z-10 w-full max-w-md border border-white/10 bg-sui-deep/70 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] p-8 md:p-10">

        {/* LOGO */}
        <Link to="/" className="mb-8 flex items-baseline justify-center leading-none">
          <span className="text-xl font-bold text-white font-display tracking-tight">Intelli</span>
          <span className="text-xl font-semibold text-sui-blue font-display tracking-tight">Learn</span>
        </Link>

        <div className="text-center mb-7">
          <h2 className="text-3xl font-bold font-display tracking-tight bg-linear-to-b from-white via-white to-sui-pale bg-clip-text text-transparent">
            Forgot Password?
          </h2>
          <p className="text-sm text-sui-mist mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-2.5 text-xs bg-red-500/10 text-red-300 border border-red-500/30 animate-fadeIn">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-2.5 text-xs bg-green-500/10 text-green-300 border border-green-500/30 animate-fadeIn">
            ✓ Password reset link sent! Please check your email.
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>

          {/* EMAIL */}
          <div>
            <label className="block font-medium text-sui-fog mb-1.5 text-sm">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trimStart())}
              required
              className="w-full px-3.5 py-2.5 border border-white/10 bg-white/5 text-white text-sm
              outline-none placeholder:text-sui-mist/60 focus:border-sui-blue focus:ring-2 focus:ring-sui-blue/25 focus:bg-white/[0.07] transition"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sui-blue text-white font-semibold text-sm py-3
            hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* BACK TO SIGNIN */}
        <div className="text-center mt-6">
          <Link
            to="/signin"
            className="text-sui-bright text-sm font-semibold hover:underline transition"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
