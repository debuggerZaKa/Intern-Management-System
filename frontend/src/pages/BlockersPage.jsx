import React, { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Plus, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { blockerService } from "../services/blockerService";
import { reportService } from "../services/reportService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import StatusBadge from "../components/common/StatusBadge";
import BlockerTicketModal from "../components/intern/BlockerTicketModal";
import Modal from "../components/common/Modal";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorMessage from "../components/common/ErrorMessage";

export default function BlockersPage() {
  const { isIntern, isMentor, isAdmin } = useAuth();
  const [blockers, setBlockers] = useState([]);
  const [reports, setReports] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolvingBlocker, setResolvingBlocker] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [resolveLoading, setResolveLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== "all") {
        params.status_filter = statusFilter;
      }
      const [blockersData, reportsData] = await Promise.all([
        blockerService.getBlockers(params),
        isIntern ? reportService.getReports() : Promise.resolve([]),
      ]);
      setBlockers(blockersData || []);
      setReports(reportsData || []);
    } catch (err) {
      console.error("Failed to load blockers:", err);
      setError(err.message || "Failed to load blocker tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!resolvingBlocker) return;
    try {
      setResolveLoading(true);
      await blockerService.updateBlocker(resolvingBlocker.id, {
        status: "resolved",
        help_needed: resolutionNotes ? `Resolution: ${resolutionNotes}` : resolvingBlocker.help_needed,
      });
      setResolvingBlocker(null);
      setResolutionNotes("");
      loadData();
    } catch (err) {
      alert(`Failed to resolve blocker: ${err.message}`);
    } finally {
      setResolveLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Blockers & Roadblocks Center</h2>
            <p className="text-xs text-slate-500">
              {isIntern
                ? "Flag impediments, technical blockers, and request mentor guidance"
                : "Review and resolve active blockers raised by engineering interns"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-800 shadow-xs"
            >
              <option value="all">All Blockers</option>
              <option value="unresolved">Unresolved Only</option>
              <option value="resolved">Resolved Only</option>
            </select>

            {isIntern && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Raise Blocker</span>
              </button>
            )}
          </div>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading ? (
          <Loader message="Loading blocker records..." />
        ) : blockers.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No blocker tickets found"
            description={
              isIntern
                ? "You have no active or historical technical blockers recorded."
                : "No unresolved blockers have been logged by assigned interns."
            }
            actionLabel={isIntern ? "Raise a Blocker" : null}
            onAction={isIntern ? () => setCreateModalOpen(true) : null}
          />
        ) : (
          <div className="space-y-3">
            {blockers.map((blocker) => (
              <div
                key={blocker.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={blocker.severity} size="xs" />
                    <StatusBadge status={blocker.status} size="xs" />
                    <h4 className="font-bold text-sm text-slate-900">{blocker.title}</h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {blocker.description}
                  </p>

                  {blocker.help_needed && (
                    <p className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 max-w-fit">
                      Requested Help: {blocker.help_needed}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>Intern ID: #{blocker.intern_id}</span>
                    <span>Report #{blocker.report_id}</span>
                    <span>Created: {new Date(blocker.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Resolve Action Button for Mentors & Admins */}
                {blocker.status !== "resolved" && (isMentor || isAdmin) && (
                  <button
                    onClick={() => {
                      setResolvingBlocker(blocker);
                      setResolutionNotes("");
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex-shrink-0 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolve Blocker</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Raise Blocker Modal */}
        <BlockerTicketModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          reports={reports}
          onBlockerCreated={loadData}
        />

        {/* Resolve Blocker Modal */}
        <Modal
          isOpen={!!resolvingBlocker}
          onClose={() => setResolvingBlocker(null)}
          title="Resolve Blocker Ticket"
          subtitle={`Blocker: ${resolvingBlocker?.title}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Notes / Action Taken
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Granted IAM policy permissions for dev S3 bucket / Resolved merge conflict..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setResolvingBlocker(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={resolveLoading}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-500/20 transition-colors"
              >
                {resolveLoading ? "Saving..." : "Confirm Resolution"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </AppLayout>
  );
}
