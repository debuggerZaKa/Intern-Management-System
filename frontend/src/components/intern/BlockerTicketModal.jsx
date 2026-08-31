import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle } from "lucide-react";
import Modal from "../common/Modal";
import { blockerService } from "../../services/blockerService";
import { internService } from "../../services/internService";
import ErrorMessage from "../common/ErrorMessage";

export default function BlockerTicketModal({
  isOpen,
  onClose,
  reports = [],
  onBlockerCreated,
}) {
  const [formData, setFormData] = useState({
    report_id: "",
    title: "",
    description: "",
    severity: "moderate",
    help_needed: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reports.length > 0 && !formData.report_id) {
      setFormData((prev) => ({ ...prev, report_id: reports[reports.length - 1].id.toString() }));
    }
  }, [reports, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Please provide a title and detailed description of the blocker.");
      return;
    }
    if (!formData.report_id) {
      setError("Please associate the blocker with a weekly report milestone.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await blockerService.createBlocker({
        report_id: parseInt(formData.report_id),
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        help_needed: formData.help_needed.trim() || null,
      });
      onBlockerCreated?.();
      onClose();
    } catch (err) {
      console.error("Failed to report blocker:", err);
      setError(err.message || "Failed to raise blocker ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Raise a Technical Blocker Ticket"
      subtitle="Flag critical impediments or access issues to your supervising mentor"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Associate with Weekly Report Milestone <span className="text-rose-500">*</span>
          </label>
          <select
            required
            value={formData.report_id}
            onChange={(e) => setFormData({ ...formData, report_id: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
          >
            <option value="">-- Choose Weekly Report --</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                Week {r.week_number} Milestone ({new Date(r.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Blocker Summary Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Missing AWS Dev credentials / Database connection timeout"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Severity Level <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
          >
            <option value="low">Low &bull; Minor issue or question</option>
            <option value="moderate">Moderate &bull; Progress slowed but not halted</option>
            <option value="high">High &bull; Multiple tasks blocked</option>
            <option value="critical">Critical &bull; Completely blocked, requires immediate mentor help</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Detailed Impediment Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the exact error, steps you have tried, and impact on timeline..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            What Specific Help Is Needed?
          </label>
          <input
            type="text"
            value={formData.help_needed}
            onChange={(e) => setFormData({ ...formData, help_needed: e.target.value })}
            placeholder="e.g. 15-minute sync with lead architect or IAM policy update"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
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
            className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{loading ? "Submitting..." : "Raise Blocker Ticket"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
