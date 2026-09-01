import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";
import logoImg from "../assets/images/netsol_logo.png";
import ErrorMessage from "../components/common/ErrorMessage";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authService.forgotPassword(email);
      setSuccessInfo(res);
    } catch (err) {
      console.error("Forgot password request failed:", err);
      setError(err.message || "Failed to process password reset request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F4F7FB] p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <img src={logoImg} alt="NETSOL Logo" className="h-9 w-auto object-contain" />
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase tracking-wider">NETSOL Technologies</h1>
            <p className="text-[10px] text-slate-400 font-medium">Intern Progress Management System</p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Forgot Password</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Enter your corporate email address to receive your password recovery token.
          </p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {successInfo ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset Token Generated</span>
              </div>
              <p className="text-emerald-700">{successInfo.message}</p>
              {successInfo.reset_token && (
                <div className="mt-2 p-2.5 bg-white rounded-xl border border-emerald-200 text-slate-800 font-mono text-[11px] break-all">
                  <span className="font-bold text-slate-500 block text-[9px] uppercase tracking-wider mb-1">
                    Demo Token (Auto-Sent to corporate inbox):
                  </span>
                  {successInfo.reset_token}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() =>
                  navigate(`/reset-password?token=${encodeURIComponent(successInfo.reset_token || "")}`)
                }
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>Proceed to Reset Password</span>
              </button>

              <Link
                to="/login"
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold text-center transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@netsol.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {loading ? "Generating Token..." : "Request Reset Token"}
            </button>

            <div className="pt-2 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
