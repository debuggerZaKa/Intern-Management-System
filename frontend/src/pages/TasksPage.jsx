import React, { useState, useEffect } from "react";
import { CheckSquare, Filter } from "lucide-react";
import { taskService } from "../services/taskService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import TaskKanban from "../components/intern/TaskKanban";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import { internshipService } from "../services/internshipService";
import { adminService } from "../services/adminService";

export default function TasksPage() {
  const { isIntern, isAdmin, isMentor } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [weekFilter, setWeekFilter] = useState("all");
  const [internFilter, setInternFilter] = useState("");
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [interns, setInterns] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  const loadInterns = async () => {
  if (!isAdmin && !isMentor) return;

  try {
    const data = await adminService.getUsers();

    const internUsers = (data || []).filter(
      (user) => user.role?.name === "intern"
    );

    setInterns(internUsers);
  } catch (err) {
    console.error("Failed to load interns:", err);
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

    // Get active internship
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

      if (weekFilter !== "all") {
        params.week_number = parseInt(weekFilter);
      }
      const data = await taskService.getTasks(params);
      setTasks(data || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setError(err.message || "Failed to load task items.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  loadInterns();
}, [isAdmin, isMentor]);

  useEffect(() => {
    loadTasks();
  }, [weekFilter, internFilter]);

  return (
  <AppLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {isIntern ? "My Engineering Task Board" : "Tasks Master Directory"}
          </h2>

          <p className="text-xs text-slate-500">
            Manage work items, update kanban progress, and record logged hours
          </p>
        </div>

        <div className="flex items-center gap-2">
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
              <option value="">Select Intern</option>

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

            {Array.from(
              {
                length: selectedInternship?.duration_weeks || 0,
              },
              (_, index) => index + 1
            ).map((w) => (
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
          onRefresh={loadTasks}
          allowCreate={isIntern || isMentor}
          isAdmin={isAdmin}
        />
      )}
    </div>
  </AppLayout>
);
}
