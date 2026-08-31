import React, { useState, useEffect } from "react";
import { Briefcase } from "lucide-react";
import { internshipService } from "../services/internshipService";
import { adminService } from "../services/adminService";
import { useAuth } from "../hooks/useAuth";
import AppLayout from "../components/common/AppLayout";
import InternshipList from "../components/admin/InternshipList";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function InternshipsPage() {
  const { isAdmin, isMentor, isIntern } = useAuth();
  const [internships, setInternships] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [interns, setInterns] = useState([]);
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
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Internship Tracks & Milestones</h2>
          <p className="text-xs text-slate-500">
            Monitor engineering tracks, weekly progression, and supervisor attachments
          </p>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading ? (
          <Loader message="Loading internship tracks..." />
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
    </AppLayout>
  );
}
