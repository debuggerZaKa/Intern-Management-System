import React from "react";
import {
  Code2,
  FolderGit2,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  Layers,
  Users,
  Copy,
  Calendar,
  AlertCircle,
  FileCheck2,
  Terminal,
  Cpu,
  UserCheck
} from "lucide-react";
import Modal from "./Modal";
import StatusBadge from "./StatusBadge";
import { getMediaUrl } from "../../utils/mediaUtils";

export default function ProjectDetailsModal({
  isOpen,
  onClose,
  project,
  tasks = [],
  intern = null,
  mentor = null,
}) {
  if (!project) return null;

  const projectTasks = (tasks || []).filter((t) => t.project_id === project.id);
  const doneTasksCount = projectTasks.filter((t) => t.status === "done").length;
  const inProgressTasksCount = projectTasks.filter((t) => t.status === "in_progress").length;
  const todoTasksCount = projectTasks.filter((t) => t.status === "todo" || t.status === "backlog").length;
  const progressPercent =
    projectTasks.length > 0
      ? Math.round((doneTasksCount / projectTasks.length) * 100)
      : 0;

  const projectCover = project?.image_url
    ? getMediaUrl(project.image_url)
    : null;

  // Resolve all actual distinct interns assigned to this project and its tasks
  const assignedInternsMap = new Map();
  if (intern && intern.id) {
    assignedInternsMap.set(intern.id, intern);
  }
  projectTasks.forEach((t) => {
    if (t.intern && t.intern.id && !assignedInternsMap.has(t.intern.id)) {
      assignedInternsMap.set(t.intern.id, t.intern);
    }
  });
  const assignedInterns = Array.from(assignedInternsMap.values());

  const mentorAvatar = mentor?.profile?.avatar_url
    ? getMediaUrl(mentor?.profile?.avatar_url)
    : null;
  const mentorName = mentor?.profile?.full_name || mentor?.email || "Supervising Mentor";

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Repository URL copied to clipboard!");
  };

  const techList = project.technologies
    ? project.technologies.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const totalMembersCount = assignedInterns.length + (mentor ? 1 : 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project.title}
      subtitle="Project Architecture, Team Members & Deliverables"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5 pt-1">
        {/* ========================================================= */}
        {/* 1. HERO PROJECT BANNER / IMAGE                            */}
        {/* ========================================================= */}
        {projectCover ? (
          <div className="relative w-full h-48 sm:h-52 rounded-3xl overflow-hidden border-2 border-slate-200 shadow-md bg-slate-950 group">
            <img
              src={projectCover}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute top-3.5 left-3.5 shadow-md backdrop-blur-md">
              <StatusBadge status={project.status || "not_started"} size="xs" />
            </div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block mb-0.5">
                Software Engineering Project
              </span>
              <h3 className="text-lg font-black text-white tracking-tight drop-shadow-sm truncate">
                {project.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-2 border-slate-800 shadow-md flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 block">
                  Software Engineering Track
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  {project.title}
                </h3>
              </div>
            </div>
            <StatusBadge status={project.status || "not_started"} size="xs" />
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. SPRINT KPI METRICS ROW                                 */}
        {/* ========================================================= */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Deliverables
            </span>
            <p className="text-base font-black text-slate-900 mt-0.5">
              {projectTasks.length} Tasks
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <p className="text-base font-black text-emerald-600 mt-0.5">
              {doneTasksCount} / {projectTasks.length} ({progressPercent}% )
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              In Progress
            </span>
            <p className="text-base font-black text-blue-600 mt-0.5">
              {inProgressTasksCount} Active
            </p>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. ASSIGNED PROJECT MEMBERS SECTION                       */}
        {/* ========================================================= */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Project Members ({totalMembersCount})</span>
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Assigned Interns */}
            {assignedInterns.map((assignedIntern) => {
              const iName = assignedIntern?.profile?.full_name || assignedIntern?.email || "Intern";
              const iAvatar = assignedIntern?.profile?.avatar_url
                ? getMediaUrl(assignedIntern.profile.avatar_url)
                : null;
              const iDegree = assignedIntern?.profile?.degree || assignedIntern?.profile?.university || assignedIntern?.email;

              return (
                <div
                  key={assignedIntern.id}
                  className="p-3.5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-xs flex items-center gap-3"
                >
                  {iAvatar ? (
                    <img
                      src={iAvatar}
                      alt={iName}
                      className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                      {iName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        Intern
                      </span>
                    </div>
                    <p className="font-black text-xs text-slate-900 truncate mt-1" title={iName}>
                      {iName}
                    </p>
                    <p className="text-[11px] text-slate-400 font-semibold truncate" title={iDegree}>
                      {iDegree}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Supervising Mentor */}
            {mentor && (
              <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-xs flex items-center gap-3">
                {mentorAvatar ? (
                  <img
                    src={mentorAvatar}
                    alt={mentorName}
                    className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {mentorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                      Mentor
                    </span>
                  </div>
                  <p className="font-black text-xs text-slate-900 truncate mt-1" title={mentorName}>
                    {mentorName}
                  </p>
                  <p className="text-[11px] text-slate-400 font-semibold truncate">
                    {mentor?.profile?.department || mentor?.email}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. SCOPE & DELIVERABLES                                   */}
        {/* ========================================================= */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-blue-600" />
            <span>Scope & Architecture Specifications</span>
          </h4>
          <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
            {project.description || "No detailed technical description specified for this engineering track."}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 5. TECH STACK & TOOLS                                     */}
        {/* ========================================================= */}
        {techList.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span>Technologies & Tooling</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {techList.map((tech, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 6. GITHUB REPOSITORY LINK                                 */}
        {/* ========================================================= */}
        {project.repo_url && (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-800" />
              <span>Version Control Repository</span>
            </h4>
            <div className="flex items-center gap-2 p-3 bg-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
              <Terminal className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span className="font-mono text-xs text-slate-200 truncate flex-1 select-all">
                {project.repo_url}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(project.repo_url)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex-shrink-0 cursor-pointer"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex-shrink-0"
                title="Open Repository in New Tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </Modal>
  );
}
