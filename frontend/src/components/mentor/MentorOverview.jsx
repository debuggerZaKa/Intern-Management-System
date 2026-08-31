import React, { useState, useEffect } from "react";
import { Users, FileCheck, AlertTriangle, Sparkles, Plus } from "lucide-react";
import { mentorService } from "../../services/mentorService";
import StatCard from "../common/StatCard";
import AttentionTracker from "./AttentionTracker";
import InternCard from "./InternCard";
import InternDetailView from "./InternDetailView";
import Loader from "../common/Loader";
import EmptyState from "../common/EmptyState";
import ErrorMessage from "../common/ErrorMessage";

export default function MentorOverview() {
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
      setError(err.message || "Failed to load assigned interns data.");
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
    return <Loader message="Loading mentor portal & assigned interns..." />;
  }

  return (
    <div className="space-y-6">
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Assigned Interns"
          value={internships.length}
          subtitle="Active mentees"
          icon={Users}
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
          subtitle="Llama 3.3 Versatile active"
          icon={Sparkles}
          color="indigo"
        />
      </div>

      {/* Urgent Attention Alert Box */}
      <AttentionTracker
        attentionList={attentionList}
        onSelectIntern={(internId) => setSelectedInternId(internId)}
      />

      {/* Interns Grid Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Your Assigned Interns</h3>
            <p className="text-xs text-slate-500">
              Select an intern to view their weekly reports, tasks board, reported blockers, and submit evaluations
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {internships.length} Active Mentees
          </span>
        </div>

        {internships.length === 0 ? (
          <EmptyState
            title="No interns currently assigned"
            description="You do not have any active mentees assigned. An administrator will assign interns to you."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {internships.map((internship) => (
              <InternCard
                key={internship.id}
                internship={internship}
                onClick={() => setSelectedInternId(internship.intern_id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
