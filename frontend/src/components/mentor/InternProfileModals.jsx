import React from "react";
import {
  FileText,
  Sparkles,
  MessageSquare,
  Brain,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  X,
} from "lucide-react";
import Modal from "../common/Modal";
import StatusBadge from "../common/StatusBadge";

export function ReportsModal({
  isOpen,
  onClose,
  reports = [],
  aiSummaries = {},
  aiSummaryLoadingReportId,
  onSummarizeReport,
  onOpenFeedback,
  isAdmin = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Weekly Progress Reports (${reports.length})`}
      subtitle="Review milestone submissions, AI executive summaries, and mentor feedback"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">No weekly reports submitted yet</p>
            <p className="text-xs text-slate-400 mt-0.5">The intern has not submitted any weekly progress reports yet.</p>
          </div>
        ) : (
          reports.map((report) => {
            const aiSummary = aiSummaries[report.id];
            return (
              <div
                key={report.id}
                className="bg-white rounded-3xl p-5 border-[1.5px] border-slate-200/90 shadow-sm space-y-4 hover:border-blue-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="px-3.5 py-1 bg-blue-50 text-blue-700 font-black text-xs rounded-xl border border-blue-200/80">
                      Week {report.week_number}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      Weekly Progress Report (Week {report.week_number})
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSummarizeReport(report.id)}
                      disabled={aiSummaryLoadingReportId === report.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 rounded-2xl text-xs font-bold transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      <span>{aiSummaryLoadingReportId === report.id ? "Analyzing..." : "AI Summary"}</span>
                    </button>

                    {!isAdmin && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenFeedback(report);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Mentor Feedback</span>
                      </button>
                    )}
                  </div>
                </div>

                {aiSummary && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white text-xs space-y-2 border border-indigo-800/40 shadow-sm">
                    <div className="flex items-center gap-2 font-bold text-blue-300">
                      <Brain className="w-4 h-4 text-blue-400" />
                      <span>AI Executive Weekly Summary</span>
                      {aiSummary.risk_level && (
                        <span className="ml-auto px-2.5 py-0.5 rounded-full bg-blue-500/30 text-[10px] uppercase font-bold">
                          Risk: {aiSummary.risk_level}
                        </span>
                      )}
                    </div>
                    <p className="text-blue-100/90 leading-relaxed">{aiSummary.summary_text}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <span className="font-extrabold text-slate-800">Tasks Completed:</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {report.tasks_completed_summary || "None reported."}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                    <span className="font-extrabold text-slate-800">Learnings & Skills:</span>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {report.learnings_and_skills || "None reported."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

export function FeedbackLogModal({
  isOpen,
  onClose,
  reports = [],
  onOpenFeedback,
  isAdmin = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chronological Feedback Log"
      subtitle="History of mentor evaluations, reviews, and qualitative feedback"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
        {reports.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-2xl border border-slate-200">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">No feedback logged yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Feedback given by mentors across weekly sprints will appear here.</p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span className="font-extrabold text-sm text-slate-900">
                  Week {report.week_number} Feedback
                </span>
                {!isAdmin ? (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFeedback(report);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-black text-xs inline-flex items-center gap-1"
                  >
                    <span>Edit Feedback</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-slate-400 text-[11px] font-bold">Recorded</span>
                )}
              </div>
              <p className="text-slate-600 font-medium">
                Deliverable progress for Week {report.week_number} recorded. Click "Edit Feedback" to review or update rubric scores.
              </p>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export function AIInsightsModal({
  isOpen,
  onClose,
  taskRate = 0,
  reportsCount = 0,
  evaluation = null,
  tasks = [],
  blockers = [],
}) {
  const activeBlockers = blockers.filter((b) => b.status !== "resolved").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Performance Insights & Trajectory"
      subtitle="Automated machine learning synthesis of intern deliverables and pace"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        <div className="p-5 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-purple-800/40 shadow-lg space-y-3">
          <div className="flex items-center gap-2 font-black text-purple-300 text-sm">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span>Automated 6-Week Trajectory Prediction</span>
          </div>
          <p className="text-purple-100/90 leading-relaxed font-medium">
            Based on the intern's task completion pace (<strong>{taskRate}%</strong>) and report submission frequency (<strong>{reportsCount} reports</strong>), the intern's overall trajectory is projected as{" "}
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-black uppercase text-[11px] border border-purple-400/30">
              {evaluation ? evaluation.recommendation : "On Track"}
            </span>.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Velocity Score</span>
            <p className="text-base font-black text-slate-900">{taskRate}% Completion</p>
            <p className="text-[11px] text-slate-500 font-semibold">{tasks.length} total assigned deliverables</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Roadblock Risk</span>
            <p className="text-base font-black text-slate-900">{activeBlockers} Active Blockers</p>
            <p className="text-[11px] text-slate-500 font-semibold">{activeBlockers === 0 ? "Zero blocking impediments" : "Attention needed"}</p>
          </div>
        </div>

        {evaluation?.ai_summary && (
          <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1.5">
            <span className="font-black text-blue-900 text-xs flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>AI Comprehensive Assessment</span>
            </span>
            <p className="text-blue-950 font-medium leading-relaxed">{evaluation.ai_summary}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
