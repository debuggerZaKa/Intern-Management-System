import React, { useState, useEffect } from "react";
import { Users, UserPlus, Upload, UserCheck, Shield } from "lucide-react";
import { adminService } from "../services/adminService";
import { roleService } from "../services/roleService";
import AppLayout from "../components/common/AppLayout";
import UserManagementTable from "../components/admin/UserManagementTable";
import SignupRequestsTable from "../components/admin/SignupRequestsTable";
import CreateUserModal from "../components/admin/CreateUserModal";
import BulkImportModal from "../components/admin/BulkImportModal";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [signupRequests, setSignupRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'signups'
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">User Administration & Approvals</h2>
            <p className="text-xs text-slate-500">
              Manage accounts, roles, access statuses, and review intern self-signup requests
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

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            onClick={() => setActiveTab("users")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === "users"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Directory ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("signups")}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
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
    </AppLayout>
  );
}
