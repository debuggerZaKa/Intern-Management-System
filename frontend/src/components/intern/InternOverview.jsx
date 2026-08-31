import React from "react";
import {
  Briefcase,
  CheckSquare,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";

export default function InternOverview({
  dashboard,
  onNavigateToTasks,
  onNavigateToReports,
  onNavigateToBlockers,
}) {
  if (!dashboard || !dashboard.has_active_internship) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <Briefcase className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Active Internship Track Found</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Your account is registered, but you have not yet been assigned to an active internship track. Please contact your NETSOL administrator or mentor.
        </p>
      </div>
    );
  }

  const currentWeek = dashboard.current_week || 1;
  const duration = dashboard.duration_weeks || 6;
  const progressPercent = Math.min(100, Math.round((currentWeek / duration) * 100));
  const tasks = dashboard.tasks_summary || { total: 0, completed: 0, in_progress: 0, todo: 0 };

  return (
    <div className="space-y-6">
      {/* 6-Week Journey Banner */}
      <div className="bg-gradient-to-r from-[#0B1E3F] via-[#0D2652] to-[#123974] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-[-30%] right-[-10%] w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                NETSOL Engineering Internship
              </span>
              <StatusBadge status={dashboard.latest_ai_status || "on_track"} size="xs" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Week {currentWeek} of {duration} Milestone
            </h2>
            <p className="text-xs text-blue-200/80 max-w-xl leading-relaxed">
              Track: <strong className="text-white">{dashboard.department || "Enterprise Software Solutions"}</strong> &bull; Start Date: {dashboard.start_date || "—"} &bull; Expected End: {dashboard.end_date || "—"}
            </p>
          </div>

          {/* Mentor Quick Card */}
          {dashboard.mentor && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3.5 min-w-[240px]">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shadow-md">
                {dashboard.mentor.full_name?.slice(0, 2) || "M"}
              </div>
              <div className="text-xs">
                <p className="text-blue-200/70 text-[10px] font-semibold uppercase tracking-wider">
                  Supervising Mentor
                </p>
                <p className="font-bold text-white text-sm">
                  {dashboard.mentor.full_name || dashboard.mentor.email}
                </p>
                <p className="text-[11px] text-blue-200/80 truncate max-w-[160px]">
                  {dashboard.mentor.email}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Milestone Progress Bar */}
        <div className="relative z-10 mt-6 pt-6 border-t border-white/15 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-blue-200">
            <span>Program Completion Rate</span>
            <span className="font-bold text-white">{progressPercent}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-indigo-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Tasks Completed"
          value={`${tasks.completed} / ${tasks.total}`}
          subtitle={`${tasks.in_progress} in progress`}
          icon={CheckSquare}
          color="emerald"
          onClick={onNavigateToTasks}
        />
        <StatCard
          title="Reports Submitted"
          value={dashboard.weekly_reports_submitted ?? 0}
          subtitle={`Milestones logged`}
          icon={FileText}
          color="blue"
          onClick={onNavigateToReports}
        />
        <StatCard
          title="Active Blockers"
          value={dashboard.unresolved_blockers ?? 0}
          subtitle={dashboard.unresolved_blockers === 0 ? "No active roadblocks" : "Awaiting resolution"}
          icon={AlertTriangle}
          color={dashboard.unresolved_blockers > 0 ? "rose" : "emerald"}
          onClick={onNavigateToBlockers}
        />
        <StatCard
          title="AI Progress Status"
          value={dashboard.latest_ai_status || "On Track"}
          subtitle="Automated analysis"
          icon={Sparkles}
          color="purple"
        />
      </div>
    </div>
  );
}
