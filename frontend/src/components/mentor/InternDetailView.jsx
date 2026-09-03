import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  CheckSquare,
  AlertCircle,
  Award,
  Sparkles,
  Plus,
  Star,
  MessageSquare,
  Clock,
  ChevronRight,
  ShieldCheck,
  Brain,
  Github,
  ExternalLink,
  Code2,
  FolderGit2,
  PlayCircle,
  CheckCircle2,
  ChevronDown,
  RotateCcw,
  UserCheck,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  Building2,
  Search,
  Filter,
  Paperclip,
  Edit2,
  Trash2,
  X,
  Users,
  Eye,
  Camera,
  Upload,
  Info,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { mentorService } from "../../services/mentorService";
import { adminService } from "../../services/adminService";
import { feedbackService } from "../../services/feedbackService";
import { evaluationService } from "../../services/evaluationService";
import { projectService } from "../../services/projectService";
import { taskService } from "../../services/taskService";
import { aiService } from "../../services/aiService";
import { blockerService } from "../../services/blockerService";
import { userService } from "../../services/userService";
import { internshipService } from "../../services/internshipService";
import { getMediaUrl } from "../../utils/mediaUtils";
import { isTrackOngoing, getUniqueInternCurrentTracks } from "../../utils/internshipUtils";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import ProjectDetailsModal from "../common/ProjectDetailsModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import UserAvatar from "../common/UserAvatar";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import FeedbackModal from "./FeedbackModal";
import EvaluationModal from "./EvaluationModal";
import TaskKanban from "../intern/TaskKanban";
import ProjectCard from "./ProjectCard";
import { ReportsModal, FeedbackLogModal, AIInsightsModal } from "./InternProfileModals";

export default function InternDetailView({
  internId,
  initialTrackId = null,
  defaultToCompleted = false,
  onBack,
  isAdmin: propIsAdmin,
}) {
  const { isAdmin: authIsAdmin, user: authUser } = useAuth();
  const isAdmin = propIsAdmin ?? authIsAdmin ?? false;

  const [internship, setInternship] = useState(null);
  const [userAllInternships, setUserAllInternships] = useState([]);
  const [cohortInternships, setCohortInternships] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [trackHistoryModalOpen, setTrackHistoryModalOpen] = useState(false);
  const allProjectsCache = useRef([]);
  const [allAssignedInterns, setAllAssignedInterns] = useState([]);
  const [reports, setReports] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Project Drilldown (Renders full page view)
  const [selectedDetailProject, setSelectedDetailProject] = useState(null);
  const [projectDetailsPopupOpen, setProjectDetailsPopupOpen] = useState(false);

  // Modals state
  const [reportsModalOpen, setReportsModalOpen] = useState(false);
  const [feedbackLogModalOpen, setFeedbackLogModalOpen] = useState(false);
  const [aiInsightsModalOpen, setAiInsightsModalOpen] = useState(false);
  const [feedbackModalReport, setFeedbackModalReport] = useState(null);
  const [feedbackModalExisting, setFeedbackModalExisting] = useState(null);
  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);

  // Project Modal State (Create & Edit)
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectCoverFile, setProjectCoverFile] = useState(null);
  const [projectCoverPreview, setProjectCoverPreview] = useState(null);

  // Project Delete Confirmation Modal
  const [projectDeleteModal, setProjectDeleteModal] = useState({
    isOpen: false,
    project: null,
    isBlocked: false,
    blockedReason: "",
    dependencies: [],
    resolutionText: "",
    confirmText: "Delete Project",
    confirmLoading: false,
  });
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    technologies: "React, FastAPI, PostgreSQL",
    repo_url: "",
    status: "not_started",
    internship_ids: [],
  });

  // AI Summary State for Reports
  const [aiSummaryLoadingReportId, setAiSummaryLoadingReportId] = useState(null);
  const [aiSummaries, setAiSummaries] = useState({});

  const loadInternData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Attempt to fetch full internship details
      let internshipData = null;
      try {
        internshipData = await mentorService.getAssignedInternDetails(internId);
      } catch (err) {
        // Fallback for admin or unassigned intern: fetch user directly
        try {
          const allUsers = await adminService.getUsers();
          const targetUser = (allUsers || []).find((u) => u.id === internId);
          if (targetUser) {
            internshipData = {
              id: null,
              intern_id: targetUser.id,
              intern: targetUser,
              department: targetUser.profile?.department || "General Engineering",
              current_week: 1,
              duration_weeks: 6,
              status: "not_started",
            };
          }
        } catch (e) {
          // ignore
        }
      }

      const [allInternshipsData, reportsData, tasksData, blockersData, projectsData, assignedInternsData] = await Promise.all([
        internshipService.getInternships().catch(() => []),
        mentorService.getAssignedInternReports(internId).catch(() => []),
        mentorService.getAssignedInternTasks(internId).catch(() => []),
        mentorService.getAssignedInternBlockers(internId).catch(() => []),
        projectService.getProjects().catch(() => []),
        mentorService.getAssignedInterns().catch(() => []),
      ]);

      allProjectsCache.current = projectsData || [];

      // Filter and sort this intern's historical tracks:
      // Active ongoing track first, followed by completed tracks newest-to-oldest by ID descending
      const internTracks = (allInternshipsData || []).filter(
        (i) => i.intern_id === internId || i.intern?.id === internId
      );
      const sortedTracks = [...internTracks].sort((a, b) => {
        const aOngoing = isTrackOngoing(a.status) ? 1 : 0;
        const bOngoing = isTrackOngoing(b.status) ? 1 : 0;
        if (aOngoing !== bOngoing) return bOngoing - aOngoing;
        return (b.id || 0) - (a.id || 0);
      });
      setUserAllInternships(sortedTracks);

      let targetTrack = null;
      if (selectedTrackId != null) {
        targetTrack = sortedTracks.find((t) => Number(t.id) === Number(selectedTrackId));
      }
      if (!targetTrack && initialTrackId != null) {
        targetTrack = sortedTracks.find((t) => Number(t.id) === Number(initialTrackId));
      }
      if (!targetTrack && defaultToCompleted) {
        targetTrack = sortedTracks.find((t) => t.status === "completed");
      }
      if (!targetTrack) {
        targetTrack = sortedTracks.find((t) => isTrackOngoing(t.status));
      }
      if (!targetTrack) {
        targetTrack = sortedTracks[0] || internshipData;
      }

      const activeTrack = targetTrack;
      setInternship(activeTrack);
      setAllAssignedInterns(assignedInternsData || []);
      setCohortInternships(allInternshipsData || []);
      setReports(reportsData || []);
      setTasks(tasksData || []);
      setBlockers(blockersData || []);

      const filteredProjects = (projectsData || []).filter(
        (p) => activeTrack?.id && p.internship_id === activeTrack.id
      );
      setProjects(filteredProjects);

      // If a project was selected in drilldown, refresh its instance
      if (selectedDetailProject) {
        const updatedSelected = filteredProjects.find((p) => p.id === selectedDetailProject.id);
        if (updatedSelected) setSelectedDetailProject(updatedSelected);
      }

      if (activeTrack?.id) {
        try {
          const evalData = await evaluationService.getInternshipEvaluation(activeTrack.id);
          setEvaluation(evalData);
        } catch (e) {
          setEvaluation(null);
        }
      }
    } catch (err) {
      console.error("Failed to load intern details:", err);
      setError(err.message || "Failed to load intern details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchTrack = (trackId) => {
    setSelectedTrackId(trackId);
    const targetTrack = trackId != null
      ? userAllInternships.find((t) => Number(t.id) === Number(trackId))
      : (userAllInternships.find((t) => isTrackOngoing(t.status)) || userAllInternships[0]);

    if (targetTrack) {
      setInternship(targetTrack);
      const filteredProjects = (allProjectsCache.current || []).filter(
        (p) => p.internship_id === targetTrack.id
      );
      setProjects(filteredProjects);
      setSelectedDetailProject(null);
      if (targetTrack.id) {
        evaluationService.getInternshipEvaluation(targetTrack.id).then(setEvaluation).catch(() => setEvaluation(null));
      }
    }
  };

  useEffect(() => {
    if (internId) {
      loadInternData();
    }
  }, [internId, initialTrackId]);


  const handleOpenFeedback = async (report) => {
    setFeedbackModalReport(report);
    try {
      const fb = await feedbackService.getReportFeedback(report.id);
      setFeedbackModalExisting(fb);
    } catch (e) {
      setFeedbackModalExisting(null);
    }
  };

  const handleSummarizeReportWithAI = async (reportId) => {
    try {
      setAiSummaryLoadingReportId(reportId);
      const summaryRes = await aiService.summarizeReport(reportId);
      setAiSummaries((prev) => ({ ...prev, [reportId]: summaryRes }));
    } catch (err) {
      console.error("AI summarization failed:", err);
      alert(`AI Summarization error: ${err.message}`);
    } finally {
      setAiSummaryLoadingReportId(null);
    }
  };

  const handleOpenCreateProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: "",
      description: "",
      technologies: "React, FastAPI, PostgreSQL",
      repo_url: "",
      status: "not_started",
      internship_ids: internship?.id ? [internship.id] : [],
    });
    setProjectCoverFile(null);
    setProjectCoverPreview(null);
    setProjectModalOpen(true);
  };

  const handleOpenEditProject = (proj) => {
    setEditingProject(proj);
    const matchingInternshipIds = Array.from(
      new Set(
        (allProjectsCache.current || [])
          .filter((p) => p.title === proj.title && p.internship_id)
          .map((p) => p.internship_id)
      )
    );
    if (proj.internship_id && !matchingInternshipIds.includes(proj.internship_id)) {
      matchingInternshipIds.push(proj.internship_id);
    }
    if (internship?.id && !matchingInternshipIds.includes(internship.id)) {
      matchingInternshipIds.push(internship.id);
    }

    setProjectFormData({
      title: proj.title || "",
      description: proj.description || "",
      technologies: proj.technologies || "React, FastAPI, PostgreSQL",
      repo_url: proj.repo_url || "",
      status: proj.status || "in_progress",
      internship_ids: matchingInternshipIds.length > 0 ? matchingInternshipIds : (internship?.id ? [internship.id] : []),
    });
    setProjectCoverFile(null);
    setProjectCoverPreview(proj.image_url ? getMediaUrl(proj.image_url) : null);
    setProjectModalOpen(true);
  };

  const handleDeleteProject = (projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    if (isCompleted || isReadOnly) {
      setProjectDeleteModal({
        isOpen: true,
        project: proj,
        isBlocked: true,
        blockedReason: "This project belongs to an officially completed or read-only internship milestone.",
        dependencies: [
          "Archived Track Milestone",
          "Official certificate evaluation record"
        ],
        resolutionText: "Historical deliverables on finalized tracks cannot be removed to preserve academic records.",
        confirmText: "Dismiss",
        confirmLoading: false,
      });
      return;
    }

    const linkedTasks = tasks.filter((t) => t.project_id === projectId);
    const completedTasks = linkedTasks.filter((t) => t.status === "done").length;
    const activeTasks = linkedTasks.length - completedTasks;

    const dependencies = [];
    if (linkedTasks.length > 0) {
      dependencies.push(
        `${linkedTasks.length} Sprint Task(s) (${completedTasks} completed, ${activeTasks} in progress)`
      );
    }
    if (proj.image_url) {
      dependencies.push("Project Cover Media Asset");
    }
    if (proj.repo_url) {
      dependencies.push("Linked GitHub Code Repository Connection");
    }

    setProjectDeleteModal({
      isOpen: true,
      project: proj,
      isBlocked: false,
      blockedReason: "",
      dependencies,
      resolutionText: "",
      confirmText: linkedTasks.length > 0 ? `Delete Project & ${linkedTasks.length} Task(s)` : "Delete Project",
      confirmLoading: false,
    });
  };

  const confirmDeleteProjectInDetail = async () => {
    if (!projectDeleteModal.project) return;
    try {
      setProjectDeleteModal((prev) => ({ ...prev, confirmLoading: true }));
      await projectService.deleteProject(projectDeleteModal.project.id);
      if (selectedDetailProject?.id === projectDeleteModal.project.id) {
        setSelectedDetailProject(null);
      }
      setProjectDeleteModal((prev) => ({ ...prev, isOpen: false, project: null, confirmLoading: false }));
      loadInternData();
    } catch (err) {
      setProjectDeleteModal((prev) => ({ ...prev, confirmLoading: false }));
      alert(`Failed to delete project: ${err.message}`);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectFormData.title.trim()) {
      alert("Project title is required.");
      return;
    }
    if (!projectFormData.internship_ids || projectFormData.internship_ids.length === 0) {
      alert("Please select at least one intern to assign this project to.");
      return;
    }

    try {
      setProjectSaving(true);
      const targetIds = projectFormData.internship_ids;

      if (editingProject) {
        await projectService.updateProject(editingProject.id, {
          title: projectFormData.title,
          description: projectFormData.description,
          technologies: projectFormData.technologies,
          repo_url: projectFormData.repo_url,
          status: projectFormData.status,
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
          (allProjectsCache.current || []).filter((p) => p.title === editingProject.title).map((p) => p.internship_id)
        );
        for (const trackId of targetIds) {
          if (!existingTrackIds.has(trackId) && trackId !== editingProject.internship_id) {
            const newP = await projectService.createProject({
              title: projectFormData.title,
              description: projectFormData.description,
              technologies: projectFormData.technologies,
              repo_url: projectFormData.repo_url,
              status: projectFormData.status,
              internship_id: parseInt(trackId),
            });
            if (projectCoverFile && newP?.id) {
              await projectService.uploadProjectImage(newP.id, projectCoverFile).catch(() => {});
            }
          }
        }
      } else {
        for (const trackId of targetIds) {
          const newProj = await projectService.createProject({
            title: projectFormData.title,
            description: projectFormData.description,
            technologies: projectFormData.technologies,
            repo_url: projectFormData.repo_url,
            status: projectFormData.status,
            internship_id: parseInt(trackId),
          });

          if (projectCoverFile && newProj?.id) {
            try {
              await projectService.uploadProjectImage(newProj.id, projectCoverFile);
            } catch (imgErr) {
              console.warn("Project saved but cover upload failed:", imgErr);
            }
          }
        }
      }

      setProjectModalOpen(false);
      setEditingProject(null);
      setProjectFormData({
        title: "",
        description: "",
        technologies: "React, FastAPI, PostgreSQL",
        repo_url: "",
        status: "not_started",
        internship_ids: [],
      });
      setProjectCoverFile(null);
      setProjectCoverPreview(null);
      loadInternData();
    } catch (err) {
      console.error("Save project failed:", err);
      alert(err.message || "Failed to save project.");
    } finally {
      setProjectSaving(false);
    }
  };

  const handleProjectCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProjectCoverFile(file);
      setProjectCoverPreview(URL.createObjectURL(file));
    }
  };

  if (loading) {
    return <Loader message="Loading intern records & project cards..." />;
  }

  if (error) {
    return (
      <div className="space-y-4 -mt-2 sm:-mt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Interns"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-black text-slate-800">Back to Interns</span>
        </div>
        <ErrorMessage message={error} />
      </div>
    );
  }

  const intern = internship?.intern;
  const mentor = internship?.mentor || authUser;
  const currentWeek = internship?.current_week || 1;
  const duration = internship?.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));

  const isCompleted = internship?.status === "completed" || internship?.status === "terminated";
  const primaryActiveTrack = userAllInternships.find((t) => isTrackOngoing(t.status));
  const isViewingPastTrack = isCompleted || (primaryActiveTrack && internship?.id !== primaryActiveTrack.id && !isTrackOngoing(internship?.status));
  const isReadOnly = isAdmin || isViewingPastTrack;

  // Candidate chronological track sequence (Track #1, Track #2...)
  const chronologicalTracks = [...userAllInternships].sort(
    (a, b) => (new Date(a.start_date || 0) - new Date(b.start_date || 0)) || ((a.id || 0) - (b.id || 0))
  );
  const getTrackNumber = (trackId) => {
    const idx = chronologicalTracks.findIndex((t) => t.id === trackId);
    return idx >= 0 ? idx + 1 : trackId;
  };

  const formatTrackDates = (startDate, endDate) => {
    if (!startDate) return "Dates pending";
    try {
      const s = new Date(startDate);
      const sStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      if (!endDate) return `Started ${sStr}`;
      const e = new Date(endDate);
      const eStr = e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      return `${sStr} – ${eStr}`;
    } catch {
      return `${startDate} – ${endDate || "Ongoing"}`;
    }
  };

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const activeBlockersCount = blockers.filter((b) => b.status !== "resolved").length;

  // Skills tag list from reports
  const allSkills = new Set();
  reports.forEach((r) => {
    if (r.learnings_and_skills) {
      r.learnings_and_skills.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean) allSkills.add(clean);
      });
    }
  });

  const internAvatarUrl = intern?.profile?.avatar_url
    ? getMediaUrl(intern?.profile?.avatar_url)
    : null;

  // =========================================================================
  // 1. DEDICATED FULL-PAGE VIEW FOR SELECTED PROJECT (TASKS PAGE)
  // =========================================================================
  if (selectedDetailProject) {
    const selectedProjectCover = selectedDetailProject.image_url
      ? getMediaUrl(selectedDetailProject.image_url)
      : null;

    return (
      <div className="space-y-4 -mt-2 sm:-mt-3 animate-fadeIn">
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between gap-4 pb-1">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedDetailProject(null)}
              title="Back to Intern Profile & Projects"
              className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {selectedDetailProject.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="h-10 px-3.5 rounded-2xl bg-slate-100 border-2 border-slate-200 text-xs font-extrabold text-slate-700 hidden sm:inline-flex items-center gap-1.5 shadow-xs">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Intern: {intern?.profile?.full_name || intern?.email}</span>
            </span>

            {/* Info Icon Button on Top Right (Same row as Back button) */}
            <button
              type="button"
              onClick={() => setProjectDetailsPopupOpen(true)}
              title="View Project Specifications & Details"
              className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
            >
              <Info className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Full Task Kanban for this Specific Project */}
        <TaskKanban
          tasks={tasks.filter((t) => t.project_id === selectedDetailProject.id)}
          projects={[selectedDetailProject]}
          internship={internship}
          onRefresh={loadInternData}
          allowCreate={!isReadOnly}
          isMentor={!isAdmin}
        />

        {/* Project Details Popup Modal with Members */}
        <ProjectDetailsModal
          isOpen={projectDetailsPopupOpen}
          onClose={() => setProjectDetailsPopupOpen(false)}
          project={selectedDetailProject}
          tasks={tasks}
          intern={intern}
          mentor={mentor}
        />
      </div>
    );
  }

  // =========================================================================
  // 2. MAIN SPLIT SCREEN: LEFT (PROFILE & OVERVIEW) | RIGHT (PROJECT CARDS)
  // =========================================================================
  return (
    <div className="space-y-4 -mt-2 sm:-mt-3 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Interns Directory"
            className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              {intern?.profile?.full_name || intern?.email}
            </h1>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Internship Track Switcher Button (shown if intern has past/multiple tracks) */}
          {userAllInternships.length > 1 && (
            <button
              onClick={() => setTrackHistoryModalOpen(true)}
              className={`h-10 px-4 rounded-2xl text-xs font-black transition-all shadow-xs inline-flex items-center gap-2 hover:scale-[1.02] flex-shrink-0 border-2 cursor-pointer ${
                isViewingPastTrack
                  ? "bg-amber-500 hover:bg-amber-600 text-white border-amber-600"
                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 hover:border-blue-400"
              }`}
            >
              <Clock className={`w-4 h-4 ${isViewingPastTrack ? "text-white" : "text-blue-600"}`} />
              <span>
                {isViewingPastTrack
                  ? `Viewing Track #${getTrackNumber(internship?.id)} (Archived)`
                  : `Track History (${userAllInternships.length})`}
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>
          )}

          {/* Weekly Reports Button */}
          <button
            onClick={() => setReportsModalOpen(true)}
            className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-2xl text-xs font-black transition-all shadow-xs hover:border-blue-400 inline-flex items-center gap-2 hover:scale-[1.02] flex-shrink-0"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Weekly Reports ({reports.length})</span>
          </button>

          {/* Feedback Log Button */}
          <button
            onClick={() => setFeedbackLogModalOpen(true)}
            className="h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 rounded-2xl text-xs font-black transition-all shadow-xs hover:border-blue-400 inline-flex items-center gap-2 hover:scale-[1.02] flex-shrink-0"
          >
            <MessageSquare className="w-4 h-4 text-indigo-600" />
            <span>Feedback Log</span>
          </button>

          {/* AI Insights Button */}
          <button
            onClick={() => setAiInsightsModalOpen(true)}
            className="h-10 px-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 text-purple-800 border-2 border-purple-300/80 rounded-2xl text-xs font-black transition-all shadow-xs inline-flex items-center gap-2 hover:scale-[1.02] flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Insights</span>
          </button>

          {/* Final Evaluation Button — edit only for the submitting mentor, view-only for admin */}
          <button
            onClick={() => setEvaluationModalOpen(true)}
            className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] inline-flex items-center gap-2 flex-shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>
              {evaluation
                ? evaluation.mentor_id === authUser?.id
                  ? "Edit Evaluation"
                  : "View Evaluation"
                : "Final Evaluation"}
            </span>
          </button>
        </div>
      </div>

      {/* Archived Historical Track Notice Banner */}
      {isViewingPastTrack && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 font-bold text-amber-950">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Viewing <strong>Archived Historical Track #{getTrackNumber(internship?.id)}</strong> ({internship?.department || "General"} &bull; {internship?.duration_weeks} Weeks). All deliverables are in <strong>Read-Only</strong> mode.
            </span>
          </div>
          {primaryActiveTrack && primaryActiveTrack.id !== internship?.id && (
            <button
              onClick={() => handleSwitchTrack(primaryActiveTrack.id)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs transition-all hover:scale-105 flex-shrink-0 cursor-pointer"
            >
              Switch to Active Current Track (Track #{getTrackNumber(primaryActiveTrack.id)})
            </button>
          )}
        </div>
      )}

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: Profile, Details, and Overview Component     */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-4">
          
          {/* Intern Profile Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/50 space-y-5">
            {/* Top Profile Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Profile Photo Display */}
              <div>
                {internAvatarUrl ? (
                  <img
                    src={internAvatarUrl}
                    alt={intern?.profile?.full_name || "Intern"}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-white shadow-xl shadow-blue-500/15"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-2xl flex items-center justify-center shadow-xl shadow-blue-500/15">
                    {intern?.profile?.full_name?.slice(0, 2).toUpperCase() || "IN"}
                  </div>
                )}
              </div>

              {/* Name & Academic Meta */}
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  {intern?.profile?.full_name || intern?.email}
                </h2>
                <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center justify-center gap-1">
                  <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>
                    {intern?.profile?.university || "University"} &bull; {intern?.profile?.degree || "Degree"}
                  </span>
                </p>
                {intern?.profile?.semester && (
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    Semester: {intern.profile.semester}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div>
                <StatusBadge status={internship?.status || "active"} size="sm" />
              </div>
            </div>

            {/* Contact & Track Info */}
            <div className="space-y-2.5 pt-3 border-t-2 border-slate-100 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Email</span>
                  <p className="font-extrabold text-slate-800 truncate text-xs" title={intern?.email}>
                    {intern?.email || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Phone</span>
                  <p className="font-extrabold text-slate-800 truncate text-xs">
                    {intern?.profile?.phone || "No phone listed"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border-2 border-slate-200">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Track / Department</span>
                  <p className="font-extrabold text-slate-800 truncate text-xs">
                    {internship?.department || "General Engineering"}
                  </p>
                </div>
              </div>
            </div>

            {/* Bio if available */}
            {intern?.profile?.bio && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">
                  Candidate Bio
                </span>
                <p className="text-slate-600 font-medium leading-relaxed italic">
                  "{intern.profile.bio}"
                </p>
              </div>
            )}
          </div>

          {/* Overview & Analytics Stats Component */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/50 space-y-4">
            <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Internship Track Overview</span>
            </h3>

            {/* Milestone Progress Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Milestone Duration</span>
                </span>
                <span className="text-blue-600">
                  Week {currentWeek} of {duration} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Tasks Done
                </span>
                <p className="text-base font-black text-slate-900">
                  {completedTasks} / {tasks.length}
                </p>
                <p className="text-[11px] font-bold text-emerald-600">
                  {taskRate}% rate
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Reports
                </span>
                <p className="text-base font-black text-slate-900">
                  {reports.length} / {duration}
                </p>
                <p className="text-[11px] font-bold text-blue-600">
                  Submissions
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-1 col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Blockers
                    </span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {activeBlockersCount} Active Roadblocks
                    </p>
                  </div>
                  <AlertCircle
                    className={`w-5 h-5 ${
                      activeBlockersCount > 0 ? "text-rose-500" : "text-emerald-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Demonstrated Skills Tag Cloud */}
            <div className="pt-3 border-t-2 border-slate-100 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                Demonstrated Engineering Skills
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allSkills.size === 0 ? (
                  <p className="text-xs text-slate-400 italic">No skills tagged in submitted weekly reports yet.</p>
                ) : (
                  Array.from(allSkills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-slate-100 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-200/80"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: Project Cards (NFT-style Reference Cards)   */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 xl:col-span-8 space-y-4">
          
          {/* Projects Section Header */}
          <div className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md shadow-slate-200/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                Assigned Software Projects
              </h2>
            </div>

            {!isReadOnly && (
              <button
                onClick={handleOpenCreateProject}
                className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] inline-flex items-center gap-2 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Assign Project</span>
              </button>
            )}
          </div>

          {/* Project Cards Grid */}
          {projects.length === 0 ? (
            <EmptyState
              icon={FolderGit2}
              title="No projects assigned to this intern yet"
              description="Assign a software engineering project to organize sprints, deliverables, and tasks."
              actionLabel={!isReadOnly ? "Assign Project" : undefined}
              onAction={!isReadOnly ? () => setProjectModalOpen(true) : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.map((proj) => (
                <ProjectCard
                  key={proj.id}
                  project={proj}
                  tasks={tasks}
                  intern={intern}
                  mentor={mentor}
                  isReadOnly={isReadOnly}
                  onOpenProject={(p) => setSelectedDetailProject(p)}
                  onEditProject={handleOpenEditProject}
                  onDeleteProject={handleDeleteProject}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================= */}
      {/* ACTION MODALS                                             */}
      {/* ========================================================= */}

      {/* Weekly Reports Modal */}
      <ReportsModal
        isOpen={reportsModalOpen}
        onClose={() => setReportsModalOpen(false)}
        reports={reports}
        aiSummaries={aiSummaries}
        aiSummaryLoadingReportId={aiSummaryLoadingReportId}
        onSummarizeReport={handleSummarizeReportWithAI}
        onOpenFeedback={handleOpenFeedback}
        isAdmin={isAdmin}
      />

      {/* Feedback Log Modal */}
      <FeedbackLogModal
        isOpen={feedbackLogModalOpen}
        onClose={() => setFeedbackLogModalOpen(false)}
        reports={reports}
        onOpenFeedback={handleOpenFeedback}
        isAdmin={isAdmin}
      />

      {/* AI Insights Modal */}
      <AIInsightsModal
        isOpen={aiInsightsModalOpen}
        onClose={() => setAiInsightsModalOpen(false)}
        taskRate={taskRate}
        reportsCount={reports.length}
        evaluation={evaluation}
        tasks={tasks}
        blockers={blockers}
      />

      {/* Mentor Feedback Modal */}
      {feedbackModalReport && (
        <FeedbackModal
          isOpen={Boolean(feedbackModalReport)}
          onClose={() => setFeedbackModalReport(null)}
          report={feedbackModalReport}
          existingFeedback={feedbackModalExisting}
          onSuccess={loadInternData}
        />
      )}

      {/* Final Evaluation Modal */}
      {evaluationModalOpen && internship && (
        <EvaluationModal
          isOpen={evaluationModalOpen}
          onClose={() => setEvaluationModalOpen(false)}
          internship={internship}
          existingEvaluation={evaluation}
          isReadOnly={!!(evaluation && evaluation.mentor_id !== authUser?.id)}
          onSuccess={loadInternData}
        />
      )}

      {/* Assign / Edit Project Modal */}
      <Modal
        isOpen={projectModalOpen}
        onClose={() => {
          setProjectModalOpen(false);
          setEditingProject(null);
        }}
        title={
          editingProject
            ? `Edit Project: ${editingProject.title}`
            : `Assign Project to ${intern?.profile?.full_name || intern?.email}`
        }
        subtitle={
          editingProject
            ? "Update project specifications, status, tech stack, and cover image"
            : "Define project scope, cover image, tech stack, and repository template"
        }
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveProject} className="space-y-4 pt-1">
          {/* Multi-Select Intern Assignment */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                Assign Interns ({projectFormData.internship_ids?.length || 0} Selected) *
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() =>
                    setProjectFormData({
                      ...projectFormData,
                      internship_ids: (cohortInternships.length > 0 ? cohortInternships : [internship]).map((i) => i?.id).filter(Boolean),
                    })
                  }
                  className="text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setProjectFormData({ ...projectFormData, internship_ids: [] })}
                  className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Selected Intern Chips */}
            {projectFormData.internship_ids?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {projectFormData.internship_ids.map((id) => {
                  const matched = (cohortInternships.length > 0 ? cohortInternships : [internship]).find((i) => i?.id === id);
                  const name = matched?.intern?.profile?.full_name || matched?.intern?.email || (id === internship?.id ? (intern?.profile?.full_name || intern?.email) : `Track #${id}`);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold shadow-2xs animate-fadeIn"
                    >
                      <UserAvatar
                        avatarUrl={matched?.intern?.profile?.avatar_url || (id === internship?.id ? intern?.profile?.avatar_url : null)}
                        name={name}
                        size="xs"
                      />
                      <span className="truncate max-w-[120px]">{name}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setProjectFormData({
                            ...projectFormData,
                            internship_ids: projectFormData.internship_ids.filter((tid) => tid !== id),
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
              {getUniqueInternCurrentTracks(cohortInternships.length > 0 ? cohortInternships : [internship].filter(Boolean)).map((i) => {
                const isSelected = projectFormData.internship_ids?.includes(i.id);
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
                            setProjectFormData({
                              ...projectFormData,
                              internship_ids: [...(projectFormData.internship_ids || []), i.id],
                            });
                          } else {
                            setProjectFormData({
                              ...projectFormData,
                              internship_ids: (projectFormData.internship_ids || []).filter((id) => id !== i.id),
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
              value={projectFormData.title}
              onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
              placeholder="e.g. Enterprise Invoice Automation Microservice"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-bold"
            />
          </div>

          {/* Project Cover Image Option */}
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
                value={projectFormData.status}
                onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
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
              value={projectFormData.description}
              onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
              placeholder="Key deliverables, sprint architecture, and milestones..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Technologies & Tools
            </label>
            <input
              type="text"
              value={projectFormData.technologies}
              onChange={(e) => setProjectFormData({ ...projectFormData, technologies: e.target.value })}
              placeholder="React, FastAPI, PostgreSQL, Docker"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Repository URL
            </label>
            <input
              type="url"
              value={projectFormData.repo_url}
              onChange={(e) => setProjectFormData({ ...projectFormData, repo_url: e.target.value })}
              placeholder="https://github.com/NETSOL/project-repo"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setProjectModalOpen(false);
                setEditingProject(null);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={projectSaving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              {projectSaving ? "Saving..." : editingProject ? "Update Project" : "Assign Project"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Track History Switcher Modal */}
      <Modal
        isOpen={trackHistoryModalOpen}
        onClose={() => setTrackHistoryModalOpen(false)}
        title="Internship Track History"
        size="lg"
      >
        <div className="space-y-3 pt-1">
          {userAllInternships.map((track) => {
            const isSelected = internship?.id === track.id;
            const isOngoing = isTrackOngoing(track.status);
            const trackNum = getTrackNumber(track.id);
            const mentorName = track.mentor?.profile?.full_name || track.mentor?.email;

            return (
              <div
                key={track.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-blue-50/60 border-blue-500 shadow-sm shadow-blue-500/10 ring-1 ring-blue-500/30"
                    : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Track Info */}
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[11px] font-black tracking-wide">
                        Track #{trackNum}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {track.department || "General Engineering"}
                      </h4>
                      <StatusBadge status={track.status} size="sm" />
                    </div>

                    {/* Meta Details */}
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{formatTrackDates(track.start_date, track.end_date)}</span>
                      </span>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{track.duration_weeks || 6} Weeks</span>
                      </span>
                      {mentorName && (
                        <>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className="text-slate-700">{mentorName}</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center">
                    {isSelected ? (
                      <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-100 text-blue-800 text-xs font-black">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Viewing Now</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          handleSwitchTrack(track.id);
                          setTrackHistoryModalOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-black transition-all shadow-2xs hover:scale-[1.02] cursor-pointer"
                      >
                        <span>{isOngoing ? "Switch to Active Track" : "View Record"}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>

      {/* Universal Delete Confirmation & Warning Modal for Projects */}
      <DeleteConfirmModal
        isOpen={projectDeleteModal.isOpen}
        onClose={() => setProjectDeleteModal((prev) => ({ ...prev, isOpen: false, project: null }))}
        onConfirm={confirmDeleteProjectInDetail}
        title={projectDeleteModal.isBlocked ? "Cannot Delete Project" : "Delete Project"}
        itemName={projectDeleteModal.project?.title}
        isBlocked={projectDeleteModal.isBlocked}
        blockedReason={projectDeleteModal.blockedReason}
        dependencies={projectDeleteModal.dependencies}
        resolutionText={projectDeleteModal.resolutionText}
        confirmText={projectDeleteModal.confirmText}
        confirmLoading={projectDeleteModal.confirmLoading}
        warningMessage="Deleting this project will permanently remove all associated sprint tasks and intern contributions."
      />
    </div>
  );
}
