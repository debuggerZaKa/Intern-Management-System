import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight
} from "lucide-react";
import logoImg from "../assets/images/netsol_logo.png";
import ErrorMessage from "../components/common/ErrorMessage";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await login(email.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Quick helper to fill demo credentials
  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans text-slate-800 bg-[#F4F7FB]">
      
      {/* ========================================================= */}
      {/* LEFT 60% - MINIMALIST PREMIUM BRAND SIDE                   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[60%] min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2652] to-[#07162E] text-white px-8 sm:px-14 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-between relative overflow-hidden">
        
        {/* Ambient Decorative Glows */}
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header: 20% Lower, 20% Bigger NETSOL TECHNOLOGIES Text + Matching Divider Line */}
        <div className="relative z-10 flex items-center gap-6">
          <img 
            src={logoImg} 
            alt="NETSOL Technologies Logo" 
            className="h-16 sm:h-20 w-auto object-contain brightness-0 invert flex-shrink-0" 
          />
          <div className="h-16 sm:h-20 w-[2.5px] bg-white/30" />
          <span className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase leading-none">
            NETSOL TECHNOLOGIES
          </span>
        </div>

        {/* Center: "Intern Management System" in Pure Solid White */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Intern Management <br />
            System
          </h1>

          <p className="text-sm sm:text-base text-blue-100/80 mt-5 leading-relaxed font-normal">
            Track weekly milestones, streamline engineering mentorship, and accelerate performance with intelligent workflows.
          </p>
        </div>

        {/* Footer: Positioned Lower at the Bottom */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/70">
          <span>&copy; 2026 NETSOL Technologies Ltd. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Online &bull; v2.0
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT 40% - AUTHENTICATION & LOGIN FORM SIDE              */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[40%] min-h-screen bg-white px-8 sm:px-12 lg:px-16 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-between shadow-2xl border-l border-slate-200/70">
        
        {/* Top Header */}
        <div className="mb-6">
          <div className="lg:hidden flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
            <img src={logoImg} alt="NETSOL Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">IMS Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Please enter your NETSOL credentials to log in.
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-5 my-auto max-w-md w-full mx-auto">
          
          <ErrorMessage message={error} onDismiss={() => setError(null)} />

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@netsol.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-800 transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-800 transition-all font-medium placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 select-none cursor-pointer">
                Remember this device for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Logins */}
          <div className="pt-5 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2.5 text-center">
              Quick Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemo("admin@netsol.com", "Admin@123")}
                className="py-2 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemo("mentor@netsol.com", "Password@123")}
                className="py-2 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer"
              >
                Mentor
              </button>
              <button
                type="button"
                onClick={() => fillDemo("ahmed.khan@netsol.com", "Password@123")}
                className="py-2 px-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer"
              >
                Intern
              </button>
            </div>
          </div>

        </div>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Don't have an intern account yet?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-700 underline ml-1">
              Register here
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
