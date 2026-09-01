import React from "react";
import StatusBadge from "../common/StatusBadge";
import { FileText, Calendar } from "lucide-react";

export default function ReportItem({ report, onSelect }) {
  if (!report) return null;

  return (
    <div
      onClick={() => onSelect && onSelect(report)}
      className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-blue-300 transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
          W{report.week_number}
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-800">
            {report.summary || `Weekly Progress Report (Week ${report.week_number})`}
          </h4>
          <p className="text-[10px] text-slate-400">
            Milestone Week {report.week_number} &bull; Status: {report.status || "submitted"}
          </p>
        </div>
      </div>
      <StatusBadge status={report.status || "submitted"} size="xs" />
    </div>
  );
}
