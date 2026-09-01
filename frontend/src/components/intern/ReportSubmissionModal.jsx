import React, { useState, useEffect } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import Modal from "../common/Modal";
import { reportService } from "../../services/reportService";
import ErrorMessage from "../common/ErrorMessage";

export default function ReportSubmissionModal({
  isOpen,
  onClose,
  existingReport = null,
  internshipId = null,
  currentWeek = 1,
  onReportSaved,
}) {
  const [formData, setFormData] = useState({
    week_number: currentWeek,
    tasks_completed_summary: "",
    tasks_in_progress_summary: "",
    learnings_and_skills: "",
    goals_next_week: "",
    status: "submitted",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingReport) {
      setFormData({
        week_number: existingReport.week_number || currentWeek,
        tasks_completed_summary: existingReport.tasks_completed_summary || "",
        tasks_in_progress_summary: existingReport.tasks_in_progress_summary || "",
        learnings_and_skills: existingReport.learnings_and_skills || "",
        goals_next_week: existingReport.goals_next_week || "",
        status: existingReport.status || "submitted",
      });
    } else {
      setFormData({
        week_number: currentWeek,
        tasks_completed_summary: "",
        tasks_in_progress_summary: "",
        learnings_and_skills: "",
        goals_next_week: "",
        status: "submitted",
      });
    }
    setError(null);
  }, [existingReport, currentWeek, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tasks_completed_summary && !formData.tasks_in_progress_summary) {
      setError("Please outline either tasks completed or in progress for this week.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (existingReport && existingReport.id) {
        await reportService.updateReport(existingReport.id, formData);
      } else {
        await reportService.submitReport({
          ...formData,
          internship_id: internshipId,
          week_number: parseInt(formData.week_number),
        });
      }
      onReportSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to submit weekly report:", err);
      setError(err.message || "Failed to submit weekly report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingReport ? `Edit Week ${formData.week_number} Report` : `Submit Week ${formData.week_number} Progress Report`}
      subtitle="Document your weekly engineering achievements, roadblocks, and next milestones"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Week Number & Status Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internship Week Number <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.week_number}
              onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold"
            >
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <option key={w} value={w}>
                  Week {w} Milestone
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Submission Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            >
              <option value="submitted">Submit for Mentor Review</option>
              <option value="draft">Save as Draft</option>
            </select>
          </div>
        </div>

        {/* Tasks Completed Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tasks Completed Summary <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            value={formData.tasks_completed_summary}
            onChange={(e) => setFormData({ ...formData, tasks_completed_summary: e.target.value })}
            placeholder="List the key engineering features, bug fixes, or architecture components you finished..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
          />
        </div>

        {/* Tasks In Progress Summary */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Tasks Currently In Progress
          </label>
          <textarea
            rows={2}
            value={formData.tasks_in_progress_summary}
            onChange={(e) => setFormData({ ...formData, tasks_in_progress_summary: e.target.value })}
            placeholder="Items currently undergoing development, testing, or code review..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
          />
        </div>

        {/* Learnings & Skills */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Key Learnings & New Skills Acquired
          </label>
          <textarea
            rows={2}
            value={formData.learnings_and_skills}
            onChange={(e) => setFormData({ ...formData, learnings_and_skills: e.target.value })}
            placeholder="Tools, frameworks, design patterns, or domain knowledge learned this week (comma separated)..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
          />
        </div>

        {/* Goals Next Week */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Goals & Deliverables for Next Week
          </label>
          <textarea
            rows={2}
            value={formData.goals_next_week}
            onChange={(e) => setFormData({ ...formData, goals_next_week: e.target.value })}
            placeholder="What will you deliver or achieve by next week's review?"
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
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
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            <span>{loading ? "Submitting..." : existingReport ? "Update Report" : "Submit Report"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
