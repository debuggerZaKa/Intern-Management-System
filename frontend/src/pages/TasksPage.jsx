import React from "react";
import Navbar from "../components/common/Navbar";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-slate-900">Tasks & Kanban Board</h1>
      </div>
    </div>
  );
}
