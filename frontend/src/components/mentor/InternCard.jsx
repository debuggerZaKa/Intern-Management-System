import React from "react";
import { User, Calendar, BookOpen, ChevronRight, FileText, CheckSquare, AlertCircle } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function InternCard({ internship, onClick }) {
  const currentWeek = internship.current_week || 1;
  const duration = internship.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));

  const internName =
    internship.intern?.profile?.full_name || internship.intern?.email || "Unknown Intern";
  const university = internship.intern?.profile?.university || "University Candidate";
  const degree = internship.intern?.profile?.degree || internship.department || "Enterprise Software";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <StatusBadge status={internship.status} size="xs" />
          <span className="text-[11px] font-bold text-slate-400">
            Week {currentWeek} of {duration}
          </span>
        </div>

        {/* Profile Details */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
            {internName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {internName}
            </h4>
            <p className="text-[11px] text-slate-500 truncate">{university}</p>
            <p className="text-[10px] text-slate-400 truncate">{degree}</p>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="space-y-1.5 mb-4">
          <div className="flex justify-between text-[11px] font-semibold text-slate-600">
            <span>Milestone Progress</span>
            <span className="font-bold text-blue-600">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
        <span>View Reports & Tasks</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}
