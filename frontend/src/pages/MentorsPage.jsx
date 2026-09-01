import React, { useState, useEffect } from "react";
import { Users, Search, UserCheck, Eye, FolderGit2, ArrowLeft, Mail, Phone, Building, CheckSquare } from "lucide-react";
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

export default function MentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  
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

  const filteredMentors = mentors.filter((m) => {
    const name = m.profile?.full_name?.toLowerCase() || "";
    const email = m.email?.toLowerCase() || "";
    const dept = m.profile?.department?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term) || dept.includes(term);
  });

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
            <button
              onClick={() => setSelectedMentor(null)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Mentors Directory</span>
            </button>

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
        /* MENTORS DIRECTORY GRID VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Corporate Mentors Directory ({filteredMentors.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Directory of senior engineering mentors. Click any mentor to inspect their assigned interns, project tracks, and workload.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search mentor name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium shadow-xs"
              />
            </div>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {loading ? (
            <Loader message="Loading corporate mentors..." />
          ) : filteredMentors.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No mentors found"
              description={search ? "No mentor records match your search filter." : "No corporate mentor accounts exist in the system yet."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMentors.map((mentor) => {
                const mentorInternships = internships.filter(i => i.mentor_id === mentor.id);
                const mentorProjectIds = new Set(mentorInternships.map(i => i.id));
                const mentorProjects = projects.filter(p => mentorProjectIds.has(p.internship_id));

                return (
                  <div
                    key={mentor.id}
                    onClick={() => setSelectedMentor(mentor)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {mentor.profile?.full_name?.slice(0, 2) || mentor.email?.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                              {mentor.profile?.full_name || mentor.email}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">{mentor.profile?.department || "Software Engineering"}</p>
                          </div>
                        </div>
                        <StatusBadge status={mentor.status || "active"} size="xs" />
                      </div>

                      {/* Workload Badges */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Assigned Interns</span>
                          <p className="text-base font-black text-slate-900">{mentorInternships.length}</p>
                        </div>
                        <div className="p-2 bg-blue-50/50 rounded-xl border border-blue-100/60">
                          <span className="text-[10px] font-bold text-blue-600 uppercase">Projects Supervised</span>
                          <p className="text-base font-black text-blue-900">{mentorProjects.length}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{mentor.email}</span>
                      <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Inspect Mentor</span>
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
