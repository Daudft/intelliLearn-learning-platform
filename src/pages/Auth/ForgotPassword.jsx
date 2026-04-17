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
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const response = await authService.forgotPassword({ email });
      setSuccess(true);
      alert(response.message || "Password reset link sent to your email!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send reset link. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="text-gray-600 mt-3">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* SUCCESS MESSAGE */}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✓ Password reset link sent! Please check your email.
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* EMAIL */}
          <div>
            <label className="block font-medium text-gray-800 mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="
                w-full px-4 py-3 rounded-xl
                border border-black/20 bg-white text-gray-900 shadow-sm
                hover:border-black/40
                focus:border-black focus:ring-2 focus:ring-black/10
                focus:outline-none transition-all duration-200
              "
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E6FF03] text-black font-semibold text-lg py-3 rounded-xl 
            hover:bg-[#d7ee00] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* BACK TO SIGNIN */}
        <div className="text-center mt-6">
          <Link
            to="/signin"
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}