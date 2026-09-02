import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  UserPlus,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  GraduationCap,
  Building2,
  Mail,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { mentorService } from "../../services/mentorService";

export default function MentorAddInternModal({ isOpen, onClose, onRequestSent }) {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'unassigned' | 'pending'
  const [sendingId, setSendingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [notesState, setNotesState] = useState({});
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadInterns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mentorService.getAvailableInterns();
      setInterns(data || []);
    } catch (err) {
      console.error("Failed to load available interns:", err);
      setError(err.message || "Failed to load interns directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadInterns();
      setSuccessMessage(null);
      setExpandedNoteId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendRequest = async (internId) => {
    try {
      setSendingId(internId);
      setError(null);
      const note = notesState[internId] || "";
      await mentorService.sendMentorshipRequest(internId, note);
      
      setSuccessMessage("Mentorship invitation sent successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
      
      // Update local state
      setInterns((prev) =>
        prev.map((i) =>
          i.id === internId
            ? { ...i, request_status: "pending" }
            : i
        )
      );
      setExpandedNoteId(null);
      if (onRequestSent) onRequestSent();
    } catch (err) {
      console.error("Failed to send mentorship request:", err);
      setError(err.message || "Could not send mentorship request.");
    } finally {
      setSendingId(null);
    }
  };

  const handleCancelRequest = async (requestId, internId) => {
    try {
      setCancellingId(internId);
      setError(null);
      if (requestId) {
        await mentorService.cancelRequest(requestId);
      }
      setSuccessMessage("Mentorship request cancelled.");
      setTimeout(() => setSuccessMessage(null), 3000);

      // Refresh list to update request status
      await loadInterns();
      if (onRequestSent) onRequestSent();
    } catch (err) {
      console.error("Failed to cancel mentorship request:", err);
      setError(err.message || "Could not cancel request.");
    } finally {
      setCancellingId(null);
    }
  };

  const filteredInterns = interns.filter((intern) => {
    const q = search.toLowerCase().trim();
    const matchesQuery =
      !q ||
      intern.full_name?.toLowerCase().includes(q) ||
      intern.email?.toLowerCase().includes(q) ||
      intern.department?.toLowerCase().includes(q) ||
      intern.university?.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (activeTab === "unassigned") {
      return !intern.current_mentor_id && !intern.is_assigned_to_me;
    }
    if (activeTab === "pending") {
      return intern.request_status === "pending";
    }
    return true;
  });

  const unassignedCount = interns.filter(
    (i) => !i.current_mentor_id && !i.is_assigned_to_me
  ).length;
  const pendingCount = interns.filter((i) => i.request_status === "pending").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Assign & Request Interns</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Cohort
                </span>
              </h3>
              <p className="text-xs text-slate-300/80">
                Browse candidate interns and send an invitation to supervise their internship track
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-800 text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Toolbar: Search and Filter Tabs */}
        <div className="p-6 pb-3 space-y-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, department or university..."
                className="w-full h-10 pl-9 pr-4 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 font-medium"
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

            <button
              onClick={loadInterns}
              title="Refresh roster"
              className="h-10 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              All Interns ({interns.length})
            </button>
            <button
              onClick={() => setActiveTab("unassigned")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "unassigned"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              Requests Sent ({pendingCount})
            </button>
          </div>
        </div>

        {/* Interns List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-blue-600" />
              <p className="text-xs font-bold text-slate-600">Loading intern directory...</p>
            </div>
          ) : filteredInterns.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
              <GraduationCap className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No interns found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search ? `No interns match "${search}".` : "No interns available under the selected filter."}
              </p>
            </div>
          ) : (
            filteredInterns.map((intern) => {
              const isAssignedToMe = intern.is_assigned_to_me;
              const isPending = intern.request_status === "pending";
              const isSending = sendingId === intern.id;
              const isCancelling = cancellingId === intern.id;
              const isNoteOpen = expandedNoteId === intern.id;

              return (
                <div
                  key={intern.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isAssignedToMe
                      ? "bg-blue-50/40 border-blue-200/80"
                      : isPending
                      ? "bg-amber-50/30 border-amber-200/80"
                      : "bg-white border-slate-200/90 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Left Intern Details */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md flex-shrink-0">
                        {intern.full_name?.slice(0, 2).toUpperCase() || "IN"}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{intern.full_name}</h4>
                          {isAssignedToMe ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Assigned to You
                            </span>
                          ) : isPending ? (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold flex items-center gap-1 border border-amber-300">
                              <Clock className="w-3 h-3" />
                              Request Pending
                            </span>
                          ) : intern.current_mentor_name ? (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                              Supervised by {intern.current_mentor_name}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[10px] font-extrabold border border-blue-200">
                              Unassigned Cohort
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {intern.email}
                          </span>
                          {intern.department && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              {intern.department}
                            </span>
                          )}
                          {intern.university && (
                            <span className="flex items-center gap-1 text-slate-500">
                              <GraduationCap className="w-3 h-3 text-slate-400" />
                              {intern.university}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:self-center flex-shrink-0">
                      {isAssignedToMe ? (
                        <div className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-500 text-xs font-bold border border-slate-200">
                          Active Mentee
                        </div>
                      ) : isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCancelRequest(intern.request_id, intern.id)}
                            disabled={isCancelling}
                            className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors disabled:opacity-50"
                          >
                            {isCancelling ? "Cancelling..." : "Cancel Request"}
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedNoteId(isNoteOpen ? null : intern.id)
                            }
                            className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                          >
                            {isNoteOpen ? "Hide Note" : "Add Note"}
                          </button>
                          <button
                            onClick={() => handleSendRequest(intern.id)}
                            disabled={isSending}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/30 transition-all disabled:opacity-60"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSending ? "Sending..." : "Send Request"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Note Input Bar */}
                  {isNoteOpen && !isAssignedToMe && !isPending && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 animate-fadeIn">
                      <input
                        type="text"
                        placeholder="Optional invitation note (e.g., 'Looking forward to mentoring you on Backend services')..."
                        value={notesState[intern.id] || ""}
                        onChange={(e) =>
                          setNotesState({
                            ...notesState,
                            [intern.id]: e.target.value,
                          })
                        }
                        className="flex-1 h-9 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                      />
                      <button
                        onClick={() => handleSendRequest(intern.id)}
                        disabled={isSending}
                        className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 flex-shrink-0 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Once sent, the intern will be notified on their dashboard to accept or decline.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
