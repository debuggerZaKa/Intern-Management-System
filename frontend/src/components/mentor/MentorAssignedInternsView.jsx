import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Eye,
  FolderGit2,
  Filter,
  Calendar,
  Clock,
  RotateCcw,
  X,
  Award,
  Mail,
  Building,
  ChevronDown,
  AlertTriangle,
  Sparkles,
  Users,
  CheckCircle2,
  FileText
} from "lucide-react";
import { mentorService } from "../../services/mentorService";
import { projectService } from "../../services/projectService";
import { adminService } from "../../services/adminService";
import StatusBadge from "../common/StatusBadge";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import StatCard from "../common/StatCard";
import InternDetailView from "./InternDetailView";

export default function MentorAssignedInternsView() {
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  const [attentionList, setAttentionList] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [configuredDurations, setConfiguredDurations] = useState([4, 6, 8, 12]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [internsData, projectsData, attentionData, settingsData] = await Promise.all([
        mentorService.getAssignedInterns(),
        projectService.getProjects().catch(() => []),
        mentorService.getInternsNeedingAttention().catch(() => []),
        adminService.getSettings().catch(() => null),
      ]);

      setInternships(internsData || []);
      setProjects(projectsData || []);
      setAttentionList(attentionData || []);
      if (settingsData && Array.isArray(settingsData.duration_options) && settingsData.duration_options.length > 0) {
        setConfiguredDurations(settingsData.duration_options);
      }
    } catch (err) {
      console.error("Failed to load assigned interns:", err);
      setError(err.message || "Failed to load assigned interns directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter items based on search and filters
  const displayedInternships = internships.filter((internship) => {
    const internUser = internship.intern;
    const matchedProject = projects.find((p) => p.internship_id === internship.id);

    // 1. Search filter
    const term = search.toLowerCase().trim();
    if (term) {
      const name = internUser?.profile?.full_name?.toLowerCase() || "";
      const email = internUser?.email?.toLowerCase() || "";
      const uni = internUser?.profile?.university?.toLowerCase() || "";
      const dept = (internUser?.profile?.department || internship.department || "").toLowerCase();
      const proj = matchedProject?.title?.toLowerCase() || "";

      const matchesSearch =
        name.includes(term) ||
        email.includes(term) ||
        uni.includes(term) ||
        dept.includes(term) ||
        proj.includes(term);

      if (!matchesSearch) return false;
    }

    // 2. Department Filter
    if (selectedDept !== "all") {
      const internDept = internUser?.profile?.department || internship.department || "";
      if (internDept !== selectedDept) return false;
    }

    // 3. Duration Filter
    if (selectedDuration !== "all") {
      const durationWeeks = internship.duration_weeks || 6;
      if (durationWeeks !== Number(selectedDuration)) return false;
    }

    // 4. Date Filters
    if (fromDate) {
      const startDate = internship.start_date || (internUser?.created_at ? internUser.created_at.slice(0, 10) : null);
      if (startDate && startDate < fromDate) return false;
    }
    if (toDate) {
      const endDate = internship.end_date || (internUser?.created_at ? internUser.created_at.slice(0, 10) : null);
      if (endDate && endDate > toDate) return false;
    }

    return true;
  });

  const uniqueDepartments = Array.from(
    new Set([
      ...internships.map((i) => i.intern?.profile?.department),
      ...internships.map((i) => i.department),
    ].filter(Boolean))
  ).sort();

  const availableDurations = Array.from(
    new Set([...configuredDurations, ...internships.map((i) => i.duration_weeks).filter(Boolean)])
  ).sort((a, b) => a - b);

  const hasActiveFilters =
    search !== "" ||
    selectedDept !== "all" ||
    selectedDuration !== "all" ||
    fromDate !== "" ||
    toDate !== "";

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("all");
    setSelectedDuration("all");
    setFromDate("");
    setToDate("");
  };

  const attentionInternIds = new Set(attentionList.map((a) => a.intern_id || a.id));

  const activeProjectsCount = displayedInternships.filter((item) => {
    return projects.some((p) => p.internship_id === item.id);
  }).length;

  const urgentAttentionCount = displayedInternships.filter((item) => {
    return attentionInternIds.has(item.intern_id || item.intern?.id);
  }).length;

  if (selectedInternId) {
    return (
      <InternDetailView
        internId={selectedInternId}
        onBack={() => {
          setSelectedInternId(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Metric Cards Overview — reflect current filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Interns"
          value={displayedInternships.length}
          subtitle={hasActiveFilters ? "Matching current filters" : "Active supervised mentees"}
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Active Projects"
          value={activeProjectsCount}
          subtitle="Projects assigned & running"
          icon={FolderGit2}
          color="indigo"
        />
        <StatCard
          title="Attention Required"
          value={urgentAttentionCount}
          subtitle={urgentAttentionCount > 0 ? "Blockers or risk flag" : "All mentees on track"}
          icon={AlertTriangle}
          color={urgentAttentionCount > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="AI Mentorship"
          value="Enabled"
          subtitle="Real-time assistance active"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* ========================================================= */}
      {/* UNIFIED FILTER & ACTION TOOLBAR CONTAINER CARD            */}
      {/* ========================================================= */}
      <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          {/* Left: Section Title / Badge */}
          <div className="h-11 bg-slate-100/80 px-4 rounded-2xl flex items-center gap-2 border border-slate-200/60 shadow-inner flex-shrink-0">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-black text-slate-800">
              Assigned Cohort ({internships.length})
            </span>
          </div>

          {/* Center: Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search assigned interns by name, email, department, project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-8 text-xs bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all shadow-xs flex items-center"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Filters Toggle Button */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-11 inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-xs font-extrabold border transition-all shadow-xs whitespace-nowrap ${
                showAdvancedFilters || hasActiveFilters
                  ? "bg-blue-50 text-blue-700 border-blue-300"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4 text-slate-600" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters Drawer Inside Container */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
            {/* Department */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {uniqueDepartments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Duration Track */}
            <div className="relative flex-1 min-w-[160px]">
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="w-full h-11 pl-3 pr-8 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium appearance-none cursor-pointer"
              >
                <option value="all">All Durations</option>
                {availableDurations.map((weeks) => (
                  <option key={weeks} value={weeks}>{weeks} Weeks Track</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* From Date */}
            <div className="flex-1 min-w-[140px]">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="From Date"
                className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
              />
            </div>

            {/* To Date */}
            <div className="flex-1 min-w-[140px]">
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="To Date"
                className="w-full h-11 px-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
              />
            </div>

            {/* Icon-only Reset Button */}
            <button
              onClick={resetFilters}
              title="Reset Filters"
              className="h-11 w-11 inline-flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl transition-colors flex-shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* ========================================================= */}
      {/* ASSIGNED INTERNS ROWS TABLE (Exact Admin Interns Page Style) */}
      {/* ========================================================= */}
      {loading ? (
        <Loader message="Loading assigned intern records roster..." />
      ) : displayedInternships.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No assigned interns found"
          description={
            hasActiveFilters
              ? "No assigned intern records match your search or filter options."
              : "You do not currently have any active mentees assigned. An administrator will assign interns to your supervision."
          }
          actionLabel={hasActiveFilters ? "Reset Filters" : null}
          onAction={hasActiveFilters ? resetFilters : null}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Table Column Headers */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <div className="col-span-4">CLIENT / INTERN NAME</div>
            <div className="col-span-3">CONTACT / TRACK INFO</div>
            <div className="col-span-3">PROJECT & AI HEALTH</div>
            <div className="col-span-2 text-right">ACTIONS</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-slate-100">
            {displayedInternships.map((internship) => {
              const internUser = internship.intern;
              const matchedProject = projects.find((p) => p.internship_id === internship.id);
              const internName = internUser?.profile?.full_name || internUser?.email || "Intern Student";
              const isAttention = attentionInternIds.has(internship.intern_id || internUser?.id);

              return (
                <div
                  key={internship.id}
                  onClick={() => setSelectedInternId(internship.intern_id || internUser?.id)}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Column 1: Intern Name & Details */}
                  <div className="sm:col-span-4 flex items-center gap-3.5">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                        {internName.slice(0, 2).toUpperCase()}
                      </div>
                      {isAttention && (
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-500 border-2 border-white rounded-full animate-ping" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {internName}
                        </h4>
                        {isAttention && (
                          <span className="px-1.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-extrabold rounded-md flex-shrink-0">
                            Attention
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        Member ID: {internUser?.id ? `INT-${internUser.id}` : `INT-${internship.intern_id}`} &bull; {internUser?.profile?.university || "University"}
                      </p>
                    </div>
                  </div>

                  {/* Column 2: Track & Contact Info */}
                  <div className="sm:col-span-3 space-y-1">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{internUser?.email}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{internship.department || internUser?.profile?.department || "Software Track"} ({internship.duration_weeks || 6}W)</span>
                    </p>
                  </div>

                  {/* Column 3: Project & AI Health */}
                  <div className="sm:col-span-3 space-y-1">
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                      <FolderGit2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{matchedProject ? matchedProject.title : "No active project"}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        status={isAttention ? "needs_attention" : "on_track"}
                        size="xs"
                      />
                      <span className="text-[10px] text-slate-400 font-medium">
                        {internship.status === "active" ? "Active Cohort" : internship.status}
                      </span>
                    </div>
                  </div>

                  {/* Column 4: Actions */}
                  <div className="sm:col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {/* Inspect Profile Squircle Button */}
                    <button
                      onClick={() => setSelectedInternId(internship.intern_id || internUser?.id)}
                      title="Inspect Mentee Profile & Performance"
                      className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 flex items-center justify-center shadow-xs transition-all"
                    >
                      <Eye className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
