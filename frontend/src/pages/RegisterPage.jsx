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
  CheckCircle2,
  Users
} from "lucide-react";
import logoImg from "../assets/images/netsol_logo.png";
import ErrorMessage from "../components/common/ErrorMessage";

export default function RegisterPage() {
  const [role, setRole] = useState("intern"); // "intern" or "mentor"
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
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

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Password and confirmation password do not match.");
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await authService.requestSignup({
        ...formData,
        role_name: role,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
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
      {/* LEFT 55% - MINIMALIST PREMIUM BRAND SIDE                   */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[55%] min-h-screen bg-gradient-to-br from-[#0B1E3F] via-[#0D2652] to-[#07162E] text-white px-8 sm:px-14 lg:px-20 pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-8 lg:pb-10 flex flex-col justify-between relative overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-[-15%] left-[-10%] w-[550px] h-[550px] bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
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

        {/* Center */}
        <div className="relative z-10 my-auto py-10 max-w-xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Intern Management <br />
            System
          </h1>

          <p className="text-sm sm:text-base text-blue-100/80 mt-5 leading-relaxed font-normal">
            A structured 6-week intensive engineering journey designed to transition top university talent into world-class software professionals.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/70">
          <span>&copy; 2026 NETSOL Technologies Ltd. All rights reserved.</span>
          <span className="text-slate-400">Lahore &bull; Dubai &bull; California &bull; Beijing</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT 45% - REGISTRATION FORM SIDE                        */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[45%] min-h-screen bg-white px-8 sm:px-12 lg:px-14 pt-10 pb-8 flex flex-col justify-between shadow-2xl border-l border-slate-200/70 overflow-y-auto">
        
        {/* Header */}
        <div className="mb-3">
          <div className="lg:hidden flex items-center gap-3 mb-3 pb-3 border-b border-slate-100">
            <img src={logoImg} alt="NETSOL Logo" className="h-8 w-auto object-contain" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">IMS Portal</span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Submit your corporate registration request for administrator verification.
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-3.5 my-auto max-w-md w-full mx-auto">
          
          {/* Role Switcher Tab */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole("intern")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "intern"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Intern Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("mentor")}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                role === "mentor"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Engineering Mentor</span>
            </button>
          </div>

          <ErrorMessage message={error} onDismiss={() => setError(null)} />

          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Registration submitted! Awaiting admin approval. Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder={role === "intern" ? "e.g. Ahmed Khan" : "e.g. Sarah Jenkins"}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Corporate / Official Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@netsol.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Password and Confirm Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 chars"
                    className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department Track *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="Enterprise Software Solutions">Enterprise Software Solutions</option>
                  <option value="Financial Cloud Solutions">Financial Cloud Solutions</option>
                  <option value="Artificial Intelligence & Analytics">Artificial Intelligence & Analytics</option>
                  <option value="Quality Engineering & Assurance">Quality Engineering & Assurance</option>
                  <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                </select>
              </div>
            </div>

            {/* Intern-specific Academic fields */}
            {role === "intern" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    University / Institution
                  </label>
                  <input
                    type="text"
                    name="university"
                    value={formData.university}
                    onChange={handleChange}
                    placeholder="e.g. FAST NUCES / LUMS"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Degree & Semester
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleChange}
                    placeholder="e.g. BS Computer Science (7th)"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Submitting Request..." : `Request ${role === "intern" ? "Intern" : "Mentor"} Access`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium">
              Already have an active account?{" "}
              <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700">
                Log in here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 pt-3">
          Protected by NETSOL Identity & Access Governance &bull; IMS v2.0
        </div>
      </div>
    </div>
  );
}
