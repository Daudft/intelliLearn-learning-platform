import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";

export default function ResetPassword() {
  const { token } = useParams(); // Get token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (password !== passwordConfirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({
        token,
        password,
        passwordConfirm,
      });

      alert(response.message || "Password reset successful! You can now sign in.");
      navigate("/signin");
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to reset password. The link may be expired.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F2F4] px-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900">Reset Password</h2>
          <p className="text-gray-600 mt-3">
            Enter your new password below.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* NEW PASSWORD */}
          <div>
            <label className="block font-medium text-gray-800 mb-1">
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter new password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="
                w-full px-4 py-3 rounded-xl
                border border-black/20 bg-white text-gray-900 shadow-sm
                hover:border-black/40
                focus:border-black focus:ring-2 focus:ring-black/10
                focus:outline-none transition-all duration-200
              "
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block font-medium text-gray-800 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
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
            {loading ? "Resetting..." : "Reset Password"}
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