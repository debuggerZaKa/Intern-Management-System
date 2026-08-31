import React, { useState } from "react";
import { ShieldCheck, Search, Clock, User, Globe, Activity } from "lucide-react";
import EmptyState from "../common/EmptyState";

export default function AuditLogsViewer({ logs = [] }) {
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter((log) => {
    const action = log.action?.toLowerCase() || "";
    const details = log.details?.toLowerCase() || "";
    const term = search.toLowerCase();
    return action.includes(term) || details.includes(term);
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Security & Administrative Audit Trail</h3>
          <p className="text-xs text-slate-500">Immutable records of platform actions, approvals, and credential modifications</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            description="System events and administrative actions will appear here automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Actor ID</th>
                  <th className="px-5 py-3.5">Target ID</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-800 font-medium">
                      User #{log.actor_id ?? "System"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {log.target_user_id ? `User #${log.target_user_id}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 font-sans text-xs text-slate-700 max-w-xs truncate" title={log.details}>
                      {log.details || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400">
                      {log.ip_address || "internal"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
