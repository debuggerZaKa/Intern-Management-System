import React, { useState, useEffect } from "react";
import { Users, UserPlus, Upload, UserCheck, Shield, GraduationCap, Eye, Search } from "lucide-react";
import { adminService } from "../services/adminService";
import { roleService } from "../services/roleService";
import { internshipService } from "../services/internshipService";
import { projectService } from "../services/projectService";
import AppLayout from "../components/common/AppLayout";
import UserManagementTable from "../components/admin/UserManagementTable";
import SignupRequestsTable from "../components/admin/SignupRequestsTable";
import CreateUserModal from "../components/admin/CreateUserModal";
import BulkImportModal from "../components/admin/BulkImportModal";
import AdminIntern360View from "../components/admin/AdminIntern360View";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import EmptyState from "../components/common/EmptyState";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'interns_roster' | 'signups'
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [internSearch, setInternSearch] = useState("");

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData, signupsData, internshipsData, projectsData] = await Promise.all([
        adminService.getUsers(),
        roleService.getRoles(),            
        adminService.getSignupRequests("pending"),
        internshipService.getInternships(),
        projectService.getProjects(),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      setSignupRequests(signupsData || []);
      setInternships(internshipsData || []);
      setProjects(projectsData || []);
    } catch (err) {
      console.error("Failed to load users data:", err);
      setError(err.message || "Failed to load user management records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const internUsers = users.filter((u) => u.role?.name === "intern");

  const filteredInterns = internUsers.filter((i) => {
    const name = i.profile?.full_name?.toLowerCase() || "";
    const email = i.email?.toLowerCase() || "";
    const uni = i.profile?.university?.toLowerCase() || "";
    const term = internSearch.toLowerCase();
    return name.includes(term) || email.includes(term) || uni.includes(term);
  });

  return (
    <AppLayout>
      {selectedInternId ? (
        /* Render 360° Management Dossier for selected Intern */
        <AdminIntern360View
          internId={selectedInternId}
          onBack={() => setSelectedInternId(null)}
        />
      ) : (
        <div className="space-y-6">
          {/* Page Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">User Administration & Cohort Roster</h2>
              <p className="text-xs text-slate-500">
                Manage system accounts, user approvals, role permissions, and inspect intern management dossiers
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setBulkImportOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Bulk Import</span>
              </button>

              <button
                onClick={() => setCreateUserOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b border-slate-200 gap-2 bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "users"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>All Users Directory ({users.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("interns_roster")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "interns_roster"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Interns Cohort Roster ({internUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("signups")}
              className={`py-3.5 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "signups"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Pending Self-Signups ({signupRequests.length})</span>
              {signupRequests.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>

          {loading ? (
            <Loader message="Loading directory records..." />
          ) : activeTab === "users" ? (
            <UserManagementTable users={users} roles={roles} onRefresh={loadData} />
          ) : activeTab === "interns_roster" ? (
            /* Interns Cohort Roster Tab */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Intern Roster ({filteredInterns.length})</h3>
                  <p className="text-xs text-slate-500">Inspect 360° management profile, assigned mentor, projects, and deliverables</p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search intern name, email, university..."
                    value={internSearch}
                    onChange={(e) => setInternSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium"
                  />
                </div>
              </div>

              {filteredInterns.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title="No interns found"
                  description="No registered intern records match your search filter."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInterns.map((intern) => {
                    const matchedInternship = internships.find(i => i.intern_id === intern.id);
                    const mentorName = matchedInternship?.mentor?.profile?.full_name || matchedInternship?.mentor?.email || "Unassigned";
                    const matchedProject = projects.find(p => p.internship_id === matchedInternship?.id);

                    return (
                      <div
                        key={intern.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-all space-y-3"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center">
                                {intern.profile?.full_name?.slice(0, 2) || intern.email?.slice(0, 2)}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-slate-900">
                                  {intern.profile?.full_name || intern.email}
                                </h4>
                                <p className="text-[11px] text-slate-500">{intern.profile?.university || "University Student"}</p>
                              </div>
                            </div>
                            <StatusBadge status={matchedInternship?.status || "active"} size="xs" />
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
                            <p className="text-slate-500">
                              <strong className="text-slate-800">Supervising Mentor:</strong> {mentorName}
                            </p>
                            <p className="text-slate-500">
                              <strong className="text-slate-800">Assigned Project:</strong> {matchedProject ? matchedProject.title : "None attached yet"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => setSelectedInternId(intern.id)}
                          className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Peek 360° Management Dossier</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <SignupRequestsTable requests={signupRequests} onRefresh={loadData} />
          )}

          {/* Modals */}
          <CreateUserModal
            isOpen={createUserOpen}
            onClose={() => setCreateUserOpen(false)}
            onUserCreated={loadData}
          />

          <BulkImportModal
            isOpen={bulkImportOpen}
            onClose={() => setBulkImportOpen(false)}
            onImportCompleted={loadData}
          />
        </div>
      )}
    </AppLayout>
  );
}
