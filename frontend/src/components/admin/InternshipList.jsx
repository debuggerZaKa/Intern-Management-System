import React, { useState } from "react";
import {
  Briefcase,
  User,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { internshipService } from "../../services/internshipService";
import StatusBadge from "../common/StatusBadge";
import Modal from "../common/Modal";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";
import MentorAssignmentModal from "./MentorAssignmentModal";

export default function InternshipList({
  internships = [],
  mentors = [],
  interns = [],
  onRefresh,
  isAdmin = true,
}) {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [assignModalInternship, setAssignModalInternship] = useState(null);
  const [formData, setFormData] = useState({
    intern_id: "",
    mentor_id: "",
    department: "Enterprise Software Solutions",
    duration_weeks: 6,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTimelineData = (internship) => {
  const startDate = new Date(internship.start_date);
  const endDate = new Date(internship.end_date);
  const today = new Date();

  const duration = internship.duration_weeks || 1;

  // Before internship starts
  if (today < startDate) {
    return {
      currentWeek: 1,
      duration,
      progressPercent: 0,
    };
  }

  // After internship ends
  if (today >= endDate) {
    return {
      currentWeek: duration,
      duration,
      progressPercent: 100,
    };
  }

  // Calculate elapsed days
  const elapsedDays = Math.floor(
    (today - startDate) / (1000 * 60 * 60 * 24)
  );

  // Calculate current week
  const currentWeek = Math.min(
    duration,
    Math.floor(elapsedDays / 7) + 1
  );

  // Calculate timeline progress
  const totalDays = Math.max(
    1,
    Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
  );

  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round((elapsedDays / totalDays) * 100)
    )
  );

  return {
    currentWeek,
    duration,
    progressPercent,
  };
};

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.intern_id) {
      setError("Please select an intern.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await internshipService.createInternship({
        intern_id: parseInt(formData.intern_id),
        mentor_id: formData.mentor_id ? parseInt(formData.mentor_id) : null,
        department: formData.department,
        duration_weeks: parseInt(formData.duration_weeks) || 6,
        start_date: formData.start_date,
        end_date: formData.end_date,
      });
      setCreateModalOpen(false);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to create internship:", err);
      setError(err.message || "Failed to create internship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active & Historical Internships</h3>
          <p className="text-xs text-slate-500">Supervise timeline milestones, mentor attachments, and progress</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Internship</span>
          </button>
        )}
      </div>

      {/* Internships Grid / Cards */}
      {internships.length === 0 ? (
        <EmptyState
          title="No internships found"
          description="Create your first internship track to attach an intern to a supervising mentor."
          actionLabel={isAdmin ? "Create Internship" : null}
          onAction={isAdmin ? () => setCreateModalOpen(true) : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map((internship) => {
            console.log("INTERNSHIP DATA:", internship);
            const {
              currentWeek,
              duration,
              progressPercent
            } = getTimelineData(internship);

            return (
              <div
                key={internship.id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <StatusBadge status={internship.status} size="xs" />
                    <span className="text-[11px] font-bold text-slate-500">
                      Week {currentWeek} of {duration}
                    </span>
                  </div>

                  {/* Intern profile miniature */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {internship.intern?.profile?.full_name?.slice(0, 2) || "IN"}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {internship.intern?.profile?.full_name || internship.intern?.email || "Unknown Intern"}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {internship.intern?.profile?.university || internship.department || "Enterprise Software"}
                      </p>
                    </div>
                  </div>

                  {/* Milestone Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Timeline Progress</span>
                      <span className="font-bold text-blue-600">{progressPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Mentor supervisor info — only visible to Admin */}
                  {isAdmin && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium">Supervising Mentor</p>
                          <p className="font-bold text-slate-800 truncate max-w-[140px]">
                            {internship.mentor?.profile?.full_name || internship.mentor?.email || "Unassigned"}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAssignModalInternship(internship)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-white px-2 py-1 rounded-lg border border-slate-200 hover:border-blue-300 shadow-xs"
                      >
                        {internship.mentor ? "Reassign" : "Assign"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Dates */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Start: {internship.start_date || "—"}</span>
                  <span>End: {internship.end_date || "—"}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Internship Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Initialize New Internship Track"
        subtitle="Attach an active intern account to a department & mentor"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Intern <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={formData.intern_id}
              onChange={(e) => setFormData({ ...formData, intern_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              <option value="">-- Choose an Intern --</option>
              {interns.map((intern) => (
                <option key={intern.id} value={intern.id}>
                  {intern.profile?.full_name || intern.email} ({intern.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign Supervising Mentor (Optional)
            </label>
            <select
              value={formData.mentor_id}
              onChange={(e) => setFormData({ ...formData, mentor_id: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
            >
              <option value="">-- Assign Later --</option>
              {mentors.map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.profile?.full_name || mentor.email} ({mentor.profile?.department || "Mentor"})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Weeks)</label>
              <input
                type="number"
                min="1"
                max="52"
                value={formData.duration_weeks}
                onChange={(e) => setFormData({ ...formData, duration_weeks: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.intern_id}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-colors"
            >
              {loading ? "Creating..." : "Initialize Track"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Mentor Assignment Modal */}
      {assignModalInternship && (
        <MentorAssignmentModal
          isOpen={!!assignModalInternship}
          onClose={() => setAssignModalInternship(null)}
          internship={assignModalInternship}
          mentors={mentors}
          onAssigned={onRefresh}
        />
      )}
    </div>
  );
}
