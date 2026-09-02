import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  Eye,
  FolderGit2,
  ArrowLeft,
  Mail,
  Phone,
  Building,
  CheckSquare,
  Filter,
  X,
  ChevronDown,
  RotateCcw,
  Shield,
  GraduationCap
} from "lucide-react";
import { adminService } from "../services/adminService";
import { internshipService } from "../services/internshipService";
import { projectService } from "../services/projectService";
import { taskService } from "../services/taskService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import AdminIntern360View from "../components/admin/AdminIntern360View";
import StatCard from "../components/common/StatCard";

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'active_supervisors'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Selected Mentor Profile View
  const [selectedMentor, setSelectedMentor] = useState(null);
  
  // Drilldown to Intern 360 View from Mentor Profile
  const [selectedInternId, setSelectedInternId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMentorsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, internshipsData, projectsData, tasksData] = await Promise.all([
        adminService.getUsers(),
        internshipService.getInternships(),
        projectService.getProjects(),
        taskService.getTasks(),
      ]);

      const mentorUsers = (usersData || []).filter((u) => u.role?.name === "mentor");
      setMentors(mentorUsers);
      setInternships(internshipsData || []);
      setProjects(projectsData || []);
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Failed to load mentors directory:", err);
      setError(err.message || "Failed to load corporate mentors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentorsData();
  }, []);

  // Filtering Logic
  const filteredMentors = mentors.filter((m) => {
    const mentorInternships = internships.filter((i) => i.mentor_id === m.id);
    if (activeTab === "active_supervisors" && mentorInternships.length === 0) {
      return false;
    }

    const name = m.profile?.full_name?.toLowerCase() || "";
    const email = m.email?.toLowerCase() || "";
    const dept = (m.profile?.department || "").toLowerCase();
    const term = search.toLowerCase().trim();

    if (term && !name.includes(term) && !email.includes(term) && !dept.includes(term)) return false;
    if (selectedDept !== "all" && (m.profile?.department || "") !== selectedDept) return false;

    return true;
  });

  const activeSupervisorsCount = mentors.filter(
    (m) => internships.filter((i) => i.mentor_id === m.id).length > 0
  ).length;

  const totalAssignedInterns = internships.filter((i) => i.mentor_id != null).length;

  // Collect unique departments
  const uniqueDepartments = Array.from(
    new Set(mentors.map((m) => m.profile?.department).filter(Boolean))
  ).sort();

  const hasActiveFilters = search !== "" || selectedDept !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("all");
  };

  return (
    <AppLayout>
      {selectedInternId ? (
        /* Drilldown to Intern 360 Profile */
        <AdminIntern360View
          internId={selectedInternId}
          onBack={() => setSelectedInternId(null)}
        />
      ) : selectedMentor ? (
        /* SELECTED MENTOR MANAGEMENT PROFILE VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Back Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedMentor(null)}
                title="Back to Mentors Directory"
                className="w-10 h-10 rounded-2xl bg-white border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-400 hover:scale-105 transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-extrabold text-slate-800">Back to Mentors Directory</span>
            </div>

            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
              Mentor Oversight Dossier
            </span>
          </div>

          {/* Mentor Profile Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                {selectedMentor.profile?.full_name?.slice(0, 2) || selectedMentor.email?.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    {selectedMentor.profile?.full_name || selectedMentor.email}
                  </h2>
                  <StatusBadge status={selectedMentor.status || "active"} size="sm" />
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-500" />
                  <span>{selectedMentor.profile?.department || "Software Engineering"}</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedMentor.email} &bull; {selectedMentor.profile?.phone || "No phone listed"}
                </p>
              </div>
            </div>

            {selectedMentor.profile?.bio && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-w-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Supervisor Bio</span>
                <p className="text-xs text-slate-600 leading-relaxed italic">"{selectedMentor.profile.bio}"</p>
              </div>
            )}
          </div>

          {/* Assigned Interns Roster Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Assigned Interns Under Supervision ({internships.filter(i => i.mentor_id === selectedMentor.id).length})</span>
              </h3>
            </div>

            {internships.filter(i => i.mentor_id === selectedMentor.id).length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No interns currently assigned to this mentor.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {internships.filter(i => i.mentor_id === selectedMentor.id).map((internship) => {
                  const internUser = internship.intern;
                  const matchedProj = projects.find(p => p.internship_id === internship.id);

                  return (
                    <div
                      key={internship.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 hover:border-blue-300 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                            {internUser?.profile?.full_name?.slice(0, 2) || "IN"}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900">
                              {internUser?.profile?.full_name || internUser?.email}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              Week {internship.current_week} of {internship.duration_weeks} &bull; {internship.department}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={internship.status} size="xs" />
                      </div>

                      {matchedProj && (
                        <div className="p-2.5 bg-white rounded-xl border border-slate-200/60 text-xs">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Active Track Project:</span>
                          <p className="font-bold text-slate-800 line-clamp-1">{matchedProj.title}</p>
                        </div>
                      )}

                      <button
                        onClick={() => setSelectedInternId(internUser?.id || internship.intern_id)}
                        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Intern 360° Profile</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Supervised Projects Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderGit2 className="w-4 h-4 text-blue-600" />
                <span>Supervised Engineering Projects</span>
              </h3>
            </div>

            {(() => {
              const mentorInternshipIds = new Set(internships.filter(i => i.mentor_id === selectedMentor.id).map(i => i.id));
              const mentorProjects = projects.filter(p => mentorInternshipIds.has(p.internship_id));

              if (mentorProjects.length === 0) {
                return <p className="text-xs text-slate-400 italic py-4 text-center">No projects assigned under this mentor's tracks yet.</p>;
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentorProjects.map((proj) => (
                    <div key={proj.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">{proj.title}</h4>
                        <StatusBadge status={proj.status || "not_started"} size="xs" />
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{proj.description}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      ) : (
        /* MENTORS DIRECTORY MAIN TABLE VIEW */
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Corporate Mentors"
              value={mentors.length}
              subtitle="All registered mentors"
              icon={Shield}
              color="blue"
            />
            <StatCard
              title="Active Supervisors"
              value={activeSupervisorsCount}
              subtitle="Currently paired with interns"
              icon={UserCheck}
              color="indigo"
            />
            <StatCard
              title="Supervised Interns"
              value={totalAssignedInterns}
              subtitle="Paired intern roster"
              icon={GraduationCap}
              color="emerald"
            />
            <StatCard
              title="Track Projects"
              value={projects.length}
              subtitle="Active mentor projects"
              icon={FolderGit2}
              color="amber"
            />
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {/* ========================================================= */}
          {/* UNIFIED FILTER TOOLBAR CONTAINER CARD                     */}
          {/* ========================================================= */}
          <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              
              {/* Left: Tab Switcher */}
              <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    activeTab === "all"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <span>All Corporate Mentors ({mentors.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("active_supervisors")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    activeTab === "active_supervisors"
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Active Supervisors ({activeSupervisorsCount})</span>
                </button>
              </div>

              {/* Center: Search Input Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search mentor by name, email, department..."
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

              {/* Right: Filters Toggle Button */}
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
              </div>
            </div>

            {/* Expandable Advanced Filters Drawer */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
                {/* Department Filter */}
                <div className="relative flex-1 min-w-[200px]">
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

                {/* Always-visible Icon-only Reset Button */}
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

          {/* CRM High-Density Table Rows */}
          {loading ? (
            <Loader message="Loading corporate mentors..." />
          ) : filteredMentors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No mentors found"
              description={search || selectedDept !== "all" ? "No mentor records match your filter criteria." : "No corporate mentor accounts exist in the system yet."}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                      <th className="py-4 px-6">Supervisor / Mentor Name</th>
                      <th className="py-4 px-6">Department & Contact</th>
                      <th className="py-4 px-6">Supervised Interns & Projects</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMentors.map((mentor) => {
                      const mentorInternships = internships.filter(i => i.mentor_id === mentor.id);
                      const mentorProjectIds = new Set(mentorInternships.map(i => i.id));
                      const mentorProjects = projects.filter(p => mentorProjectIds.has(p.internship_id));

                      return (
                        <tr
                          key={mentor.id}
                          onClick={() => setSelectedMentor(mentor)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Mentor Profile Name */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-2xl bg-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:bg-blue-600 transition-colors flex-shrink-0">
                                {mentor.profile?.full_name?.slice(0, 2) || mentor.email?.slice(0, 2)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                    {mentor.profile?.full_name || mentor.email}
                                  </h4>
                                  <StatusBadge status={mentor.status || "active"} size="xs" />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">Corporate Supervisor</p>
                              </div>
                            </div>
                          </td>

                          {/* Dept & Contact */}
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                <Building className="w-3.5 h-3.5 text-blue-500" />
                                <span>{mentor.profile?.department || "Software Engineering"}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[180px]">{mentor.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* Workload Stats */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3 text-xs">
                              <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold border border-slate-200/60 flex items-center gap-1.5">
                                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                                <span>{mentorInternships.length} Interns</span>
                              </span>

                              <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-extrabold border border-blue-200/60 flex items-center gap-1.5">
                                <FolderGit2 className="w-3.5 h-3.5 text-blue-600" />
                                <span>{mentorProjects.length} Projects</span>
                              </span>
                            </div>
                          </td>

                          {/* Action Button */}
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedMentor(mentor)}
                              className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold transition-all shadow-xs inline-flex items-center gap-1.5"
                              title="Inspect Mentor Dossier"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span>Inspect Mentor</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
