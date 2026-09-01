import React, { useState, useEffect } from "react";
import { User, Mail, Phone, GraduationCap, Building2, Globe, Github, Linkedin, CheckCircle2, Lock, KeyRound } from "lucide-react";
import { userService } from "../../services/userService";
import { authService } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import ErrorMessage from "../common/ErrorMessage";
import StatusBadge from "../common/StatusBadge";

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile"); // "profile" or "password"

  const [formData, setFormData] = useState({
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

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setFormData({
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim()) {
      setError("Full name cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      const updatedProfile = await userService.updateMyProfile(formData);
      setUser((prev) => (prev ? { ...prev, profile: updatedProfile } : prev));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to update profile:", err);
      setError(err.message || "Failed to update profile information.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordError("Please fill in all password fields.");
      return;
    }
    if (passwordData.new_password.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(false);
      await authService.changePassword(passwordData.old_password, passwordData.new_password);
      setPasswordSuccess(true);
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to change password:", err);
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Account Info Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.profile?.full_name?.slice(0, 2) || user?.email?.slice(0, 2) || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {user?.profile?.full_name || user?.email}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <StatusBadge status={user?.role?.name || "intern"} size="xs" />
              <StatusBadge status={user?.status || "active"} size="xs" />
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "profile"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === "password"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Change Password
          </button>
        </div>
      </div>

      {activeTab === "profile" ? (
        /* Profile Form Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Personal & Academic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+92-300-1234567"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. FAST NUCES"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. BS Computer Science"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <input
                  type="text"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  placeholder="e.g. 7th Semester"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Software Solutions"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                name="linkedin_url"
                value={formData.linkedin_url}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / Profile Summary</label>
              <textarea
                rows={3}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief overview of engineering interests and experience..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                {loading ? "Saving Changes..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Change Password Form Card */
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
          {passwordError && <ErrorMessage message={passwordError} onClose={() => setPasswordError(null)} />}

          {passwordSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span>Change Corporate Credentials</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                required
                value={passwordData.old_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, old_password: e.target.value })
                }
                placeholder="Enter current password"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, new_password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirm_password: e.target.value })
                  }
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
