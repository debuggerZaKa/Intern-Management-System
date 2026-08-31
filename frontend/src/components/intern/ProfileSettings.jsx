import React, { useState, useEffect } from "react";
import { User, Mail, Phone, GraduationCap, Building2, Globe, Github, Linkedin, CheckCircle2 } from "lucide-react";
import { userService } from "../../services/userService";
import { useAuth } from "../../hooks/useAuth";
import ErrorMessage from "../common/ErrorMessage";
import StatusBadge from "../common/StatusBadge";

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

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
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
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
    </div>
  );
}
