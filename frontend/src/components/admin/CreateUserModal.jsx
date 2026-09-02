import React, { useState } from "react";
import Modal from "../common/Modal";
import { adminService } from "../../services/adminService";
import ErrorMessage from "../common/ErrorMessage";

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  const [durationOptions, setDurationOptions] = useState([4, 6, 8, 12]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    role_name: "intern",
    department: "Enterprise Software Solutions",
    phone: "",
    university: "",
    degree: "",
    semester: "7th Semester",
    duration_weeks: 6,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      adminService
        .getSettings()
        .then((data) => {
          if (data && Array.isArray(data.duration_options) && data.duration_options.length > 0) {
            setDurationOptions(data.duration_options);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.full_name) {
      setError("Please fill in required fields: Email, Password, and Full Name.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminService.createUserAccount(formData);
      onUserCreated?.();
      onClose();
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(err.message || "Failed to create user account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create User Account"
      subtitle="Directly provision an active intern or mentor account"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Role <span className="text-rose-500">*</span>
            </label>
            <select
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              <option value="intern">Intern</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ahmed Khan"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="name@netsol.com"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
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
              placeholder="e.g. Enterprise Solutions"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
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
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>
        </div>

        {formData.role_name === "intern" && (
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Academic & Internship Track Configuration
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="e.g. FAST NUCES"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. BS CS"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
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
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            {/* Internship Duration Field with quick selection pills */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-blue-900">
                  Internship Duration (Weeks) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] font-semibold text-blue-700">
                  {formData.duration_weeks || 6} Weeks Track
                </span>
              </div>

              <div className="flex items-center gap-2">
                {durationOptions.map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration_weeks: w })}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      Number(formData.duration_weeks) === w
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {w} Weeks
                  </button>
                ))}

                <div className="flex-1 min-w-[70px]">
                  <input
                    type="number"
                    min="1"
                    max="52"
                    name="duration_weeks"
                    value={formData.duration_weeks}
                    onChange={(e) => setFormData({ ...formData, duration_weeks: Number(e.target.value) || 1 })}
                    placeholder="Custom"
                    className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
