import React from "react";
import AppLayout from "../components/common/AppLayout";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function RolesPage() {
  const roles = [
    {
      name: "Administrator (Admin)",
      description: "Full system-wide administrative authority over users, signup requests, mentor assignments, global configurations, and audit trails.",
      permissions: ["users:read", "users:create", "users:update", "users:deactivate", "admin:analytics", "admin:settings", "audit:read"]
    },
    {
      name: "Engineering Mentor",
      description: "Direct supervision over assigned interns, weekly milestone report assessments, rating provision, blocker unblocking, and 6-week final appraisals.",
      permissions: ["reports:read", "feedback:create", "feedback:update", "evaluations:create", "ai:summarize", "ai:chat"]
    },
    {
      name: "Intern Candidate",
      description: "Primary data contributor managing personal project records, kanban task progression, blocker logging, self-assessments, and 6-week journey tracking.",
      permissions: ["tasks:create", "tasks:update", "reports:create", "blockers:create", "profile:update"]
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Role-Based Access Control (RBAC)</h2>
          <p className="text-xs text-slate-500">
            Pre-configured corporate permission tiers and governance policies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {roles.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>{r.name}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Core Permissions:</span>
                <div className="flex flex-wrap gap-1">
                  {r.permissions.map((p, j) => (
                    <span key={j} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
