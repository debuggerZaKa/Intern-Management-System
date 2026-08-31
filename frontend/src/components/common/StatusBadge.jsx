import React from "react";

const STATUS_CONFIGS = {
  // General Statuses
  active: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Active" },
  pending: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Pending" },
  inactive: { bg: "bg-slate-100 text-slate-700 border-slate-300", dot: "bg-slate-400", label: "Inactive" },
  deactivated: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", label: "Deactivated" },
  archived: { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", label: "Archived" },
  rejected: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", label: "Rejected" },
  approved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Approved" },
  completed: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "Completed" },

  // Task Statuses
  todo: { bg: "bg-slate-100 text-slate-700 border-slate-200", dot: "bg-slate-400", label: "To Do" },
  in_progress: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "In Progress" },
  done: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Done" },

  // Blocker Statuses & Severities
  open: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", label: "Open" },
  resolved: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Resolved" },
  low: { bg: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500", label: "Low" },
  medium: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Medium" },
  high: { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500", label: "High" },
  critical: { bg: "bg-red-100 text-red-800 border-red-300 animate-pulse", dot: "bg-red-600", label: "Critical" },

  // AI Progress Statuses
  on_track: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "On Track" },
  needs_attention: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", label: "Needs Attention" },
  at_risk: { bg: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", label: "At Risk" },

  // Roles
  admin: { bg: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500", label: "Admin" },
  mentor: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500", label: "Mentor" },
  intern: { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500", label: "Intern" },
};

export default function StatusBadge({ status = "pending", size = "sm", className = "", customLabel = null }) {
  const normalized = (status || "").toLowerCase().replace(/\s+/g, "_");
  const config = STATUS_CONFIGS[normalized] || {
    bg: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    label: status || "Unknown",
  };

  const sizeClasses = size === "xs" 
    ? "px-2 py-0.5 text-[10px] gap-1" 
    : size === "lg" 
    ? "px-3.5 py-1 text-sm gap-2" 
    : "px-2.5 py-0.5 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.dot}`} />
      <span>{customLabel || config.label}</span>
    </span>
  );
}
