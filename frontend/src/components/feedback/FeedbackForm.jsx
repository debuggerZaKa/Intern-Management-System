import React, { useState } from "react";
import { Star } from "lucide-react";

export default function FeedbackForm({ onSave, onCancel }) {
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [actionItems, setActionItems] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ rating, feedback_text: feedbackText, action_items: actionItems });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Weekly Star Rating (1-5)
        </label>
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 text-slate-300 hover:text-amber-400"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
          Written Guidance & Mentorship
        </label>
        <textarea
          rows={4}
          required
          value={feedbackText}
          onChange={(e) => setFeedbackText(e.target.value)}
          placeholder="Guidance on engineering tasks, code quality, and deliverables..."
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
          Submit Feedback
        </button>
      </div>
    </form>
  );
}
