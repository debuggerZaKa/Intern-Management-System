import React from "react";
import { CheckSquare, Clock, Edit2, Trash2, Calendar } from "lucide-react";
import { formatTaskDate } from "../../utils/taskDateUtils";
import StatusBadge from "../common/StatusBadge";

export default function TaskItem({ task, onEdit, onDelete }) {
  if (!task) return null;

  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-blue-300 transition-all">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-xs text-slate-800">{task.title}</h4>
          <StatusBadge status={task.status} size="xs" />
        </div>
        {task.description && (
          <p className="text-[11px] text-slate-500 line-clamp-1">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
          {task.due_date && (
            <span className="flex items-center gap-1 text-slate-700 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
              <Calendar className="w-3 h-3 text-slate-500" />
              {formatTaskDate(task.due_date)}
            </span>
          )}
          <span>Week {task.week_number}</span>
          <span>&bull;</span>
          <span className="capitalize">Priority: {task.priority}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-slate-400 hover:text-blue-600 rounded"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-slate-400 hover:text-rose-600 rounded"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
