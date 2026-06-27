import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../../utils/api";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      await API.put(`/auth/password/reset/${token}`, { password });
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your new password below.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-field" placeholder="New password" />
          <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="input-field" placeholder="Confirm new password" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
