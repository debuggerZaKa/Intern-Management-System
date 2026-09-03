import React, { useState, useEffect } from "react";
import { Award, Star, CheckCircle2, FileText, Lock } from "lucide-react";
import Modal from "../common/Modal";
import { evaluationService } from "../../services/evaluationService";
import ErrorMessage from "../common/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";

export default function EvaluationModal({
  isOpen,
  onClose,
  internship,
  existingEvaluation = null,
  isReadOnly = false,
  onEvaluationSaved,
}) {
  const { user: authUser, isAdmin, isMentor } = useAuth();

  const [formData, setFormData] = useState({
    overall_rating: 8.5,
    technical_skills_rating: 4.5,
    soft_skills_rating: 4.5,
    strengths: "",
    areas_for_improvement: "",
    recommendation: "hire",
    final_comments: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Read-only condition:
  // 1. Explicit isReadOnly prop
  // 2. An evaluation exists and the current logged-in user is NOT the mentor who created it
  // 3. Current user is an Admin viewing an already evaluated record
  const isAuthoringMentor =
    Boolean(existingEvaluation?.mentor_id && authUser?.id && existingEvaluation.mentor_id === authUser.id);
  const readOnly =
    isReadOnly ||
    (existingEvaluation && !isAuthoringMentor) ||
    (isAdmin && Boolean(existingEvaluation));

  useEffect(() => {
    if (existingEvaluation) {
      setFormData({
        overall_rating: existingEvaluation.overall_rating ?? 8.5,
        technical_skills_rating: existingEvaluation.technical_skills_rating ?? 4.5,
        soft_skills_rating: existingEvaluation.soft_skills_rating ?? 4.5,
        strengths: existingEvaluation.strengths || "",
        areas_for_improvement: existingEvaluation.areas_for_improvement || "",
        recommendation: existingEvaluation.recommendation || "hire",
        final_comments: existingEvaluation.final_comments || "",
      });
    } else {
      setFormData({
        overall_rating: 8.5,
        technical_skills_rating: 4.5,
        soft_skills_rating: 4.5,
        strengths: "",
        areas_for_improvement: "",
        recommendation: "hire",
        final_comments: "",
      });
    }
    setError(null);
  }, [existingEvaluation, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internship || readOnly) return;

    try {
      setLoading(true);
      setError(null);
      if (existingEvaluation && existingEvaluation.id) {
        await evaluationService.updateEvaluation(existingEvaluation.id, formData);
      } else {
        await evaluationService.submitEvaluation(internship.id, formData);
      }
      onEvaluationSaved?.();
      onClose();
    } catch (err) {
      console.error("Failed to save evaluation:", err);
      setError(err.message || "Failed to submit final evaluation.");
    } finally {
      setLoading(false);
    }
  };

  if (!internship) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="End-of-Internship Evaluation"
      subtitle={`Intern: ${internship.intern?.profile?.full_name || internship.intern?.email || "Unknown"}`}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {readOnly && (
          <div className="flex items-center gap-2 p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
            <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span>Read-Only View: Official appraisal submitted by evaluating mentor.</span>
          </div>
        )}

        {/* Rating Dimension Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Overall Score (1 - 10)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="10"
              required
              disabled={readOnly}
              value={formData.overall_rating}
              onChange={(e) =>
                setFormData({ ...formData, overall_rating: parseFloat(e.target.value) || 0 })
              }
              className={`w-full px-3 py-2 text-xs border rounded-xl font-bold ${
                readOnly
                  ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Technical Rating (1 - 5)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              required
              disabled={readOnly}
              value={formData.technical_skills_rating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  technical_skills_rating: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 text-xs border rounded-xl font-bold ${
                readOnly
                  ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Soft Skills (1 - 5)
            </label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              required
              disabled={readOnly}
              value={formData.soft_skills_rating}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  soft_skills_rating: parseFloat(e.target.value) || 0,
                })
              }
              className={`w-full px-3 py-2 text-xs border rounded-xl font-bold ${
                readOnly
                  ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
            />
          </div>
        </div>

        {/* Recommendation Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Final Hiring Recommendation <span className="text-rose-500">*</span>
          </label>
          <select
            value={formData.recommendation}
            disabled={readOnly}
            onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
            className={`w-full px-3 py-2 text-xs border rounded-xl font-semibold ${
              readOnly
                ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                : "bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            }`}
          >
            <option value="hire">Hire as Associate Software Engineer</option>
            <option value="extend">Extend Internship for Further Assessment</option>
            <option value="do_not_hire">Do Not Extend Offer</option>
            <option value="undecided">Undecided / Further Review Required</option>
          </select>
        </div>

        {/* Strengths */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Key Strengths</label>
          <textarea
            rows={2}
            value={formData.strengths}
            disabled={readOnly}
            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
            placeholder="e.g. Fast learner in backend APIs, excellent problem-solving ability, proactive communicator..."
            className={`w-full px-3 py-2 text-xs border rounded-xl ${
              readOnly
                ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                : "bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            }`}
          />
        </div>

        {/* Areas for Improvement */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Areas for Growth & Improvement
          </label>
          <textarea
            rows={2}
            value={formData.areas_for_improvement}
            disabled={readOnly}
            onChange={(e) =>
              setFormData({ ...formData, areas_for_improvement: e.target.value })
            }
            placeholder="e.g. Needs deeper familiarity with automated testing frameworks and CI/CD pipelines..."
            className={`w-full px-3 py-2 text-xs border rounded-xl ${
              readOnly
                ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                : "bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            }`}
          />
        </div>

        {/* Final Comments */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Comprehensive Mentor Summary
          </label>
          <textarea
            rows={3}
            value={formData.final_comments}
            disabled={readOnly}
            onChange={(e) => setFormData({ ...formData, final_comments: e.target.value })}
            placeholder="Overall evaluation narrative for HR and department leadership..."
            className={`w-full px-3 py-2 text-xs border rounded-xl ${
              readOnly
                ? "bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed"
                : "bg-slate-50 border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            }`}
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            {readOnly ? "Close" : "Cancel"}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-colors flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>{loading ? "Submitting..." : existingEvaluation ? "Update Evaluation" : "Finalize Evaluation"}</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
