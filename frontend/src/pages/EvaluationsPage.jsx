import React, { useState, useEffect, useMemo } from "react";
import {
  Award,
  Star,
  BookOpen,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Edit2,
  CheckSquare,
  Building,
  UserCheck,
  Code2,
  X,
  ChevronDown,
  RotateCcw
} from "lucide-react";
import { evaluationService } from "../services/evaluationService";
import { internshipService } from "../services/internshipService";
import { mentorService } from "../services/mentorService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import EvaluationModal from "../components/mentor/EvaluationModal";
import StatCard from "../components/common/StatCard";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import { getMediaUrl } from "../utils/mediaUtils";
import { getUniqueInternCurrentTracks } from "../utils/internshipUtils";

export default function EvaluationsPage() {
  const { user, isIntern, isMentor, isAdmin } = useAuth();
  const [internships, setInternships] = useState([]);
  const [evaluationsMap, setEvaluationsMap] = useState({}); // { [internshipId]: evalObj }
  const [selectedInternshipForEval, setSelectedInternshipForEval] = useState(null);

  // Tab & Filter States: 'all' | 'ready' | 'in_progress' | 'evaluated'
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedRec, setSelectedRec] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch internships based on role
      let rawInternships = [];
      if (isMentor && !isAdmin) {
        rawInternships = await mentorService.getAssignedInterns().catch(() => []);
      } else {
        rawInternships = await internshipService.getInternships().catch(() => []);
      }

      // Deduplicate so each candidate appears once for their current active track
      const uniqueTracks = getUniqueInternCurrentTracks(rawInternships || []);
      setInternships(uniqueTracks);

      // Load evaluations for each current track
      const evalPromises = uniqueTracks.map(async (item) => {
        try {
          const evalRes = await evaluationService.getInternshipEvaluation(item.id);
          return { id: item.id, data: evalRes };
        } catch {
          return { id: item.id, data: null };
        }
      });

      const evalResults = await Promise.all(evalPromises);
      const map = {};
      evalResults.forEach((res) => {
        if (res.data) map[res.id] = res.data;
      });
      setEvaluationsMap(map);
    } catch (err) {
      console.error("Failed to load evaluations:", err);
      setError(err.message || "Failed to load evaluation records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isMentor, isAdmin]);

  // Available departments for filter
  const departments = useMemo(() => {
    const set = new Set();
    internships.forEach((i) => {
      const dept = i.department || i.intern?.profile?.department;
      if (dept) set.add(dept);
    });
    return Array.from(set).sort();
  }, [internships]);

  // Helper to test if duration is completed
  const isDurationComplete = (internship) => {
    if (!internship) return false;
    const isWeekReached = (internship.current_week || 1) >= (internship.duration_weeks || 6);
    const isStatusCompleted = [
      "waiting_certificate_approval",
      "pending_certificate_generation",
      "completed"
    ].includes(internship.status);
    return isWeekReached || isStatusCompleted;
  };

  // Categorize lists for tab counters and filtering
  const categorized = useMemo(() => {
    const ready = [];
    const inProgress = [];
    const evaluated = [];

    internships.forEach((item) => {
      const hasEval = Boolean(evaluationsMap[item.id]);
      if (hasEval) {
        evaluated.push(item);
      } else if (isDurationComplete(item)) {
        ready.push(item);
      } else {
        inProgress.push(item);
      }
    });

    return { ready, inProgress, evaluated };
  }, [internships, evaluationsMap]);

  // Calculate Average Rating
  const averageRating = useMemo(() => {
    const evals = Object.values(evaluationsMap).filter((e) => e && typeof e.overall_rating === "number");
    if (evals.length === 0) return null;
    const sum = evals.reduce((acc, curr) => acc + curr.overall_rating, 0);
    return (sum / evals.length).toFixed(1);
  }, [evaluationsMap]);

  // Filtered List based on Active Tab, Search, Department, and Recommendation
  const displayedInternships = useMemo(() => {
    let list = internships;
    if (activeTab === "ready") {
      list = categorized.ready;
    } else if (activeTab === "in_progress") {
      list = categorized.inProgress;
    } else if (activeTab === "evaluated") {
      list = categorized.evaluated;
    }

    return list.filter((item) => {
      const intern = item.intern;
      const evalRecord = evaluationsMap[item.id];
      const name = (intern?.profile?.full_name || "").toLowerCase();
      const email = (intern?.email || "").toLowerCase();
      const dept = (item.department || intern?.profile?.department || "").toLowerCase();
      const uni = (intern?.profile?.university || "").toLowerCase();
      const term = search.toLowerCase().trim();

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        dept.includes(term) ||
        uni.includes(term);

      const matchesDept =
        selectedDept === "all" ||
        item.department === selectedDept ||
        intern?.profile?.department === selectedDept;

      const matchesRec =
        selectedRec === "all" ||
        evalRecord?.recommendation?.toLowerCase() === selectedRec.toLowerCase();

      return matchesSearch && matchesDept && matchesRec;
    });
  }, [internships, activeTab, categorized, search, selectedDept, selectedRec, evaluationsMap]);

  const hasActiveFilters = search !== "" || selectedDept !== "all" || selectedRec !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedRec("all");
  };

  return (
    <AppLayout>
      <div className="space-y-6 -mt-2 sm:-mt-3 animate-fadeIn">
        {/* ========================================================= */}
        {/* 1. TOP METRIC CARDS OVERVIEW (MATCHING PROJECTS PAGE)     */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Mentees"
            value={internships.length}
            subtitle={hasActiveFilters ? "Current active candidates" : "All enrolled mentees"}
            icon={UserCheck}
            color="blue"
          />
          <StatCard
            title="Ready for Review"
            value={categorized.ready.length}
            subtitle={
              categorized.ready.length > 0
                ? "Duration complete • Action required"
                : "All completed tracks reviewed"
            }
            icon={AlertCircle}
            color={categorized.ready.length > 0 ? "amber" : "emerald"}
          />
          <StatCard
            title="In Active Sprints"
            value={categorized.inProgress.length}
            subtitle="Ongoing duration milestones"
            icon={Clock}
            color="purple"
          />
          <StatCard
            title="Completed Reviews"
            value={categorized.evaluated.length}
            subtitle={averageRating ? `Avg Score: ${averageRating} / 10` : "Evaluated & approved"}
            icon={Award}
            color="indigo"
          />
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* ========================================================= */}
        {/* 2. UNIFIED FILTER & ACTION TOOLBAR CARD                   */}
        {/* ========================================================= */}
        <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Left: Tab Switcher directly in Toolbar */}
            <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab("all")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "all"
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>All Candidates</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {internships.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ready")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "ready"
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>Ready for Review</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "ready" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {categorized.ready.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("in_progress")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "in_progress"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>In Progress</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "in_progress" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-900"
                  }`}
                >
                  {categorized.inProgress.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("evaluated")}
                className={`h-full px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "evaluated"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span>Evaluated</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === "evaluated" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-900"
                  }`}
                >
                  {categorized.evaluated.length}
                </span>
              </button>
            </div>

            {/* Center: Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search candidates by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-8 text-xs bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all shadow-xs flex items-center"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Filters Toggle Button */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-11 inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-xs font-extrabold border transition-all shadow-xs whitespace-nowrap cursor-pointer ${
                  showAdvancedFilters || (selectedDept !== "all" || selectedRec !== "all")
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-4 h-4 text-slate-600" />
                <span>Filters</span>
                {(selectedDept !== "all" || selectedRec !== "all") && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </button>
            </div>
          </div>

          {/* Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
              {/* Department Dropdown */}
              {departments.length > 0 && (
                <div className="relative flex-1 min-w-[160px]">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                  >
                    <option value="all">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}

              {/* Recommendation Dropdown */}
              <div className="relative flex-1 min-w-[160px]">
                <select
                  value={selectedRec}
                  onChange={(e) => setSelectedRec(e.target.value)}
                  className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
                >
                  <option value="all">All Recommendations</option>
                  <option value="hire">Hire Recommendation</option>
                  <option value="consider">Consider Recommendation</option>
                  <option value="no_hire">No Hire Recommendation</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Icon-only Reset Button */}
              <button
                onClick={resetFilters}
                title="Reset Filters"
                className="h-11 w-11 inline-flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-colors flex-shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* 3. CANDIDATE EVALUATION CARDS GRID                        */}
        {/* ========================================================= */}
        {loading ? (
          <Loader message="Loading candidate evaluations and performance reviews..." />
        ) : displayedInternships.length === 0 ? (
          <EmptyState
            icon={Award}
            title={
              activeTab === "ready"
                ? "No candidates waiting for evaluation"
                : activeTab === "evaluated"
                ? "No completed evaluations yet"
                : activeTab === "in_progress"
                ? "No ongoing sprint candidates"
                : "No candidate records match your search"
            }
            description={
              activeTab === "ready"
                ? "Mentees will appear here once they complete their required sprint duration weeks."
                : "Use the filter tabs above to view other candidate statuses."
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedInternships.map((internship) => {
              const intern = internship.intern;
              const evalRecord = evaluationsMap[internship.id];
              const isDone = isDurationComplete(internship);
              const avatarUrl = intern?.profile?.avatar_url
                ? getMediaUrl(intern.profile.avatar_url)
                : null;
              const initials =
                intern?.profile?.full_name?.slice(0, 2).toUpperCase() ||
                intern?.email?.slice(0, 2).toUpperCase() ||
                "IN";

              const currentWeek = internship.current_week || 1;
              const totalWeeks = internship.duration_weeks || 6;
              const progressPercent = Math.min(100, Math.round((currentWeek / totalWeeks) * 100));

              return (
                <div
                  key={internship.id}
                  className="bg-white rounded-3xl p-6 border-2 border-slate-300 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col justify-between space-y-5 group"
                >
                  {/* Top Candidate Information Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={intern?.profile?.full_name || "Intern"}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                            {initials}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="font-black text-sm text-slate-900 truncate tracking-tight">
                            {intern?.profile?.full_name || intern?.email}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold truncate mt-0.5">
                            {internship.department || intern?.profile?.department || "Engineering"}
                          </p>
                          {intern?.profile?.university && (
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {intern.profile.university} &bull; Sem {intern?.profile?.semester || "—"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Chip */}
                      <div className="flex-shrink-0">
                        {evalRecord ? (
                          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border-2 border-emerald-200 text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Evaluated</span>
                          </span>
                        ) : isDone ? (
                          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border-2 border-amber-200 text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Ready for Review</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border-2 border-blue-200 text-[11px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-blue-600" />
                            <span>Week {currentWeek} of {totalWeeks}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sprint Duration & Progress Bar */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Sprint Timeline: Week {currentWeek} of {totalWeeks}</span>
                        <span className="text-blue-600 font-black">{progressPercent}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isDone ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>Start: {internship.start_date || "—"}</span>
                        <span>End: {internship.end_date || "—"}</span>
                      </div>
                    </div>

                    {/* Evaluated Details vs Pending Status */}
                    {evalRecord ? (
                      <div className="space-y-3 pt-1">
                        {/* 3 Metric Score Tiles */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="p-3 rounded-2xl bg-indigo-50/70 border-2 border-indigo-100 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-wider flex items-center justify-center gap-1">
                              <Star className="w-3 h-3 fill-indigo-600 text-indigo-600" />
                              <span>Overall</span>
                            </span>
                            <span className="text-base font-black text-indigo-950 mt-1">
                              {evalRecord.overall_rating} <span className="text-[11px] text-indigo-600 font-bold">/ 10</span>
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-blue-50/70 border-2 border-blue-100 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider flex items-center justify-center gap-1">
                              <Code2 className="w-3 h-3 text-blue-600" />
                              <span>Technical</span>
                            </span>
                            <span className="text-base font-black text-blue-950 mt-1">
                              {evalRecord.technical_skills_rating} <span className="text-[11px] text-blue-600 font-bold">/ 5</span>
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-purple-50/70 border-2 border-purple-100 flex flex-col justify-center">
                            <span className="text-[10px] font-black text-purple-700 uppercase tracking-wider flex items-center justify-center gap-1">
                              <UserCheck className="w-3 h-3 text-purple-600" />
                              <span>Soft Skills</span>
                            </span>
                            <span className="text-base font-black text-purple-950 mt-1">
                              {evalRecord.soft_skills_rating} <span className="text-[11px] text-purple-600 font-bold">/ 5</span>
                            </span>
                          </div>
                        </div>

                        {/* Recommendation Chip */}
                        <div className="p-3 bg-slate-50 rounded-2xl border-2 border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-600 font-bold">Graduation Recommendation:</span>
                          <span
                            className={`px-3 py-1 rounded-xl font-black text-[11px] uppercase tracking-wider ${
                              evalRecord.recommendation === "hire"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : evalRecord.recommendation === "consider"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {evalRecord.recommendation}
                          </span>
                        </div>

                        {/* Final Comments Snippet */}
                        {evalRecord.final_comments && (
                          <div className="p-3 bg-slate-50/70 rounded-2xl border-2 border-slate-100 text-xs text-slate-600 italic font-medium leading-relaxed">
                            "{evalRecord.final_comments}"
                          </div>
                        )}
                      </div>
                    ) : isDone ? (
                      <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-amber-200/80 text-xs text-amber-900 font-semibold space-y-1">
                        <div className="flex items-center gap-2 font-black text-amber-950">
                          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <span>Duration Completed • Review Required</span>
                        </div>
                        <p className="text-[11px] text-amber-800 pl-6">
                          This mentee has fulfilled the required training duration. Complete the final appraisal to unlock certificate eligibility.
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-xs text-slate-500 font-medium space-y-1">
                        <div className="flex items-center gap-2 font-bold text-slate-700">
                          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <span>Ongoing Sprint (Week {currentWeek} of {totalWeeks})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 pl-6">
                          Final evaluation is scheduled at the end of the internship, but an early appraisal can be submitted anytime.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action Buttons Row */}
                  {/* For submitting/completing a new evaluation: any mentor or admin can act.
                      For editing an existing evaluation: only the mentor who submitted it. */}
                  {(isMentor || isAdmin) && (!evalRecord || evalRecord.mentor_id === user?.id) && (
                    <div className="pt-3 border-t-2 border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInternshipForEval(internship)}
                        className={`px-5 py-2.5 rounded-2xl text-xs font-black shadow-md transition-all hover:scale-105 inline-flex items-center gap-2 cursor-pointer ${
                          evalRecord
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300/80"
                            : isDone
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20"
                            : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20"
                        }`}
                      >
                        {evalRecord ? (
                          <>
                            <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit Evaluation</span>
                          </>
                        ) : isDone ? (
                          <>
                            <Award className="w-4 h-4" />
                            <span>Complete Evaluation</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-4 h-4" />
                            <span>Submit Early Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Evaluation Modal */}
        {selectedInternshipForEval && (
          <EvaluationModal
            isOpen={!!selectedInternshipForEval}
            onClose={() => setSelectedInternshipForEval(null)}
            internship={selectedInternshipForEval}
            existingEvaluation={evaluationsMap[selectedInternshipForEval.id]}
            onEvaluationSaved={loadData}
          />
        )}
      </div>
    </AppLayout>
  );
}
