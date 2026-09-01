import React, { useState } from "react";

export default function BlockerForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "moderate",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Blocker Summary *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Database connection timeout on staging VPC"
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Severity Level
        </label>
        <select
          value={formData.severity}
          onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="minor">Minor (Non-blocking)</option>
          <option value="moderate">Moderate (Slowing progress)</option>
          <option value="critical">Critical (Completely stalled)</option>
        </select>
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Help / Resources Needed
        </label>
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Specific mentor guidance or permissions required..."
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-slate-100 rounded-xl">
            Cancel
          </button>
        )}
        <button type="submit" className="px-4 py-1.5 bg-rose-600 text-white font-bold rounded-xl">
          Report Blocker
        </button>
      </div>
    </form>
  );
}
