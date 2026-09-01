import React from "react";
import StatusBadge from "../common/StatusBadge";
import { User, Mail } from "lucide-react";

export default function UserItem({ user, onAction }) {
  if (!user) return null;

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
          {user.profile?.full_name?.slice(0, 2) || user.email?.slice(0, 2) || "U"}
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-900">
            {user.profile?.full_name || user.email}
          </h4>
          <p className="text-[11px] text-slate-400">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <StatusBadge status={user.role?.name || "intern"} size="xs" />
        <StatusBadge status={user.status || "active"} size="xs" />
      </div>
    </div>
  );
}
