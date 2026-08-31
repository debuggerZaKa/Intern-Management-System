import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AccessDenied from "./AccessDenied";
import Loader from "./Loader";

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user, authLoading, hasRole } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Verifying role permissions..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleAllowed = hasRole(allowedRoles);

  if (!roleAllowed) {
    return <AccessDenied requiredRole={Array.isArray(allowedRoles) ? allowedRoles.join(" or ") : allowedRoles} />;
  }

  return children;
}
