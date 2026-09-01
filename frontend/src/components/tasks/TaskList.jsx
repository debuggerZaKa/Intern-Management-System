import React from "react";
import TaskItem from "./TaskItem";
import EmptyState from "../common/EmptyState";
import { CheckSquare } from "lucide-react";

export default function TaskList({ tasks = [], onEditTask, onDeleteTask }) {
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon={CheckSquare}
        title="No tasks found"
        description="No tasks are listed in this view."
      />
    );
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
        />
      ))}
    </div>
  );
}
