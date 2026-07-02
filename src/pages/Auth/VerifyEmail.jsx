import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [error, setError] = useState("");

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail({ token });

      if (response?.alreadyVerified) {
        // if backend returns this flag
        setAlreadyVerified(true);
      } else {
        setSuccess(true);
      }

      setLoading(false);

    } catch (err) {
      const msg = err.response?.data?.message;

      if (msg?.toLowerCase().includes("already verified")) {
        setAlreadyVerified(true);
      } else {
        setError(
          msg || "Verification failed. The link may be invalid or expired."
        );
      }

      setLoading(false);
    }
  };

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="relative z-10 w-full max-w-md border border-white/10 bg-sui-deep/70 backdrop-blur-xl shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)] p-8 md:p-10 text-center">

        {/* LOGO */}
        <Link to="/" className="mb-8 flex items-baseline justify-center leading-none">
          <span className="text-xl font-bold text-white font-display tracking-tight">Intelli</span>
          <span className="text-xl font-semibold text-sui-blue font-display tracking-tight">Learn</span>
        </Link>

        {/* LOADING */}
        {loading && (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-sui-blue"></div>
            </div>
            <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-3">Verifying Email...</h2>
            <p className="text-sui-fog">Please wait while we verify your email address.</p>
          </>
        )}

        {/* SUCCESS */}
        {success && !alreadyVerified && !loading && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/15 rounded-full">
                <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold font-display tracking-tight bg-linear-to-b from-white via-white to-sui-pale bg-clip-text text-transparent mb-3">Email Verified!</h2>
            <p className="text-sui-fog mb-6">
              Your email has been successfully verified. You may now sign in.
            </p>

            <Link
              to="/signin"
              className="inline-block bg-sui-blue text-white font-semibold px-6 py-3
              hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {/* ALREADY VERIFIED */}
        {alreadyVerified && !loading && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-sui-blue/15 rounded-full">
                <svg className="w-10 h-10 text-sui-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold font-display tracking-tight bg-linear-to-b from-white via-white to-sui-pale bg-clip-text text-transparent mb-3">Already Verified</h2>
            <p className="text-sui-fog mb-6">
              Your email is already verified. You can sign in now.
            </p>

            <Link
              to="/signin"
              className="inline-block bg-sui-blue text-white font-semibold px-6 py-3
              hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {/* ERROR */}
        {error && !loading && !success && !alreadyVerified && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/15 rounded-full">
                <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold font-display tracking-tight text-white mb-3">Verification Failed</h2>
            <p className="text-red-300 mb-6">{error}</p>

            <div className="space-y-3">
              <Link
                to="/signup"
                className="block bg-sui-blue text-white font-semibold px-6 py-3
                hover:bg-sui-bright hover:shadow-[0_12px_32px_-8px_rgba(77,162,255,0.6)] transition-all"
              >
                Sign Up Again
              </Link>

              <Link
                to="/signin"
                className="block text-sui-bright text-sm font-semibold hover:underline transition"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
