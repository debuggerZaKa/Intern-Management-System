import React, { useState, useEffect, useRef } from "react";
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
  X,
  Camera,
  Upload
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import { adminService } from "../services/adminService";
import { getMediaUrl } from "../utils/mediaUtils";
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

  // Avatar Upload State
  const avatarInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

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

  // Avatar Upload Handler for logged-in user (Intern / Mentor / Admin)
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setAvatarUploading(true);
      setProfileError(null);
      const updatedProfile = await userService.uploadMyAvatar(file);
      setUser((prev) => (prev ? { ...prev, profile: updatedProfile } : prev));
      setProfileSuccess("Profile photo updated successfully!");
      setTimeout(() => setProfileSuccess(null), 3500);
    } catch (err) {
      console.error("Failed to upload avatar:", err);
      setProfileError(err.message || "Failed to upload profile photo.");
    } finally {
      setAvatarUploading(false);
    }
  };

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
      <div className="space-y-4 -mt-3 sm:-mt-5 lg:-mt-6 animate-fadeIn">
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={avatarInputRef}
          onChange={handleAvatarUpload}
          accept="image/*"
          className="hidden"
        />

        {/* Global Feedback Banners */}
        {profileSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {settingsSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{settingsSuccess}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* SPLIT SCREEN: PROFILE (LEFT) | OTHER SETTINGS (RIGHT)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: PROFILE CARD (READ-ONLY / EDITABLE) (5 COLS) */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/60 space-y-5">
              
              {/* Header with Top-Right Edit Button */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Profile Details
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Account identity & credentials
                    </p>
                  </div>
                </div>

                {/* Edit Button on Top Right */}
                {profileMode === "view" ? (
                  <button
                    type="button"
                    onClick={() => setProfileMode("edit")}
                    className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMode("view");
                      setProfileError(null);
                    }}
                    className="h-9 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition-all border-2 border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

              {profileError && (
                <ErrorMessage message={profileError} onClose={() => setProfileError(null)} />
              )}

              {/* Avatar Hero & Upload Badge */}
              <div className="flex flex-col items-center text-center pb-4 border-b-2 border-slate-100">
                <div className="relative mb-3 group">
                  {user?.profile?.avatar_url ? (
                    <img
                      src={getMediaUrl(user.profile.avatar_url)}
                      alt={user?.profile?.full_name || "Avatar"}
                      className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-600 text-white font-black text-2xl flex items-center justify-center border-2 border-slate-200 shadow-md">
                      {userInitials}
                    </div>
                  )}

                  {/* Always Visible Camera Badge */}
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    title="Change Profile Photo"
                    className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {user?.profile?.full_name || user?.email}
                </h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black uppercase tracking-wider">
                    {user?.role?.name || "Member"}
                  </span>
                  <StatusBadge status={user?.status || "active"} size="xs" />
                </div>

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-600" />
                  <span>{avatarUploading ? "Uploading..." : "Change Photo"}</span>
                </button>
              </div>

              {profileMode === "view" ? (
                /* ========================================================= */
                /* READ-ONLY PROFILE DISPLAY                                 */
                /* ========================================================= */
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Full Name
                      </span>
                      <p className="font-extrabold text-slate-900 truncate">
                        {user?.profile?.full_name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Email Address
                      </span>
                      <p className="font-extrabold text-slate-900 truncate">{user?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Phone Number
                      </span>
                      <p className="font-extrabold text-slate-900 truncate">
                        {user?.profile?.phone || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <Building className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Department / Track
                      </span>
                      <p className="font-extrabold text-slate-900">
                        {user?.profile?.department || "General Engineering"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        University / Institute
                      </span>
                      <p className="font-extrabold text-slate-900">
                        {user?.profile?.university || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200/80">
                    <Globe className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Degree & Academic Level
                      </span>
                      <p className="font-extrabold text-slate-900">
                        {user?.profile?.degree
                          ? `${user.profile.degree}${user.profile.semester ? ` (Sem ${user.profile.semester})` : ""}`
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Social Profiles */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Social & Developer Links
                    </span>
                    <div className="flex flex-col gap-2 font-bold">
                      {user?.profile?.linkedin_url ? (
                        <a
                          href={user.profile.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-2"
                        >
                          <Linkedin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{user.profile.linkedin_url}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-2">
                          <Linkedin className="w-4 h-4 text-slate-300" />
                          <span>No LinkedIn URL attached</span>
                        </span>
                      )}

                      {user?.profile?.github_url ? (
                        <a
                          href={user.profile.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-900 hover:underline flex items-center gap-2"
                        >
                          <Github className="w-4 h-4 text-slate-800 flex-shrink-0" />
                          <span className="truncate">{user.profile.github_url}</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-2">
                          <Github className="w-4 h-4 text-slate-300" />
                          <span>No GitHub URL attached</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user?.profile?.bio && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        Professional Bio / Summary
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed italic">
                        "{user.profile.bio}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* ========================================================= */
                /* EDITABLE PROFILE FORM                                     */
                /* ========================================================= */
                <form onSubmit={handleProfileSubmit} className="space-y-4 animate-fadeIn">
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={profileForm.full_name}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, full_name: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={profileForm.phone}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, phone: e.target.value })
                        }
                        placeholder="+92-300-1234567"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        Department / Practice
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={profileForm.department}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, department: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        University / Institute
                      </label>
                      <input
                        type="text"
                        name="university"
                        value={profileForm.university}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, university: e.target.value })
                        }
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                          Degree Program
                        </label>
                        <input
                          type="text"
                          name="degree"
                          value={profileForm.degree}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, degree: e.target.value })
                          }
                          placeholder="BS Computer Science"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                          Semester
                        </label>
                        <input
                          type="number"
                          name="semester"
                          value={profileForm.semester}
                          onChange={(e) =>
                            setProfileForm({ ...profileForm, semester: e.target.value })
                          }
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        name="linkedin_url"
                        value={profileForm.linkedin_url}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, linkedin_url: e.target.value })
                        }
                        placeholder="https://linkedin.com/in/username"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        name="github_url"
                        value={profileForm.github_url}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, github_url: e.target.value })
                        }
                        placeholder="https://github.com/username"
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                        Professional Bio / Summary
                      </label>
                      <textarea
                        name="bio"
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) =>
                          setProfileForm({ ...profileForm, bio: e.target.value })
                        }
                        placeholder="Brief overview of your role, technical background, or interests..."
                        className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Save Button below all info */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                    >
                      <Save className="w-4 h-4" />
                      <span>{savingProfile ? "Saving Profile..." : "Save Profile Changes"}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: OTHER SETTINGS (SECURITY & ADMIN) (7 COLS)  */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* CARD 1: SECURITY & PASSWORD AUTHENTICATION */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/60 space-y-5">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight">
                      Security & Password Authentication
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Update your account password and security credentials
                    </p>
                  </div>
                </div>
              </div>

              {passwordError && (
                <ErrorMessage message={passwordError} onClose={() => setPasswordError(null)} />
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    value={passwordForm.old_password}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, old_password: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new_password: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm_password: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="h-10 px-6 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-2xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{savingPassword ? "Updating..." : "Update Password"}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* CARD 2: PLATFORM CONFIGURATION (ADMIN ONLY) */}
            {isAdmin && (
              <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/60 space-y-5">
                <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 border-2 border-purple-200 text-purple-600 flex items-center justify-center font-bold flex-shrink-0">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 tracking-tight">
                        Platform & Program Configuration
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Manage corporate departments, track durations, and platform thresholds
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSavePlatformSettings}
                    disabled={savingSettings}
                    className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer hover:scale-105"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? "Saving..." : "Save Settings"}</span>
                  </button>
                </div>

                {settingsError && (
                  <ErrorMessage message={settingsError} onClose={() => setSettingsError(null)} />
                )}

                {loading ? (
                  <Loader message="Loading platform settings..." />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Department Management */}
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <h4 className="text-xs font-black text-slate-900">Corporate Departments</h4>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="e.g. Cloud Architecture"
                          className="flex-1 px-3 py-2 text-xs bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleAddDepartment}
                          className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {platformSettings.departments.map((dept) => (
                          <span
                            key={dept}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-slate-800 text-[11px] font-extrabold rounded-xl border border-slate-200 shadow-xs"
                          >
                            {dept}
                            <button
                              type="button"
                              onClick={() => handleRemoveDepartment(dept)}
                              className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Duration Tracks */}
                    <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <h4 className="text-xs font-black text-slate-900">Internship Duration Tracks</h4>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          placeholder="e.g. 10 (weeks)"
                          className="flex-1 px-3 py-2 text-xs bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-bold"
                        />
                        <button
                          type="button"
                          onClick={handleAddDuration}
                          className="px-3 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {platformSettings.duration_options.map((weeks) => (
                          <span
                            key={weeks}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-900 text-[11px] font-black rounded-xl border border-indigo-200"
                          >
                            {weeks} Weeks Track
                            <button
                              type="button"
                              onClick={() => handleRemoveDuration(weeks)}
                              className="text-indigo-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
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
        </div>
      </div>
    </AppLayout>
  );
}
