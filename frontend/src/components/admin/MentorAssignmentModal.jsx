import React, { useState, useEffect } from "react";
import { UserCheck, History, Clock, ArrowRight, User } from "lucide-react";
import Modal from "../common/Modal";
import { adminService } from "../../services/adminService";
import ErrorMessage from "../common/ErrorMessage";
import Loader from "../common/Loader";

export default function MentorAssignmentModal({
  isOpen,
  onClose,
  internship,
  mentors = [],
  onAssigned,
}) {
  const [selectedMentorId, setSelectedMentorId] = useState("");
  const [notes, setNotes] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("assign"); // 'assign' | 'history'

  useEffect(() => {
    if (internship) {
      setSelectedMentorId(internship.mentor_id ? internship.mentor_id.toString() : "");
      setNotes("");
      setError(null);
      loadHistory();
    }
  }, [internship]);

  const loadHistory = async () => {
    if (!internship) return;
    try {
      setHistoryLoading(true);
      const data = await adminService.getAssignmentHistory(internship.id);
      setHistory(data || []);
    } catch (err) {
      console.warn("Could not load assignment history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!internship || !selectedMentorId) {
      setError("Please select a mentor to assign.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await adminService.assignMentor(internship.id, parseInt(selectedMentorId), notes);
      onAssigned?.();
      onClose();
    } catch (err) {
      console.error("Failed to assign mentor:", err);
      setError(err.message || "Failed to assign mentor.");
    } finally {
      setLoading(false);
    }
  };

  if (!internship) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mentor Assignment & Supervision"
      subtitle={`Intern: ${internship.intern?.profile?.full_name || internship.intern?.email || "Unknown"}`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("assign")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              activeTab === "assign"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Assign / Reassign Mentor
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Assignment History ({history.length})</span>
          </button>
        </div>

        {activeTab === "assign" ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Assigned Mentor
              </label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                  {internship.mentor?.profile?.full_name?.slice(0, 1) || "M"}
                </div>
                <div>
                  <p className="font-bold text-slate-800">
                    {internship.mentor?.profile?.full_name || internship.mentor?.email || "None Assigned"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {internship.mentor?.profile?.department || "Supervising Mentor"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select New / Reassigned Mentor <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedMentorId}
                onChange={(e) => setSelectedMentorId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              >
                <option value="">-- Choose a Mentor --</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.profile?.full_name || m.email} ({m.profile?.department || "Engineering"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Supervision Notes / Reason for Assignment
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Assigned to Cloud & Distributed Systems track for 6-week program..."
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !selectedMentorId}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
              >
                {loading ? "Assigning..." : "Confirm Mentor Assignment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {historyLoading ? (
              <Loader message="Loading assignment records..." />
            ) : history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No previous mentor assignment records found.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {history.map((record) => (
                  <div
                    key={record.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Mentor ID: {record.mentor_id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          record.is_active
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {record.is_active ? "Current Active" : "Historical"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Clock className="w-3 h-3" />
                      <span>
                        Assigned: {new Date(record.assigned_at).toLocaleDateString()}
                      </span>
                      {record.end_date && (
                        <span>
                          &bull; Ended: {new Date(record.end_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {record.notes && (
                      <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100 text-[11px] mt-1 italic">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
