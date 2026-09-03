import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Sparkles,
  MessageSquare,
  Star,
  Brain,
  Edit2,
  Users
} from "lucide-react";

import { reportService } from "../services/reportService";
import { mentorService } from "../services/mentorService";
import { feedbackService } from "../services/feedbackService";
import { aiService } from "../services/aiService";
import { useAuth } from "../hooks/useAuth";

import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import ReportSubmissionModal from "../components/intern/ReportSubmissionModal";
import FeedbackModal from "../components/mentor/FeedbackModal";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";

export default function ReportsPage() {
  const { isIntern, isMentor, isAdmin } = useAuth();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mentor assigned interns
  const [assignedInterns, setAssignedInterns] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState("");

  // Modals
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [feedbackModalReport, setFeedbackModalReport] = useState(null);
  const [feedbackModalExisting, setFeedbackModalExisting] = useState(null);

  // AI Summaries
  const [aiSummaries, setAiSummaries] = useState({});
  const [aiLoadingId, setAiLoadingId] = useState(null);

  /*
   * ---------------------------------------------------------
   * LOAD NORMAL REPORTS
   * Used by Intern and Admin
   * ---------------------------------------------------------
   */
  const loadReports = async (internId = selectedInternId) => {
    try {
      setLoading(true);
      setError(null);

      // Mentor -> only selected intern's reports
      if (isMentor) {
        if (!internId) {
          setReports([]);
          return;
        }

        const data = await mentorService.getAssignedInternReports(internId);
        setReports(data || []);
        return;
      }

      // Intern/Admin -> existing behavior
      const data = await reportService.getReports();
      setReports(data || []);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(err.message || "Failed to load weekly reports.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * LOAD MENTOR'S ASSIGNED INTERNS
   * ---------------------------------------------------------
   */
  const loadAssignedInterns = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await mentorService.getAssignedInterns({
        status_filter: "active",
      });

      setAssignedInterns(data || []);
    } catch (err) {
      console.error("Failed to load assigned interns:", err);
      setError(err.message || "Failed to load assigned interns.");
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (isMentor) {
      loadAssignedInterns();
      setReports([]);
    } else {
      loadReports();
    }
  }, [isMentor]);

  /*
   * ---------------------------------------------------------
   * MENTOR SELECTS AN INTERN
   * ---------------------------------------------------------
   */
  const handleInternSelect = async (e) => {
    const internId = e.target.value;

    setSelectedInternId(internId);
    setReports([]);
    setAiSummaries({});

    if (!internId) {
      return;
    }

    await loadReports(internId);
  };

  /*
   * ---------------------------------------------------------
   * GET INTERN DISPLAY NAME
   *
   * Different backend response shapes are supported here.
   * If name is not included by InternshipResponse,
   * intern ID will be used as fallback.
   * ---------------------------------------------------------
   */
  const getInternDisplayName = (internship) => {
    return (
      internship?.intern?.profile?.full_name ||
      internship?.intern?.full_name ||
      internship?.intern_name ||
      internship?.full_name ||
      internship?.intern?.email ||
      `Intern #${internship?.intern_id}`
    );
  };

  /*
   * ---------------------------------------------------------
   * FEEDBACK
   * ---------------------------------------------------------
   */
  const handleOpenFeedback = async (report) => {
    setFeedbackModalReport(report);

    try {
      const fb = await feedbackService.getReportFeedback(report.id);
      setFeedbackModalExisting(fb);
    } catch (e) {
      setFeedbackModalExisting(null);
    }
  };

  /*
   * ---------------------------------------------------------
   * AI SUMMARY
   * ---------------------------------------------------------
   */
  const handleSummarizeReport = async (reportId) => {
    try {
      setAiLoadingId(reportId);

      const res = await aiService.summarizeReport(reportId);

      setAiSummaries((prev) => ({
        ...prev,
        [reportId]: res,
      }));
    } catch (err) {
      alert(`AI Summarization error: ${err.message}`);
    } finally {
      setAiLoadingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* =====================================================
            INTERN ACTION
        ====================================================== */}
        {isIntern && (
          <div className="flex items-center justify-end">
            <button
              onClick={() => {
                setEditingReport(null);
                setSubmitModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Weekly Report</span>
            </button>
          </div>
        )}

        {/* =====================================================
            MENTOR - SELECT INTERN
        ====================================================== */}
        {isMentor && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Weekly Reports
                </h3>

                <p className="text-xs text-slate-500">
                  Select an assigned intern to view their weekly reports.
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Intern
              </label>

              <select
                value={selectedInternId}
                onChange={handleInternSelect}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">
                  Select an intern...
                </option>

                {assignedInterns.map((internship) => (
                  <option
                    key={internship.id}
                    value={internship.intern_id}
                  >
                    {getInternDisplayName(internship)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* =====================================================
            ERROR
        ====================================================== */}
        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* =====================================================
            MENTOR - NO INTERN SELECTED
        ====================================================== */}
        {isMentor && !selectedInternId && !loading && (
          <EmptyState
            icon={Users}
            title="Select an intern"
            description="Choose one of your assigned interns above to view their weekly reports."
          />
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}
        {loading ? (
          <Loader message="Loading weekly reports..." />
        ) : (
          <>
            {/* =================================================
                NO REPORTS
            ================================================== */}
            {selectedInternId || !isMentor ? (
              reports.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No weekly reports submitted yet"
                  description={
                    isIntern
                      ? "Submit your first weekly report to track your engineering journey."
                      : "This intern has not submitted any weekly reports yet."
                  }
                  actionLabel={
                    isIntern ? "Submit First Report" : null
                  }
                  onAction={
                    isIntern
                      ? () => setSubmitModalOpen(true)
                      : null
                  }
                />
              ) : (
                /* =============================================
                   REPORT LIST
                ============================================== */
                <div className="space-y-4">

                  {reports.map((report) => {
                    const aiSummary = aiSummaries[report.id];

                    return (
                      <div
                        key={report.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                      >

                        {/* =====================================
                            REPORT HEADER
                        ====================================== */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">

                          <div className="flex items-center gap-3">

                            <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200">
                              Week {report.week_number}
                            </span>

                            <h4 className="text-sm font-bold text-slate-900">
                              Weekly Engineering Report (Week{" "}
                              {report.week_number})
                            </h4>

                            <StatusBadge
                              status={report.status}
                              size="xs"
                            />
                          </div>

                          <div className="flex items-center gap-2">

                            {/* AI Summary */}
                            {(isMentor || isAdmin) && (
                              <button
                                onClick={() =>
                                  handleSummarizeReport(report.id)
                                }
                                disabled={
                                  aiLoadingId === report.id
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 rounded-xl text-xs font-bold transition-colors"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />

                                <span>
                                  {aiLoadingId === report.id
                                    ? "Analyzing..."
                                    : "AI Summary"}
                                </span>
                              </button>
                            )}

                            {/* Mentor Feedback */}
                            {(isMentor || isAdmin) && (
                              <button
                                onClick={() =>
                                  handleOpenFeedback(report)
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Mentor Feedback</span>
                              </button>
                            )}

                            {/* Intern Edit Draft */}
                            {isIntern &&
                              report.status === "draft" && (
                                <button
                                  onClick={() => {
                                    setEditingReport(report);
                                    setSubmitModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                  <span>Edit Draft</span>
                                </button>
                              )}
                          </div>
                        </div>

                        {/* =====================================
                            AI SUMMARY
                        ====================================== */}
                        {aiSummary && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs space-y-2 shadow-sm animate-fadeIn">

                            <div className="flex items-center gap-2 font-bold text-blue-300">

                              <Brain className="w-4 h-4 text-blue-400" />

                              <span>
                                AI Executive Weekly Summary
                              </span>

                              {aiSummary.progress_status && (
                                <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold uppercase ml-auto">
                                  {aiSummary.progress_status}
                                </span>
                              )}
                            </div>

                            <p className="text-blue-100/90 leading-relaxed whitespace-pre-wrap">
                              {aiSummary.summary_text ||
                                aiSummary.summary ||
                                "Summary generated successfully."}
                            </p>
                          </div>
                        )}

                        {/* =====================================
                            REPORT SECTIONS
                        ====================================== */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Tasks Completed
                            </p>

                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {report.tasks_completed_summary ||
                                "None documented"}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Tasks In Progress
                            </p>

                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {report.tasks_in_progress_summary ||
                                "None documented"}
                            </p>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Goals Next Week
                            </p>

                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                              {report.goals_next_week ||
                                "None specified"}
                            </p>
                          </div>

                        </div>

                        {/* =====================================
                            LEARNINGS
                        ====================================== */}
                        {report.learnings_and_skills && (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">

                            <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                              Learnings & Skills Acquired
                            </p>

                            <p className="text-slate-600 leading-relaxed">
                              {report.learnings_and_skills}
                            </p>
                          </div>
                        )}

                        {/* =====================================
                            FEEDBACK
                        ====================================== */}
                        {report.feedback && (
                          <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-2">

                            <div className="flex items-center justify-between">

                              <span className="font-bold text-indigo-900 flex items-center gap-1.5">

                                <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />

                                Mentor Feedback & Rating
                              </span>

                              <div className="flex items-center gap-1">

                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <=
                                      (report.feedback?.rating || 5)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    }`}
                                  />
                                ))}

                                <span className="text-xs font-bold text-slate-700 ml-1">
                                  {report.feedback.rating}/5
                                </span>

                              </div>
                            </div>

                            <p className="text-indigo-950/80 leading-relaxed">
                              {report.feedback.comments}
                            </p>

                          </div>
                        )}

                        {/* =====================================
                            FOOTER
                        ====================================== */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">

                          <span className="font-semibold text-slate-500">
                            Milestone: Week {report.week_number} of 6
                          </span>

                          <span>
                            Submitted:{" "}
                            {new Date(
                              report.created_at
                            ).toLocaleDateString()}
                          </span>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )
            ) : null}
          </>
        )}

        {/* =====================================================
            REPORT SUBMISSION MODAL
        ====================================================== */}
        <ReportSubmissionModal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          existingReport={editingReport}
          onReportSaved={loadReports}
        />

        {/* =====================================================
            FEEDBACK MODAL
        ====================================================== */}
        <FeedbackModal
          isOpen={!!feedbackModalReport}
          onClose={() => setFeedbackModalReport(null)}
          report={feedbackModalReport}
          existingFeedback={feedbackModalExisting}
          onFeedbackSaved={() => loadReports(selectedInternId)}
        />

      </div>
    </AppLayout>
  );
}

