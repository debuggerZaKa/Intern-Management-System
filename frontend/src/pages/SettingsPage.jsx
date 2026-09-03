import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Lock,
  KeyRound,
  CheckCircle2,
  Edit2,
  Eye,
  Save,
  Building,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Shield,
  Sliders,
  RotateCcw,
  X
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { adminService } from "../services/adminService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function SettingsPage() {
  const { user, setUser, isAdmin } = useAuth();
  
  // Settings Mode: 'view' | 'edit' (for Profile)
  const [profileMode, setProfileMode] = useState("view");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
    university: "",
    degree: "",
    semester: "",
    department: "",
    linkedin_url: "",
    github_url: "",
    bio: "",
  });

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Admin Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    departments: [],
    duration_options: [4, 6, 8, 12],
    ai_model: "llama-3.3-70b-versatile",
    ai_enabled: true,
    email_notifications_enabled: true,
    late_submission_alert_hours: "24",
  });

  const [newDepartment, setNewDepartment] = useState("");
  const [newDuration, setNewDuration] = useState("");

  // Loading & Alert States
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [settingsSuccess, setSettingsSuccess] = useState(null);

  const [profileError, setProfileError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [settingsError, setSettingsError] = useState(null);

  // Sync profileForm with logged in user profile
  useEffect(() => {
    if (user?.profile) {
      setProfileForm({
        full_name: user.profile.full_name || "",
        phone: user.profile.phone || "",
        university: user.profile.university || "",
        degree: user.profile.degree || "",
        semester: user.profile.semester || "",
        department: user.profile.department || "",
        linkedin_url: user.profile.linkedin_url || "",
        github_url: user.profile.github_url || "",
        bio: user.profile.bio || "",
      });
    }
  }, [user]);

  // Load Platform Configuration for Admins
  const loadPlatformSettings = async () => {
    if (!isAdmin) return;
    try {
      setLoading(true);
      const data = await adminService.getSettings();
      if (data) {
        setPlatformSettings({
          departments: Array.isArray(data.departments) ? data.departments : [],
          duration_options: Array.isArray(data.duration_options) && data.duration_options.length > 0
            ? data.duration_options
            : [4, 6, 8, 12],
          ai_model: data.ai_model || "llama-3.3-70b-versatile",
          ai_enabled: data.ai_enabled === true || data.ai_enabled === "true",
          email_notifications_enabled: data.email_notifications_enabled === true || data.email_notifications_enabled === "true",
          late_submission_alert_hours: data.late_submission_alert_hours || "24",
        });
      }
    } catch (err) {
      console.error("Failed to load platform settings:", err);
      setSettingsError(err.message || "Failed to load platform configuration.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPlatformSettings();
    }
  }, [isAdmin]);

  // Profile Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.full_name.trim()) {
      setProfileError("Full name cannot be empty.");
      return;
    }

    try {
      setSavingProfile(true);
      setProfileError(null);
      const updatedProfile = await userService.updateMyProfile(profileForm);
      setUser((prev) => (prev ? { ...prev, profile: updatedProfile } : prev));
      setProfileSuccess("Profile updated successfully!");
      setProfileMode("view");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setProfileError(err.message || "Failed to update profile information.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Change Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordForm.old_password || !passwordForm.new_password) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      await authService.changePassword(passwordForm.old_password, passwordForm.new_password);
      setPasswordSuccess("Password updated successfully!");
      setPasswordForm({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(err.message || "Failed to update password. Check old password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // Department Management (Admin)
  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    if (platformSettings.departments.includes(newDepartment.trim())) {
      alert("Department already exists.");
      return;
    }
    setPlatformSettings((prev) => ({
      ...prev,
      departments: [...prev.departments, newDepartment.trim()],
    }));
    setNewDepartment("");
  };

  const handleRemoveDepartment = (deptToRemove) => {
    setPlatformSettings((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== deptToRemove),
    }));
  };

  // Duration Track Management (Admin)
  const handleAddDuration = () => {
    const num = parseInt(newDuration, 10);
    if (isNaN(num) || num <= 0) {
      alert("Please enter a valid number of weeks (e.g. 10).");
      return;
    }
    if (platformSettings.duration_options.includes(num)) {
      alert(`${num}-week duration track already exists.`);
      return;
    }
    const updated = [...platformSettings.duration_options, num].sort((a, b) => a - b);
    setPlatformSettings((prev) => ({
      ...prev,
      duration_options: updated,
    }));
    setNewDuration("");
  };

  const handleRemoveDuration = (numToRemove) => {
    setPlatformSettings((prev) => ({
      ...prev,
      duration_options: prev.duration_options.filter((d) => d !== numToRemove),
    }));
  };

  // Platform Settings Save Handler
  const handleSavePlatformSettings = async () => {
    try {
      setSavingSettings(true);
      setSettingsError(null);
      await adminService.updateSettings(platformSettings);
      setSettingsSuccess("Platform configuration saved successfully!");
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch (err) {
      console.error("Failed to update settings:", err);
      setSettingsError(err.message || "Failed to save settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const userInitials =
    user?.profile?.full_name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "US";

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        
        {/* ========================================================= */}
        {/* TOP PROFILE HERO BANNER BAR                               */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border border-slate-800/80 shadow-md shadow-slate-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 font-black text-xl flex items-center justify-center border-2 border-white/20 shadow-lg shadow-blue-500/20 flex-shrink-0">
              {userInitials}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white truncate">
                  {user?.profile?.full_name || user?.email}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black uppercase tracking-wider">
                  {user?.role?.name || "Member"}
                </span>
                <StatusBadge status={user?.status || "active"} size="xs" />
              </div>

              <p className="text-xs text-slate-300 font-medium mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  {user?.email}
                </span>
                {user?.profile?.department && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Building className="w-3.5 h-3.5 text-blue-400" />
                      {user.profile.department}
                    </span>
                  </>
                )}
                {user?.profile?.university && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                      {user.profile.university}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Viewing / Editing Mode Switcher */}
          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-2xl flex items-center gap-1 border border-white/10 flex-shrink-0">
            <button
              type="button"
              onClick={() => setProfileMode("view")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                profileMode === "view"
                  ? "bg-white text-slate-900 shadow-md shadow-slate-900/20"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>View Profile</span>
            </button>

            <button
              type="button"
              onClick={() => setProfileMode("edit")}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                profileMode === "edit"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {profileSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* CARD 1: PERSONAL PROFILE & BIO DETAILS                    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Personal & Professional Information</h3>
                <p className="text-xs text-slate-500 font-medium">Your platform account details, contact info, and bio</p>
              </div>
            </div>

            {profileMode === "view" ? (
              <button
                type="button"
                onClick={() => setProfileMode("edit")}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Info</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setProfileMode("view")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
            )}
          </div>

          {profileError && <ErrorMessage message={profileError} onClose={() => setProfileError(null)} />}

          {profileMode === "view" ? (
            /* READ-ONLY VIEWING MODE */
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Full Name</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user?.profile?.full_name || "Not provided"}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Email Address</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user?.email}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Phone Number</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user?.profile?.phone || "Not provided"}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Department / Track</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user?.profile?.department || "General Engineering"}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">University / Institute</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>{user?.profile?.university || "Not provided"}</span>
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Degree & Semester</span>
                  <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {user?.profile?.degree ? `${user.profile.degree} (Sem ${user.profile.semester || 1})` : "Not provided"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Social Links & Bio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Social Profiles</span>
                  <div className="flex items-center gap-4 text-xs font-bold">
                    {user?.profile?.linkedin_url ? (
                      <a
                        href={user.profile.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1.5"
                      >
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        <span>LinkedIn Profile</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1.5"><Linkedin className="w-4 h-4 text-slate-300" /> No LinkedIn attached</span>
                    )}

                    {user?.profile?.github_url ? (
                      <a
                        href={user.profile.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-900 hover:underline flex items-center gap-1.5"
                      >
                        <Github className="w-4 h-4 text-slate-800" />
                        <span>GitHub Profile</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1.5"><Github className="w-4 h-4 text-slate-300" /> No GitHub attached</span>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Biography / Overview</span>
                  <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                    "{user?.profile?.bio || "No biography overview added yet."}"
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* EDITING FORM MODE */
            <form onSubmit={handleProfileSubmit} className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">University / Institute</label>
                  <input
                    type="text"
                    name="university"
                    value={profileForm.university}
                    onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Degree Program</label>
                  <input
                    type="text"
                    name="degree"
                    value={profileForm.degree}
                    onChange={(e) => setProfileForm({ ...profileForm, degree: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={profileForm.semester}
                    onChange={(e) => setProfileForm({ ...profileForm, semester: e.target.value })}
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    name="linkedin_url"
                    value={profileForm.linkedin_url}
                    onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    name="github_url"
                    value={profileForm.github_url}
                    onChange={(e) => setProfileForm({ ...profileForm, github_url: e.target.value })}
                    placeholder="https://github.com/username"
                    className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Professional Summary</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  placeholder="Share a short bio..."
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setProfileMode("view")}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="h-10 px-5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ========================================================= */}
        {/* CARD 2: SECURITY & PASSWORD MANAGEMENT                    */}
        {/* ========================================================= */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Security & Password Authentication</h3>
                <p className="text-xs text-slate-500 font-medium">Update your account password and security credentials</p>
              </div>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && <ErrorMessage message={passwordError} onClose={() => setPasswordError(null)} />}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                value={passwordForm.old_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword}
                className="h-10 px-5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4" />
                <span>{savingPassword ? "Updating Password..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* ========================================================= */}
        {/* CARD 3: PROGRAM & PLATFORM CONFIGURATION (ADMIN ONLY)     */}
        {/* ========================================================= */}
        {isAdmin && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Platform & Program Configuration</h3>
                  <p className="text-xs text-slate-500 font-medium">Manage departments, program tracks, AI models, and system thresholds</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSavePlatformSettings}
                disabled={savingSettings}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? "Saving..." : "Save Platform Settings"}</span>
              </button>
            </div>

            {settingsSuccess && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && <ErrorMessage message={settingsError} onClose={() => setSettingsError(null)} />}

            {loading ? (
              <Loader message="Loading platform settings..." />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Management */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900">Corporate Departments</h4>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      placeholder="e.g. AI & Machine Learning"
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddDepartment}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {platformSettings.departments.map((dept) => (
                      <span
                        key={dept}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-slate-800 text-xs font-bold rounded-lg border border-slate-200/90 shadow-2xs"
                      >
                        {dept}
                        <button
                          type="button"
                          onClick={() => handleRemoveDepartment(dept)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Duration Tracks */}
                <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-xs font-bold text-slate-900">Internship Duration Tracks</h4>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      placeholder="e.g. 10 (weeks)"
                      className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddDuration}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {platformSettings.duration_options.map((weeks) => (
                      <span
                        key={weeks}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-900 text-xs font-extrabold rounded-lg border border-indigo-200/80"
                      >
                        {weeks} Weeks Track
                        <button
                          type="button"
                          onClick={() => handleRemoveDuration(weeks)}
                          className="text-indigo-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
