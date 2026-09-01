import React from "react";
import { Star, MessageSquare } from "lucide-react";

export default function FeedbackCard({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-amber-500">
          {[...Array(feedback.rating || 5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <span className="text-[10px] text-slate-400">
          {feedback.created_at ? new Date(feedback.created_at).toLocaleDateString() : ""}
        </span>
      </div>

      <p className="text-xs text-slate-700 italic leading-relaxed">
        "{feedback.feedback_text}"
      </p>

      {feedback.action_items && (
        <div className="p-2.5 bg-blue-50/60 rounded-xl text-[11px] text-blue-900">
          <span className="font-bold block mb-1">Focus Action Items:</span>
          {feedback.action_items}
        </div>
      )}
    </div>
  );
}
