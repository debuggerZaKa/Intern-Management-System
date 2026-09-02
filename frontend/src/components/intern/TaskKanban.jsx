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
  Paperclip,
  Send,
  Filter
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function TaskKanban({
  tasks = [],
  projects: initialProjects = [],
  onRefresh,
  allowCreate = false,
  isIntern = false,
  isAdmin = false,
  isMentor = false,
}) {
  const [projectsList, setProjectsList] = useState(initialProjects || []);
  const [statusFilter, setStatusFilter] = useState("all");
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
  const [fetchingProjects, setFetchingProjects] = useState(false);
  const [error, setError] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      setProjectsList(initialProjects);
    }
  }, [initialProjects]);

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

    setFormData({
      title: "",
      description: "",
      mentor_notes: "",
      submission_url: "",
      week_number: 1,
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

    setFormData({
      title: task.title || "",
      description: task.description || "",
      mentor_notes: task.mentor_notes || "",
      submission_url: task.submission_url || "",
      week_number: task.week_number || 1,
      priority: task.priority || "medium",
      status: task.status || "todo",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
      project_id: task.project_id ? String(task.project_id) : (currentList[0]?.id ? String(currentList[0].id) : ""),
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
      console.error("Failed to submit task:", err);
      setError(err.message || "Failed to submit task deliverable.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTaskByMentor = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }
    if (!formData.project_id) {
      setError("Please select the project this task belongs to.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          mentor_notes: formData.mentor_notes,
          submission_url: formData.submission_url,
          status: formData.status,
          priority: formData.priority,
          week_number: parseInt(formData.week_number),
          estimated_hours: parseFloat(formData.estimated_hours) || 0,
          actual_hours: parseFloat(formData.actual_hours) || 0,
        });
      } else {
        await taskService.createTask({
          project_id: parseInt(formData.project_id),
          title: formData.title,
          description: formData.description,
          mentor_notes: formData.mentor_notes,
          submission_url: formData.submission_url,
          priority: formData.priority,
          status: formData.status,
          week_number: parseInt(formData.week_number),
          estimated_hours: parseFloat(formData.estimated_hours) || 0,
          actual_hours: parseFloat(formData.actual_hours) || 0,
        });
      }
      setModalOpen(false);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to save task:", err);
      setError(err.message || "Failed to save task.");
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
      console.error("Failed to update status:", err);
      alert(err.message || "Failed to update task status.");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await taskService.deleteTask(taskId);
      onRefresh?.();
    } catch (err) {
      alert(`Failed to delete task: ${err.message}`);
    }
  };

  const getProjectName = (projectId) => {
    const p = projectsList.find((proj) => proj.id === projectId);
    return p ? p.title : `Project #${projectId}`;
  };

  // Filter tasks based on top-right status dropdown
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="space-y-5">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* List Header & Top-Right Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Task Deliverables ({filteredTasks.length})</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            {isIntern
              ? "Start assigned tasks, submit deliverable notes & links, and log hours"
              : "Assign deliverables, provide guidance notes, and review intern submissions"}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Top-Right Status Filter */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses ({tasks.length})</option>
              <option value="todo">To Do ({tasks.filter(t => t.status === "todo").length})</option>
              <option value="in_progress">In Progress ({tasks.filter(t => t.status === "in_progress").length})</option>
              <option value="done">Completed ({tasks.filter(t => t.status === "done").length})</option>
            </select>
          </div>

          {allowCreate && (
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Task List View (Clean Vertical List, Not Kanban Columns) */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match the selected filter"
          description={
            statusFilter === "all"
              ? "No tasks have been assigned to this project yet."
              : `No tasks currently marked as "${statusFilter.replace("_", " ")}".`
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isToDo = task.status === "todo";
            const isInProgress = task.status === "in_progress";
            const isDone = task.status === "done";

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-5 border shadow-xs transition-all space-y-3 group ${
                  isDone
                    ? "border-emerald-200/80 bg-emerald-50/10"
                    : isInProgress
                    ? "border-blue-200 bg-blue-50/20"
                    : "border-slate-200/80 hover:border-blue-300"
                }`}
              >
                {/* Task Row Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200/60 flex items-center gap-1">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      {getProjectName(task.project_id)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                      Week {task.week_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg font-bold text-xs capitalize ${
                      task.priority === "critical" ? "bg-rose-100 text-rose-800" :
                      task.priority === "high" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                    }`}>
                      {task.priority} Priority
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={task.status || "todo"} size="sm" />

                    {(isMentor || isAdmin) && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(task)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Task Title & Description */}
                <div>
                  <h4 className={`text-sm font-bold text-slate-900 leading-snug ${isDone ? "line-through text-slate-600 decoration-emerald-500" : ""}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                  )}
                </div>

                {/* Mentor Guidance Notes Box (if any) */}
                {task.mentor_notes && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                    <MessageSquare className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-950">Mentor Guidance Instructions:</span>
                      <p className="text-amber-900/90 leading-relaxed mt-0.5">{task.mentor_notes}</p>
                    </div>
                  </div>
                )}

                {/* Submitted Deliverables Section (for completed tasks) */}
                {isDone && (
                  <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                    {task.submission_notes && (
                      <div>
                        <span className="font-bold text-emerald-950">Submitted Notes:</span>
                        <p className="text-emerald-900/90 leading-relaxed">{task.submission_notes}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 pt-1">
                      {task.submission_url && (
                        <a
                          href={task.submission_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline text-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Code PR / Demo Link</span>
                        </a>
                      )}
                      {task.attachment_url && (
                        <a
                          href={task.attachment_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-bold text-purple-700 hover:underline text-xs"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>View Attached Artifact</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Row Action Footer */}
                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Estimated: {task.estimated_hours || 0}h
                    </span>
                    <span className="flex items-center gap-1 text-blue-600 font-bold">
                      Logged: {task.actual_hours || 0}h
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {isToDo ? (
                      <button
                        onClick={() => handleQuickStatusChange(task, "in_progress")}
                        disabled={updatingTaskId === task.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>{updatingTaskId === task.id ? "Starting..." : "Start Task"}</span>
                      </button>
                    ) : isInProgress ? (
                      <button
                        onClick={() => openSubmitModal(task)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Deliverable</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
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

      {/* Intern Task Submission Modal */}
      {submitModalOpen && submittingTask && (
        <Modal
          isOpen={submitModalOpen}
          onClose={() => setSubmitModalOpen(false)}
          title={`Submit Task: ${submittingTask.title}`}
          subtitle="Provide submission notes, reference repository/demo links, and upload deliverable files"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmitTaskDeliverable} className="space-y-4">
            {submittingTask.mentor_notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1 text-amber-950">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                  Mentor Guidance Instructions:
                </span>
                <p className="text-amber-900/90 leading-relaxed">{submittingTask.mentor_notes}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Submission Notes & Implementation Summary *
              </label>
              <textarea
                rows={3}
                required
                value={submitForm.submission_notes}
                onChange={(e) => setSubmitForm({ ...submitForm, submission_notes: e.target.value })}
                placeholder="Detail what was built, testing performed, API changes, and completion status..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference / Code PR / Demo URL
              </label>
              <input
                type="url"
                value={submitForm.submission_url}
                onChange={(e) => setSubmitForm({ ...submitForm, submission_url: e.target.value })}
                placeholder="https://github.com/NETSOL/repo/pull/12 or https://demo.netsol.com"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Actual Logged Hours</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attachment File</label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="task-file-input"
                  />
                  <label
                    htmlFor="task-file-input"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 cursor-pointer flex items-center justify-between text-slate-700 font-semibold"
                  >
                    <span>{uploading ? "Uploading..." : submitForm.attachment_url ? "File Attached ✓" : "Upload File"}</span>
                    <UploadCloud className="w-4 h-4 text-slate-500" />
                  </label>
                </div>
              </div>
            </div>

            {submitForm.attachment_url && (
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                Attached: {submitForm.attachment_url}
              </p>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Submitting..." : "Submit Deliverable"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Mentor Task Assignment & Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Task Item" : "Assign Task to Engineering Project"}
        subtitle="Specify project, deliverables, mentor guidance notes, and target milestone week"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveTaskByMentor} className="space-y-4">
          {/* Project Selector */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Project *
              </label>
              {fetchingProjects && (
                <span className="text-[10px] text-blue-600 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Updating...
                </span>
              )}
            </div>

            {projectsList.length === 0 && !fetchingProjects ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>No Projects Available</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  No engineering projects have been created yet. Please create or assign a project first in Projects directory.
                </p>
                <Link
                  to="/projects"
                  onClick={() => setModalOpen(false)}
                  className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline text-[11px]"
                >
                  <span>Go to Projects Directory &rarr;</span>
                </Link>
              </div>
            ) : (
              <select
                required
                disabled={Boolean(editingTask)}
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
              >
                <option value="">Choose Project...</option>
                {projectsList.map((proj) => (
                  <option key={proj.id} value={String(proj.id)}>
                    {proj.title} (Track #{proj.internship_id})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Task Deliverable Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement JWT authentication and session tokens"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description & Acceptance Criteria</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide engineering specifics, pull request requirements, and scope..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          {/* Mentor Guidance Notes Field */}
          <div>
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
              Mentor Guidance & Instructions (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.mentor_notes}
              onChange={(e) => setFormData({ ...formData, mentor_notes: e.target.value })}
              placeholder="Specific architectural notes, coding guidelines, or resources for the intern..."
              className="w-full px-3.5 py-2 text-xs bg-amber-50/50 border border-amber-200/80 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
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
                value={formData.week_number}
                onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                {[1, 2, 3, 4, 5, 6].map((w) => (
                  <option key={w} value={w}>
                    Week {w} Milestone
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Estimated Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || projectsList.length === 0}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              {loading ? "Saving..." : editingTask ? "Update Task" : "Assign Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
