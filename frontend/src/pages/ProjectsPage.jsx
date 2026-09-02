import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  Plus,
  Github,
  ExternalLink,
  Code2,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  UserCheck,
  PlayCircle,
  CheckSquare,
  ArrowLeft,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  X,
  ChevronDown,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import { internshipService } from "../services/internshipService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import StatCard from "../components/common/StatCard";
import TaskKanban from "../components/intern/TaskKanban";

export default function ProjectsPage() {
  const { user, isIntern, isMentor, isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [internships, setInternships] = useState([]);
  const [activeInternship, setActiveInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Selected Project for On-Page Tasks Screen
  const [selectedProject, setSelectedProject] = useState(null);

  // Modal State for Project Create / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: "",
    repo_url: "",
    status: "not_started",
    internship_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [projectsData, tasksData, internshipsData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
        internshipService.getInternships()
      ]);

      setProjects(projectsData || []);
      setTasks(tasksData || []);
      setInternships(internshipsData || []);

      if (isIntern) {
        const myActive = (internshipsData || []).find(i => i.status === "active");
        setActiveInternship(myActive || null);
      }

      if (selectedProject) {
        const updatedSelected = (projectsData || []).find(p => p.id === selectedProject.id);
        if (updatedSelected) {
          setSelectedProject(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(err.message || "Failed to load project records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    const defaultInternshipId = internships[0]?.id || "";
    setFormData({
      title: "",
      description: "",
      technologies: "React, FastAPI, PostgreSQL, Tailwind CSS",
      repo_url: "https://github.com/NETSOL/internship-project",
      status: "not_started",
      internship_id: defaultInternshipId,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (e, proj) => {
    e.stopPropagation();
    setEditingProject(proj);
    setFormData({
      title: proj.title,
      description: proj.description || "",
      technologies: proj.technologies || "",
      repo_url: proj.repo_url || "",
      status: proj.status || "not_started",
      internship_id: proj.internship_id || "",
    });
    setModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Project title is required.");
      return;
    }

    try {
      setSaving(true);
      if (editingProject) {
        await projectService.updateProject(editingProject.id, formData);
      } else {
        const targetInternshipId = formData.internship_id || activeInternship?.id || (internships[0]?.id);
        if (!targetInternshipId) {
          alert("Please select an intern track to assign this project to.");
          return;
        }
        await projectService.createProject({
          ...formData,
          internship_id: parseInt(targetInternshipId),
        });
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error("Save project failed:", err);
      alert(err.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (e, project, newStatus) => {
    if (e) e.stopPropagation();
    try {
      setStatusUpdatingId(project.id);
      await projectService.updateProject(project.id, { status: newStatus });
      setActionSuccess(
        newStatus === "in_progress"
          ? `Project "${project.title}" started! Status set to In Progress.`
          : `Project "${project.title}" marked as ${newStatus.replace("_", " ")}.`
      );
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err) {
      console.error("Status update failed:", err);
      alert(err.message || "Failed to update project status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDeleteProject = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project? Associated tasks will be detached.")) {
      return;
    }
    try {
      await projectService.deleteProject(id);
      if (selectedProject?.id === id) {
        setSelectedProject(null);
      }
      loadData();
    } catch (err) {
      alert(err.message || "Failed to delete project.");
    }
  };

  // Filter projects based on search & dropdowns
  const displayedProjects = projects.filter((proj) => {
    const matchedInternship = internships.find((i) => i.id === proj.internship_id);
    const internName = matchedInternship?.intern?.profile?.full_name || matchedInternship?.intern?.email || "";

    // 1. Search Filter
    const term = search.toLowerCase().trim();
    if (term) {
      const title = proj.title?.toLowerCase() || "";
      const desc = proj.description?.toLowerCase() || "";
      const tech = proj.technologies?.toLowerCase() || "";
      const intern = internName.toLowerCase();

      const matchesSearch =
        title.includes(term) ||
        desc.includes(term) ||
        tech.includes(term) ||
        intern.includes(term);

      if (!matchesSearch) return false;
    }

    // 2. Status Filter
    if (selectedStatus !== "all") {
      const status = proj.status || "not_started";
      if (status !== selectedStatus) return false;
    }

    // 3. Department Filter
    if (selectedDept !== "all") {
      const dept = matchedInternship?.department || proj.department || "";
      if (dept !== selectedDept) return false;
    }

    return true;
  });

  const uniqueDepartments = Array.from(
    new Set([
      ...internships.map((i) => i.department),
      ...projects.map((p) => p.department),
    ].filter(Boolean))
  ).sort();

  const hasActiveFilters = search !== "" || selectedStatus !== "all" || selectedDept !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedDept("all");
  };

  // Computed KPI Metrics
  const inProgressCount = displayedProjects.filter((p) => p.status === "in_progress").length;
  const completedCount = displayedProjects.filter((p) => p.status === "completed").length;
  const totalTasksCount = tasks.length;
  const doneTasksCount = tasks.filter((t) => t.status === "done").length;

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading ? (
          <Loader message="Loading engineering projects & tasks..." />
        ) : selectedProject ? (
          /* ON-PAGE PROJECT TASKS SCREEN */
          <div className="space-y-6 animate-fadeIn">
            {/* Top Navigation Back Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  title="Back to All Projects"
                  className="w-10 h-10 rounded-2xl bg-white border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-black text-slate-800">Back to All Projects</span>
              </div>

              {/* Only Mentors can edit project details */}
              {isMentor && (
                <button
                  onClick={(e) => handleOpenEdit(e, selectedProject)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Project Details</span>
                </button>
              )}

              {/* Admin View-Only Notice */}
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Admin Read-Only Monitoring View</span>
                </span>
              )}
            </div>

            {/* Selected Project Overview Header Banner */}
            <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
                    <Code2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">{selectedProject.title}</h2>
                      <StatusBadge status={selectedProject.status || "not_started"} size="sm" />
                    </div>
                    {(() => {
                      const matchedInternship = internships.find(i => i.id === selectedProject.internship_id);
                      const internName = matchedInternship?.intern?.profile?.full_name || matchedInternship?.intern?.email || `Track #${selectedProject.internship_id}`;
                      return (
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>Assigned Intern: <strong className="text-slate-800">{internName}</strong></span>
                        </p>
                      );
                    })()}
                  </div>
                </div>

                {isIntern && selectedProject.status === "not_started" && (
                  <button
                    onClick={(e) => handleUpdateStatus(e, selectedProject, "in_progress")}
                    disabled={statusUpdatingId === selectedProject.id}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>{statusUpdatingId === selectedProject.id ? "Starting..." : "Start Project"}</span>
                  </button>
                )}
              </div>

              {selectedProject.description && (
                <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {selectedProject.description}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {selectedProject.technologies && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.technologies.split(",").map((t, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200/70">
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {selectedProject.repo_url && (
                  <a
                    href={selectedProject.repo_url}
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

            {/* Embedded Project Task Kanban Workspace Container */}
            <div className="bg-white rounded-3xl p-6 border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70">
              <TaskKanban
                tasks={tasks.filter((t) => t.project_id === selectedProject.id)}
                projects={[selectedProject]}
                onRefresh={loadData}
                allowCreate={isMentor}
                isIntern={isIntern}
                isAdmin={isAdmin}
                isMentor={isMentor}
              />
            </div>
          </div>
        ) : (
          /* ALL PROJECTS GRID VIEW WITH PREMIUM STYLING */
          <div className="space-y-6">

            {/* Top Metric Cards Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Projects"
                value={displayedProjects.length}
                subtitle={hasActiveFilters ? "Matching current filters" : "Engineering project tracks"}
                icon={FolderGit2}
                color="blue"
              />
              <StatCard
                title="In Progress"
                value={inProgressCount}
                subtitle="Active development sprints"
                icon={PlayCircle}
                color="indigo"
              />
              <StatCard
                title="Completed"
                value={completedCount}
                subtitle="Fully built & delivered"
                icon={CheckCircle2}
                color="emerald"
              />
              <StatCard
                title="Task Deliverables"
                value={`${doneTasksCount} / ${totalTasksCount}`}
                subtitle="Tasks completed overall"
                icon={CheckSquare}
                color="purple"
              />
            </div>

            {/* ========================================================= */}
            {/* UNIFIED FILTER & ACTION TOOLBAR CONTAINER CARD            */}
            {/* ========================================================= */}
            <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                {/* Left: Section Title / Badge */}
                <div className="h-11 bg-slate-100/80 px-4 rounded-2xl flex items-center gap-2 border border-slate-200/60 shadow-inner flex-shrink-0">
                  <FolderGit2 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-slate-800">
                    Projects Directory ({projects.length})
                  </span>
                </div>

                {/* Center: Search Input Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search projects by title, assigned intern, technology..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-11 pl-10 pr-8 text-xs bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all shadow-xs flex items-center"
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

                {/* Right: Filters Toggle & Action Button */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className={`h-11 inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-xs font-extrabold border transition-all shadow-xs whitespace-nowrap ${
                      showAdvancedFilters || hasActiveFilters
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

                  {isMentor && (
                    <button
                      onClick={handleOpenCreate}
                      className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Assign New Project</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Advanced Filters Drawer */}
              {showAdvancedFilters && (
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
                  {/* Status Dropdown */}
                  <div className="relative flex-1 min-w-[160px]">
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Department Dropdown */}
                  {uniqueDepartments.length > 0 && (
                    <div className="relative flex-1 min-w-[160px]">
                      <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                      >
                        <option value="all">All Departments</option>
                        {uniqueDepartments.map((dept) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}

                  {/* Icon-only Reset Button */}
                  <button
                    onClick={resetFilters}
                    title="Reset Filters"
                    className="h-11 w-11 inline-flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-colors flex-shrink-0"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* ========================================================= */}
            {/* PROJECT CARDS GRID (Preserving Card Layout)               */}
            {/* ========================================================= */}
            {displayedProjects.length === 0 ? (
              <EmptyState
                icon={FolderGit2}
                title={isIntern ? "No project assigned yet" : "No engineering projects match your criteria"}
                description={
                  hasActiveFilters
                    ? "No project records match your search or filter options."
                    : isIntern
                    ? "Your supervising mentor will assign your official engineering project track shortly."
                    : "Create and assign primary software engineering projects to your interns to organize tasks and sprints."
                }
                actionLabel={hasActiveFilters ? "Reset Filters" : isMentor ? "Assign First Project" : null}
                onAction={hasActiveFilters ? resetFilters : isMentor ? handleOpenCreate : null}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProjects.map((proj) => {
                  const techList = proj.technologies
                    ? proj.technologies.split(",").map((t) => t.trim()).filter(Boolean)
                    : [];
                  
                  const matchedInternship = internships.find(i => i.id === proj.internship_id);
                  const internName = matchedInternship?.intern?.profile?.full_name || matchedInternship?.intern?.email || `Track #${proj.internship_id}`;
                  const isNotStarted = proj.status === "not_started";

                  const projectTasks = tasks.filter(t => t.project_id === proj.id);
                  const doneCount = projectTasks.filter(t => t.status === "done").length;
                  const progressPercent = projectTasks.length > 0
                    ? Math.round((doneCount / projectTasks.length) * 100)
                    : 0;

                  return (
                    /* Entire Card is Clickable to Open Tasks Screen */
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProject(proj)}
                      className={`bg-white rounded-3xl p-6 border-[1.5px] shadow-md shadow-slate-200/70 flex flex-col justify-between transition-all cursor-pointer group hover:shadow-xl ${
                        isNotStarted
                          ? "border-amber-300/80 bg-amber-50/10 hover:border-amber-400"
                          : "border-slate-300 hover:border-blue-500"
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Header Row */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shadow-md flex-shrink-0 transition-transform group-hover:scale-105 ${
                              isNotStarted
                                ? "bg-amber-500 text-white shadow-amber-500/20"
                                : "bg-gradient-to-tr from-blue-600 to-indigo-700 text-white shadow-blue-500/20"
                            }`}>
                              <Code2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-base text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {proj.title}
                              </h4>
                              <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                <span className="truncate">{internName}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <StatusBadge status={proj.status || "not_started"} size="xs" />
                          </div>
                        </div>

                        {/* Description */}
                        {proj.description && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                            {proj.description}
                          </p>
                        )}

                        {/* Tech Stacks Tags */}
                        {techList.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {techList.map((tech, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-slate-100/90 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200/70"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Milestone & Tasks Progress Bar */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                              <span>{doneCount} / {projectTasks.length} Tasks Completed</span>
                            </span>
                            <span className="text-blue-600 font-black">{progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Quick Action Button for Intern Status Transition */}
                        {isIntern && isNotStarted && (
                          <button
                            onClick={(e) => handleUpdateStatus(e, proj, "in_progress")}
                            disabled={statusUpdatingId === proj.id}
                            className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group/btn"
                          >
                            <PlayCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span>{statusUpdatingId === proj.id ? "Starting..." : "Start Project"}</span>
                          </button>
                        )}
                      </div>

                      {/* Footer & Actions */}
                      <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between">
                        {proj.repo_url ? (
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                            <span>Code Repo</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">No repo attached</span>
                        )}

                        {isMentor && (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleOpenEdit(e, proj)}
                              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 flex items-center justify-center transition-all"
                              title="Edit Project Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleDeleteProject(e, proj.id)}
                              className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center transition-all"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Project Create / Edit Modal (For Mentors) */}
        {isMentor && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingProject ? "Edit Engineering Project" : "Assign Engineering Project to Intern"}
            subtitle="Define project deliverables, tech stacks, and assign to an intern"
          >
            <form onSubmit={handleSaveProject} className="space-y-4">
              {!editingProject && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Assign to Intern / Track *
                  </label>
                  <select
                    required
                    value={formData.internship_id}
                    onChange={(e) => setFormData({ ...formData, internship_id: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                  >
                    {internships.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.intern?.profile?.full_name || i.intern?.email} ({i.department} - Week {i.current_week})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key goals, architectural components, deliverables, and engineering scope..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technologies & Tools (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, FastAPI, PostgreSQL, Docker, Redis"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Code Repository URL
                </label>
                <input
                  type="url"
                  value={formData.repo_url}
                  onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                  placeholder="https://github.com/NETSOL/project-repo"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
                >
                  <option value="not_started">Not Started (Intern will click Start)</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingProject ? "Update Project" : "Assign Project"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </AppLayout>
  );
}
