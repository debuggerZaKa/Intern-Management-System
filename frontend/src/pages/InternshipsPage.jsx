import React, { useState, useEffect } from "react";
import { Briefcase, Users, UserCheck } from "lucide-react";
import { internshipService } from "../services/internshipService";
import { adminService } from "../services/adminService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import InternshipList from "../components/admin/InternshipList";
import AdminMentorsDirectory from "../components/admin/AdminMentorsDirectory";
import AdminIntern360View from "../components/admin/AdminIntern360View";
import MentorAssignedInternsView from "../components/mentor/MentorAssignedInternsView";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function InternshipsPage() {
  const { isAdmin, isMentor, isIntern } = useAuth();
  const [internships, setInternships] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [interns, setInterns] = useState([]);
  const [activeTab, setActiveTab] = useState("pairings"); // 'pairings' | 'mentors'
  const [inspectInternId, setInspectInternId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const internshipsData = await internshipService.getInternships();
      setInternships(internshipsData || []);

      if (isAdmin) {
        const users = await adminService.getUsers();
        setMentors(users.filter((u) => u.role?.name === "mentor"));
        setInterns(users.filter((u) => u.role?.name === "intern"));
      }
    } catch (err) {
      console.error("Failed to load internships:", err);
      setError(err.message || "Failed to load internship tracks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isMentor) {
      loadData();
    }
  }, [isMentor]);

  return (
    <AppLayout>
      {isMentor ? (
        <MentorAssignedInternsView />
      ) : inspectInternId ? (
        <AdminIntern360View
          internId={inspectInternId}
          onBack={() => setInspectInternId(null)}
        />
      ) : (
        <div className="space-y-6">
          {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

          {/* Admin Tabs for Pairings vs Mentors Directory */}
          {isAdmin && (
            <div className="flex border-b border-slate-200 gap-2 bg-white px-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <button
                onClick={() => setActiveTab("pairings")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "pairings"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Internship Pairings ({internships.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("mentors")}
                className={`py-3.5 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                  activeTab === "mentors"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Corporate Mentors Directory ({mentors.length})</span>
              </button>
            </div>
          )}

          {loading ? (
            <Loader message="Loading internship tracks..." />
          ) : activeTab === "mentors" && isAdmin ? (
            <AdminMentorsDirectory onSelectIntern={(internId) => setInspectInternId(internId)} />
          ) : (
            <InternshipList
              internships={internships}
              mentors={mentors}
              interns={interns}
              onRefresh={loadData}
              isAdmin={isAdmin}
            />
          )}
        </div>
      )}
    </AppLayout>
  );
}
