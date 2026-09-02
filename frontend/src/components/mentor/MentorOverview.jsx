import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileCheck,
  AlertTriangle,
  Sparkles,
  FolderGit2,
  FileText,
  AlertCircle,
  Award,
  ArrowRight,
  GraduationCap
} from "lucide-react";
import { mentorService } from "../../services/mentorService";
import StatCard from "../common/StatCard";
import AttentionTracker from "./AttentionTracker";
import InternDetailView from "./InternDetailView";
import Loader from "../common/Loader";
import ErrorMessage from "../common/ErrorMessage";

export default function MentorOverview() {
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [attentionList, setAttentionList] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [internsData, attentionData] = await Promise.all([
        mentorService.getAssignedInterns(),
        mentorService.getInternsNeedingAttention(),
      ]);
      setInternships(internsData || []);
      setAttentionList(attentionData || []);
    } catch (err) {
      console.error("Failed to load mentor overview data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return <Loader message="Loading mentor portal dashboard..." />;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Assigned Interns"
          value={internships.length}
          subtitle="Active mentees supervised"
          icon={GraduationCap}
          color="blue"
        />
        <StatCard
          title="Attention Required"
          value={attentionList.length}
          subtitle={attentionList.length > 0 ? "Critical blockers or risk" : "All mentees on track"}
          icon={AlertTriangle}
          color={attentionList.length > 0 ? "amber" : "emerald"}
        />
        <StatCard
          title="Standard Duration"
          value="6 Weeks"
          subtitle="Structured milestones"
          icon={FileCheck}
          color="purple"
        />
        <StatCard
          title="AI Mentorship"
          value="Enabled"
          subtitle="Real-time assistant active"
          icon={Sparkles}
          color="indigo"
        />
      </div>

      {/* Urgent Attention Alert Box */}
      <AttentionTracker
        attentionList={attentionList}
        onSelectIntern={(internId) => setSelectedInternId(internId)}
      />

      {/* Mentor Quick Workspace Shortcuts */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Mentor Operations Center
            </h3>
            <p className="text-xs text-slate-500">
              Access your assigned mentees, evaluate deliverables, review weekly reports, and resolve roadblocks
            </p>
          </div>
          <button
            onClick={() => navigate("/internships")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all hover:scale-[1.02] self-start sm:self-auto"
          >
            <Users className="w-4 h-4" />
            <span>Go to Assigned Interns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div
            onClick={() => navigate("/internships")}
            className="p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
              Assigned Interns
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              View your {internships.length} active mentees roster, contact info, and track progress
            </p>
          </div>

          <div
            onClick={() => navigate("/reports")}
            className="p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Weekly Reports
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Review submitted weekly logs and provide structured mentor feedback
            </p>
          </div>

          <div
            onClick={() => navigate("/blockers")}
            className="p-4 rounded-2xl bg-rose-50/50 hover:bg-rose-50 border border-rose-100 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">
              Blocker Support
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Address critical technical roadblocks and unblock mentees quickly
            </p>
          </div>

          <div
            onClick={() => navigate("/evaluations")}
            className="p-4 rounded-2xl bg-purple-50/50 hover:bg-purple-50 border border-purple-100 transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-purple-600 transition-colors">
              Evaluations & Grading
            </h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Complete midterm and final performance evaluations for graduation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

