import React, { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Building2,
  Mail,
  AlertCircle
} from "lucide-react";
import { internService } from "../../services/internService";

export default function MentorshipRequestsCard({ onAssignmentUpdated }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [successBanner, setSuccessBanner] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await internService.getMentorshipRequests();
      // Filter for pending requests
      const pending = (data || []).filter((r) => r.status === "pending");
      setRequests(pending);
    } catch (err) {
      console.error("Failed to load mentorship requests:", err);
      setError(err.message || "Failed to load mentorship requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (requestId, action, mentorName) => {
    try {
      setActionLoadingId(requestId);
      setError(null);
      const res = await internService.respondToMentorshipRequest(requestId, action);
      
      if (action === "accept") {
        setSuccessBanner(res.message || `You are now assigned to mentor ${mentorName}!`);
        // Remove accepted request and any cancelled ones
        setRequests([]);
        if (onAssignmentUpdated) {
          onAssignmentUpdated();
        }
      } else {
        // Remove declined request
        setRequests((prev) => prev.filter((r) => r.id !== requestId));
      }
    } catch (err) {
      console.error("Failed to respond to mentorship request:", err);
      setError(err.message || "Could not process response.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && requests.length === 0) return null;
  if (!loading && requests.length === 0 && !successBanner) return null;

  return (
    <div className="space-y-3 animate-fadeIn">
      {successBanner && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/20 to-teal-500/10 border-2 border-emerald-500/40 text-emerald-950 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-black text-emerald-900">{successBanner}</p>
              <p className="text-xs text-emerald-700">Your dashboard is now synced with your supervising mentor.</p>
            </div>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {requests.map((req) => {
        const mentor = req.mentor || {};
        const isProcessing = actionLoadingId === req.id;
        const mentorName = mentor.full_name || mentor.email || "Corporate Mentor";

        return (
          <div
            key={req.id}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/50 border-2 border-blue-400/60 shadow-lg shadow-blue-500/10 p-5 sm:p-6 space-y-4"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Mentorship Request Received
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {new Date(req.created_at).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Mentor Info Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-md flex-shrink-0">
                  {mentorName.slice(0, 2).toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-slate-900 tracking-tight">
                    {mentorName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                    {mentor.job_title && (
                      <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-lg text-[11px]">
                        {mentor.job_title}
                      </span>
                    )}
                    {mentor.department && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {mentor.department}
                      </span>
                    )}
                    {mentor.email && (
                      <span className="flex items-center gap-1 text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {mentor.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 sm:self-center">
                <button
                  onClick={() => handleRespond(req.id, "reject", mentorName)}
                  disabled={isProcessing}
                  className="h-10 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Decline
                </button>
                <button
                  onClick={() => handleRespond(req.id, "accept", mentorName)}
                  disabled={isProcessing}
                  className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isProcessing ? "Processing..." : "Accept Request"}</span>
                </button>
              </div>
            </div>

            {/* Note from Mentor */}
            {req.notes && (
              <div className="p-3 bg-white/90 rounded-2xl border border-blue-200/70 text-xs text-slate-700 font-medium">
                <span className="font-bold text-slate-900 mr-1.5">Note from Mentor:</span>
                "{req.notes}"
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
