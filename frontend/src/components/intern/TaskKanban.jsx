import React, { useState } from "react";
import { Plus, CheckSquare, Clock, Edit2, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { taskService } from "../../services/taskService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function TaskKanban({
  tasks = [],
  onRefresh,
  allowCreate = true,
  isAdmin = false,
})  {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    week_number: 1,
    status: "todo",
    estimated_hours: 4,
    actual_hours: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      week_number: 1,
      status: "todo",
      estimated_hours: 4,
      actual_hours: 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      week_number: task.week_number || 1,
      status: task.status || "todo",
      estimated_hours: task.estimated_hours || 0,
      actual_hours: task.actual_hours || 0,
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (editingTask) {
        await taskService.updateTask(editingTask.id, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
          week_number: parseInt(formData.week_number),
          estimated_hours: parseFloat(formData.estimated_hours) || 0,
          actual_hours: parseFloat(formData.actual_hours) || 0,
        });
      } else {
        await taskService.createTask({
          title: formData.title,
          description: formData.description,
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
      await taskService.updateTask(task.id, { status: newStatus });
      onRefresh?.();
    } catch (err) {
      console.error("Failed to update status:", err);
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

  const todoTasks = tasks.filter((t) => t.status === "todo");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const doneTasks = tasks.filter((t) => t.status === "done");

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Kanban Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Interactive Task Kanban</h3>
          <p className="text-xs text-slate-500">Track tasks, update progression states, and log engineering hours</p>
        </div>
        {allowCreate && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Column 1: To Do */}
        <div className="bg-slate-100/70 p-4 rounded-2xl space-y-3 flex flex-col">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">To Do</span>
            <span className="text-xs bg-slate-200 font-bold px-2 py-0.5 rounded-full text-slate-700">
              {todoTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {todoTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2.5 text-xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                    Week {task.week_number}
                  </span>
                  {!isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  )}
                </div>

                <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
                {task.description && (
                  <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{task.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.estimated_hours || 0}h est
                  </span>
                 {!isAdmin && (
                <button
                  onClick={() => handleQuickStatusChange(task, "in_progress")}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-lg"
                >
                  Start &rarr;
                </button>
              )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-blue-50/50 p-4 rounded-2xl space-y-3 border border-blue-100/60 flex flex-col">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">In Progress</span>
            <span className="text-xs bg-blue-200 font-bold px-2 py-0.5 rounded-full text-blue-800">
              {inProgressTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {inProgressTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-blue-200/80 shadow-xs space-y-2.5 text-xs group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Week {task.week_number}
                  </span>
                  {!isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  )}
                </div>

                <p className="font-bold text-slate-900 leading-snug">{task.title}</p>
                {task.description && (
                  <p className="text-slate-500 text-[11px] line-clamp-2 leading-relaxed">{task.description}</p>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {task.actual_hours || 0}h logged
                  </span>
                  {!isAdmin && (
                  <button
                    onClick={() => handleQuickStatusChange(task, "done")}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg"
                  >
                    Complete ✓
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Done */}
        <div className="bg-emerald-50/50 p-4 rounded-2xl space-y-3 border border-emerald-100/60 flex flex-col">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Done</span>
            <span className="text-xs bg-emerald-200 font-bold px-2 py-0.5 rounded-full text-emerald-800">
              {doneTasks.length}
            </span>
          </div>

          <div className="space-y-2.5 flex-1">
            {doneTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white p-4 rounded-xl border border-emerald-200/80 shadow-xs space-y-2 text-xs opacity-90 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    Week {task.week_number}
                  </span>
                  {!isAdmin && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 text-slate-400 hover:text-blue-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  )}
                </div>

                <p className="font-bold text-slate-700 line-through decoration-emerald-500 leading-snug">
                  {task.title}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                  <span>Completed</span>
                  <span>{task.actual_hours || 0}h total</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Task Item" : "Create New Task"}
        subtitle="Define milestone scope, target week, and logged hours"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Implement JWT authentication middleware"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide technical specifics and acceptance criteria..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Week Number</label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.week_number}
                onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Hours</label>
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Logged Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={formData.actual_hours}
                onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
              />
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
              disabled={loading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              {loading ? "Saving..." : editingTask ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
