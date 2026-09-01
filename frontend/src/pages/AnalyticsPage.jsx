import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Brain,
  Star,
  FileText,
  Sparkles,
  BarChart3,
  Calendar
} from "lucide-react";
import { internService } from "../services/internService";
import { taskService } from "../services/taskService";
import { reportService } from "../services/reportService";
import { blockerService } from "../services/blockerService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import StatCard from "../components/common/StatCard";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [blockers, setBlockers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashData, tasksData, reportsData, blockersData] = await Promise.all([
        internService.getDashboard(),
        taskService.getTasks(),
        reportService.getReports(),
        blockerService.getBlockers(),
      ]);

      setDashboard(dashData || {});
      setTasks(tasksData || []);
      setReports(reportsData || []);
      setBlockers(blockersData || []);
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      setError(err.message || "Failed to load progress analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <Loader message="Synthesizing personal 6-week engineering analytics..." />
      </AppLayout>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const taskRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const reportRate = Math.min(100, Math.round(((reports.length || 0) / 6) * 100));
  const resolvedBlockers = blockers.filter((b) => b.status === "resolved").length;
  const blockerRate = blockers.length > 0 ? Math.round((resolvedBlockers / blockers.length) * 100) : 100;

  // Extract cumulative skills from reports
  const allSkills = new Set();
  reports.forEach((r) => {
    if (r.learnings_and_skills) {
      r.learnings_and_skills.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean && clean.length > 1) allSkills.add(clean);
      });
    }
  });

  // Calculate Weighted Overall Progress Score (Proposal 9.5.4):
  // Task completion (25%) + Report timeliness (15%) + Blocker resolution (10%) + Feedback/Skills (50%)
  const skillScore = Math.min(100, allSkills.size * 15);
  const compositeScore = Math.round(
    taskRate * 0.25 +
    reportRate * 0.20 +
    blockerRate * 0.15 +
    skillScore * 0.20 +
    20 // base corporate participation baseline
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Progress Analytics</h2>
            <p className="text-xs text-slate-500">
              6-week engineering velocity, skill acquisition map, and composite performance metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-xl text-blue-700 text-xs font-bold flex items-center gap-1.5 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>AI Health: {dashboard?.latest_ai_status || "On Track"}</span>
            </span>
          </div>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Hero Score Composite Card */}
        <div className="bg-gradient-to-r from-[#0B1E3F] via-[#0D2652] to-[#123974] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Composite Evaluation Model
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cumulative Growth Score: {compositeScore} / 100
            </h3>
            <p className="text-xs text-blue-200/80 max-w-xl leading-relaxed">
              Calculated using weighted indices across task throughput ({taskRate}%), report regularity ({reportRate}%), roadblock resolutions ({blockerRate}%), and cumulative technical competencies.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-center min-w-[140px]">
            <div className="w-24 h-24 rounded-full bg-white/10 border-4 border-blue-400/40 flex flex-col items-center justify-center shadow-lg backdrop-blur-sm">
              <span className="text-2xl font-black text-white">{compositeScore}%</span>
              <span className="text-[9px] uppercase font-bold text-blue-200">Overall</span>
            </div>
          </div>
        </div>

        {/* 4 Core Dimensions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Task Completion Rate"
            value={`${taskRate}%`}
            subtitle={`${completedTasks} of ${tasks.length} tasks finished`}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Milestone Reporting"
            value={`${reports.length} / 6`}
            subtitle={`${reportRate}% program submissions`}
            icon={FileText}
            color="blue"
          />
          <StatCard
            title="Blocker Resolution"
            value={`${blockerRate}%`}
            subtitle={`${resolvedBlockers} of ${blockers.length} cleared`}
            icon={AlertTriangle}
            color={blockerRate < 60 ? "rose" : "amber"}
          />
          <StatCard
            title="Skills Mastered"
            value={allSkills.size}
            subtitle="Verified technical tools"
            icon={Brain}
            color="purple"
          />
        </div>

        {/* Visual Charts & Skill Tags Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Week-by-Week Progress Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900">6-Week Milestone Velocity</h4>
                <p className="text-xs text-slate-500">Weekly report submissions and self-assessed productivity</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="grid grid-cols-6 gap-3 pt-4">
              {[1, 2, 3, 4, 5, 6].map((weekNum) => {
                const rep = reports.find((r) => r.week_number === weekNum);
                const isSubmitted = Boolean(rep);
                const selfScore = rep?.self_rating_productivity || 0;
                const heightPercent = isSubmitted ? Math.max(30, selfScore * 20) : 10;

                return (
                  <div key={weekNum} className="flex flex-col items-center space-y-2">
                    <div className="w-full bg-slate-100 rounded-xl h-40 flex items-end p-1.5 relative group">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 flex flex-col items-center justify-center text-[10px] font-bold text-white ${
                          isSubmitted
                            ? "bg-gradient-to-t from-blue-600 to-indigo-500 shadow-sm"
                            : "bg-slate-200 text-slate-400"
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {isSubmitted && `${selfScore}/5`}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-700">W{weekNum}</span>
                    <span className="text-[10px] text-slate-400">
                      {isSubmitted ? "Logged" : "Pending"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cumulative Technical Skills Tag Cloud */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900">Demonstrated Skills</h4>
                <Award className="w-4 h-4 text-slate-400" />
              </div>

              <div className="pt-4 flex flex-wrap gap-2">
                {allSkills.size === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4">
                    Skills logged in weekly reports will populate here.
                  </p>
                ) : (
                  Array.from(allSkills).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200/60 rounded-xl text-xs font-bold shadow-xs hover:bg-blue-100 transition-colors"
                    >
                      {skill}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Continuous Skill Mapping</span>
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Skills are evaluated during weekly AI report analysis and synthesized into your end-of-internship certification profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
