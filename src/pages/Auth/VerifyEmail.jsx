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

  useEffect(() => {
    verifyEmail();
  }, []);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10 text-center">

        {/* LOADING */}
        {loading && (
          <>
            <div className="mb-6">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#E6FF03]"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Verifying Email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {/* SUCCESS */}
        {success && !alreadyVerified && !loading && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Email Verified!</h2>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You may now sign in.
            </p>

            <Link
              to="/signin"
              className="inline-block bg-[#E6FF03] text-black font-semibold px-6 py-3 rounded-xl 
              hover:bg-[#d7ee00] transition-all shadow-md"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {/* ALREADY VERIFIED */}
        {alreadyVerified && !loading && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Already Verified</h2>
            <p className="text-gray-600 mb-6">
              Your email is already verified. You can sign in now.
            </p>

            <Link
              to="/signin"
              className="inline-block bg-[#E6FF03] text-black font-semibold px-6 py-3 rounded-xl 
              hover:bg-[#d7ee00] transition-all shadow-md"
            >
              Go to Sign In
            </Link>
          </>
        )}

        {/* ERROR */}
        {error && !loading && !success && !alreadyVerified && (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">Verification Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>

            <div className="space-y-3">
              <Link
                to="/signup"
                className="block bg-[#E6FF03] text-black font-semibold px-6 py-3 rounded-xl 
                hover:bg-[#d7ee00] transition-all shadow-md"
              >
                Sign Up Again
              </Link>

              <Link
                to="/signin"
                className="block text-blue-600 font-semibold hover:underline"
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
