import React from "react";
import { AlertTriangle, ChevronRight, User } from "lucide-react";

export default function AttentionTracker({ attentionList = [], onSelectIntern }) {
  if (!attentionList || attentionList.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
          ✓
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-900">All Assigned Interns On Track</p>
          <p className="text-[11px] text-emerald-700">No critical blockers or high-risk AI progress flags detected.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 tracking-tight">
              Interns Requiring Immediate Attention
            </h4>
            <p className="text-[11px] text-slate-500">
              Triggered by critical blockers or AI risk indicators
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
          {attentionList.length} Flagged
        </span>
      </div>

      <div className="space-y-2">
        {attentionList.map((item) => (
          <div
            key={item.internship_id}
            onClick={() => onSelectIntern?.(item.intern_id)}
            className="p-3 rounded-xl bg-amber-50/50 hover:bg-amber-50 border border-amber-200/60 flex items-center justify-between gap-3 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {item.intern_name?.slice(0, 2) || "IN"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{item.intern_name}</p>
                <div className="flex flex-wrap gap-1.5 mt-0.5">
                  {item.reasons?.map((reason, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 font-semibold rounded"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] font-bold text-slate-400">Week {item.current_week}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
