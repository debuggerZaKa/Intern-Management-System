import React from "react";
import StatusBadge from "../common/StatusBadge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function BlockerItem({ blocker, onResolve }) {
  if (!blocker) return null;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <h4 className="font-bold text-xs text-slate-800">{blocker.title}</h4>
          <StatusBadge status={blocker.severity} size="xs" />
        </div>
        {blocker.description && (
          <p className="text-[11px] text-slate-600">{blocker.description}</p>
        )}
      </div>

      {blocker.status !== "resolved" && onResolve && (
        <button
          onClick={() => onResolve(blocker.id)}
          className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-colors"
        >
          Mark Resolved
        </button>
      )}
    </div>
  );
}
