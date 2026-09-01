import React, { useState, useEffect } from "react";
import {
  Settings,
  Building2,
  Clock,
  Sparkles,
  Mail,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { adminService } from "../services/adminService";
import AppLayout from "../components/common/AppLayout";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    departments: [],
    internship_duration_weeks: "6",
    ai_model: "llama-3.3-70b-versatile",
    ai_enabled: true,
    email_notifications_enabled: true,
    late_submission_alert_hours: "24",
  });

  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSettings();
      if (data) {
        setSettings({
          departments: Array.isArray(data.departments) ? data.departments : [],
          internship_duration_weeks: data.internship_duration_weeks || "6",
          ai_model: data.ai_model || "llama-3.3-70b-versatile",
          ai_enabled: data.ai_enabled === true || data.ai_enabled === "true",
          email_notifications_enabled: data.email_notifications_enabled === true || data.email_notifications_enabled === "true",
          late_submission_alert_hours: data.late_submission_alert_hours || "24",
        });
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
      setError(err.message || "Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleAddDepartment = () => {
    if (!newDepartment.trim()) return;
    if (settings.departments.includes(newDepartment.trim())) {
      alert("Department already exists.");
      return;
    }
    setSettings((prev) => ({
      ...prev,
      departments: [...prev.departments, newDepartment.trim()],
    }));
    setNewDepartment("");
  };

  const handleRemoveDepartment = (deptToRemove) => {
    setSettings((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d !== deptToRemove),
    }));
  };

  const handleSaveAll = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      await adminService.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update settings:", err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">System Settings & Governance</h2>
            <p className="text-xs text-slate-500">
              Configure global internship parameters, department directories, AI models, and automated triggers
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Platform settings updated and applied successfully!</span>
          </div>
        )}

        {loading ? (
          <Loader message="Loading system settings..." />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1: Department Management */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Corporate Departments</h4>
                  <p className="text-[11px] text-slate-500">Manage tracks available for intern registration & assignment</p>
                </div>
              </div>

              {/* Add department input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="e.g. Artificial Intelligence & Robotics"
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
                <button
                  type="button"
                  onClick={handleAddDepartment}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Departments list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {settings.departments.map((dept, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs"
                  >
                    <span className="font-semibold text-slate-800">{dept}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDepartment(dept)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove Department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Program Lifecycle & Timeline Defaults */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Internship Lifecycle</h4>
                  <p className="text-[11px] text-slate-500">Configure duration defaults and submission deadlines</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Standard Program Duration (Weeks)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="52"
                    value={settings.internship_duration_weeks}
                    onChange={(e) =>
                      setSettings({ ...settings, internship_duration_weeks: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default 6-week intensive engineering cycle</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Late Submission Alert Threshold (Hours)
                  </label>
                  <input
                    type="number"
                    value={settings.late_submission_alert_hours}
                    onChange={(e) =>
                      setSettings({ ...settings, late_submission_alert_hours: e.target.value })
                    }
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: AI Engine Settings */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">AI Intelligence Engine</h4>
                  <p className="text-[11px] text-slate-500">Configure LLM inference parameters and evaluation models</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Active AI Model
                  </label>
                  <select
                    value={settings.ai_model}
                    onChange={(e) => setSettings({ ...settings, ai_model: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                  >
                    <option value="llama-3.3-70b-versatile">Groq / Llama 3.3 70B Versatile (Fast)</option>
                    <option value="llama-3.1-8b-instant">Groq / Llama 3.1 8B Instant (Ultra-Fast)</option>
                    <option value="mixtral-8x7b-32768">Groq / Mixtral 8x7B (32k Context)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Enable Automated AI Analysis</p>
                    <p className="text-[11px] text-slate-500">Run automatic sentiment and blocker evaluation on report submission</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.ai_enabled}
                    onChange={(e) => setSettings({ ...settings, ai_enabled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Communication & Notifications */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Notifications & Dispatch</h4>
                  <p className="text-[11px] text-slate-500">Corporate communication hooks and alert dispatches</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800">Email Notifications</p>
                    <p className="text-[11px] text-slate-500">Send automatic updates for approval status and feedback</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.email_notifications_enabled}
                    onChange={(e) =>
                      setSettings({ ...settings, email_notifications_enabled: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>

                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Corporate Audit Trail</span>
                  </div>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    All administrative settings updates are stamped with administrator user ID and recorded in system audit logs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
