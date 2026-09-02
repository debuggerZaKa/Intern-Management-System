import React, { useState, useEffect } from "react";
import {
  Award,
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Calendar,
  Building,
  Eye,
  FileCheck,
  RotateCcw,
  Sparkles,
  X,
  ChevronDown,
  Mail,
  UserCheck
} from "lucide-react";
import { internshipService } from "../services/internshipService";
import { adminService } from "../services/adminService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import CertificateModal from "../components/admin/CertificateModal";
import StatCard from "../components/common/StatCard";

export default function AlumniPage() {
  const [internships, setInternships] = useState([]);
  const [activeTab, setActiveTab] = useState("pending"); // 'pending' | 'certified'
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  // Certificate Modal State
  const [selectedCertInternship, setSelectedCertInternship] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await internshipService.getInternships();
      setInternships(data || []);
    } catch (err) {
      console.error("Failed to load alumni records:", err);
      setError(err.message || "Failed to load alumni records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);

  // Categorize Internships
  const pendingApprovalInternships = internships.filter((item) => {
    const isCompleted = item.status === "completed";
    const isDurationPassed = item.end_date && item.end_date <= todayStr;
    return !isCompleted && isDurationPassed;
  });

  const certifiedAlumniInternships = internships.filter((item) => item.status === "completed");

  const currentTabItems = activeTab === "pending" ? pendingApprovalInternships : certifiedAlumniInternships;

  // Filter Logic
  const filteredItems = currentTabItems.filter((item) => {
    const internName = item.intern?.profile?.full_name?.toLowerCase() || item.intern?.email?.toLowerCase() || "";
    const dept = (item.department || item.intern?.profile?.department || "").toLowerCase();
    const term = search.toLowerCase().trim();

    if (term && !internName.includes(term) && !dept.includes(term)) return false;
    if (selectedDept !== "all" && (item.department || item.intern?.profile?.department) !== selectedDept) return false;

    return true;
  });

  // Unique departments for filter
  const uniqueDepartments = Array.from(
    new Set(internships.map((i) => i.department || i.intern?.profile?.department).filter(Boolean))
  ).sort();

  const hasActiveFilters = search !== "" || selectedDept !== "all";

  const resetFilters = () => {
    setSearch("");
    setSelectedDept("all");
  };

  const handleApproveCertificate = async (e, item) => {
    e.stopPropagation();
    try {
      setApprovingId(item.id);
      await internshipService.updateInternship(item.id, { status: "completed" });
      setActionSuccess(`Certificate approved for ${item.intern?.profile?.full_name || item.intern?.email}! Transitioned to Certified Alumni.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err) {
      console.error("Failed to approve certificate:", err);
      alert(err.message || "Failed to approve certificate.");
    } finally {
      setApprovingId(null);
    }
  };

  const handleOpenCertificate = (e, item) => {
    e.stopPropagation();
    setSelectedCertInternship(item);
    setCertModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fadeIn">
        
        {/* Action Success Alert */}
        {actionSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Quick KPI Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Pending Certificate Approval"
            value={pendingApprovalInternships.length}
            subtitle="Duration end reached"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Certified Alumni"
            value={certifiedAlumniInternships.length}
            subtitle="Verified certificates"
            icon={Award}
            color="emerald"
          />
          <StatCard
            title="Total Program Graduates"
            value={pendingApprovalInternships.length + certifiedAlumniInternships.length}
            subtitle="All program alumni"
            icon={GraduationCap}
            color="blue"
          />
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* ========================================================= */}
        {/* UNIFIED FILTER & ACTION TOOLBAR CONTAINER CARD            */}
        {/* ========================================================= */}
        <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            
            {/* Left: Tab Switcher */}
            <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0">
              <button
                onClick={() => setActiveTab("pending")}
                className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === "pending"
                    ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Pending Approval ({pendingApprovalInternships.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("certified")}
                className={`h-full px-5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                  activeTab === "certified"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certified Alumni ({certifiedAlumniInternships.length})</span>
              </button>
            </div>

            {/* Center: Search Input Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search alumni by name, email, department..."
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

          {/* Expandable Advanced Filters Drawer */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
              {/* Department Filter */}
              <div className="relative flex-1 min-w-[200px]">
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

        {/* Content Roster Table */}
        {loading ? (
          <Loader message="Loading alumni records..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={Award}
            title={activeTab === "pending" ? "No pending certificate approvals" : "No certified alumni yet"}
            description={
              activeTab === "pending"
                ? "All completed interns have been approved and granted certificates."
                : "Approved alumni with generated completion certificates will be cataloged here."
            }
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Intern / Alumni Name</th>
                    <th className="py-4 px-6">Timeline & Dept Track</th>
                    <th className="py-4 px-6">Supervising Mentor</th>
                    <th className="py-4 px-6 text-right">Certificate Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const internUser = item.intern;
                    const internName = internUser?.profile?.full_name || internUser?.email || "Graduated Intern";
                    const mentorName = item.mentor?.profile?.full_name || item.mentor?.email || "Unassigned";

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Profile Info */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-2xl text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0 ${
                              item.status === "completed"
                                ? "bg-emerald-600"
                                : "bg-amber-500"
                            }`}>
                              {internName.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-slate-900 truncate">
                                  {internName}
                                </h4>
                                <StatusBadge
                                  status={item.status === "completed" ? "completed" : "pending"}
                                  size="xs"
                                />
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">
                                {internUser?.profile?.university || "University Graduate"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Track & Timeline */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.department || internUser?.profile?.department || "Software Track"}</span>
                              <span>•</span>
                              <span className="text-blue-700 font-extrabold">{item.duration_weeks || 6}W Track</span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span>Start: {item.start_date || "—"}</span>
                              <span>&bull;</span>
                              <span>End: {item.end_date || "—"}</span>
                            </p>
                          </div>
                        </td>

                        {/* Supervising Mentor */}
                        <td className="py-4 px-6">
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                            <span className={mentorName !== "Unassigned" ? "text-blue-700" : "text-slate-400 font-normal"}>
                              {mentorName}
                            </span>
                          </p>
                        </td>

                        {/* Certificate Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {item.status !== "completed" && (
                              <button
                                onClick={(e) => handleApproveCertificate(e, item)}
                                disabled={approvingId === item.id}
                                className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{approvingId === item.id ? "Approving..." : "Approve & Graduate"}</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => handleOpenCertificate(e, item)}
                              className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold transition-all shadow-xs inline-flex items-center gap-1.5"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-500" />
                              <span>Generate Certificate</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certificate Modal */}
        <CertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          internData={selectedCertInternship}
        />
      </div>
    </AppLayout>
  );
}
