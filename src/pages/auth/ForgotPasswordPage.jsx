import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/password/forgot", { email });
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

        {sent ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-4">📧</div>
            <p className="font-semibold text-gray-900">Email sent!</p>
            <p className="text-sm text-gray-500 mt-2">Check your inbox for the password reset link.</p>
            <Link to="/login" className="btn-primary mt-6 inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field mb-4" placeholder="you@example.com" />
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <Link to="/login" className="block text-center text-sm text-sky-600 mt-4 hover:underline">Back to Login</Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
