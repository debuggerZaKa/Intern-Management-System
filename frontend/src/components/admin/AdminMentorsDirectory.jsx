import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  Building,
  Briefcase,
  FolderGit2,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  BookOpen
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { internshipService } from "../../services/internshipService";
import { projectService } from "../../services/projectService";
import StatusBadge from "../common/StatusBadge";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function AdminMentorsDirectory({ onSelectIntern }) {
  const [mentors, setMentors] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMentorsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, internshipsData, projectsData] = await Promise.all([
        adminService.getUsers(),
        internshipService.getInternships(),
        projectService.getProjects(),
      ]);

      const mentorUsers = (usersData || []).filter(
        (u) => u.role?.name === "mentor"
      );

      setMentors(mentorUsers);
      setInternships(internshipsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error("Failed to load mentors directory:", err);
      setError(err.message || "Failed to load mentors directory.");
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
    <div className="space-y-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Corporate Mentors Directory ({filteredMentors.length})</span>
          </h3>
          <p className="text-xs text-slate-500">Supervise mentor profiles, assigned intern workloads, and active engineering tracks</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search mentor name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
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
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group"
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

                  {mentor.profile?.bio && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed italic">
                      "{mentor.profile.bio}"
                    </p>
                  )}

                  {/* Workload Stats */}
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

                {/* Card Action Footer */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 truncate max-w-[140px]">{mentor.email}</span>

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <span>View Supervised Roster</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Mentor Supervised Interns Roster Drawer / Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-700 text-white font-bold flex items-center justify-center text-sm">
                  {selectedMentor.profile?.full_name?.slice(0, 2) || "M"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Supervised Interns Roster: {selectedMentor.profile?.full_name || selectedMentor.email}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedMentor.profile?.department || "Software Engineering"} &bull; {selectedMentor.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {internships.filter(i => i.mentor_id === selectedMentor.id).length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-6">No interns currently assigned to this mentor.</p>
              ) : (
                internships.filter(i => i.mentor_id === selectedMentor.id).map((internship) => {
                  const internUser = internship.intern;
                  return (
                    <div
                      key={internship.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 text-xs group hover:border-blue-300 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 text-sm">
                            {internUser?.profile?.full_name || internUser?.email}
                          </p>
                          <StatusBadge status={internship.status} size="xs" />
                        </div>
                        <p className="text-slate-500">
                          Track: {internship.department} &bull; Week {internship.current_week} of {internship.duration_weeks}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          const targetId = internUser?.id || internship.intern_id;
                          setSelectedMentor(null);
                          onSelectIntern?.(targetId);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect 360° Dossier</span>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
