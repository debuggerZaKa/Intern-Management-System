import React, { useState, useEffect } from "react";
import { GraduationCap, Search, Eye, UserCheck, FolderGit2, BookOpen } from "lucide-react";
import { adminService } from "../services/adminService";
import { internshipService } from "../services/internshipService";
import { projectService } from "../services/projectService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import AdminIntern360View from "../components/admin/AdminIntern360View";

export default function InternsPage() {
  const [interns, setInterns] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadInternsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, internshipsData, projectsData] = await Promise.all([
        adminService.getUsers(),
        internshipService.getInternships(),
        projectService.getProjects(),
      ]);

      const internUsers = (usersData || []).filter((u) => u.role?.name === "intern");
      setInterns(internUsers);
      setInternships(internshipsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error("Failed to load interns directory:", err);
      setError(err.message || "Failed to load interns directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternsData();
  }, []);

  const filteredInterns = interns.filter((i) => {
    const name = i.profile?.full_name?.toLowerCase() || "";
    const email = i.email?.toLowerCase() || "";
    const uni = i.profile?.university?.toLowerCase() || "";
    const dept = i.profile?.department?.toLowerCase() || "";
    const term = search.toLowerCase();
    return name.includes(term) || email.includes(term) || uni.includes(term) || dept.includes(term);
  });

  return (
    <AppLayout>
      {selectedInternId ? (
        /* Full Inline 360° Management Profile */
        <AdminIntern360View
          internId={selectedInternId}
          onBack={() => setSelectedInternId(null)}
        />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Search Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                <span>Interns Cohort Roster ({filteredInterns.length})</span>
              </h2>
              <p className="text-xs text-slate-500">
                Complete directory of interns. Click any intern to inspect their assigned mentor, projects, tasks, and performance.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search intern name, email, university..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium shadow-xs"
              />
            </div>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {loading ? (
            <Loader message="Loading interns directory..." />
          ) : filteredInterns.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No interns found"
              description={search ? "No intern records match your search query." : "No registered intern accounts exist in the system yet."}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInterns.map((intern) => {
                const matchedInternship = internships.find(i => i.intern_id === intern.id);
                const mentorName = matchedInternship?.mentor?.profile?.full_name || matchedInternship?.mentor?.email || "Unassigned";
                const matchedProject = projects.find(p => p.internship_id === matchedInternship?.id);

                return (
                  <div
                    key={intern.id}
                    onClick={() => setSelectedInternId(intern.id)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group space-y-3"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs">
                            {intern.profile?.full_name?.slice(0, 2) || intern.email?.slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                              {intern.profile?.full_name || intern.email}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {intern.profile?.university || "University Student"}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={matchedInternship?.status || "active"} size="xs" />
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                        <p className="text-slate-600 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Supervising Mentor:</span>
                          <span className="text-blue-700 font-semibold">{mentorName}</span>
                        </p>
                        <p className="text-slate-600 flex items-center justify-between">
                          <span className="font-bold text-slate-700">Track Project:</span>
                          <span className="text-slate-900 font-semibold truncate max-w-[150px]">
                            {matchedProject ? matchedProject.title : "Not assigned"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{intern.email}</span>
                      <span className="font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        <span>Inspect Profile</span>
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
