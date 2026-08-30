import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  Building2,
  BookOpen,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import logoImg from "../assets/images/netsol_logo.png";
import ErrorMessage from "../components/common/ErrorMessage";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    university: "",
    degree: "",
    semester: "7th Semester",
    department: "Enterprise Software Solutions",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await authService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error("Registration failed:", err);
      setError(err.message || "Registration failed. An account with this email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-sans text-slate-800 bg-[#F4F7FB]">
      
      {/* ========================================================= */}
      {/* LEFT 60% - MINIMALIST PREMIUM BRAND SIDE                   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[60%] min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2652] to-[#07162E] text-white px-8 sm:px-14 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-between relative overflow-hidden">
        
        {/* Ambient Glows */}
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
            A structured 6-week intensive engineering journey designed to transition top university talent into world-class software professionals.
          </p>
        </div>

        {/* Footer: Positioned Lower at the Bottom */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/70">
          <span>&copy; 2026 NETSOL Technologies Ltd. All rights reserved.</span>
          <span className="text-slate-400">Lahore &bull; Dubai &bull; California &bull; Beijing</span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* RIGHT 40% - INTERN REGISTRATION FORM SIDE                 */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[40%] min-h-screen bg-white px-8 sm:px-12 lg:px-16 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-between shadow-2xl border-l border-slate-200/70 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-4">
          <div className="lg:hidden flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <img src={logoImg} alt="NETSOL Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">IMS Portal</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Intern Signup</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Create your student profile to start your 6-week journey.
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-4 my-auto max-w-md w-full mx-auto">
          
          <ErrorMessage message={error} onDismiss={() => setError(null)} />

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Registration successful! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Ahmed Khan"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Corporate / Academic Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ahmed.khan@netsol.com"
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 text-slate-800 font-medium placeholder:text-slate-400"
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

            {/* University & Degree Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  University
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="FAST NUCES"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Degree Program
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="BS CS / SE"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Department
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                >
                  <option value="Enterprise Software Solutions">Enterprise Software Solutions</option>
                  <option value="Cloud & Distributed Systems">Cloud & Distributed Systems</option>
                  <option value="AI & Generative Technology Labs">AI & Generative Technology Labs</option>
                  <option value="Quality Engineering & Automation">Quality Engineering & Automation</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

        </div>

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 underline ml-1">
              Sign in here
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}
