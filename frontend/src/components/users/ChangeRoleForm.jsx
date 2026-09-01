import React, { useState } from "react";

export default function ChangeRoleForm({ currentRole, onSave, onCancel }) {
  const [role, setRole] = useState(currentRole || "intern");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(role);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Assign Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="intern">Intern</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Administrator</option>
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-3 py-1.5 bg-slate-100 rounded-xl">
            Cancel
          </button>
        )}
        <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl">
          Update Role
        </button>
      </div>
    </form>
  );
}
