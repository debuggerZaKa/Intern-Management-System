import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Upload,
  UserCheck,
  Shield,
  GraduationCap,
  Eye,
  Search,
  Filter,
  Clock,
  RotateCcw,
  X,
  ChevronDown,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { adminService } from "../services/adminService";
import { roleService } from "../services/roleService";
import { internshipService } from "../services/internshipService";
import AppLayout from "../components/common/AppLayout";
import UserManagementTable from "../components/admin/UserManagementTable";
import SignupRequestsTable from "../components/admin/SignupRequestsTable";
import CreateUserModal from "../components/admin/CreateUserModal";
import BulkImportModal from "../components/admin/BulkImportModal";
import AdminIntern360View from "../components/admin/AdminIntern360View";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";
import StatCard from "../components/common/StatCard";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  
  // Tab State: 'users' (Current Users) | 'signups' (Pending Approvals)
  const [activeTab, setActiveTab] = useState("users");
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Unified Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, rolesData, signupsData] = await Promise.all([
        adminService.getUsers(),
        roleService.getRoles(),
        adminService.getSignupRequests("pending"),
      ]);
      setUsers(usersData || []);
      setRoles(rolesData || []);
      setSignupRequests(signupsData || []);
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
  const mentorUsers = users.filter((u) => u.role?.name === "mentor");

  // Collect unique departments dynamically
  const uniqueDepartments = Array.from(
    new Set(users.map((u) => u.profile?.department).filter(Boolean))
  ).sort();

  // Tab-scoped filter evaluation
  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase().trim();
    if (term) {
      const name = u.profile?.full_name?.toLowerCase() || "";
      const email = u.email?.toLowerCase() || "";
      const dept = u.profile?.department?.toLowerCase() || "";
      if (!name.includes(term) && !email.includes(term) && !dept.includes(term)) return false;
    }

    if (roleFilter !== "all" && u.role?.name !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    if (selectedDept !== "all" && (u.profile?.department || "") !== selectedDept) return false;

    if (fromDate) {
      const created = u.created_at ? u.created_at.slice(0, 10) : null;
      if (created && created < fromDate) return false;
    }
    if (toDate) {
      const created = u.created_at ? u.created_at.slice(0, 10) : null;
      if (created && created > toDate) return false;
    }

    return true;
  });

  const filteredSignups = signupRequests.filter((r) => {
    const term = search.toLowerCase().trim();
    if (term) {
      const name = r.full_name?.toLowerCase() || "";
      const email = r.email?.toLowerCase() || "";
      if (!name.includes(term) && !email.includes(term)) return false;
    }

    if (fromDate) {
      const created = r.created_at ? r.created_at.slice(0, 10) : null;
      if (created && created < fromDate) return false;
    }
    if (toDate) {
      const created = r.created_at ? r.created_at.slice(0, 10) : null;
      if (created && created > toDate) return false;
    }

    return true;
  });

  const hasActiveFilters =
    search !== "" ||
    roleFilter !== "all" ||
    statusFilter !== "all" ||
    selectedDept !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  const resetFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSelectedDept("all");
    setFromDate("");
    setToDate("");
  };

  return (
    <AppLayout>
      {selectedInternId ? (
        /* Render 360° Management Dossier for selected Intern */
        <AdminIntern360View
          internId={selectedInternId}
          onBack={() => setSelectedInternId(null)}
        />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Metric Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total System Staff"
              value={users.length}
              subtitle="All system accounts"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Corporate Mentors"
              value={mentorUsers.length}
              subtitle="Supervising mentors"
              icon={Shield}
              color="indigo"
            />
            <StatCard
              title="Enrolled Interns"
              value={internUsers.length}
              subtitle="Active cohort interns"
              icon={GraduationCap}
              color="emerald"
            />
            <StatCard
              title="Pending Approvals"
              value={signupRequests.length}
              subtitle="Awaiting self-signup approval"
              icon={Clock}
              color="amber"
            />
          </div>

          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {/* ========================================================= */}
          {/* UNIFIED FILTER & ACTION TOOLBAR CONTAINER CARD            */}
          {/* ========================================================= */}
          <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              
              {/* Left: Tab Switcher (Current Users vs Pending Approvals) */}
              <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0">
                <button
                  onClick={() => setActiveTab("users")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "users"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Current Users ({users.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("signups")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                    activeTab === "signups"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Pending Approvals ({signupRequests.length})</span>
                  {signupRequests.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              </div>

              {/* Center: Search Input Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder={
                    activeTab === "users"
                      ? "Search current users by name, email, department..."
                      : "Search pending signup candidates by name or email..."
                  }
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

              {/* Right: Action Buttons */}
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

                <button
                  onClick={() => setCreateUserOpen(true)}
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add User</span>
                </button>
              </div>
            </div>

            {/* Expandable Advanced Filters Drawer */}
            {showAdvancedFilters && (
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
                {/* Role Filter - for Current Users */}
                {activeTab === "users" && (
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                    >
                      <option value="all">All Roles</option>
                      <option value="intern">Interns</option>
                      <option value="mentor">Mentors</option>
                      <option value="admin">Admins</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                {/* Status Filter - for Current Users */}
                {activeTab === "users" && (
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="deactivated">Deactivated</option>
                      <option value="archived">Archived</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                {/* Department Filter */}
                {activeTab === "users" && (
                  <div className="relative flex-1 min-w-[160px]">
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
                )}

                {/* From Date */}
                <div className="flex-1 min-w-[130px]">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                  />
                </div>

                {/* To Date */}
                <div className="flex-1 min-w-[130px]">
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
                  />
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

          {/* ========================================================= */}
          {/* CONTENT TABLE DATA                                        */}
          {/* ========================================================= */}
          {loading ? (
            <Loader message="Loading records..." />
          ) : activeTab === "users" ? (
            <UserManagementTable
              users={filteredUsers}
              roles={roles}
              onRefresh={loadData}
              search={search}
              roleFilter={roleFilter}
              statusFilter={statusFilter}
              deptFilter={selectedDept}
            />
          ) : (
            <SignupRequestsTable requests={filteredSignups} onRefresh={loadData} />
          )}

          {/* Modals */}
          <CreateUserModal
            isOpen={createUserOpen}
            onClose={() => setCreateUserOpen(false)}
            onUserCreated={loadData}
          />
        </div>
      )}
    </AppLayout>
  );
}
