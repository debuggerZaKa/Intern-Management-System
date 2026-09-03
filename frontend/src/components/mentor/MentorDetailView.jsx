import React, { useState } from "react";
import {
  ArrowLeft,
  UserCheck,
  Building,
  Mail,
  Phone,
  GraduationCap,
  FolderGit2,
  CheckSquare,
  CheckCircle2,
  Clock,
  Eye,
  Search,
  Users,
  Shield,
  Briefcase,
  Layers,
  Code2,
  Sparkles,
  Award,
  AlertCircle
} from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import EmptyState from "../common/EmptyState";
import { getMediaUrl } from "../../utils/mediaUtils";
import { getUniqueInternCurrentTracks } from "../../utils/internshipUtils";
import UserAvatar from "../common/UserAvatar";

export default function MentorDetailView({
  mentor,
  internships = [],
  projects = [],
  tasks = [],
  onBack,
  onSelectIntern,
}) {
  const [searchIntern, setSearchIntern] = useState("");

  if (!mentor) return null;

  const mentorAvatar = mentor.profile?.avatar_url
    ? getMediaUrl(mentor.profile.avatar_url)
    : null;
  const mentorInitials =
    mentor.profile?.full_name?.slice(0, 2).toUpperCase() ||
    mentor.email?.slice(0, 2).toUpperCase() ||
    "ME";

  // Filter internships assigned to this mentor & deduplicate so only current active track is shown per candidate
  const allMentorInternships = internships.filter((i) => i.mentor_id === mentor.id);
  const mentorInternships = getUniqueInternCurrentTracks(allMentorInternships);

  // Filter projects associated with this mentor's current internships
  const mentorInternshipIds = new Set(mentorInternships.map((i) => i.id));
  const mentorProjects = projects.filter((p) =>
    mentorInternshipIds.has(p.internship_id)
  );

  // Mentor's total supervised tasks
  const mentorProjectIds = new Set(mentorProjects.map((p) => p.id));
  const mentorTasks = tasks.filter((t) => mentorProjectIds.has(t.project_id));
  const completedTasksCount = mentorTasks.filter((t) => t.status === "done").length;
  const totalTasksCount = mentorTasks.length;
  const overallTaskRate =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

  // Active interns count
  const activeInternsCount = mentorInternships.filter(
    (i) => i.status === "active"
  ).length;

  // Search filtered interns
  const displayedInternships = mentorInternships.filter((internship) => {
    const internName = (internship.intern?.profile?.full_name || "").toLowerCase();
    const internEmail = (internship.intern?.email || "").toLowerCase();
    const dept = (internship.department || "").toLowerCase();
    const term = searchIntern.toLowerCase().trim();
    if (!term) return true;
    return (
      internName.includes(term) ||
      internEmail.includes(term) ||
      dept.includes(term)
    );
  });

  return (
    <div className="space-y-4 -mt-2 sm:-mt-3 animate-fadeIn">
      {/* ========================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR                              */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Mentors Directory"
            className="w-10 h-10 rounded-2xl bg-white border-2 border-slate-300 shadow-xs flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Mentor Oversight Dossier
            </span>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
              {mentor.profile?.full_name || mentor.email}
            </h1>
          </div>
        </div>

        {/* Right Header Status / Tag */}
        <div className="flex items-center gap-2">
          <span className="h-10 px-3.5 bg-blue-50 text-blue-700 border-2 border-blue-200 rounded-2xl text-xs font-black shadow-xs inline-flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span>Corporate Mentor Record</span>
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SPLIT LAYOUT: LEFT (PROFILE & STATS) | RIGHT (INTERNS) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: MENTOR PROFILE & OVERVIEW (4 COLS)           */}
        {/* ========================================================= */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Main Mentor Profile Box */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/60 space-y-5">
            {/* Avatar & Core Identity */}
            <div className="flex flex-col items-center text-center pb-5 border-b-2 border-slate-100">
              <div className="relative mb-3.5">
                {mentorAvatar ? (
                  <img
                    src={mentorAvatar}
                    alt={mentor.profile?.full_name || "Mentor Avatar"}
                    className="w-24 h-24 rounded-3xl object-cover border-2 border-slate-200 shadow-lg shadow-blue-500/10"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-600 text-white font-black text-2xl flex items-center justify-center border-2 border-slate-200 shadow-lg shadow-blue-500/15">
                    {mentorInitials}
                  </div>
                )}
              </div>

              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {mentor.profile?.full_name || mentor.email}
              </h2>
              <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                {mentor.profile?.department || "Senior Engineering Mentor"}
              </p>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                <StatusBadge status={mentor.status || "active"} size="xs" />
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-black uppercase tracking-wider">
                  Lead Supervisor
                </span>
              </div>
            </div>

            {/* Contact & Professional Details */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Corporate Email
                  </span>
                  <a
                    href={`mailto:${mentor.email}`}
                    className="font-extrabold text-slate-800 truncate block hover:text-blue-600"
                  >
                    {mentor.email}
                  </a>
                </div>
              </div>

              {mentor.profile?.phone && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Phone Contact
                    </span>
                    <span className="font-extrabold text-slate-800 truncate block">
                      {mentor.profile.phone}
                    </span>
                  </div>
                </div>
              )}

              {mentor.profile?.department && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <Building className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Department / Practice
                    </span>
                    <span className="font-extrabold text-slate-800 block">
                      {mentor.profile.department}
                    </span>
                  </div>
                </div>
              )}

              {mentor.profile?.university && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                  <GraduationCap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Alma Mater / Background
                    </span>
                    <span className="font-extrabold text-slate-800 block">
                      {mentor.profile.university}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Leadership Statement / Bio */}
            {mentor.profile?.bio && (
              <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Supervisory Statement & Bio
                </span>
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                  "{mentor.profile.bio}"
                </p>
              </div>
            )}
          </div>

          {/* Supervision Performance Overview Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-md shadow-slate-200/60 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Supervision Workload Metrics</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Assigned Interns
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {mentorInternships.length}
                </p>
                <span className="text-[10px] font-bold text-blue-600">
                  {activeInternsCount} Active
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Projects Lead
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {mentorProjects.length}
                </p>
                <span className="text-[10px] font-bold text-indigo-600">
                  Track Projects
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Sprint Tasks
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {totalTasksCount}
                </p>
                <span className="text-[10px] font-bold text-slate-500">
                  Deliverables
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Tasks Done Rate
                </span>
                <p className="text-xl font-black text-emerald-600 mt-1">
                  {overallTaskRate}%
                </p>
                <span className="text-[10px] font-bold text-emerald-700">
                  {completedTasksCount} Done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: ASSIGNED INTERN CARDS (8 COLS)              */}
        {/* ========================================================= */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Header & Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border-2 border-slate-300 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 font-bold flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Assigned Supervised Interns
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {mentorInternships.length} total candidates in mentorship cohort
                </p>
              </div>
            </div>

            {/* Intern Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter cohort interns..."
                value={searchIntern}
                onChange={(e) => setSearchIntern(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Intern Cards Roster Grid */}
          {displayedInternships.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border-2 border-slate-300 shadow-md text-center space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center shadow-inner">
                <UserCheck className="w-8 h-8" />
              </div>
              <h4 className="text-base font-black text-slate-900">
                {searchIntern ? "No matching interns found" : "No Interns Assigned Yet"}
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchIntern
                  ? "Try clearing your search query to see all cohort members under this mentor."
                  : "This mentor does not have any candidates assigned to their supervision roster yet."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayedInternships.map((internship) => {
                const internUser = internship.intern;
                const internUserAvatar = internUser?.profile?.avatar_url
                  ? getMediaUrl(internUser.profile.avatar_url)
                  : null;
                const internUserName =
                  internUser?.profile?.full_name || internUser?.email || "Intern Candidate";

                const currentWeek = internship.current_week || 1;
                const duration = internship.duration_weeks || 6;
                const progressPercent = Math.min(
                  100,
                  Math.round((currentWeek / duration) * 100)
                );

                // Matched Project
                const matchedProj = projects.find(
                  (p) => p.internship_id === internship.id
                );
                const projCover = matchedProj?.image_url
                  ? getMediaUrl(matchedProj.image_url)
                  : null;

                // Tasks for this intern's project
                const internTasks = matchedProj
                  ? tasks.filter((t) => t.project_id === matchedProj.id)
                  : [];
                const doneTasks = internTasks.filter((t) => t.status === "done").length;

                return (
                  <div
                    key={internship.id}
                    className="bg-white rounded-3xl p-5 border-2 border-slate-300 shadow-md shadow-slate-200/70 hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3.5">
                      {/* Card Top: Avatar & Info & Status */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar
                            avatarUrl={internUser?.profile?.avatar_url}
                            name={internUserName}
                            size="md"
                          />

                          <div className="min-w-0">
                            <h4
                              className="font-black text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors"
                              title={internUserName}
                            >
                              {internUserName}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-semibold truncate">
                              {internUser?.profile?.university || internship.department}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={internship.status || "active"} size="xs" />
                      </div>

                      {/* Internship Week Progress Bar */}
                      <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-700">
                          <span>Sprint Progress</span>
                          <span className="text-blue-600 font-black">
                            Week {currentWeek} of {duration} ({progressPercent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Active Project Track Section */}
                      {matchedProj ? (
                        <div className="p-3 rounded-2xl bg-blue-50/50 border-2 border-blue-100/80 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              {projCover ? (
                                <img
                                  src={projCover}
                                  alt={matchedProj.title}
                                  className="w-7 h-7 rounded-lg object-cover border border-blue-200 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                                  <Code2 className="w-3.5 h-3.5" />
                                </div>
                              )}
                              <span className="text-xs font-black text-slate-900 truncate" title={matchedProj.title}>
                                {matchedProj.title}
                              </span>
                            </div>
                            <StatusBadge status={matchedProj.status || "not_started"} size="xs" />
                          </div>

                          {/* Task Metrics */}
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 pt-1 border-t border-blue-100">
                            <span>Deliverables Done:</span>
                            <strong className="text-blue-700 font-black">
                              {doneTasks} / {internTasks.length} Tasks
                            </strong>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center">
                          <span className="text-[11px] text-slate-400 font-bold">
                            No active project assigned yet
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Button */}
                    <button
                      onClick={() => onSelectIntern(internUser?.id || internship.intern_id)}
                      className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl shadow-md shadow-blue-500/15 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect Intern 360° Profile</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
