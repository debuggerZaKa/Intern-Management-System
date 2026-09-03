import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CheckSquare,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  PlayCircle,
  FolderGit2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  FileText,
  MessageSquare,
  Send,
  Filter,
  Calendar,
  Search,
  X,
  Paperclip,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import { calculateWeekFromStartDate, getTodayDateStr, formatTaskDate } from "../../utils/taskDateUtils";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function TaskKanban({
  tasks = [],
  projects: initialProjects = [],
  internship = null,
  onRefresh,
  allowCreate = false,
  isIntern = false,
  isAdmin = false,
  isMentor = false,
}) {
  const [projectsList, setProjectsList] = useState(initialProjects || []);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "completed"
  
  // Search and Advanced Filters
  const [search, setSearch] = useState("");
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Mentor Assign / Edit Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mentor_notes: "",
    submission_url: "",
    due_date: getTodayDateStr(),
    week_number: 1,
    priority: "medium",
    status: "todo",
    estimated_hours: 4,
    actual_hours: 0,
    project_id: "",
  });

  // Intern Submit Form State
  const [submitForm, setSubmitForm] = useState({
    submission_notes: "",
    submission_url: "",
    actual_hours: 4,
    attachment_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  // Delete Task Confirmation Modal
  const [deleteTaskModal, setDeleteTaskModal] = useState({
    isOpen: false,
    task: null,
    isBlocked: false,
    blockedReason: "",
    dependencies: [],
    confirmLoading: false,
  });

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectsList(initialProjects);
    }
  }, [initialProjects]);

  const getProjectStartDate = (projId, list = projectsList) => {
    const proj = (list || []).find((p) => String(p.id) === String(projId));
    return proj?.internship?.start_date || internship?.start_date || getTodayDateStr();
  };

  const loadProjectsForModal = async () => {
    try {
      setFetchingProjects(true);
      const data = await projectService.getProjects();
      const freshList = data || [];
      setProjectsList(freshList);
      return freshList;
    } catch (err) {
      console.error("Failed to fetch projects for task modal:", err);
      return projectsList;
    } finally {
      setFetchingProjects(false);
    }
  };

  const openCreateModal = async () => {
    setEditingTask(null);
    setError(null);

    const currentList = await loadProjectsForModal();
    const defaultProjectId = currentList[0]?.id ? String(currentList[0].id) : "";
    const today = getTodayDateStr();
    const projStart = getProjectStartDate(defaultProjectId, currentList);
    const autoWeek = calculateWeekFromStartDate(projStart, today);

    setFormData({
      title: "",
      description: "",
      mentor_notes: "",
      submission_url: "",
      due_date: today,
      week_number: autoWeek,
      priority: "medium",
      status: "todo",
      estimated_hours: 4,
      actual_hours: 0,
      project_id: defaultProjectId,
    });
    setModalOpen(true);
  };

  const openEditModal = async (task) => {
    setEditingTask(task);
    setError(null);
    const currentList = await loadProjectsForModal();
    const projId = task.project_id ? String(task.project_id) : (currentList[0]?.id ? String(currentList[0].id) : "");
    const taskDate = task.due_date ? String(task.due_date).slice(0, 10) : getTodayDateStr();

    setFormData({
      title: task.title || "",
      description: task.description || "",
      mentor_notes: task.mentor_notes || "",
      submission_url: task.submission_url || "",
      due_date: taskDate,
      week_number: task.week_number || 1,
      priority: task.priority || "medium",
      status: task.status || "todo",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
      project_id: projId,
    });
    setModalOpen(true);
  };

  const openSubmitModal = (task) => {
    setSubmittingTask(task);
    setSubmitForm({
      submission_notes: task.submission_notes || "",
      submission_url: task.submission_url || "",
      actual_hours: task.actual_hours || task.estimated_hours || 4,
      attachment_url: task.attachment_url || "",
    });
    setError(null);
    setSubmitModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await taskService.uploadFile(file);
      if (res && res.url) {
        setSubmitForm((prev) => ({ ...prev, attachment_url: res.url }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert(`File upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitTaskDeliverable = async (e) => {
    e.preventDefault();
    if (!submittingTask) return;

    try {
      setLoading(true);
      setError(null);
      await taskService.updateTask(submittingTask.id, {
        status: "done",
        submission_notes: submitForm.submission_notes,
        submission_url: submitForm.submission_url,
        attachment_url: submitForm.attachment_url,
        actual_hours: parseFloat(submitForm.actual_hours) || 0,
      });

      setSubmitModalOpen(false);
      setSubmittingTask(null);
      onRefresh?.();
    } catch (err) {
      setError(err.message || "Failed to submit task deliverable");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Task title is required");
      return;
    }
    if (!formData.project_id) {
      setError("Please select a project for this task");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        title: formData.title,
        description: formData.description,
        mentor_notes: formData.mentor_notes,
        submission_url: formData.submission_url,
        due_date: formData.due_date,
        week_number: parseInt(formData.week_number) || 1,
        priority: formData.priority,
        status: formData.status,
        estimated_hours: parseFloat(formData.estimated_hours) || 0,
        actual_hours: parseFloat(formData.actual_hours) || 0,
        project_id: parseInt(formData.project_id),
      };

      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
      } else {
        await taskService.createTask(payload);
      }

      setModalOpen(false);
      setEditingTask(null);
      onRefresh?.();
    } catch (err) {
      setError(err.message || "Failed to save task deliverable");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStatusChange = async (task, newStatus) => {
    try {
      setUpdatingTaskId(task.id);
      await taskService.updateTask(task.id, { status: newStatus });
      onRefresh?.();
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (isCompletedTrack) {
      setDeleteTaskModal({
        isOpen: true,
        task,
        isBlocked: true,
        blockedReason: "Tasks on finalized or completed internship tracks are archived and cannot be deleted.",
        dependencies: ["Archived Milestone Deliverable", "Completed Evaluation Record"],
        confirmLoading: false,
      });
      return;
    }

    const dependencies = [`Current Status: ${task.status.toUpperCase()}`];
    if (task.estimated_hours > 0) {
      dependencies.push(`Logged Hours: ${task.actual_hours || 0} / ${task.estimated_hours}h`);
    }
    if (task.attachment_url) {
      dependencies.push("Submitted File Attachment");
    }
    if (task.submission_url) {
      dependencies.push("Deliverable Demo / Pull Request URL");
    }

    setDeleteTaskModal({
      isOpen: true,
      task,
      isBlocked: false,
      blockedReason: "",
      dependencies,
      confirmLoading: false,
    });
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskModal.task) return;
    try {
      setDeleteTaskModal((prev) => ({ ...prev, confirmLoading: true }));
      await taskService.deleteTask(deleteTaskModal.task.id);
      setDeleteTaskModal((prev) => ({ ...prev, isOpen: false, task: null, confirmLoading: false }));
      onRefresh?.();
    } catch (err) {
      setDeleteTaskModal((prev) => ({ ...prev, confirmLoading: false }));
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const getProjectName = (projectId) => {
    const p = projectsList.find((proj) => proj.id === projectId);
    return p ? p.title : `Project #${projectId}`;
  };

  // Active filters count
  const hasActiveFilters =
    search.trim() !== "" ||
    selectedWeek !== "all" ||
    selectedPriority !== "all" ||
    selectedProject !== "all" ||
    selectedDate !== "";

  const clearAllFilters = () => {
    setSearch("");
    setSelectedWeek("all");
    setSelectedPriority("all");
    setSelectedProject("all");
    setSelectedDate("");
  };

  // Tab counts
  const allCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "done").length;

  // Filtered tasks logic
  const filteredTasks = tasks.filter((task) => {
    // 1. Tab filter
    if (activeTab === "pending" && task.status === "done") return false;
    if (activeTab === "completed" && task.status !== "done") return false;

    // 2. Search query
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      const title = (task.title || "").toLowerCase();
      const desc = (task.description || "").toLowerCase();
      const notes = (task.mentor_notes || "").toLowerCase();
      const proj = getProjectName(task.project_id).toLowerCase();
      if (!title.includes(term) && !desc.includes(term) && !notes.includes(term) && !proj.includes(term)) {
        return false;
      }
    }

    // 3. Week filter
    if (selectedWeek !== "all" && Number(task.week_number) !== Number(selectedWeek)) {
      return false;
    }

    // 4. Priority filter
    if (selectedPriority !== "all" && task.priority !== selectedPriority) {
      return false;
    }

    // 5. Project filter
    if (selectedProject !== "all" && String(task.project_id) !== String(selectedProject)) {
      return false;
    }

    // 6. Day / Date filter
    if (selectedDate && task.due_date && !String(task.due_date).startsWith(selectedDate)) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* ========================================================= */}
      {/* FILTER & ACTION TOOLBAR (Direct on page layout)           */}
      {/* ========================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          
          {/* Left: 3 Tabs (All, Pending, Completed) */}
          <div className="h-11 bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/90 shadow-inner flex-shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`h-full px-4 sm:px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-sm shadow-slate-900/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>All ({allCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("pending")}
              className={`h-full px-4 sm:px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "pending"
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("completed")}
              className={`h-full px-4 sm:px-5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
                activeTab === "completed"
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed ({completedCount})</span>
            </button>
          </div>

          {/* Center: Search Input Bar */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search tasks by title, scope, guidance notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-8 text-xs bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium transition-all shadow-xs flex items-center"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters Toggle & Assign Task Action */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`h-11 inline-flex items-center justify-center gap-2 px-4 rounded-2xl text-xs font-extrabold border transition-all shadow-xs whitespace-nowrap ${
                showFilters || hasActiveFilters
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4 text-slate-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>

            {allowCreate && (
              <button
                onClick={openCreateModal}
                className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Expandable Advanced Filters Row */}
        {showFilters && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-fadeIn">
            {/* Week Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Milestone Week
              </label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
              >
                <option value="all">All Weeks</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>

            {/* Day / Date Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Day / Date Filter
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                />
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate("")}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100"
                    title="Clear Date"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
              >
                <option value="all">All Priorities</option>
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical Priority</option>
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                Project Track
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-semibold"
              >
                <option value="all">All Projects</option>
                {projectsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset All Filters Button */}
            {hasActiveFilters && (
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-1">
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TASK CARDS GRID (White Cards with Colored Border Strokes) */}
      {/* ========================================================= */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match the selected view"
          description={
            hasActiveFilters
              ? "Try adjusting your search query, week, or date filters."
              : activeTab === "pending"
              ? "All tasks are completed! Great job."
              : activeTab === "completed"
              ? "No completed tasks yet."
              : "No task deliverables have been assigned yet."
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTasks.map((task) => {
            const isToDo = task.status === "todo";
            const isInProgress = task.status === "in_progress";
            const isDone = task.status === "done";

            return (
              <div
                key={task.id}
                className={`bg-white rounded-3xl p-6 border-[1.5px] shadow-md shadow-slate-200/70 flex flex-col justify-between transition-all group hover:shadow-xl ${
                  isDone
                    ? "border-emerald-500 hover:border-emerald-600"
                    : isInProgress
                    ? "border-blue-500 hover:border-blue-600"
                    : "border-blue-400/80 hover:border-blue-500"
                }`}
              >
                {/* Card Top: Badges & Mentor Actions */}
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Week, Date & Priority Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/70">
                        Week {task.week_number}
                      </span>

                      {task.due_date && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200/70 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatTaskDate(task.due_date)}
                        </span>
                      )}

                      {/* Solid Color Priority Tags */}
                      <span
                        className={`px-2.5 py-1 rounded-lg font-black text-xs uppercase tracking-wider ${
                          task.priority === "critical"
                            ? "bg-rose-500 text-white"
                            : task.priority === "high"
                            ? "bg-amber-500 text-white"
                            : task.priority === "medium"
                            ? "bg-blue-500 text-white"
                            : "bg-slate-700 text-white"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <StatusBadge status={task.status || "todo"} size="sm" />

                      {(isMentor || isAdmin) && (
                        <div className="flex items-center opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(task)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4
                      className="font-extrabold text-base text-slate-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                      title={task.title}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2" title={task.description}>
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Mentor Guidance Note Box */}
                  {task.mentor_notes && (
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="line-clamp-2">
                        <strong className="text-amber-950 font-bold">Mentor: </strong>
                        <span>{task.mentor_notes}</span>
                      </div>
                    </div>
                  )}

                  {/* Submission Deliverables Links */}
                  {(task.submission_url || task.attachment_url || task.submission_notes) && (
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                      {task.submission_notes && (
                        <p className="text-slate-600 italic line-clamp-2">
                          "{task.submission_notes}"
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {task.submission_url && (
                          <a
                            href={task.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold text-xs border border-blue-200/70 transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Code / PR Link</span>
                          </a>
                        )}
                        {task.attachment_url && (
                          <a
                            href={task.attachment_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-bold text-xs border border-purple-200/70 transition-all"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span>Attached Artifact</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Hours & Primary Action Button */}
                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-slate-500">
                    <span>{task.estimated_hours || 0}h est</span>
                    <span className="mx-1.5 text-slate-300">•</span>
                    <strong className="text-slate-800 font-extrabold">{task.actual_hours || 0}h logged</strong>
                  </div>

                  <div>
                    {isToDo ? (
                      <button
                        onClick={() => handleQuickStatusChange(task, "in_progress")}
                        disabled={updatingTaskId === task.id}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{updatingTaskId === task.id ? "Starting..." : "Start Task"}</span>
                      </button>
                    ) : isInProgress ? (
                      <button
                        onClick={() => openSubmitModal(task)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-extrabold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* MENTOR / ADMIN TASK ASSIGNMENT / EDIT MODAL               */}
      {/* ========================================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Task Deliverable" : "Assign New Task Deliverable"}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {/* Project Track Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Project Track *
            </label>
            <select
              required
              value={formData.project_id}
              onChange={(e) => {
                const projId = e.target.value;
                const projStart = getProjectStartDate(projId);
                const autoWeek = calculateWeekFromStartDate(projStart, formData.due_date);
                setFormData({
                  ...formData,
                  project_id: projId,
                  week_number: autoWeek,
                });
              }}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            >
              <option value="" disabled>Select assigned project</option>
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement user authentication flow"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Description & Deliverable Scope
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Engineering details, acceptance criteria, and specific deliverables..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Mentor Guidance & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.mentor_notes}
              onChange={(e) => setFormData({ ...formData, mentor_notes: e.target.value })}
              placeholder="Specific architectural notes, coding guidelines, or resources for the intern..."
              className="w-full px-3.5 py-2 text-xs bg-amber-50/50 border border-amber-200/80 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Task Date *
              </label>
              <input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => {
                  const newDate = e.target.value;
                  const projStart = getProjectStartDate(formData.project_id);
                  const autoWeek = calculateWeekFromStartDate(projStart, newDate);
                  setFormData({
                    ...formData,
                    due_date: newDate,
                    week_number: autoWeek,
                  });
                }}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Week
              </label>
              <select
                value={formData.week_number}
                onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                  <option key={w} value={w}>
                    Week {w}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingTask ? "Save Changes" : "Assign Task"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* INTERN SUBMIT DELIVERABLE MODAL                           */}
      {/* ========================================================= */}
      <Modal
        isOpen={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title="Submit Task Deliverables"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitTaskDeliverable} className="space-y-4">
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {submittingTask && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800">{submittingTask.title}</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">{submittingTask.description}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Deliverable Notes & Summary *
            </label>
            <textarea
              required
              rows={3}
              value={submitForm.submission_notes}
              onChange={(e) => setSubmitForm({ ...submitForm, submission_notes: e.target.value })}
              placeholder="Explain the changes, test results, PR description, or what you built..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Pull Request / GitHub / Demo URL
            </label>
            <input
              type="url"
              value={submitForm.submission_url}
              onChange={(e) => setSubmitForm({ ...submitForm, submission_url: e.target.value })}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Attach Deliverable File / Artifact
            </label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200">
                <UploadCloud className="w-4 h-4 text-slate-500" />
                <span>{uploading ? "Uploading..." : "Choose File"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {submitForm.attachment_url && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 truncate max-w-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>File attached</span>
                </span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Actual Hours Spent
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={submitForm.actual_hours}
              onChange={(e) => setSubmitForm({ ...submitForm, actual_hours: e.target.value })}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setSubmitModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5" />
              )}
              <span>Complete & Submit</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Universal Task Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteTaskModal.isOpen}
        onClose={() => setDeleteTaskModal((prev) => ({ ...prev, isOpen: false, task: null }))}
        onConfirm={confirmDeleteTask}
        title={deleteTaskModal.isBlocked ? "Cannot Delete Task" : "Delete Sprint Task"}
        itemName={deleteTaskModal.task?.title}
        isBlocked={deleteTaskModal.isBlocked}
        blockedReason={deleteTaskModal.blockedReason}
        dependencies={deleteTaskModal.dependencies}
        confirmText="Delete Task"
        confirmLoading={deleteTaskModal.confirmLoading}
        warningMessage="This sprint task and any intern submissions will be permanently deleted."
      />
    </div>
  );
}
