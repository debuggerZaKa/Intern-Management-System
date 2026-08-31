import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  CheckSquare,
  AlertCircle,
  Award,
  Sparkles,
  Plus,
  Star,
  MessageSquare,
  Clock,
  ChevronRight,
  ShieldCheck,
  Brain
} from "lucide-react";
import { mentorService } from "../../services/mentorService";
import { feedbackService } from "../../services/feedbackService";
import { evaluationService } from "../../services/evaluationService";
import { aiService } from "../../services/aiService";
import { blockerService } from "../../services/blockerService";
import StatusBadge from "../common/StatusBadge";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import FeedbackModal from "./FeedbackModal";
import EvaluationModal from "./EvaluationModal";

export default function InternDetailView({ internId, onBack }) {
  const [internship, setInternship] = useState(null);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState("reports"); // reports, tasks, blockers, evaluation
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [feedbackModalReport, setFeedbackModalReport] = useState(null);
  const [feedbackModalExisting, setFeedbackModalExisting] = useState(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [aiSummaryLoadingReportId, setAiSummaryLoadingReportId] = useState(null);
  const [aiSummaries, setAiSummaries] = useState({}); // { [reportId]: summaryObj }

  const loadInternData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [internshipData, reportsData, tasksData, blockersData] = await Promise.all([
        mentorService.getAssignedInternDetails(internId),
        mentorService.getAssignedInternReports(internId),
        mentorService.getAssignedInternTasks(internId),
        mentorService.getAssignedInternBlockers(internId),
      ]);

      setInternship(internshipData);
      setReports(reportsData || []);
      setTasks(tasksData || []);
      setBlockers(blockersData || []);

      // Load evaluation if internship exists
      if (internshipData?.id) {
        try {
          const evalData = await evaluationService.getInternshipEvaluation(internshipData.id);
          setEvaluation(evalData);
        } catch (e) {
          // No evaluation yet, perfectly normal
          setEvaluation(null);
        }
      }
    } catch (err) {
      console.error("Failed to load intern details:", err);
      setError(err.message || "Failed to load intern details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (internId) {
      loadInternData();
    }
  }, [internId]);

  const handleOpenFeedback = async (report) => {
    setFeedbackModalReport(report);
    try {
      const fb = await feedbackService.getReportFeedback(report.id);
      setFeedbackModalExisting(fb);
    } catch (e) {
      setFeedbackModalExisting(null);
    }
  };

  const handleSummarizeReportWithAI = async (reportId) => {
    try {
      setAiSummaryLoadingReportId(reportId);
      const summaryRes = await aiService.summarizeReport(reportId);
      setAiSummaries((prev) => ({ ...prev, [reportId]: summaryRes }));
    } catch (err) {
      console.error("AI summarization failed:", err);
      alert(`AI Summarization error: ${err.message}`);
    } finally {
      setAiSummaryLoadingReportId(null);
    }
  };

  const handleResolveBlocker = async (blockerId) => {
    try {
      await blockerService.updateBlocker(blockerId, { status: "resolved" });
      loadInternData();
    } catch (err) {
      alert(`Failed to resolve blocker: ${err.message}`);
    }
  };

  if (loading) {
    return <Loader message="Loading intern records & submissions..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interns List
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const intern = internship?.intern;
  const currentWeek = internship?.current_week || 1;
  const duration = internship?.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));

  return (
    <div className="space-y-6">
      {/* Top Back & Header Card */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assigned Interns
        </button>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {intern?.profile?.full_name?.slice(0, 2) || "IN"}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {intern?.profile?.full_name || intern?.email}
                </h2>
                <StatusBadge status={internship?.status || "active"} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {intern?.profile?.university} &bull; {intern?.profile?.degree} ({intern?.profile?.semester})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {intern?.email} &bull; {intern?.profile?.phone || "No phone listed"} &bull; Track: {internship?.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* 6-Week Evaluation Action */}
            <button
              onClick={() => setEvaluationModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{evaluation ? "Edit 6-Week Evaluation" : "Finalize 6-Week Evaluation"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab("reports")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Weekly Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tasks Master ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("blockers")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "blockers"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Blockers & Issues ({blockers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("evaluation")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === "evaluation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Final Evaluation {evaluation && "✓"}</span>
        </button>
      </div>

      {/* Tab 1: Weekly Reports & Feedback */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState
              title="No weekly reports submitted yet"
              description="The intern has not submitted any weekly progress reports yet."
            />
          ) : (
            <div className="space-y-4">
              {reports.map((report) => {
                const aiSummary = aiSummaries[report.id];
                return (
                  <div
                    key={report.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200">
                          Week {report.week_number}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">
                          {report.summary || `Weekly Progress Report (Week ${report.week_number})`}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* AI Summarize Action */}
                        <button
                          onClick={() => handleSummarizeReportWithAI(report.id)}
                          disabled={aiSummaryLoadingReportId === report.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 rounded-xl text-xs font-bold transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                          <span>
                            {aiSummaryLoadingReportId === report.id ? "Analyzing..." : "AI Summary"}
                          </span>
                        </button>

                        {/* Give / Edit Feedback */}
                        <button
                          onClick={() => handleOpenFeedback(report)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Mentor Feedback</span>
                        </button>
                      </div>
                    </div>

                    {/* AI Generated Inline Summary if present */}
                    {aiSummary && (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs space-y-2 shadow-sm animate-fadeIn">
                        <div className="flex items-center gap-2 font-bold text-blue-300">
                          <Brain className="w-4 h-4 text-blue-400" />
                          <span>AI Executive Weekly Summary</span>
                          {aiSummary.progress_status && (
                            <span className="text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-bold uppercase ml-auto">
                              {aiSummary.progress_status}
                            </span>
                          )}
                        </div>
                        <p className="text-blue-100/90 leading-relaxed whitespace-pre-wrap">
                          {aiSummary.summary_text || aiSummary.summary || "Summary generated successfully."}
                        </p>
                      </div>
                    )}

                    {/* Report Sections Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                          Achievements & Milestones
                        </p>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {report.achievements || "None documented"}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                          Challenges & Roadblocks
                        </p>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {report.challenges || "None reported"}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">
                          Goals for Next Week
                        </p>
                        <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                          {report.next_week_goals || "None specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2">
                      <span>Logged Hours: <strong className="text-slate-700">{report.hours_logged || 0} hrs</strong></span>
                      <span>Submitted: {report.created_at ? new Date(report.created_at).toLocaleDateString() : "—"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Tasks Master */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks assigned"
              description="This intern has not created or been assigned any task items yet."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* To Do Column */}
              <div className="bg-slate-100/70 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-700 uppercase">To Do</span>
                  <span className="text-xs bg-slate-200 font-bold px-2 py-0.5 rounded-full text-slate-700">
                    {tasks.filter((t) => t.status === "todo").length}
                  </span>
                </div>
                {tasks
                  .filter((t) => t.status === "todo")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs space-y-2 text-xs"
                    >
                      <p className="font-bold text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Week {task.week_number || "—"}</span>
                        <span>{task.estimated_hours || 0}h est</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* In Progress Column */}
              <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3 border border-blue-100/60">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-blue-900 uppercase">In Progress</span>
                  <span className="text-xs bg-blue-200 font-bold px-2 py-0.5 rounded-full text-blue-800">
                    {tasks.filter((t) => t.status === "in_progress").length}
                  </span>
                </div>
                {tasks
                  .filter((t) => t.status === "in_progress")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-blue-200/80 shadow-xs space-y-2 text-xs"
                    >
                      <p className="font-bold text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-slate-500 text-[11px] line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Week {task.week_number || "—"}</span>
                        <span>{task.actual_hours || 0}h logged</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Done Column */}
              <div className="bg-emerald-50/50 p-4 rounded-2xl space-y-3 border border-emerald-100/60">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-emerald-900 uppercase">Done</span>
                  <span className="text-xs bg-emerald-200 font-bold px-2 py-0.5 rounded-full text-emerald-800">
                    {tasks.filter((t) => t.status === "done").length}
                  </span>
                </div>
                {tasks
                  .filter((t) => t.status === "done")
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-xs space-y-2 text-xs"
                    >
                      <p className="font-bold text-slate-900 line-through decoration-emerald-500 text-slate-700">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-slate-400 text-[11px] line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-emerald-600 font-semibold pt-1">
                        <span>Completed</span>
                        <span>{task.actual_hours || 0}h total</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Blockers Hub */}
      {activeTab === "blockers" && (
        <div className="space-y-4">
          {blockers.length === 0 ? (
            <EmptyState
              title="No blockers recorded"
              description="The intern has not encountered any major technical impediments."
            />
          ) : (
            <div className="space-y-3">
              {blockers.map((blocker) => (
                <div
                  key={blocker.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={blocker.severity} size="xs" />
                      <StatusBadge status={blocker.status} size="xs" />
                      <h4 className="font-bold text-xs text-slate-900">{blocker.title}</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {blocker.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span>Reported: {blocker.created_at ? new Date(blocker.created_at).toLocaleDateString() : "—"}</span>
                      {blocker.resolution_notes && (
                        <span className="text-emerald-700 font-medium">
                          Resolution: {blocker.resolution_notes}
                        </span>
                      )}
                    </div>
                  </div>

                  {blocker.status !== "resolved" && (
                    <button
                      onClick={() => handleResolveBlocker(blocker.id)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex-shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Final Evaluation */}
      {activeTab === "evaluation" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
          {evaluation ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <span>6-Week Final Performance Appraisal</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submitted on {new Date(evaluation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setEvaluationModalOpen(true)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors"
                >
                  Edit Evaluation
                </button>
              </div>

              {/* Scores Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                  <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                    Overall Score
                  </p>
                  <p className="text-3xl font-black text-indigo-950 mt-1">
                    {evaluation.overall_rating} <span className="text-sm font-semibold text-indigo-600">/ 10</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    Technical Skills
                  </p>
                  <p className="text-3xl font-black text-blue-950 mt-1">
                    {evaluation.technical_skills_rating} <span className="text-sm font-semibold text-blue-600">/ 5</span>
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                  <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                    Soft Skills
                  </p>
                  <p className="text-3xl font-black text-purple-950 mt-1">
                    {evaluation.soft_skills_rating} <span className="text-sm font-semibold text-purple-600">/ 5</span>
                  </p>
                </div>
              </div>

              {/* Recommendation Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">Hiring Recommendation:</span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold uppercase rounded-full">
                  {evaluation.recommendation}
                </span>
              </div>

              {/* Text Narrative */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Identified Strengths</p>
                  <p className="text-slate-600 leading-relaxed">{evaluation.strengths || "—"}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Areas for Improvement</p>
                  <p className="text-slate-600 leading-relaxed">{evaluation.areas_for_improvement || "—"}</p>
                </div>
              </div>

              {evaluation.final_comments && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <p className="font-bold text-slate-700 uppercase text-[10px]">Overall Mentor Narrative</p>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {evaluation.final_comments}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Award}
              title="Final evaluation not yet submitted"
              description="Complete the 6-week end-of-internship evaluation for this intern."
              actionLabel="Start 6-Week Evaluation"
              onAction={() => setEvaluationModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={!!feedbackModalReport}
        onClose={() => setFeedbackModalReport(null)}
        report={feedbackModalReport}
        existingFeedback={feedbackModalExisting}
        onFeedbackSaved={loadInternData}
      />

      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={evaluationModalOpen}
        onClose={() => setEvaluationModalOpen(false)}
        internship={internship}
        existingEvaluation={evaluation}
        onEvaluationSaved={loadInternData}
      />
    </div>
  );
}
