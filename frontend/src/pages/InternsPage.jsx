import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Search,
  Eye,
  UserCheck,
  FolderGit2,
  Filter,
  Calendar,
  Clock,
  RotateCcw,
  UserPlus,
  X,
  Award,
  CheckCircle2,
  Mail,
  Phone,
  Building,
  ChevronDown
} from "lucide-react";
import { adminService } from "../services/adminService";
import { internshipService } from "../services/internshipService";
import { projectService } from "../services/projectService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import AdminIntern360View from "../components/admin/AdminIntern360View";
import CreateUserModal from "../components/admin/CreateUserModal";
import CertificateModal from "../components/admin/CertificateModal";
import StatCard from "../components/common/StatCard";
import UserAvatar from "../components/common/UserAvatar";
import { getPrimaryInternship, isTrackOngoing } from "../utils/internshipUtils";

export default function InternsPage() {
  const [interns, setInterns] = useState([]);
  const [internships, setInternships] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Tab State: 'current' | 'pending_approval'
  const [activeTab, setActiveTab] = useState("current");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Modal & Selection States
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [selectedCertInternship, setSelectedCertInternship] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [configuredDurations, setConfiguredDurations] = useState([4, 6, 8, 12]);

  const loadInternsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, internshipsData, projectsData, settingsData] = await Promise.all([
        adminService.getUsers(),
        internshipService.getInternships(),
        projectService.getProjects(),
        adminService.getSettings().catch(() => null),
      ]);

      const internUsers = (usersData || []).filter((u) => u.role?.name === "intern");
      setInterns(internUsers);
      setInternships(internshipsData || []);
      setProjects(projectsData || []);
      if (settingsData && Array.isArray(settingsData.duration_options) && settingsData.duration_options.length > 0) {
        setConfiguredDurations(settingsData.duration_options);
      }
    } catch (err) {
      console.error("Failed to load interns directory:", err);
      setError(err.message || "Failed to load interns directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInternsData();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Categorize Interns: an intern is active if their primary current track is ongoing
  const activeEnrolledInterns = interns.filter((intern) => {
    const primaryTrack = getPrimaryInternship(intern.id, internships);
    return !primaryTrack || isTrackOngoing(primaryTrack.status);
  });

  const pendingCertificateInternships = internships.filter((i) => {
    return i.status !== "completed" && i.status !== "terminated" && i.end_date && i.end_date <= todayStr;
  });

  const assignedMentorsCount = activeEnrolledInterns.filter((intern) => {
    const matched = getPrimaryInternship(intern.id, internships);
    return matched?.mentor_id != null;
  }).length;

  const certifiedAlumniCount = internships.filter((i) => i.status === "completed").length;

  // Filter items based on active tab & filters
  const displayedItems = (activeTab === "current" ? activeEnrolledInterns : pendingCertificateInternships).filter((item) => {
    const internUser = activeTab === "current" ? item : item.intern;
    const matchedInternship = activeTab === "current" ? getPrimaryInternship(item.id, internships) : item;
    const matchedProject = projects.find((p) => p.internship_id === matchedInternship?.id);
    const mentorName = matchedInternship?.mentor?.profile?.full_name || matchedInternship?.mentor?.email || "";

    // 1. Search filter
    const term = search.toLowerCase().trim();
    if (term) {
      const name = internUser?.profile?.full_name?.toLowerCase() || "";
      const email = internUser?.email?.toLowerCase() || "";
      const uni = internUser?.profile?.university?.toLowerCase() || "";
      const dept = (internUser?.profile?.department || matchedInternship?.department || "").toLowerCase();
      const proj = matchedProject?.title?.toLowerCase() || "";
      const mentor = mentorName.toLowerCase();

      const matchesSearch =
        name.includes(term) ||
        email.includes(term) ||
        uni.includes(term) ||
        dept.includes(term) ||
        proj.includes(term) ||
        mentor.includes(term);

      if (!matchesSearch) return false;
    }

    // 2. Department Filter
    if (selectedDept !== "all") {
      const internDept = internUser?.profile?.department || matchedInternship?.department || "";
      if (internDept !== selectedDept) return false;
    }

    // 3. Duration Filter
    if (selectedDuration !== "all") {
      const durationWeeks = matchedInternship?.duration_weeks || 6;
      if (durationWeeks !== Number(selectedDuration)) return false;
    }

    // 4. Date Filters
    if (fromDate) {
      const startDate = matchedInternship?.start_date || (internUser?.created_at ? internUser.created_at.slice(0, 10) : null);
      if (startDate && startDate < fromDate) return false;
    }
    if (toDate) {
      const endDate = matchedInternship?.end_date || (internUser?.created_at ? internUser.created_at.slice(0, 10) : null);
      if (endDate && endDate > toDate) return false;
    }

    return true;
  });

  const uniqueDepartments = Array.from(
    new Set([
      ...interns.map((i) => i.profile?.department),
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

  const handleApproveCertificate = async (e, internship) => {
    e.stopPropagation();
    if (!internship) return;
    try {
      setApprovingId(internship.id);
      await internshipService.updateInternship(internship.id, { status: "completed" });
      setActionSuccess(`Certificate approved for ${internship.intern?.profile?.full_name || internship.intern?.email}! Record moved to Certified Alumni.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadInternsData();
    } catch (err) {
      console.error("Failed to approve certificate:", err);
      alert(err.message || "Failed to approve certificate.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenCertModal = (e, internship) => {
    e.stopPropagation();
    if (internship?.id) {
      window.open(`/certificate/${internship.id}`, "_blank");
    }
  };

  return (
    <AppLayout>
      {selectedInternId ? (
        <AdminIntern360View
          internId={selectedInternId}
          onBack={() => setSelectedInternId(null)}
        />
      ) : (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Action Success Alert */}
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {/* Top Metric Cards Overview — reflect current tab & filters */}
          {(() => {
            // Compute filter-aware stats based on the current tab and displayedItems
            const isCurrentTab = activeTab === "current";

            // Active interns in current view (only meaningful when on "current" tab)
            const filteredActiveCount = isCurrentTab ? displayedItems.length : activeEnrolledInterns.length;

            // Mentors assigned among filtered current interns
            const filteredMentorsCount = isCurrentTab
              ? displayedItems.filter((intern) => {
                  const matched = internships.find((i) => i.intern_id === intern.id);
                  return matched?.mentor_id != null;
                }).length
              : assignedMentorsCount;

            // Pending certificate approval count — when on pending tab, reflect filtered count
            const filteredPendingCount = isCurrentTab
              ? pendingCertificateInternships.length
              : displayedItems.length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Active Interns"
                  value={filteredActiveCount}
                  subtitle={hasActiveFilters && isCurrentTab ? "Matching filters" : "Enrolled cohort roster"}
                  icon={GraduationCap}
                  color="blue"
                />
                <StatCard
                  title="Mentors Assigned"
                  value={filteredMentorsCount}
                  subtitle={hasActiveFilters && isCurrentTab ? "In filtered view" : "Senior mentor paired"}
                  icon={UserCheck}
                  color="indigo"
                />
                <StatCard
                  title="Pending Approval"
                  value={filteredPendingCount}
                  subtitle={hasActiveFilters && !isCurrentTab ? "Matching filters" : "Duration end reached"}
                  icon={Clock}
                  color="amber"
                />
                <StatCard
                  title="Certified Alumni"
                  value={certifiedAlumniCount}
                  subtitle="Graduated & certified"
                  icon={Award}
                  color="emerald"
                />
              </div>
            );
          })()}

          {/* ========================================================= */}
          {/* UNIFIED FILTER & ACTION TOOLBAR CONTAINER CARD            */}
          {/* ========================================================= */}
          <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              
              {/* Left: Tab Switcher (Current Interns vs Waiting Certificate Approval) */}
              <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0">
                <button
                  onClick={() => setActiveTab("current")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    activeTab === "current"
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Current Interns ({activeEnrolledInterns.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("pending_approval")}
                  className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    activeTab === "pending_approval"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>Waiting Certificate Approval ({pendingCertificateInternships.length})</span>
                </button>
              </div>

              {/* Center: Search Input Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search interns by name, email, department..."
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

              {/* Right: Filters Toggle Button & New Intern Action Button */}
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

                <button
                  onClick={() => setCreateUserOpen(true)}
                  className="h-11 inline-flex items-center justify-center gap-2 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>New Intern</span>
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

                {/* Always-visible Icon-only Reset Button */}
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
          {/* INTERN ROWS TABLE (Not Cards)                             */}
          {/* ========================================================= */}
          {loading ? (
            <Loader message="Loading intern records roster..." />
          ) : displayedItems.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={activeTab === "current" ? "No active interns found" : "No interns pending certificate approval"}
              description={
                activeTab === "current"
                  ? "No active intern accounts match your search or filter options."
                  : "All completed interns have been approved and granted completion certificates."
              }
              actionLabel={hasActiveFilters ? "Reset Filters" : "Add New Intern"}
              onAction={hasActiveFilters ? resetFilters : () => setCreateUserOpen(true)}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              
              {/* Table Column Headers */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-white border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                <div className="col-span-4">CLIENT / INTERN NAME</div>
                <div className="col-span-3">CONTACT / TRACK INFO</div>
                <div className="col-span-3">MENTOR & PROJECT</div>
                <div className="col-span-2 text-right">ACTIONS</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100">
                {displayedItems.map((item) => {
                  const internUser = activeTab === "current" ? item : item.intern;
                  const matchedInternship = activeTab === "current" ? getPrimaryInternship(item.id, internships) : item;
                  const matchedProject = projects.find((p) => p.internship_id === matchedInternship?.id);
                  const internName = internUser?.profile?.full_name || internUser?.email || "Intern Student";
                  const mentorName = matchedInternship?.mentor?.profile?.full_name || matchedInternship?.mentor?.email || "Unassigned";

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedInternId(internUser?.id)}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Column 1: Intern Name & Details */}
                      <div className="sm:col-span-4 flex items-center gap-3.5">
                        <UserAvatar
                          avatarUrl={internUser?.profile?.avatar_url}
                          name={internName}
                          size="md"
                        />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                            {internName}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">
                            Member ID: {internUser?.id ? `INT-${internUser.id}` : "Pending"} &bull; {internUser?.profile?.university || "University"}
                          </p>
                        </div>
                      </div>

                      {/* Column 2: Track & Contact Info */}
                      <div className="sm:col-span-3 space-y-1">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{internUser?.email}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{matchedInternship?.department || internUser?.profile?.department || "Software Track"} ({matchedInternship?.duration_weeks || 6}W)</span>
                        </p>
                      </div>

                      {/* Column 3: Mentor & Project */}
                      <div className="sm:col-span-3 space-y-1">
                        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span className="truncate">{mentorName}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <FolderGit2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{matchedProject ? matchedProject.title : "No active project"}</span>
                        </p>
                      </div>

                      {/* Column 4: Actions */}
                      <div className="sm:col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        
                        {/* Actions for Pending Certificate Approval Tab */}
                        {activeTab === "pending_approval" && (
                          <>
                            <button
                              onClick={(e) => handleApproveCertificate(e, matchedInternship)}
                              disabled={approvingId === matchedInternship?.id}
                              title="Approve & Issue Certificate"
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{approvingId === matchedInternship?.id ? "..." : "Approve"}</span>
                            </button>

                            <button
                              onClick={(e) => handleOpenCertModal(e, matchedInternship)}
                              title="Preview Certificate"
                              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 text-slate-600 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/50 flex items-center justify-center shadow-xs transition-all"
                            >
                              <Award className="w-4 h-4 text-amber-500" />
                            </button>
                          </>
                        )}

                        {/* Inspect Profile Button */}
                        <button
                          onClick={() => setSelectedInternId(internUser?.id)}
                          title="Inspect Profile"
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

          {/* Certificate Modal */}
          <CertificateModal
            isOpen={certModalOpen}
            onClose={() => setCertModalOpen(false)}
            internData={selectedCertInternship}
          />

          {/* Provision Intern Modal */}
          <CreateUserModal
            isOpen={createUserOpen}
            onClose={() => setCreateUserOpen(false)}
            onUserCreated={loadInternsData}
          />
        </div>
      )}
    </AppLayout>
  );
}
