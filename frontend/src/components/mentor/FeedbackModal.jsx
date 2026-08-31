import React, { useState, useEffect } from "react";
import { Star, MessageSquare, CheckCircle2 } from "lucide-react";
import Modal from "../common/Modal";
import { feedbackService } from "../../services/feedbackService";
import ErrorMessage from "../common/ErrorMessage";

export default function FeedbackModal({
  isOpen,
  onClose,
  report,
  existingFeedback = null,
  onFeedbackSaved,
}) {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (existingFeedback) {
      setRating(existingFeedback.rating || 5);
      setComments(existingFeedback.comments || "");
    } else {
      setRating(5);
      setComments("");
    }
    setError(null);
  }, [existingFeedback, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!report) return;
    if (!comments.trim()) {
      setError("Please provide constructive mentor comments.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (existingFeedback && existingFeedback.id) {
        await feedbackService.updateFeedback(existingFeedback.id, {
          rating,
          comments: comments.trim(),
        });
      } else {
        await feedbackService.submitFeedback(report.id, {
          rating,
          comments: comments.trim(),
        });
      }
      onFeedbackSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to save feedback:", err);
      setError(err.message || "Failed to submit mentor feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (!report) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingFeedback ? "Edit Weekly Mentor Feedback" : "Submit Weekly Mentor Feedback"}
      subtitle={`Week ${report.week_number} Report &bull; ${report.summary || "Weekly Submission"}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Rating Stars */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Performance Rating (1 - 5 Stars)
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300 hover:text-amber-300"
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5</span>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Constructive Comments & Guidance <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Share feedback on the intern's engineering quality, milestones achieved, and areas of improvement..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 leading-relaxed"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
          >
            {loading ? "Submitting..." : existingFeedback ? "Update Feedback" : "Submit Feedback"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
