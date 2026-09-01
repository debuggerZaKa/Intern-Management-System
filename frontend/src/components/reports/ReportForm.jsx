import React, { useState } from "react";

export default function ReportForm({ initialData = {}, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    week_number: initialData.week_number || 1,
    summary: initialData.summary || "",
    tasks_completed_summary: initialData.tasks_completed_summary || "",
    tasks_in_progress_summary: initialData.tasks_in_progress_summary || "",
    learnings_and_skills: initialData.learnings_and_skills || "",
    goals_next_week: initialData.goals_next_week || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Week Number (1-6)
        </label>
        <input
          type="number"
          min="1"
          max="6"
          value={formData.week_number}
          onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Tasks Completed This Week
        </label>
        <textarea
          rows={3}
          value={formData.tasks_completed_summary}
          onChange={(e) => setFormData({ ...formData, tasks_completed_summary: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Learnings & Demonstrated Skills
        </label>
        <textarea
          rows={2}
          value={formData.learnings_and_skills}
          onChange={(e) => setFormData({ ...formData, learnings_and_skills: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Goals & Deliverables for Next Week
        </label>
        <textarea
          rows={2}
          value={formData.goals_next_week}
          onChange={(e) => setFormData({ ...formData, goals_next_week: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-slate-100 rounded-xl">
            Cancel
          </button>
        )}
        <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
          Submit Report
        </button>
      </div>
    </form>
  );
}
