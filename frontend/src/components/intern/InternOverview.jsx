import React, { useState, useEffect } from "react";
import {
  Briefcase,
  CheckSquare,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  Award,
  Brain,
  BarChart3,
  Plus
} from "lucide-react";
import { taskService } from "../../services/taskService";
import { reportService } from "../../services/reportService";
import { blockerService } from "../../services/blockerService";
import StatCard from "../common/StatCard";
import StatusBadge from "../common/StatusBadge";

export default function InternOverview({
  dashboard,
  onNavigateToTasks,
  onNavigateToReports,
  onNavigateToBlockers,
}) {
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const loadDetailedData = async () => {
      try {
        setAnalyticsLoading(true);
        const [tasksData, reportsData, blockersData] = await Promise.all([
          taskService.getTasks(),
          reportService.getReports(),
          blockerService.getBlockers(),
        ]);
        setTasks(tasksData || []);
        setReports(reportsData || []);
        setBlockers(blockersData || []);
      } catch (err) {
        console.error("Failed to load intern analytics details:", err);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    if (dashboard?.has_active_internship) {
      loadDetailedData();
    }
  }, [dashboard]);

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
  const tasksSummary = dashboard.tasks_summary || { total: 0, completed: 0, in_progress: 0, todo: 0 };

  // Analytics Metrics Calculation
  const totalTasksCount = tasks.length || tasksSummary.total || 0;
  const completedTasksCount = tasks.filter((t) => t.status === "done").length || tasksSummary.completed || 0;
  const taskRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;
  const reportRate = Math.min(100, Math.round(((reports.length || dashboard.weekly_reports_submitted || 0) / duration) * 100));
  const resolvedBlockers = blockers.filter((b) => b.status === "resolved").length;
  const totalBlockers = blockers.length;
  const blockerRate = totalBlockers > 0 ? Math.round((resolvedBlockers / totalBlockers) * 100) : 100;

  // Extract demonstrated skill tags
  const allSkills = new Set();
  reports.forEach((r) => {
    if (r.learnings_and_skills) {
      r.learnings_and_skills.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean && clean.length > 1) allSkills.add(clean);
      });
    }
  });

  const skillScore = Math.min(100, allSkills.size * 15);
  const compositeScore = Math.round(
    taskRate * 0.25 +
    reportRate * 0.20 +
    blockerRate * 0.15 +
    skillScore * 0.20 +
    20 // base corporate participation baseline
  );

  return (
    <div className="space-y-6">
      {/* 6-Week Journey Banner */}
      <div className="bg-gradient-to-r from-[#0B1E3F] via-[#0D2652] to-[#123974] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Ambient Glow */}
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
            <span>Program Timeline Elapsed</span>
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
          value={`${completedTasksCount} / ${totalTasksCount}`}
          subtitle={`${tasksSummary.in_progress || 0} in progress`}
          icon={CheckSquare}
          color="emerald"
          onClick={onNavigateToTasks}
        />
        <StatCard
          title="Reports Submitted"
          value={dashboard.weekly_reports_submitted ?? reports.length ?? 0}
          subtitle={`${reportRate}% submitted`}
          icon={FileText}
          color="blue"
          onClick={onNavigateToReports}
        />
        <StatCard
          title="Active Blockers"
          value={dashboard.unresolved_blockers ?? (totalBlockers - resolvedBlockers) ?? 0}
          subtitle={(dashboard.unresolved_blockers === 0) ? "No active roadblocks" : "Awaiting resolution"}
          icon={AlertTriangle}
          color={(dashboard.unresolved_blockers > 0) ? "rose" : "emerald"}
          onClick={onNavigateToBlockers}
        />
        <StatCard
          title="AI Trajectory"
          value={dashboard.latest_ai_status || "On Track"}
          subtitle="Automated analysis"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* ========================================================= */}
      {/* INTEGRATED PERSONAL GROWTH & ANALYTICS SECTION             */}
      {/* ========================================================= */}
      <div className="space-y-5 pt-2">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Performance Analytics & Milestone Velocity</span>
            </h3>
            <p className="text-xs text-slate-500">
              Live metrics across 6-week deliverables, blocker clearance, and technical skill acquisitions
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
            Growth Score: {compositeScore}/100
          </span>
        </div>

        {/* Analytics Charts & Visual Distribution Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week-by-Week Velocity Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Weekly Milestone Cadence</h4>
                <p className="text-xs text-slate-500">Milestone report submissions and task completion per week</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-6 gap-3 pt-3">
              {[1, 2, 3, 4, 5, 6].map((weekNum) => {
                const rep = reports.find((r) => r.week_number === weekNum);
                const isSubmitted = Boolean(rep);
                const weekTasks = tasks.filter((t) => t.week_number === weekNum);
                const weekDoneTasks = weekTasks.filter((t) => t.status === "done").length;
                const heightPercent = isSubmitted ? (weekTasks.length > 0 ? Math.max(40, Math.round((weekDoneTasks / weekTasks.length) * 100)) : 80) : (weekNum <= currentWeek ? 25 : 12);

                return (
                  <div key={weekNum} className="flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-100 rounded-xl h-36 flex items-end p-1.5 relative group">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 flex flex-col items-center justify-center text-[10px] font-bold text-white ${
                          isSubmitted
                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm"
                            : weekNum === currentWeek
                            ? "bg-amber-400 text-slate-900"
                            : "bg-slate-200 text-slate-400"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {isSubmitted ? `${weekDoneTasks}/${weekTasks.length || 1}` : weekNum === currentWeek ? "Active" : "—"}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">W{weekNum}</span>
                    <span className="text-[10px] text-slate-400">
                      {isSubmitted ? "Logged" : weekNum === currentWeek ? "In Progress" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Tasks Throughput</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{taskRate}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Report Punctuality</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{reportRate}%</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Roadblocks Cleared</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">{blockerRate}%</p>
              </div>
            </div>
          </div>

          {/* Cumulative Skills Tag Cloud & Insights */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">Demonstrated Skills</h4>
                <Award className="w-4 h-4 text-slate-400" />
              </div>

              <div className="pt-3 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {allSkills.size === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">
                    Technical tools & skills logged in your weekly reports will appear here automatically.
                  </p>
                ) : (
                  Array.from(allSkills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/60 rounded-xl text-xs font-bold shadow-xs hover:bg-blue-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>End-of-Internship Certification</span>
              </p>
              <p className="text-[11px] leading-relaxed text-blue-700">
                All skills, task deliverables, and report scores are compiled directly into your final appraisal report.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
