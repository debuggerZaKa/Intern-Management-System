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
  GraduationCap,
  Info
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
import ProjectCard from "../components/mentor/ProjectCard";
import ProjectDetailsModal from "../components/common/ProjectDetailsModal";
import UserAvatar from "../components/common/UserAvatar";
import { getMediaUrl } from "../utils/mediaUtils";
import { getUniqueInternCurrentTracks } from "../utils/internshipUtils";
import { Upload } from "lucide-react";

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
  const [projectInfoModalOpen, setProjectInfoModalOpen] = useState(false);

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
  const [projectCoverFile, setProjectCoverFile] = useState(null);
  const [projectCoverPreview, setProjectCoverPreview] = useState(null);
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

  const handleProjectCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProjectCoverFile(file);
      setProjectCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleOpenCreate = () => {
    setEditingProject(null);
    const defaultInternshipId = internships[0]?.id;
    setFormData({
      title: "",
      description: "",
      technologies: "React, FastAPI, PostgreSQL, Tailwind CSS",
      repo_url: "https://github.com/NETSOL/internship-project",
      status: "not_started",
      internship_ids: defaultInternshipId ? [defaultInternshipId] : [],
    });
    setProjectCoverFile(null);
    setProjectCoverPreview(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (e, proj) => {
    if (e) e.stopPropagation();
    setEditingProject(proj);
    const matchingInternshipIds = Array.from(
      new Set(
        projects
          .filter((p) => p.title === proj.title && p.internship_id)
          .map((p) => p.internship_id)
      )
    );
    if (!matchingInternshipIds.includes(proj.internship_id)) {
      matchingInternshipIds.push(proj.internship_id);
    }

    setFormData({
      title: proj.title,
      description: proj.description || "",
      technologies: proj.technologies || "",
      repo_url: proj.repo_url || "",
      status: proj.status || "not_started",
      internship_ids: matchingInternshipIds.length > 0 ? matchingInternshipIds : [proj.internship_id],
    });
    setProjectCoverFile(null);
    setProjectCoverPreview(proj.image_url ? getMediaUrl(proj.image_url) : null);
    setModalOpen(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Project title is required.");
      return;
    }
    if (!formData.internship_ids || formData.internship_ids.length === 0) {
      alert("Please select at least one intern to assign this project to.");
      return;
    }

    try {
      setSaving(true);
      const targetIds = formData.internship_ids;

      if (editingProject) {
        // Update the primary project
        await projectService.updateProject(editingProject.id, {
          title: formData.title,
          description: formData.description,
          technologies: formData.technologies,
          repo_url: formData.repo_url,
          status: formData.status,
        });

        if (projectCoverFile) {
          try {
            await projectService.uploadProjectImage(editingProject.id, projectCoverFile);
          } catch (imgErr) {
            console.warn("Cover image upload failed:", imgErr);
          }
        }

        // For any newly selected internship tracks, create project instances if not present
        const existingTrackIds = new Set(
          projects.filter((p) => p.title === editingProject.title).map((p) => p.internship_id)
        );
        for (const trackId of targetIds) {
          if (!existingTrackIds.has(trackId) && trackId !== editingProject.internship_id) {
            const newP = await projectService.createProject({
              title: formData.title,
              description: formData.description,
              technologies: formData.technologies,
              repo_url: formData.repo_url,
              status: formData.status,
              internship_id: parseInt(trackId),
            });
            if (projectCoverFile && newP?.id) {
              await projectService.uploadProjectImage(newP.id, projectCoverFile).catch(() => {});
            }
          }
        }
      } else {
        // Create project for each selected internship track
        for (const trackId of targetIds) {
          const createdProj = await projectService.createProject({
            title: formData.title,
            description: formData.description,
            technologies: formData.technologies,
            repo_url: formData.repo_url,
            status: formData.status,
            internship_id: parseInt(trackId),
          });

          if (projectCoverFile && createdProj?.id) {
            try {
              await projectService.uploadProjectImage(createdProj.id, projectCoverFile);
            } catch (imgErr) {
              console.warn("Cover image upload failed:", imgErr);
            }
          }
        }
      }

      setModalOpen(false);
      setEditingProject(null);
      setProjectCoverFile(null);
      setProjectCoverPreview(null);
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
      <div className={`animate-fadeIn ${selectedProject ? "space-y-3.5 -mt-2 sm:-mt-3" : "space-y-6"}`}>
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
          <div className="space-y-3.5 animate-fadeIn">
            {/* Top Navigation Back Header */}
            <div className="flex items-center justify-between gap-4 pb-1">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedProject(null)}
                  title="Back to All Projects"
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedProject.title}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Only Mentors / Admins can edit project details */}
                {(isMentor || isAdmin) && (
                  <button
                    onClick={(e) => handleOpenEdit(e, selectedProject)}
                    className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Edit Project</span>
                  </button>
                )}

                {/* Info Icon Button on Top Right (Same row as Back button) */}
                <button
                  type="button"
                  onClick={() => setProjectInfoModalOpen(true)}
                  title="View Project Specifications & Details"
                  className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Info className="w-5 h-5 text-blue-600" />
                </button>
              </div>
            </div>

            {/* Embedded Project Task Kanban */}
            <TaskKanban
              tasks={tasks.filter((t) => t.project_id === selectedProject.id)}
              projects={[selectedProject]}
              onRefresh={loadData}
              allowCreate={isMentor || isAdmin}
              isIntern={isIntern}
              isAdmin={isAdmin}
              isMentor={isMentor}
            />

            {/* Project Details Popup Modal with Members */}
            <ProjectDetailsModal
              isOpen={projectInfoModalOpen}
              onClose={() => setProjectInfoModalOpen(false)}
              project={selectedProject}
              tasks={tasks}
              intern={internships.find((i) => i.id === selectedProject.internship_id)?.intern}
              mentor={internships.find((i) => i.id === selectedProject.internship_id)?.mentor}
            />
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
            {/* PROJECT CARDS GRID (Using NFT-Style ProjectCard)          */}
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
                actionLabel={hasActiveFilters ? "Reset Filters" : (isMentor || isAdmin) ? "Assign First Project" : null}
                onAction={hasActiveFilters ? resetFilters : (isMentor || isAdmin) ? handleOpenCreate : null}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedProjects.map((proj) => {
                  const matchedInternship = internships.find((i) => i.id === proj.internship_id);

                  return (
                    <ProjectCard
                      key={proj.id}
                      project={proj}
                      tasks={tasks}
                      intern={matchedInternship?.intern}
                      mentor={matchedInternship?.mentor}
                      isReadOnly={isIntern}
                      onOpenProject={(p) => setSelectedProject(p)}
                      onEditProject={(p) => handleOpenEdit(null, p)}
                      onDeleteProject={(id) => handleDeleteProject(null, id)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Project Create / Edit Modal (For Mentors & Admins) */}
        {(isMentor || isAdmin) && (
          <Modal
            isOpen={modalOpen}
            onClose={() => {
              setModalOpen(false);
              setEditingProject(null);
            }}
            title={editingProject ? `Edit Project: ${editingProject.title}` : "Assign Engineering Project to Intern"}
            subtitle="Define project deliverables, cover image, tech stacks, and assign to an intern"
            maxWidth="max-w-xl"
          >
            <form onSubmit={handleSaveProject} className="space-y-4 pt-1">
              {/* Multi-Select Intern Assignment */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                    Assign Interns ({formData.internship_ids?.length || 0} Selected) *
                  </label>
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          internship_ids: internships.map((i) => i.id),
                        })
                      }
                      className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, internship_ids: [] })}
                      className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Selected Intern Chips */}
                {formData.internship_ids?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {formData.internship_ids.map((id) => {
                      const matched = internships.find((i) => i.id === id);
                      const name = matched?.intern?.profile?.full_name || matched?.intern?.email || `Track #${id}`;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs animate-fadeIn"
                        >
                          <UserAvatar
                            avatarUrl={matched?.intern?.profile?.avatar_url}
                            name={name}
                            size="xs"
                          />
                          <span className="truncate max-w-[120px]">{name}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                internship_ids: formData.internship_ids.filter((tid) => tid !== id),
                              })
                            }
                            className="p-0.5 hover:bg-blue-200 rounded-full text-blue-600 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}

                {/* Candidate Selection List */}
                <div className="max-h-44 overflow-y-auto border-2 border-slate-200 rounded-2xl p-2 bg-slate-50 divide-y divide-slate-100 space-y-1">
                  {getUniqueInternCurrentTracks(internships).map((i) => {
                    const isSelected = formData.internship_ids?.includes(i.id);
                    const iName = i.intern?.profile?.full_name || i.intern?.email || "Intern";

                    return (
                      <label
                        key={i.id}
                        className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? "bg-blue-100/70 border border-blue-300"
                            : "bg-white hover:bg-slate-100/80 border border-slate-200/60"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  internship_ids: [...(formData.internship_ids || []), i.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  internship_ids: (formData.internship_ids || []).filter((id) => id !== i.id),
                                });
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <UserAvatar
                            avatarUrl={i.intern?.profile?.avatar_url}
                            name={iName}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {iName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {i.department} &bull; Week {i.current_week} of {i.duration_weeks}W
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex-shrink-0">
                            Assigned
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. NETSOL Cloud Lease Optimization Engine"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold"
                />
              </div>

              {/* Project Cover Image Section */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Project Cover Image
                </label>
                <div className="space-y-2">
                  {projectCoverPreview ? (
                    <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-slate-200 group bg-slate-900">
                      <img
                        src={projectCoverPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                        <label className="px-3 py-1.5 bg-white text-slate-900 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100 shadow-md">
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProjectCoverChange}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectCoverFile(null);
                            setProjectCoverPreview(null);
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-md"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="w-full py-4 px-3 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all text-xs text-slate-500">
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="font-bold">Upload project cover image (PNG, JPG, WEBP)</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProjectCoverChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {editingProject && (
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Project Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Project Scope & Deliverables
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key goals, architectural components, deliverables, and engineering scope..."
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Technologies & Tools (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  placeholder="React, FastAPI, PostgreSQL, Docker, Redis"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Code Repository URL
                </label>
                <input
                  type="url"
                  value={formData.repo_url}
                  onChange={(e) => setFormData({ ...formData, repo_url: e.target.value })}
                  placeholder="https://github.com/NETSOL/project-repo"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50"
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
