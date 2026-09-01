import React from "react";
import { Brain, Sparkles } from "lucide-react";
import StatusBadge from "../common/StatusBadge";

export default function AISummaryCard({ summary, riskLevel, detectedSkills = [] }) {
  if (!summary) return null;

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white space-y-3 shadow-md border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs text-blue-300">
          <Brain className="w-4 h-4 text-blue-400" />
          <span>AI Insight Synthesis</span>
        </div>
        {riskLevel && <StatusBadge status={riskLevel} size="xs" />}
      </div>

      <p className="text-xs text-blue-100/90 leading-relaxed">{summary}</p>

      {detectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/10">
          {detectedSkills.map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-white/10 rounded-md text-[10px] text-blue-200">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
