import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import DashboardPage from "../pages/DashboardPage";
import UsersPage from "../pages/UsersPage";
import InternsPage from "../pages/InternsPage";
import AlumniPage from "../pages/AlumniPage";
import MentorsPage from "../pages/MentorsPage";
import InternshipsPage from "../pages/InternshipsPage";
import ProjectsPage from "../pages/ProjectsPage";
import ReportsPage from "../pages/ReportsPage";
import BlockersPage from "../pages/BlockersPage";
import EvaluationsPage from "../pages/EvaluationsPage";
import SettingsPage from "../pages/SettingsPage";
import AuditLogsPage from "../pages/AuditLogsPage";
import ProfilePage from "../pages/ProfilePage";
import CertificatePage from "../pages/CertificatePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Root redirects to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Directories */}
      <Route
        path="/interns"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <InternsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/alumni"
        element={
          <RoleRoute allowedRoles={["admin", "mentor"]}>
            <AlumniPage />
          </RoleRoute>
        }
      />
      <Route
        path="/mentors"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <MentorsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/users"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <UsersPage />
          </RoleRoute>
        }
      />

      <Route
        path="/audit-logs"
        element={
          <RoleRoute allowedRoles={["admin"]}>
            <AuditLogsPage />
          </RoleRoute>
        }
      />

      {/* Shared Authenticated Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/internships"
        element={
          <ProtectedRoute>
            <InternshipsPage />
          </ProtectedRoute>
        }
      />
      {/* Redirect /tasks to /projects */}
      <Route
        path="/tasks"
        element={<Navigate to="/projects" replace />}
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blockers"
        element={
          <ProtectedRoute>
            <BlockersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/evaluations"
        element={
          <ProtectedRoute>
            <EvaluationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={<Navigate to="/settings" replace />}
      />

      {/* Full-Page Printable Certificate Routes */}
      <Route
        path="/certificate/:internshipId"
        element={
          <ProtectedRoute>
            <CertificatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificate"
        element={
          <ProtectedRoute>
            <CertificatePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
