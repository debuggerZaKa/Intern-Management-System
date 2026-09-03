import React, { useState } from "react";
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Archive,
  Shield,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { userService } from "../../services/userService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import UserAvatar from "../common/UserAvatar";

export default function UserManagementTable({
  users = [],
  roles = [],
  onRefresh,
  search: externalSearch,
  roleFilter: externalRoleFilter,
  statusFilter: externalStatusFilter,
  deptFilter: externalDeptFilter,
}) {
  const [internalSearch, setInternalSearch] = useState("");
  const [internalRoleFilter, setInternalRoleFilter] = useState("all");
  const [internalStatusFilter, setInternalStatusFilter] = useState("all");
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [newRoleId, setNewRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isControlled = externalSearch !== undefined || externalRoleFilter !== undefined;
  const search = isControlled ? (externalSearch || "") : internalSearch;
  const roleFilter = isControlled ? (externalRoleFilter || "all") : internalRoleFilter;
  const statusFilter = isControlled ? (externalStatusFilter || "all") : internalStatusFilter;

  // Filter users
  const filteredUsers = users.filter((u) => {
    const name = u.profile?.full_name?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const dept = u.profile?.department?.toLowerCase() || "";
    const term = search.toLowerCase();
    const matchesSearch = name.includes(term) || email.includes(term) || dept.includes(term);

    const matchesRole = roleFilter === "all" || u.role?.name === roleFilter;
    const matchesStatus = statusFilter === "all" || u.status === statusFilter;
    const matchesDept = !externalDeptFilter || externalDeptFilter === "all" || dept === externalDeptFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  const handleActivate = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.activateUser(userId);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to activate user:", err);
      setError(err.message || "Failed to activate user.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.deactivateUser(userId);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to deactivate user:", err);
      setError(err.message || "Failed to deactivate user.");
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      await adminService.archiveUser(userId);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to archive user:", err);
      setError(err.message || "Failed to archive user.");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    if (!roleModalUser || !newRoleId) return;
    try {
      setLoading(true);
      setError(null);
      await userService.updateUserRole(roleModalUser.id, parseInt(newRoleId));
      setRoleModalUser(null);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to update role:", err);
      setError(err.message || "Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Show inner Controls Bar only when not controlled by parent */}
      {!isControlled && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={internalRoleFilter}
              onChange={(e) => setInternalRoleFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              <option value="all">All Roles</option>
              <option value="intern">Interns</option>
              <option value="mentor">Mentors</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={internalStatusFilter}
              onChange={(e) => setInternalStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="deactivated">Deactivated</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      )}

      {/* Users Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No users match your filters"
            description="Try modifying your search keywords or clearing status/role filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department / University</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          avatarUrl={u.profile?.avatar_url}
                          name={u.profile?.full_name || u.email}
                          size="md"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.profile?.full_name || "Unnamed User"}</p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.role?.name || "intern"} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{u.profile?.department || "—"}</p>
                      <p className="text-[11px] text-slate-400">{u.profile?.university || ""}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Change Role Button */}
                        <button
                          onClick={() => {
                            setRoleModalUser(u);
                            setNewRoleId(u.role_id?.toString() || "");
                          }}
                          title="Change Role"
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        {/* Activate / Deactivate Toggle */}
                        {u.status === "active" ? (
                          <button
                            onClick={() => handleDeactivate(u.id)}
                            title="Deactivate Account"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivate(u.id)}
                            title="Activate Account"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}

                        {/* Archive button */}
                        {u.status !== "archived" && (
                          <button
                            onClick={() => handleArchive(u.id)}
                            title="Archive Account"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Change Role Modal */}
      <Modal
        isOpen={!!roleModalUser}
        onClose={() => setRoleModalUser(null)}
        title="Change User Role"
        subtitle={`User: ${roleModalUser?.profile?.full_name || roleModalUser?.email}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Role
            </label>
            <select
              value={newRoleId}
              onChange={(e) => setNewRoleId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name.toUpperCase()} — {r.description}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              onClick={() => setRoleModalUser(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleRoleChange}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
            >
              {loading ? "Updating..." : "Save Role"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
