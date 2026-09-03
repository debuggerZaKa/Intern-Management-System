import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  GraduationCap,
  Search,
  CheckCircle2,
  Clock,
  Filter,
  Calendar,
  Building,
  FileCheck,
  RotateCcw,
  Sparkles,
  X,
  ChevronDown,
  UserCheck,
  BadgeCheck,
  ShieldCheck,
  Scroll,
  Loader2,
} from "lucide-react";
import { internshipService } from "../services/internshipService";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";
import UserAvatar from "../components/common/UserAvatar";
import { getMediaUrl } from "../utils/mediaUtils";
import CertificateModal from "../components/admin/CertificateModal";
import StatCard from "../components/common/StatCard";
import AdminIntern360View from "../components/admin/AdminIntern360View";

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS = {
  WAITING: "waiting_certificate_approval",
  PENDING_GEN: "pending_certificate_generation",
  COMPLETED: "completed",
};

const TABS = [
  {
    id: "waiting",
    label: "Waiting Admin Approval",
    icon: Clock,
    color: "amber",
    statuses: [STATUS.WAITING],
    description: "Mentor has submitted final evaluation. Admin review required.",
  },
  {
    id: "roster",
    label: "Alumni Roster & Certificate Portal",
    icon: Scroll,
    color: "blue",
    statuses: [STATUS.PENDING_GEN],
    description: "Admin approved. Certificate generation pending.",
  },
  {
    id: "certified",
    label: "Certified Alumni",
    icon: BadgeCheck,
    color: "emerald",
    statuses: [STATUS.COMPLETED],
    description: "Certificate issued. Officially Certified Alumni.",
  },
];

export default function AlumniPage() {
  const [internships, setInternships] = useState([]);
  const [activeTab, setActiveTab] = useState("waiting");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const [selectedInternId, setSelectedInternId] = useState(null);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [selectedCertInternship, setSelectedCertInternship] = useState(null);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Categorize by status ───────────────────────────────────────────────────
  const byStatus = (statuses) =>
    internships.filter((i) => statuses.includes(i.status));

  const waitingItems = byStatus([STATUS.WAITING]);
  const rosterItems = byStatus([STATUS.PENDING_GEN]);
  const certifiedItems = byStatus([STATUS.COMPLETED]);

  const currentTabDef = TABS.find((t) => t.id === activeTab);
  const currentTabItems = byStatus(currentTabDef.statuses);

  // ─── Filters ────────────────────────────────────────────────────────────────
  const uniqueDepartments = Array.from(
    new Set(internships.map((i) => i.department || i.intern?.profile?.department).filter(Boolean))
  ).sort();

  const hasActiveFilters = search !== "" || selectedDept !== "all";
  const resetFilters = () => { setSearch(""); setSelectedDept("all"); };

  const filteredItems = currentTabItems.filter((item) => {
    const name = (item.intern?.profile?.full_name || item.intern?.email || "").toLowerCase();
    const dept = (item.department || item.intern?.profile?.department || "").toLowerCase();
    const term = search.toLowerCase().trim();
    if (term && !name.includes(term) && !dept.includes(term)) return false;
    if (selectedDept !== "all" && (item.department || item.intern?.profile?.department) !== selectedDept) return false;
    return true;
  });

  // ─── Actions ─────────────────────────────────────────────────────────────────
  const handleApprove = async (e, item) => {
    e.stopPropagation();
    try {
      setActionLoadingId(item.id);
      await internshipService.approveCertificate(item.id);
      setActionSuccess(`✓ Admin approved ${item.intern?.profile?.full_name || item.intern?.email}. Now in Alumni Roster.`);
      setTimeout(() => setActionSuccess(null), 4500);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to approve.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleIssueCertificate = async (e, item) => {
    e.stopPropagation();
    try {
      setActionLoadingId(item.id);
      const result = await internshipService.issueCertificate(item.id);
      setActionSuccess(`🎓 Certificate issued! ID: ${result.certificate_id}. ${item.intern?.profile?.full_name || item.intern?.email} is now a Certified Alumni.`);
      setTimeout(() => setActionSuccess(null), 6000);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to issue certificate.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewCertificate = (e, item) => {
    e.stopPropagation();
    if (item?.id) {
      window.open(`/certificate/${item.id}`, "_blank");
    }
  };

  // ─── Tab color map ────────────────────────────────────────────────────────────
  const tabColors = {
    waiting: {
      active: "bg-amber-500 text-white shadow-md shadow-amber-500/20",
      inactive: "text-slate-600 hover:text-slate-900 hover:bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
    },
    roster: {
      active: "bg-blue-600 text-white shadow-md shadow-blue-600/20",
      inactive: "text-slate-600 hover:text-slate-900 hover:bg-blue-50",
      badge: "bg-blue-100 text-blue-700",
    },
    certified: {
      active: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20",
      inactive: "text-slate-600 hover:text-slate-900 hover:bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-700",
    },
  };

  const tabCounts = { waiting: waitingItems.length, roster: rosterItems.length, certified: certifiedItems.length };

  if (selectedInternId) {
    return (
      <AppLayout>
        <AdminIntern360View
          internId={selectedInternId}
          initialTrackId={selectedTrackId}
          defaultToCompleted={true}
          onBack={() => {
            setSelectedInternId(null);
            setSelectedTrackId(null);
            loadData();
          }}
        />
      </AppLayout>
    );
  }

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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Awaiting Admin Approval"
            value={waitingItems.length}
            subtitle="Mentor evaluated, needs admin OK"
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="In Certificate Portal"
            value={rosterItems.length}
            subtitle="Approved, certificate pending"
            icon={Scroll}
            color="blue"
          />
          <StatCard
            title="Certified Alumni"
            value={certifiedItems.length}
            subtitle="Certificate issued"
            icon={BadgeCheck}
            color="emerald"
          />
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Filter + Tab Toolbar */}
        <div className="bg-white p-5 rounded-3xl border-[1.5px] border-slate-300 shadow-md shadow-slate-200/70 space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">

            {/* Tab Switcher */}
            <div className="h-11 bg-slate-100/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-inner flex-shrink-0 overflow-x-auto">
              {TABS.map((tab) => {
                const colors = tabColors[tab.id];
                const Icon = tab.icon;
                const count = tabCounts[tab.id];
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`h-full px-4 rounded-xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${
                      activeTab === tab.id ? colors.active : colors.inactive
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{tab.label}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                      activeTab === tab.id ? "bg-white/25 text-white" : colors.badge
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-8 text-xs bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 font-medium transition-all shadow-xs"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filters toggle */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`h-11 inline-flex items-center justify-center gap-2 px-5 rounded-2xl text-xs font-extrabold border transition-all shadow-xs whitespace-nowrap ${
                  showAdvancedFilters || hasActiveFilters
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 animate-fadeIn">
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

        {/* Tab description banner */}
        <div className="px-1">
          <p className="text-xs text-slate-500 font-medium">{currentTabDef.description}</p>
        </div>

        {/* Content */}
        {loading ? (
          <Loader message="Loading alumni records..." />
        ) : filteredItems.length === 0 ? (
          <EmptyState
            icon={currentTabDef.icon}
            title={`No records in "${currentTabDef.label}"`}
            description="Records appear here automatically as interns progress through the pipeline."
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">Intern / Alumni</th>
                    <th className="py-4 px-6">Track & Timeline</th>
                    <th className="py-4 px-6">Mentor</th>
                    <th className="py-4 px-6">Evaluation Score</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => {
                    const internUser = item.intern;
                    const internName = internUser?.profile?.full_name || internUser?.email || "Graduate";
                    const mentorName = item.mentor?.profile?.full_name || item.mentor?.email || "—";
                    const evalScore = item.evaluation?.overall_rating;
                    const isLoading = actionLoadingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        onClick={() => {
                          setSelectedInternId(item.intern_id || item.intern?.id);
                          setSelectedTrackId(item.id);
                        }}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >

                        {/* Name + Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <UserAvatar
                              avatarUrl={internUser?.profile?.avatar_url}
                              name={internName}
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-extrabold text-sm text-slate-900 truncate">{internName}</h4>
                                {item.status === STATUS.COMPLETED && item.certificate_id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black">
                                    <BadgeCheck className="w-3 h-3" /> Certified
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                                {internUser?.profile?.university || internUser?.email}
                              </p>
                              {item.certificate_id && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-0.5 truncate">
                                  Cert: {item.certificate_id}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Track */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Building className="w-3.5 h-3.5 text-slate-400" />
                              <span>{item.department || "—"}</span>
                              <span className="text-blue-700 font-extrabold">· {item.duration_weeks || 6}W</span>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {item.start_date} → {item.end_date}
                            </p>
                          </div>
                        </td>

                        {/* Mentor */}
                        <td className="py-4 px-6">
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <span className={mentorName !== "—" ? "text-blue-700" : "text-slate-400 font-normal"}>
                              {mentorName}
                            </span>
                          </p>
                        </td>

                        {/* Score */}
                        <td className="py-4 px-6">
                          {evalScore != null ? (
                            <div className="flex items-center gap-2">
                              <div className={`text-sm font-black ${
                                evalScore >= 4 ? "text-emerald-600" :
                                evalScore >= 3 ? "text-blue-600" : "text-amber-600"
                              }`}>
                                {evalScore}/5
                              </div>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <div key={s} className={`w-2 h-2 rounded-full ${s <= evalScore ? "bg-amber-400" : "bg-slate-200"}`} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No eval</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center justify-end gap-2 flex-wrap">

                            {/* Stage 1: Waiting → approve to roster */}
                            {item.status === STATUS.WAITING && (
                              <button
                                onClick={(e) => handleApprove(e, item)}
                                disabled={isLoading}
                                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                              >
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                <span>{isLoading ? "Approving…" : "Approve & Move to Roster"}</span>
                              </button>
                            )}

                            {/* Stage 2: Roster → issue certificate */}
                            {item.status === STATUS.PENDING_GEN && (
                              <>
                                <button
                                  onClick={(e) => handleViewCertificate(e, item)}
                                  className="h-9 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-xl text-xs font-extrabold transition-all shadow-xs inline-flex items-center gap-1.5"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  onClick={(e) => handleIssueCertificate(e, item)}
                                  disabled={isLoading}
                                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 shadow-xs"
                                >
                                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                  <span>{isLoading ? "Issuing…" : "Issue Certificate"}</span>
                                </button>
                              </>
                            )}

                            {/* Stage 3: Certified - view only */}
                            {item.status === STATUS.COMPLETED && (
                              <button
                                onClick={(e) => handleViewCertificate(e, item)}
                                className="h-9 px-3.5 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-xl text-xs font-extrabold transition-all shadow-xs inline-flex items-center gap-1.5"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>View Certificate</span>
                              </button>
                            )}
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
