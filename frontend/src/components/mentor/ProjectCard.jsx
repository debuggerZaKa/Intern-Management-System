import React from "react";
import {
  Code2,
  FolderGit2,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Edit2,
  Trash2,
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import { getMediaUrl } from "../../utils/mediaUtils";

export default function ProjectCard({
  project,
  tasks = [],
  intern,
  mentor,
  isReadOnly = false,
  onOpenProject,
  onEditProject,
  onDeleteProject,
}) {
  const projectTasks = tasks.filter((t) => t.project_id === project.id);
  const completedCount = projectTasks.filter((t) => t.status === "done").length;
  const progressPercent =
    projectTasks.length > 0
      ? Math.round((completedCount / projectTasks.length) * 100)
      : 0;

  const internName = intern?.profile?.full_name || intern?.email || "Intern";
  const internAvatar = intern?.profile?.avatar_url
    ? getMediaUrl(intern?.profile?.avatar_url)
    : null;

  const mentorName = mentor?.profile?.full_name || mentor?.email || "Mentor";
  const mentorAvatar = mentor?.profile?.avatar_url
    ? getMediaUrl(mentor?.profile?.avatar_url)
    : null;

  const projectCover = project?.image_url
    ? getMediaUrl(project.image_url)
    : null;

  // Get all unique interns assigned to this project and its tasks
  const projectInternsMap = new Map();
  if (intern && intern.id) {
    projectInternsMap.set(intern.id, intern);
  }
  projectTasks.forEach((t) => {
    if (t.intern && t.intern.id && !projectInternsMap.has(t.intern.id)) {
      projectInternsMap.set(t.intern.id, t.intern);
    }
  });
  const assignedMembers = Array.from(projectInternsMap.values());
  const memberCount = assignedMembers.length;

  return (
    <div className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md shadow-slate-200/60 hover:shadow-xl hover:border-blue-500 transition-all duration-300 flex flex-col justify-between group space-y-4">
      <div className="space-y-4">
        {/* Top Header Row (Assigned to / Mentor) */}
        <div className="flex items-center justify-between gap-2 pb-1 text-xs">
          {/* Assigned Intern(s) */}
          {memberCount > 1 ? (
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex -space-x-2 overflow-hidden flex-shrink-0">
                {assignedMembers.slice(0, 3).map((m) => {
                  const mAvatar = m.profile?.avatar_url ? getMediaUrl(m.profile.avatar_url) : null;
                  const mName = m.profile?.full_name || m.email || "Intern";
                  return mAvatar ? (
                    <img
                      key={m.id}
                      src={mAvatar}
                      alt={mName}
                      className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                  ) : (
                    <div
                      key={m.id}
                      className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white shadow-xs"
                    >
                      {mName.slice(0, 2).toUpperCase()}
                    </div>
                  );
                })}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                  Assigned
                </span>
                <p className="font-extrabold text-slate-800 truncate text-[11px]">
                  {memberCount} Members
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {internAvatar ? (
                <img
                  src={internAvatar}
                  alt={internName}
                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs flex-shrink-0">
                  {internName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                  Assigned to
                </span>
                <p
                  className="font-extrabold text-slate-800 truncate text-[11px]"
                  title={internName}
                >
                  {internName}
                </p>
              </div>
            </div>
          )}

          {/* Mentor */}
          <div className="flex items-center gap-2 min-w-0 text-right">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                Mentor
              </span>
              <p
                className="font-extrabold text-slate-800 truncate text-[11px]"
                title={mentorName}
              >
                {mentorName}
              </p>
            </div>
            {mentorAvatar ? (
              <img
                src={mentorAvatar}
                alt={mentorName}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white text-[11px] font-black flex items-center justify-center shadow-xs flex-shrink-0">
                {mentorName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Hero Featured Project Image Section (Reference layout) */}
        <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 flex items-center justify-center shadow-inner group/img border border-slate-200/80">
          {projectCover ? (
            <img
              src={projectCover}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 text-center">
              {/* Abstract decorative 3D glowing background */}
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-400 shadow-xl mb-2 group-hover:scale-110 transition-transform">
                <Code2 className="w-8 h-8 text-blue-300" />
              </div>
              <span className="text-xs font-bold text-blue-200/80">
                Software Engineering Project
              </span>
            </div>
          )}

          {/* Status Badge floating overlay */}
          <div className="absolute top-3 left-3 shadow-md backdrop-blur-md">
            <StatusBadge status={project.status || "in_progress"} size="xs" />
          </div>
        </div>

        {/* Project Details Section */}
        <div className="space-y-2.5">
          <h4
            className="font-black text-base text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-1"
            title={project.title}
          >
            {project.title}
          </h4>

          {project.description && (
            <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          {/* Tech Stack Pills */}
          {project.technologies && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.technologies.split(",").slice(0, 4).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg border border-slate-200/80"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Metrics & Actions */}
      <div className="pt-3 border-t-2 border-slate-100 space-y-3">
        {/* Progress Metric Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
            <span className="flex items-center gap-1 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>Sprint Progress</span>
            </span>
            <span className="text-blue-600">
              {completedCount}/{projectTasks.length} Tasks ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Actions Row: Solid Icon-Only Buttons (Edit, Delete, Git Repo) + View Tasks */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <>
                {/* Edit Button (Solid Indigo) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditProject) onEditProject(project);
                  }}
                  title="Edit Project"
                  className="w-9 h-9 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 transition-all hover:scale-105 cursor-pointer flex-shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete Button (Solid Rose) */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onDeleteProject) onDeleteProject(project.id);
                  }}
                  title="Delete Project"
                  className="w-9 h-9 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-500/25 transition-all hover:scale-105 cursor-pointer flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Git Repo Button (Solid Slate-900) */}
            {project.repo_url ? (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Open GitHub Repository"
                className="w-9 h-9 rounded-2xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-md shadow-slate-900/25 transition-all hover:scale-105 cursor-pointer flex-shrink-0"
              >
                <Github className="w-4 h-4" />
              </a>
            ) : (
              <button
                type="button"
                disabled
                title="No Repository Linked"
                className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center cursor-not-allowed opacity-60 flex-shrink-0"
              >
                <Github className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* View Tasks Button (Solid Blue) */}
          <button
            onClick={() => onOpenProject(project)}
            className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-500/25 transition-all hover:scale-105 inline-flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <span>View Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
