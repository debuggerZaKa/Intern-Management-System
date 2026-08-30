import React from "react";
import { usePermission } from "../../hooks/usePermission";
import AccessDenied from "./AccessDenied";

export default function PermissionRoute({ permission, permissions = [], requireAll = false, children }) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermission();

  let isAllowed = false;

  if (permission) {
    isAllowed = hasPermission(permission);
  } else if (permissions.length > 0) {
    isAllowed = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  } else {
    isAllowed = true;
  }

  if (!isAllowed) {
    return <AccessDenied message="Your account role does not have the database permission required to access this page." />;
  }

  return children;
}
