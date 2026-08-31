import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import DashboardPage from "../pages/DashboardPage";
import UsersPage from "../pages/UsersPage";
import InternshipsPage from "../pages/InternshipsPage";
import TasksPage from "../pages/TasksPage";
import ReportsPage from "../pages/ReportsPage";
import BlockersPage from "../pages/BlockersPage";
import EvaluationsPage from "../pages/EvaluationsPage";
import AuditLogsPage from "../pages/AuditLogsPage";
import ProfilePage from "../pages/ProfilePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleRoute from "../components/common/RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

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

      {/* Admin Specific Routes */}
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
        path="/internships"
        element={
          <ProtectedRoute>
            <InternshipsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TasksPage />
          </ProtectedRoute>
        }
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
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
