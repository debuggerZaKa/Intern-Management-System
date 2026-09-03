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
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  Building2,
  Search,
  Filter,
  Paperclip,
  Edit2,
  Trash2,
  X,
  Users,
} from "lucide-react";
import { mentorService } from "../../services/mentorService";
import { feedbackService } from "../../services/feedbackService";
import { evaluationService } from "../../services/evaluationService";
import { projectService } from "../../services/projectService";
import { taskService } from "../../services/taskService";
import { aiService } from "../../services/aiService";
import { blockerService } from "../../services/blockerService";
import { calculateWeekFromStartDate, getTodayDateStr, formatTaskDate } from "../../utils/taskDateUtils";
import StatusBadge from "../common/StatusBadge";
import StatCard from "../common/StatCard";
import Modal from "../common/Modal";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import FeedbackModal from "./FeedbackModal";
import EvaluationModal from "./EvaluationModal";
import TaskKanban from "../intern/TaskKanban";

export default function InternDetailView({ internId, onBack }) {
  const [internship, setInternship] = useState(null);
  const [allAssignedInterns, setAllAssignedInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, projects, tasks, reports, feedback_history, ai_insights
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Project Drilldown (Renders full page view)
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);

  // Selected Task Popup Details (for Tasks Tab)
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);

  // Tasks Tab Filter State
  const [taskTabFilter, setTaskTabFilter] = useState("all"); // all, pending, completed
  const [taskWeekFilter, setTaskWeekFilter] = useState("all");
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

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

  // Task Create / Edit Modal State (Supports Multi-Intern selection)
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    due_date: getTodayDateStr(),
    week_number: 1,
    priority: "medium",
    estimated_hours: 4,
    mentor_notes: "",
    project_id: "",
    selected_intern_ids: [],
  });
  const [taskSaving, setTaskSaving] = useState(false);

  const [aiSummaryLoadingReportId, setAiSummaryLoadingReportId] = useState(null);
  const [aiSummaries, setAiSummaries] = useState({}); // { [reportId]: summaryObj }

  const loadInternData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [internshipData, reportsData, tasksData, blockersData, projectsData, assignedInternsData] = await Promise.all([
        mentorService.getAssignedInternDetails(internId),
        mentorService.getAssignedInternReports(internId),
        mentorService.getAssignedInternTasks(internId),
        mentorService.getAssignedInternBlockers(internId),
        projectService.getProjects(),
        mentorService.getAssignedInterns().catch(() => []),
      ]);

      setInternship(internshipData);
      setAllAssignedInterns(assignedInternsData || []);
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

  const handleOpenCreateTask = () => {
    setEditingTask(null);
    const today = getTodayDateStr();
    const internStart = internship?.start_date || (internship?.intern?.created_at ? internship.intern.created_at.slice(0, 10) : today);
    const autoWeek = calculateWeekFromStartDate(internStart, today);

    const currentInternId = intern?.id || internship?.intern_id;

    setTaskFormData({
      title: "",
      description: "",
      due_date: today,
      week_number: autoWeek,
      priority: "medium",
      estimated_hours: 4,
      mentor_notes: "",
      project_id: projects[0]?.id || "",
      selected_intern_ids: currentInternId ? [currentInternId] : [],
    });
    setTaskModalOpen(true);
  };

  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      title: task.title || "",
      description: task.description || "",
      due_date: task.due_date ? String(task.due_date).slice(0, 10) : getTodayDateStr(),
      week_number: task.week_number || 1,
      priority: task.priority || "medium",
      estimated_hours: task.estimated_hours || 4,
      mentor_notes: task.mentor_notes || "",
      project_id: task.project_id || projects[0]?.id || "",
      selected_intern_ids: task.intern_id ? [task.intern_id] : [],
    });
    setTaskModalOpen(true);
  };

  const handleToggleInternSelection = (id) => {
    setTaskFormData((prev) => {
      const current = prev.selected_intern_ids || [];
      if (current.includes(id)) {
        if (current.length === 1) return prev; // At least one intern must be selected
        return { ...prev, selected_intern_ids: current.filter((x) => x !== id) };
      } else {
        return { ...prev, selected_intern_ids: [...current, id] };
      }
    });
  };

  const handleSaveTask = async (e) => {
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
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title: taskFormData.title,
          description: taskFormData.description,
          due_date: taskFormData.due_date || getTodayDateStr(),
          week_number: parseInt(taskFormData.week_number) || 1,
          priority: taskFormData.priority,
          estimated_hours: parseFloat(taskFormData.estimated_hours) || 0,
          mentor_notes: taskFormData.mentor_notes,
          project_id: parseInt(taskFormData.project_id),
        });
      } else {
        await taskService.createTask({
          title: taskFormData.title,
          description: taskFormData.description,
          due_date: taskFormData.due_date || getTodayDateStr(),
          week_number: parseInt(taskFormData.week_number) || 1,
          priority: taskFormData.priority,
          estimated_hours: parseFloat(taskFormData.estimated_hours) || 0,
          mentor_notes: taskFormData.mentor_notes,
          project_id: parseInt(taskFormData.project_id),
          intern_ids: taskFormData.selected_intern_ids.length > 0 ? taskFormData.selected_intern_ids : undefined,
          status: "todo",
        });
      }
      setTaskModalOpen(false);
      setSelectedTaskDetail(null);
      loadInternData();
    } catch (err) {
      console.error("Task save failed:", err);
      alert(err.message || "Failed to save task.");
    } finally {
      setTaskSaving(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      setSelectedTaskDetail(null);
      loadInternData();
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  const getProjectName = (projectId) => {
    const p = projects.find((proj) => proj.id === projectId);
    return p ? p.title : `Project #${projectId}`;
  };

  if (loading) {
    return <Loader message="Loading intern records & submissions..." />;
  }

  if (error) {
    return (
      <div className="space-y-4 -mt-2 sm:-mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Assigned Interns"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-800">Back to Assigned Interns</span>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const intern = internship?.intern;
  const currentWeek = internship?.current_week || 1;
  const duration = internship?.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));

  const isCompleted = internship?.status === "completed" || internship?.status === "terminated";

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

  // Filtered Tasks for Tab 3 (Tasks Tab)
  const filteredTasks = tasks.filter((task) => {
    if (taskTabFilter === "pending" && task.status === "done") return false;
    if (taskTabFilter === "completed" && task.status !== "done") return false;

    if (taskWeekFilter !== "all" && Number(task.week_number) !== Number(taskWeekFilter)) {
      return false;
    }

    if (taskSearchQuery.trim()) {
      const q = taskSearchQuery.toLowerCase().trim();
      const title = (task.title || "").toLowerCase();
      const desc = (task.description || "").toLowerCase();
      const proj = getProjectName(task.project_id).toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !proj.includes(q)) return false;
    }

    return true;
  });

  // Group tasks by week
  const groupedTasksByWeek = {};
  filteredTasks.forEach((task) => {
    const w = task.week_number || 1;
    if (!groupedTasksByWeek[w]) groupedTasksByWeek[w] = [];
    groupedTasksByWeek[w].push(task);
  });
  const sortedWeeks = Object.keys(groupedTasksByWeek).map(Number).sort((a, b) => a - b);

  // =========================================================================
  // 1. DEDICATED FULL-PAGE VIEW FOR SELECTED PROJECT
  // =========================================================================
  if (selectedDetailProject) {
    return (
      <div className="space-y-4 -mt-2 sm:-mt-3 animate-fadeIn">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDetailProject(null)}
              title="Back to Intern Profile"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Tasks from {selectedDetailProject.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-3.5 py-1.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-xs">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Intern: {intern?.profile?.full_name || intern?.email}</span>
            </span>
          </div>
        </div>

        {/* Project Overview Card Banner */}
        <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                <Code2 className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {selectedDetailProject.title}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  {selectedDetailProject.description || "No project scope description provided."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-auto">
              <StatusBadge status={selectedDetailProject.status || "not_started"} size="sm" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {selectedDetailProject.technologies ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedDetailProject.technologies.split(",").map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200/70"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            ) : <div />}

            {selectedDetailProject.repo_url && (
              <a
                href={selectedDetailProject.repo_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-600 hover:underline"
              >
                <Github className="w-4 h-4" />
                <span>Code Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Full Task Kanban for this Specific Project */}
        <TaskKanban
          tasks={tasks.filter((t) => t.project_id === selectedDetailProject.id)}
          projects={[selectedDetailProject]}
          internship={internship}
          onRefresh={loadInternData}
          allowCreate={!isCompleted}
          isMentor={true}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN INTERN 360 PROFILE VIEW
  // =========================================================================
  return (
    <div className="space-y-4 -mt-2 sm:-mt-3 animate-fadeIn">
      {/* Top Navigation Back Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Assigned Interns"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Intern Profile: {intern?.profile?.full_name || intern?.email}
          </h1>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          {/* Export / Print Evaluation */}
          <button
            onClick={() => setPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-extrabold transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF Report</span>
          </button>

          {/* 6-Week Evaluation Action */}
          <button
            onClick={() => setEvaluationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{evaluation ? "Edit 6-Week Evaluation" : "Finalize 6-Week Evaluation"}</span>
          </button>
        </div>
      </div>

      {/* Completed Track Archived Notification Banner */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 font-bold text-slate-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>This internship track is <strong>{internship.status.replace(/_/g, " ")}</strong>. All deliverables, milestones, and evaluations are archived as official immutable records.</span>
          </div>
          <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-xl font-extrabold text-[11px] uppercase tracking-wider flex-shrink-0">
            Read Only Record
          </span>
        </div>
      )}

      {/* Structured Profile Overview Card Banner */}
      <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              {intern?.profile?.full_name?.slice(0, 2) || "IN"}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {intern?.profile?.full_name || intern?.email}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>{intern?.profile?.university || "University"} &bull; {intern?.profile?.degree || "Degree"} ({intern?.profile?.semester || "Semester"})</span>
              </p>
            </div>
          </div>

          {/* Top Right: Status Badge */}
          <div className="flex items-center gap-2.5 flex-shrink-0 self-start sm:self-auto">
            <StatusBadge status={internship?.status || "active"} size="sm" />
          </div>
        </div>

        {/* Structured Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Email Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="font-extrabold text-slate-800 truncate text-xs mt-0.5" title={intern?.email}>{intern?.email || "—"}</p>
            </div>
          </div>

          {/* Phone Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone Number</p>
              <p className="font-extrabold text-slate-800 truncate text-xs mt-0.5">{intern?.profile?.phone || "No phone listed"}</p>
            </div>
          </div>

          {/* Department Track Card */}
          <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Engineering Track</p>
              <p className="font-extrabold text-slate-800 truncate text-xs mt-0.5">{internship?.department || "General Engineering"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Centered Segmented Pill Tabs Bar (Generous Button Widths) */}
      <div className="flex justify-center w-full py-1">
        <div className="inline-flex items-center gap-1.5 h-12 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 shadow-inner overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "projects"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects ({projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "tasks"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks ({tasks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("reports")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "reports"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Weekly Reports ({reports.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("feedback_history")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "feedback_history"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Feedback Log</span>
          </button>

          <button
            onClick={() => setActiveTab("ai_insights")}
            className={`px-5 sm:px-6 h-full rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === "ai_insights"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/20"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Insights</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW METRICS & SKILLS                          */}
      {/* ========================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Top Colored Metric Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Milestone Progress"
              value={`Week ${currentWeek} of ${duration}`}
              subtitle={`${progressPercent}% of 6-week internship elapsed`}
              icon={Clock}
              color="blue"
            />
            <StatCard
              title="Tasks Completed"
              value={`${completedTasks} / ${tasks.length}`}
              subtitle={`${taskRate}% deliverable completion rate`}
              icon={CheckSquare}
              color="emerald"
            />
            <StatCard
              title="Reports Submitted"
              value={`${reports.length} / ${duration}`}
              subtitle="Weekly milestone submissions"
              icon={FileText}
              color="indigo"
            />
            <StatCard
              title="Active Blockers"
              value={blockers.filter((b) => b.status !== "resolved").length}
              subtitle="Roadblocks requiring mentor unblocking"
              icon={AlertCircle}
              color="rose"
            />
          </div>

          {/* Skills Tag Cloud */}
          <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-3">
            <h4 className="font-extrabold text-sm text-slate-900">Demonstrated Engineering Competencies</h4>
            <div className="flex flex-wrap gap-2 pt-1">
              {allSkills.size === 0 ? (
                <p className="text-xs text-slate-400 italic">No skills tagged in submitted weekly reports yet.</p>
              ) : (
                Array.from(allSkills).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200"
                  >
                    {skill}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PROJECTS DIRECTORY (Clicking opens Full-Page View)  */}
      {/* ========================================================= */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-base text-slate-900 tracking-tight">Assigned Software Projects</h4>
            {!isCompleted && (
              <button
                onClick={() => setProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Project</span>
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState
              title="No projects assigned to this intern yet"
              description="Assign an official software engineering project to organize sprints, tasks, and repository deliverables."
              actionLabel={!isCompleted ? "Assign Project" : undefined}
              onAction={!isCompleted ? () => setProjectModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => setSelectedDetailProject(proj)}
                  className="bg-white rounded-3xl p-6 border-[1.5px] border-blue-400/80 shadow-md shadow-slate-200/70 flex flex-col justify-between space-y-4 hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Code2 className="w-5 h-5" />
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">{proj.title}</h4>
                      </div>
                      <StatusBadge status={proj.status || "not_started"} size="xs" />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.technologies.split(",").map((tech, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200/70"
                          >
                            {tech.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span>View Full Project Workspace & Tasks</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TASKS DELIVERABLES (Week-wise, Project Tag, Modal) */}
      {/* ========================================================= */}
      {activeTab === "tasks" && (
        <div className="space-y-4">
          {/* Tasks Toolbar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* 3 Status Filter Pills */}
            <div className="h-11 bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/90 shadow-inner flex-shrink-0">
              <button
                onClick={() => setTaskTabFilter("all")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  taskTabFilter === "all"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                All ({tasks.length})
              </button>
              <button
                onClick={() => setTaskTabFilter("pending")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  taskTabFilter === "pending"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Pending ({tasks.filter(t => t.status !== "done").length})
              </button>
              <button
                onClick={() => setTaskTabFilter("completed")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  taskTabFilter === "completed"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                Completed ({tasks.filter(t => t.status === "done").length})
              </button>
            </div>

            {/* Week Selector */}
            <div className="flex-shrink-0">
              <select
                value={taskWeekFilter}
                onChange={(e) => setTaskWeekFilter(e.target.value)}
                className="h-11 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 font-extrabold text-slate-800 shadow-xs"
              >
                <option value="all">All Weeks</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tasks by title or project..."
                value={taskSearchQuery}
                onChange={(e) => setTaskSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-8 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium transition-all shadow-xs flex items-center"
              />
              {taskSearchQuery && (
                <button
                  onClick={() => setTaskSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Assign Task Button */}
            {projects.length > 0 && !isCompleted && (
              <button
                onClick={handleOpenCreateTask}
                className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Task</span>
              </button>
            )}
          </div>

          {/* Week-Wise Structured Task Deliverables */}
          {filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="No task deliverables match the selected view"
              description="No tasks found for this intern with the active filters."
            />
          ) : (
            <div className="space-y-8 pt-2">
              {sortedWeeks.map((weekNum) => {
                const tasksInWeek = groupedTasksByWeek[weekNum] || [];
                return (
                  <div key={weekNum} className="space-y-4">
                    {/* Week Milestone Heading Banner */}
                    <div className="flex items-center gap-2.5">
                      <span className="px-3.5 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs">
                        Week {weekNum}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        ({tasksInWeek.length} {tasksInWeek.length === 1 ? "deliverable" : "deliverables"})
                      </span>
                    </div>

                    {/* Task Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {tasksInWeek.map((task) => {
                        const isDone = task.status === "done";
                        const isInProgress = task.status === "in_progress";

                        return (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTaskDetail(task)}
                            className={`bg-white rounded-3xl p-6 border-[1.5px] shadow-sm hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 min-h-[190px] group ${
                              isDone
                                ? "border-emerald-500 hover:border-emerald-600"
                                : isInProgress
                                ? "border-blue-500 hover:border-blue-600"
                                : "border-slate-300 hover:border-blue-400"
                            }`}
                          >
                            <div className="space-y-3">
                              {/* Top row: Project Name & Single Status Tag */}
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200/70 truncate max-w-[215px] sm:max-w-[245px]"
                                  title={getProjectName(task.project_id)}
                                >
                                  {getProjectName(task.project_id)}
                                </span>

                                {/* Single Status Tag */}
                                {isDone ? (
                                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 flex-shrink-0">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Completed</span>
                                  </span>
                                ) : isInProgress ? (
                                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-extrabold inline-flex items-center gap-1 flex-shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                                    <span>In Progress</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-extrabold flex-shrink-0">
                                    To Do
                                  </span>
                                )}
                              </div>

                              {/* Task Title */}
                              <h4
                                className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                                title={task.title}
                              >
                                {task.title}
                              </h4>

                              {/* Task Description */}
                              {task.description && (
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed" title={task.description}>
                                  {task.description}
                                </p>
                              )}
                            </div>

                            {/* Card Footer: Week & Click Indicator */}
                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-400">Week {task.week_number}</span>
                              <span className="text-blue-600 font-extrabold text-xs flex items-center gap-1 group-hover:underline">
                                <span>Details</span>
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: WEEKLY REPORTS & FEEDBACK                          */}
      {/* ========================================================= */}
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
                  className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4 hover:border-blue-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 font-extrabold text-xs rounded-xl border border-blue-200/80">
                        Week {report.week_number}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Weekly Progress Report (Week {report.week_number})
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSummarizeReportWithAI(report.id)}
                        disabled={aiSummaryLoadingReportId === report.id}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 rounded-2xl text-xs font-bold transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                        <span>{aiSummaryLoadingReportId === report.id ? "Analyzing..." : "AI Summary"}</span>
                      </button>

                      <button
                        onClick={() => handleOpenFeedback(report)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Mentor Feedback</span>
                      </button>
                    </div>
                  </div>

                  {aiSummary && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white text-xs space-y-2 border border-indigo-800/40 shadow-sm animate-fadeIn">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <span className="font-extrabold text-slate-800">Tasks Completed:</span>
                      <p className="text-slate-600 leading-relaxed">{report.tasks_completed_summary || "None reported."}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <span className="font-extrabold text-slate-800">Learnings & Skills:</span>
                      <p className="text-slate-600 leading-relaxed">{report.learnings_and_skills || "None reported."}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: FEEDBACK LOG                                       */}
      {/* ========================================================= */}
      {activeTab === "feedback_history" && (
        <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <h4 className="font-black text-sm text-slate-900">Chronological Mentor Feedback</h4>
          {reports.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reports or feedback given yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="font-extrabold">Week {report.week_number} Feedback Log</span>
                    <button
                      onClick={() => handleOpenFeedback(report)}
                      className="text-blue-600 hover:text-blue-700 font-extrabold"
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

      {/* ========================================================= */}
      {/* TAB 6: AI INSIGHTS                                        */}
      {/* ========================================================= */}
      {activeTab === "ai_insights" && (
        <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h4 className="font-black text-sm text-slate-900">AI Trajectory & Risk Assessment</h4>
          </div>
          <div className="p-5 bg-purple-50/70 border border-purple-200/80 rounded-2xl text-xs text-purple-950 space-y-2">
            <p className="font-extrabold text-sm">Automated 6-Week Trajectory Prediction</p>
            <p className="text-purple-900 leading-relaxed">
              Based on the intern's task completion pace ({taskRate}%) and report frequency ({reports.length} submissions), the intern's overall performance is rated as <strong>{evaluation ? evaluation.recommendation : "On Track"}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TASK DETAIL POPUP MODAL                                   */}
      {/* ========================================================= */}
      {selectedTaskDetail && (
        <Modal
          isOpen={Boolean(selectedTaskDetail)}
          onClose={() => setSelectedTaskDetail(null)}
          title="Task Deliverable Details"
          subtitle={`Deliverable breakdown for ${getProjectName(selectedTaskDetail.project_id)}`}
        >
          <div className="space-y-4 text-xs">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-extrabold text-xs border border-blue-200/70 flex items-center gap-1">
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>{getProjectName(selectedTaskDetail.project_id)}</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/70">
                  Week {selectedTaskDetail.week_number}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-lg font-black text-xs uppercase tracking-wider ${
                    selectedTaskDetail.priority === "critical"
                      ? "bg-rose-500 text-white"
                      : selectedTaskDetail.priority === "high"
                      ? "bg-amber-500 text-white"
                      : selectedTaskDetail.priority === "medium"
                      ? "bg-blue-500 text-white"
                      : "bg-slate-700 text-white"
                  }`}
                >
                  {selectedTaskDetail.priority}
                </span>
              </div>
              <StatusBadge status={selectedTaskDetail.status || "todo"} size="sm" />
            </div>

            {/* Title */}
            <div>
              <h3 className="font-black text-base text-slate-900 leading-snug">
                {selectedTaskDetail.title}
              </h3>
              {selectedTaskDetail.due_date && (
                <p className="text-[11px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target Due Date: {formatTaskDate(selectedTaskDetail.due_date)}</span>
                </p>
              )}
            </div>

            {/* Scope / Description */}
            <div className="space-y-1">
              <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Scope & Requirements</span>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 leading-relaxed text-slate-700 font-medium">
                {selectedTaskDetail.description || "No specific description provided."}
              </div>
            </div>

            {/* Mentor Guidance Notes */}
            {selectedTaskDetail.mentor_notes && (
              <div className="space-y-1">
                <span className="font-extrabold text-amber-800 uppercase tracking-wider text-[10px]">Mentor Guidance</span>
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-950 font-medium leading-relaxed">
                  {selectedTaskDetail.mentor_notes}
                </div>
              </div>
            )}

            {/* Hours Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
              <span className="font-semibold text-slate-500">Estimated: <strong>{selectedTaskDetail.estimated_hours || 0}h</strong></span>
              <span className="font-semibold text-slate-500">Logged Hours: <strong className="text-blue-600">{selectedTaskDetail.actual_hours || 0}h</strong></span>
            </div>

            {/* Submitted Deliverables Links */}
            {(selectedTaskDetail.submission_url || selectedTaskDetail.attachment_url || selectedTaskDetail.submission_notes) && (
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5">
                <span className="font-extrabold text-emerald-950 uppercase tracking-wider text-[10px]">Intern Submission Artifacts</span>
                {selectedTaskDetail.submission_notes && (
                  <p className="text-slate-700 italic">
                    "{selectedTaskDetail.submission_notes}"
                  </p>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedTaskDetail.submission_url && (
                    <a
                      href={selectedTaskDetail.submission_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Code / PR Link</span>
                    </a>
                  )}
                  {selectedTaskDetail.attachment_url && (
                    <a
                      href={selectedTaskDetail.attachment_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Download Artifact</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Mentor Actions (Only editable if internship not completed) */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {!isCompleted ? (
                <button
                  type="button"
                  onClick={() => handleDeleteTask(selectedTaskDetail.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Task</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                {!isCompleted && (
                  <button
                    type="button"
                    onClick={() => {
                      const task = selectedTaskDetail;
                      setSelectedTaskDetail(null);
                      handleOpenEditTask(task);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Task</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedTaskDetail(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Task Create / Edit Modal (Multi-Intern support) */}
      <Modal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        title={editingTask ? "Edit Task Deliverable" : `Assign Task`}
        subtitle="Specify deliverable title, target milestone week, priority, scope, and assigned intern(s)"
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={taskFormData.title}
              onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
              placeholder="e.g. Implement authentication middleware & JWT handlers"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Track *
            </label>
            <select
              required
              value={taskFormData.project_id}
              onChange={(e) => setTaskFormData({ ...taskFormData, project_id: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
            >
              <option value="">Select Project Track</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Assign to Intern(s) Multi-Select Selector (Only when creating a new task) */}
          {!editingTask && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Assign to Intern(s) *</span>
              </label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 max-h-36 overflow-y-auto">
                {allAssignedInterns.length > 0 ? (
                  allAssignedInterns.map((item) => {
                    const iId = item.intern_id || item.intern?.id;
                    const iName = item.intern?.profile?.full_name || item.intern?.email || `Intern #${iId}`;
                    const isChecked = taskFormData.selected_intern_ids?.includes(iId);

                    return (
                      <label
                        key={iId}
                        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleInternSelection(iId)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span>{iName}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">({item.department})</span>
                      </label>
                    );
                  })
                ) : (
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={true}
                      readOnly
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>{intern?.profile?.full_name || intern?.email}</span>
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Task Date
              </label>
              <input
                type="date"
                value={taskFormData.due_date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const internStart = internship?.start_date || (internship?.intern?.created_at ? internship.intern.created_at.slice(0, 10) : newDate);
                  const autoWeek = calculateWeekFromStartDate(internStart, newDate);
                  setTaskFormData({ ...taskFormData, due_date: newDate, week_number: autoWeek });
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Week
              </label>
              <select
                value={taskFormData.week_number}
                onChange={(e) => setTaskFormData({ ...taskFormData, week_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={taskFormData.priority}
                onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Est Hours
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={taskFormData.estimated_hours}
                onChange={(e) => setTaskFormData({ ...taskFormData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Scope & Acceptance Criteria
            </label>
            <textarea
              rows={3}
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
              placeholder="Detailed specifications, technical endpoints, PR requirements..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mentor Guidance Notes
            </label>
            <textarea
              rows={2}
              value={taskFormData.mentor_notes}
              onChange={(e) => setTaskFormData({ ...taskFormData, mentor_notes: e.target.value })}
              placeholder="Pointers to docs, reference architectures, or best practices..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
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
              {taskSaving ? "Saving..." : editingTask ? "Update Task" : "Assign Task"}
            </button>
          </div>
        </form>
      </Modal>

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
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
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
                    <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <p className="font-bold text-indigo-900">Overall Rating</p>
                      <p className="text-xl font-black text-indigo-950 mt-1">{evaluation.overall_rating}/10</p>
                    </div>
                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="font-bold text-blue-900">Technical Rating</p>
                      <p className="text-xl font-black text-blue-950 mt-1">{evaluation.technical_skills_rating}/5</p>
                    </div>
                    <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100">
                      <p className="font-bold text-purple-900">Soft Skills</p>
                      <p className="text-xl font-black text-purple-950 mt-1">{evaluation.soft_skills_rating}/5</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold text-emerald-900 flex justify-between">
                    <span>Hiring Recommendation:</span>
                    <span className="uppercase">{evaluation.recommendation}</span>
                  </div>

                  {evaluation.final_comments && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                      <p className="font-bold text-slate-800">Mentor Assessment:</p>
                      <p className="text-slate-600 italic">"{evaluation.final_comments}"</p>
                    </div>
                  )}

                  {evaluation.ai_summary && (
                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-1">
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
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm shadow-blue-500/20"
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
