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
  Brain,
  Github,
  Printer,
  ExternalLink,
  Code2,
  FolderGit2,
  PlayCircle,
  CheckCircle2
} from "lucide-react";
import { mentorService } from "../../services/mentorService";
import { feedbackService } from "../../services/feedbackService";
import { evaluationService } from "../../services/evaluationService";
import { projectService } from "../../services/projectService";
import { taskService } from "../../services/taskService";
import { aiService } from "../../services/aiService";
import { blockerService } from "../../services/blockerService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
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
  const [projects, setProjects] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, projects, tasks, reports, feedback_history, ai_insights
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [feedbackModalReport, setFeedbackModalReport] = useState(null);
  const [feedbackModalExisting, setFeedbackModalExisting] = useState(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    technologies: "React, FastAPI, PostgreSQL",
    repo_url: "",
    status: "not_started",
  });
  const [projectSaving, setProjectSaving] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    week_number: 1,
    priority: "medium",
    estimated_hours: 4,
    project_id: "",
  });
  const [taskSaving, setTaskSaving] = useState(false);

  const [aiSummaryLoadingReportId, setAiSummaryLoadingReportId] = useState(null);
  const [aiSummaries, setAiSummaries] = useState({}); // { [reportId]: summaryObj }

  const loadInternData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [internshipData, reportsData, tasksData, blockersData, projectsData] = await Promise.all([
        mentorService.getAssignedInternDetails(internId),
        mentorService.getAssignedInternReports(internId),
        mentorService.getAssignedInternTasks(internId),
        mentorService.getAssignedInternBlockers(internId),
        projectService.getProjects(),
      ]);

      setInternship(internshipData);
      setReports(reportsData || []);
      setTasks(tasksData || []);
      setBlockers(blockersData || []);
      
      const filteredProjects = (projectsData || []).filter(
        (p) => p.internship_id === internshipData?.id
      );
      setProjects(filteredProjects);

      if (internshipData?.id) {
        try {
          const evalData = await evaluationService.getInternshipEvaluation(internshipData.id);
          setEvaluation(evalData);
        } catch (e) {
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectFormData.title.trim()) {
      alert("Project title is required.");
      return;
    }
    if (!internship?.id) {
      alert("Internship track ID not found.");
      return;
    }

    try {
      setProjectSaving(true);
      await projectService.createProject({
        ...projectFormData,
        internship_id: internship.id,
      });
      setProjectModalOpen(false);
      setProjectFormData({
        title: "",
        description: "",
        technologies: "React, FastAPI, PostgreSQL",
        repo_url: "",
        status: "not_started",
      });
      loadInternData();
    } catch (err) {
      console.error("Project creation failed:", err);
      alert(err.message || "Failed to assign project.");
    } finally {
      setProjectSaving(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) {
      alert("Task title is required.");
      return;
    }
    if (!taskFormData.project_id) {
      alert("Please select the project this task belongs to.");
      return;
    }

    try {
      setTaskSaving(true);
      await taskService.createTask({
        project_id: parseInt(taskFormData.project_id),
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        week_number: parseInt(taskFormData.week_number) || 1,
        estimated_hours: parseFloat(taskFormData.estimated_hours) || 0,
        status: "todo",
      });
      setTaskModalOpen(false);
      setTaskFormData({
        title: "",
        description: "",
        week_number: 1,
        priority: "medium",
        estimated_hours: 4,
        project_id: projects[0]?.id || "",
      });
      loadInternData();
    } catch (err) {
      console.error("Task creation failed:", err);
      alert(err.message || "Failed to assign task.");
    } finally {
      setTaskSaving(false);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
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
          Back to Assigned Interns
        </button>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const intern = internship?.intern;
  const currentWeek = internship?.current_week || 1;
  const duration = internship?.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Skills tag list from reports
  const allSkills = new Set();
  reports.forEach((r) => {
    if (r.learnings_and_skills) {
      r.learnings_and_skills.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean) allSkills.add(clean);
      });
    }
  });

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
                {intern?.profile?.university || "University"} &bull; {intern?.profile?.degree || "Degree"} ({intern?.profile?.semester || "Semester"})
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {intern?.email} &bull; {intern?.profile?.phone || "No phone listed"} &bull; Track: {internship?.department}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Export / Print Evaluation */}
            <button
              onClick={() => setPrintModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF Report</span>
            </button>

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

      {/* Navigation 6 Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 gap-2 bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <button
          onClick={() => setActiveTab("overview")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "overview"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Tab 1: Overview</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "projects"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Tab 2: Projects ({projects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("tasks")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "tasks"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Tab 3: Tasks ({tasks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("reports")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "reports"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tab 4: Weekly Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("feedback_history")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "feedback_history"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tab 5: Feedback Log</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_insights")}
          className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === "ai_insights"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Tab 6: AI Insights</span>
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">Milestone Progress</p>
              <p className="text-2xl font-black text-slate-900">Week {currentWeek} of {duration}</p>
              <p className="text-[11px] text-blue-600 font-semibold">{progressPercent}% elapsed</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">Tasks Completed</p>
              <p className="text-2xl font-black text-slate-900">{completedTasks} / {tasks.length}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">{taskRate}% completion rate</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">Reports Submitted</p>
              <p className="text-2xl font-black text-slate-900">{reports.length} / 6</p>
              <p className="text-[11px] text-indigo-600 font-semibold">Weekly milestone reports</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">Active Blockers</p>
              <p className="text-2xl font-black text-slate-900">
                {blockers.filter((b) => b.status !== "resolved").length}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold">Roadblocks needing unblocking</p>
            </div>
          </div>

          {/* Skills Tag Cloud */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-900">Demonstrated Engineering Competencies</h4>
            <div className="flex flex-wrap gap-2 pt-2">
              {allSkills.size === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills tagged in submitted weekly reports yet.</p>
              ) : (
                Array.from(allSkills).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-200"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Assigned Software Projects</h4>
            <button
              onClick={() => setProjectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Assign Project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects assigned to this intern yet"
              description="Assign an official software engineering project to organize sprints, tasks, and repository deliverables."
              actionLabel="Assign Project"
              onAction={() => setProjectModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Code2 className="w-5 h-5 text-blue-600" />
                      <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
                    </div>
                    <StatusBadge status={proj.status || "not_started"} size="xs" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                  {proj.technologies && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {proj.technologies.split(",").map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-md"
                        >
                          {tech.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.repo_url && (
                    <a
                      href={proj.repo_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold pt-2"
                    >
                      <Github className="w-4 h-4" />
                      <span>View Code Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tasks Master */}
      {activeTab === "tasks" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">Task Deliverables</h4>
            {projects.length > 0 && (
              <button
                onClick={() => {
                  setTaskFormData({
                    title: "",
                    description: "",
                    week_number: currentWeek,
                    priority: "medium",
                    estimated_hours: 4,
                    project_id: projects[0]?.id || "",
                  });
                  setTaskModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Task</span>
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              title="No tasks assigned yet"
              description="Assign engineering task deliverables attached to this intern's projects."
              actionLabel={projects.length > 0 ? "Assign First Task" : null}
              onAction={projects.length > 0 ? () => setTaskModalOpen(true) : null}
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{task.title}</p>
                    <p className="text-slate-400 text-[11px]">
                      Week {task.week_number} &bull; Priority: {task.priority} &bull; {task.estimated_hours || 0}h est
                    </p>
                  </div>
                  <StatusBadge status={task.status} size="xs" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Weekly Reports & Feedback */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <EmptyState
              title="No weekly reports submitted yet"
              description="The intern has not submitted any weekly progress reports yet."
            />
          ) : (
            reports.map((report) => {
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
                        Weekly Progress Report (Week {report.week_number})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSummarizeReportWithAI(report.id)}
                        disabled={aiSummaryLoadingReportId === report.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 rounded-xl text-xs font-bold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        <span>{aiSummaryLoadingReportId === report.id ? "Analyzing..." : "AI Summary"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenFeedback(report)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Mentor Feedback</span>
                      </button>
                    </div>
                  </div>

                  {aiSummary && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white text-xs space-y-2 shadow-sm animate-fadeIn">
                      <div className="flex items-center gap-2 font-bold text-blue-300">
                        <Brain className="w-4 h-4 text-blue-400" />
                        <span>AI Executive Weekly Summary</span>
                        {aiSummary.risk_level && (
                          <span className="ml-auto px-2 py-0.5 rounded-full bg-blue-500/30 text-[10px] uppercase">
                            Risk: {aiSummary.risk_level}
                          </span>
                        )}
                      </div>
                      <p className="text-blue-100/90 leading-relaxed">{aiSummary.summary_text}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                      <span className="font-bold text-slate-700">Tasks Completed:</span>
                      <p className="text-slate-600">{report.tasks_completed_summary || "None reported."}</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                      <span className="font-bold text-slate-700">Learnings & Skills:</span>
                      <p className="text-slate-600">{report.learnings_and_skills || "None reported."}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 5: Feedback History */}
      {activeTab === "feedback_history" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <h4 className="text-sm font-bold text-slate-900">Chronological Mentor Feedback</h4>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reports or feedback given yet.</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>Week {report.week_number} Feedback Log</span>
                    <button
                      onClick={() => handleOpenFeedback(report)}
                      className="text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Update Feedback
                    </button>
                  </div>
                  <p className="text-slate-600">Review feedback status via the Mentor Feedback modal.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: AI Insights */}
      {activeTab === "ai_insights" && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h4 className="text-sm font-bold text-slate-900">AI Trajectory & Risk Assessment</h4>
          </div>
          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 space-y-2">
            <p className="font-bold">Automated 6-Week Trajectory Prediction</p>
            <p className="text-purple-800 leading-relaxed">
              Based on the intern's task completion pace ({taskRate}%) and report frequency ({reports.length} submissions), the intern's overall performance is rated as <strong>{evaluation ? evaluation.recommendation : "On Track"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      {feedbackModalReport && (
        <FeedbackModal
          isOpen={Boolean(feedbackModalReport)}
          onClose={() => setFeedbackModalReport(null)}
          report={feedbackModalReport}
          existingFeedback={feedbackModalExisting}
          onSuccess={loadInternData}
        />
      )}

      {evaluationModalOpen && internship && (
        <EvaluationModal
          isOpen={evaluationModalOpen}
          onClose={() => setEvaluationModalOpen(false)}
          internship={internship}
          existingEvaluation={evaluation}
          onSuccess={loadInternData}
        />
      )}

      {/* Assign Project Modal */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        title={`Assign Project to ${intern?.profile?.full_name || intern?.email}`}
        subtitle="Define project scope, tech stack, and repository template"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={projectFormData.title}
              onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
              placeholder="e.g. NETSOL Cloud Lease Optimization Engine"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Scope & Deliverables
            </label>
            <textarea
              rows={3}
              value={projectFormData.description}
              onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
              placeholder="Key deliverables, sprint architecture, and milestones..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Technologies & Tools
            </label>
            <input
              type="text"
              value={projectFormData.technologies}
              onChange={(e) => setProjectFormData({ ...projectFormData, technologies: e.target.value })}
              placeholder="React, FastAPI, PostgreSQL, Docker"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Repository URL
            </label>
            <input
              type="url"
              value={projectFormData.repo_url}
              onChange={(e) => setProjectFormData({ ...projectFormData, repo_url: e.target.value })}
              placeholder="https://github.com/NETSOL/project-repo"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setProjectModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={projectSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {projectSaving ? "Assigning..." : "Assign Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Task Modal */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={`Assign Task to ${intern?.profile?.full_name || intern?.email}`}
        subtitle="Select a project and specify the deliverables and target milestone week"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Project *
            </label>
            <select
              required
              value={taskFormData.project_id}
              onChange={(e) => setTaskFormData({ ...taskFormData, project_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
            >
              <option value="">Select project...</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              placeholder="e.g. Build JWT auth interceptor and refresh token handler"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              placeholder="Engineering details, testing requirements, and deliverables..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Target Week</label>
              <select
                value={taskFormData.week_number}
                onChange={(e) => setTaskFormData({ ...taskFormData, week_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <option key={w} value={w}>
                    Week {w} Milestone
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setTaskModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={taskSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
            >
              {taskSaving ? "Assigning..." : "Assign Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Evaluation Report Modal */}
      {printModalOpen && internship && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">Corporate Evaluation Report</h3>
                <p className="text-xs text-slate-500">NETSOL Technologies &bull; Intern Performance Record</p>
              </div>
              <button
                onClick={() => setPrintModalOpen(false)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 text-xs print:p-0">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800">Intern Name:</p>
                  <p className="text-slate-600">{intern?.profile?.full_name || intern?.email}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">Department Track:</p>
                  <p className="text-slate-600">{internship.department}</p>
                </div>
              </div>

              {evaluation ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                      <p className="font-bold text-indigo-900">Overall Rating</p>
                      <p className="text-xl font-black text-indigo-950 mt-1">{evaluation.overall_rating}/10</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="font-bold text-blue-900">Technical Rating</p>
                      <p className="text-xl font-black text-blue-950 mt-1">{evaluation.technical_skills_rating}/5</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="font-bold text-purple-900">Soft Skills</p>
                      <p className="text-xl font-black text-purple-950 mt-1">{evaluation.soft_skills_rating}/5</p>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 font-bold text-emerald-900 flex justify-between">
                    <span>Hiring Recommendation:</span>
                    <span className="uppercase">{evaluation.recommendation}</span>
                  </div>

                  {evaluation.final_comments && (
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                      <p className="font-bold text-slate-800">Mentor Assessment:</p>
                      <p className="text-slate-600 italic">"{evaluation.final_comments}"</p>
                    </div>
                  )}

                  {evaluation.ai_summary && (
                    <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                      <p className="font-bold text-blue-900">AI Performance Synthesis:</p>
                      <p className="text-blue-800 leading-relaxed">{evaluation.ai_summary}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-400 italic text-center py-6">
                  Final 6-week evaluation has not yet been recorded.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={handleTriggerPrint}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm shadow-blue-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
