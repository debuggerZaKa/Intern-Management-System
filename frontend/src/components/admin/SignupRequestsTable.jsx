import React, { useState } from "react";
import { Check, X, User, Mail, Calendar, MessageSquare, AlertCircle } from "lucide-react";
import { adminService } from "../../services/adminService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function SignupRequestsTable({ requests, onRefresh }) {
  const [selectedReq, setSelectedReq] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const openActionModal = (req, type) => {
    setSelectedReq(req);
    setActionType(type);
    setAdminNotes("");
    setError(null);
  };

  const handleAction = async () => {
    if (!selectedReq || !actionType) return;
    try {
      setLoading(true);
      setError(null);
      if (actionType === "approve") {
        await adminService.approveSignupRequest(selectedReq.id, adminNotes);
      } else {
        await adminService.rejectSignupRequest(selectedReq.id, adminNotes);
      }
      setSelectedReq(null);
      setActionType(null);
      onRefresh?.();
    } catch (err) {
      console.error(`Failed to ${actionType} request:`, err);
      setError(err.message || `Failed to ${actionType} signup request.`);
    } finally {
      setLoading(false);
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <EmptyState
        title="No pending signup requests"
        description="All user self-registrations have been reviewed and resolved."
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Pending Self-Signup Requests</h3>
          <p className="text-xs text-slate-500">Review and approve new intern candidates requesting platform access</p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          {requests.length} Pending
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/70 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <tr>
              <th className="px-5 py-3.5">Candidate</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Submitted On</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {req.full_name?.slice(0, 2) || "IN"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{req.full_name || "Applicant"}</p>
                      <p className="text-[11px] text-slate-400">Internship Candidate</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-medium text-slate-600">{req.email}</td>
                <td className="px-5 py-4 text-slate-500">
                  {req.created_at ? new Date(req.created_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-5 py-4">
                  <StatusBadge status={req.status} size="sm" />
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => openActionModal(req, "approve")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openActionModal(req, "reject")}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-xs transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation & Notes Modal */}
      <Modal
        isOpen={!!selectedReq}
        onClose={() => {
          setSelectedReq(null);
          setActionType(null);
        }}
        title={actionType === "approve" ? "Approve Signup Request" : "Reject Signup Request"}
        subtitle={`Applicant: ${selectedReq?.full_name} (${selectedReq?.email})`}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          <p className="text-xs text-slate-600 leading-relaxed">
            {actionType === "approve"
              ? "Approving this request will immediately activate the account and grant the intern access to their portal."
              : "Rejecting this request will mark the account status as rejected and deny platform access."}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Approved after technical screening and HR verification..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setSelectedReq(null);
                setActionType(null);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              disabled={loading}
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-sm transition-colors ${
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 shadow-emerald-500/20"
                  : "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 shadow-rose-500/20"
              }`}
            >
              {loading ? "Processing..." : actionType === "approve" ? "Confirm Approval" : "Confirm Rejection"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
