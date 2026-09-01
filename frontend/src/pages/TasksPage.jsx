import React, { useState, useEffect } from "react";
import { CheckSquare, Filter, FolderGit2 } from "lucide-react";
import { taskService } from "../services/taskService";
import { projectService } from "../services/projectService";
import { internshipService } from "../services/internshipService";
import { adminService } from "../services/adminService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import TaskKanban from "../components/intern/TaskKanban";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function TasksPage() {
  const { user, isIntern, isAdmin, isMentor } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [weekFilter, setWeekFilter] = useState("all");
  const [internFilter, setInternFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInternsAndProjects = async () => {
    try {
      const [projectsData, usersData] = await Promise.all([
        projectService.getProjects(),
        (isAdmin || isMentor) ? adminService.getUsers() : Promise.resolve([]),
      ]);

      setProjects(projectsData || []);

      if (isAdmin || isMentor) {
        const internUsers = (usersData || []).filter(
          (u) => u.role?.name === "intern"
        );
        setInterns(internUsers);
      }
    } catch (err) {
      console.error("Failed to load reference data:", err);
    }
  };

  const loadSelectedInternship = async (internId) => {
    if (!internId) {
      setSelectedInternship(null);
      return;
    }

    try {
      const data = await internshipService.getInternships({
        intern_id: parseInt(internId),
      });
      const activeInternship = (data || []).find(
        (internship) => internship.status === "active"
      );
      setSelectedInternship(activeInternship || null);
    } catch (err) {
      console.error("Failed to load selected intern's internship:", err);
      setSelectedInternship(null);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};

      if (internFilter) {
        params.intern_id = parseInt(internFilter);
      }

      if (projectFilter !== "all") {
        params.project_id = parseInt(projectFilter);
      }

      if (weekFilter !== "all") {
        params.week_number = parseInt(weekFilter);
      }

      const [data, freshProjects] = await Promise.all([
        taskService.getTasks(params),
        projectService.getProjects(),
      ]);

      setTasks(data || []);
      setProjects(freshProjects || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load task items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternsAndProjects();
  }, [user, isAdmin, isMentor]);

  useEffect(() => {
    loadTasks();
  }, [weekFilter, internFilter, projectFilter]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isIntern ? "My Engineering Task Board" : "Tasks Master Directory"}
            </h2>
            <p className="text-xs text-slate-500">
              {isIntern
                ? "View your mentor-assigned engineering deliverables, start tasks, and log completed hours"
                : "Assign, organize, and monitor task deliverables across engineering projects and intern tracks"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 shadow-xs"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  Project: {proj.title}
                </option>
              ))}
            </select>

            {/* Intern Filter - Admin & Mentor only */}
            {(isAdmin || isMentor) && (
              <select
                value={internFilter}
                onChange={(e) => {
                  const internId = e.target.value;
                  setInternFilter(internId);
                  setWeekFilter("all");
                  loadSelectedInternship(internId);
                }}
                className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 shadow-xs"
              >
                <option value="">All Interns</option>
                {interns.map((intern) => (
                  <option key={intern.id} value={intern.id}>
                    {intern.profile?.full_name || intern.email}
                  </option>
                ))}
              </select>
            )}

            {/* Week Filter */}
            <select
              value={weekFilter}
              onChange={(e) => setWeekFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 shadow-xs"
            >
              <option value="all">All Weeks</option>
              {[1, 2, 3, 4, 5, 6].map((w) => (
                <option key={w} value={w}>
                  Week {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {loading ? (
          <Loader message="Loading task boards..." />
        ) : (
          <TaskKanban
            tasks={tasks}
            projects={projects}
            onRefresh={loadTasks}
            allowCreate={isMentor || isAdmin}
            isIntern={isIntern}
            isAdmin={isAdmin}
            isMentor={isMentor}
          />
        )}
      </div>
    </AppLayout>
  );
}
