import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { adminService } from "../services/adminService";
import { internService } from "../services/internService";
import AppLayout from "../components/common/AppLayout";
import AnalyticsOverview from "../components/admin/AnalyticsOverview";
import MentorOverview from "../components/mentor/MentorOverview";
import InternOverview from "../components/intern/InternOverview";
import Loader from "../components/common/Loader";
import ErrorMessage from "../components/common/ErrorMessage";

export default function DashboardPage() {
  const { user, isAdmin, isMentor, isIntern } = useAuth();
  const navigate = useNavigate();

  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [internDashboard, setInternDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (isAdmin) {
        const data = await adminService.getAnalytics();
        setAdminAnalytics(data);
      } else if (isIntern) {
        const data = await internService.getDashboard();
        setInternDashboard(data);
      }
      // Mentor loads its own in MentorOverview component
    } catch (err) {
      console.error("Dashboard load failed:", err);
      setError(err.message || "Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return (
    <AppLayout>
      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {loading ? (
        <Loader message="Loading personalized dashboard..." />
      ) : (
        <>
          {isAdmin && <AnalyticsOverview analytics={adminAnalytics} />}
          {isMentor && <MentorOverview />}
          {isIntern && (
            <InternOverview
              dashboard={internDashboard}
              onNavigateToTasks={() => navigate("/tasks")}
              onNavigateToReports={() => navigate("/reports")}
              onNavigateToBlockers={() => navigate("/blockers")}
            />
          )}
        </>
      )}
    </AppLayout>
  );
}
