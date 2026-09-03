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
import MentorDetailView from "../mentor/MentorDetailView";
import { getUniqueInternCurrentTracks } from "../../utils/internshipUtils";
import UserAvatar from "../common/UserAvatar";

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

  if (selectedMentor) {
    return (
      <MentorDetailView
        mentor={selectedMentor}
        internships={internships}
        projects={projects}
        tasks={[]}
        onBack={() => setSelectedMentor(null)}
        onSelectIntern={(id) => onSelectIntern?.(id)}
      />
    );
  }

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
            const mentorInternships = getUniqueInternCurrentTracks(
              internships.filter((i) => i.mentor_id === mentor.id)
            );
            const mentorProjectIds = new Set(mentorInternships.map((i) => i.id));
            const mentorProjects = projects.filter((p) => mentorProjectIds.has(p.internship_id));

            return (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        avatarUrl={mentor.profile?.avatar_url}
                        name={mentor.profile?.full_name || mentor.email}
                        size="md"
                      />
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
    </div>
  );
}
