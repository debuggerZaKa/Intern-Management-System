import React from "react";
import { Users, Briefcase, CheckCircle2, Clock, AlertTriangle, UserCheck } from "lucide-react";
import StatCard from "../common/StatCard";

export default function AnalyticsOverview({ analytics }) {
  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Users"
          value={analytics.total_users ?? 0}
          subtitle={`Active: ${analytics.active_users ?? 0}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Internships"
          value={analytics.active_internships ?? 0}
          subtitle={`Completed: ${analytics.completed_internships ?? 0}`}
          icon={Briefcase}
          color="emerald"
        />
        <StatCard
          title="Pending Signups"
          value={analytics.pending_signup_requests ?? 0}
          subtitle="Awaiting admin approval"
          icon={UserCheck}
          color="amber"
        />
        <StatCard
          title="Active Blockers"
          value={analytics.unresolved_blockers ?? 0}
          subtitle="System-wide unresolved"
          icon={AlertTriangle}
          color={analytics.unresolved_blockers > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* User Distribution Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            User Distribution
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Interns</span>
              <span className="font-bold text-slate-900">{analytics.interns_count ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    analytics.total_users ? ((analytics.interns_count || 0) / analytics.total_users) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-600 font-medium">Mentors</span>
              <span className="font-bold text-slate-900">{analytics.mentors_count ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    analytics.total_users ? ((analytics.mentors_count || 0) / analytics.total_users) * 100 : 0
                  }%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2">
              <span className="text-slate-600 font-medium">Administrators</span>
              <span className="font-bold text-slate-900">{analytics.admins_count ?? 0}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{
                  width: `${
                    analytics.total_users ? ((analytics.admins_count || 0) / analytics.total_users) * 100 : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Weekly Reports & Tasks Activity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
            Submissions & Activity
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Total Tasks Tracked</p>
                  <p className="text-[11px] text-slate-500">Across all engineering tracks</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-900">{analytics.total_tasks ?? 0}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Weekly Reports Submitted</p>
                  <p className="text-[11px] text-slate-500">Engineering milestones</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-900">
                {analytics.total_reports_submitted ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              System Environment
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Backend API</span>
                <span className="font-semibold text-emerald-600">FastAPI &bull; Online</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">AI Engine</span>
                <span className="font-semibold text-blue-600">Groq / Llama 3.3 70B</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Program Duration</span>
                <span className="font-semibold text-slate-900">6 Weeks Standard</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Organization</span>
                <span className="font-bold text-slate-900">NETSOL Technologies Ltd</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
