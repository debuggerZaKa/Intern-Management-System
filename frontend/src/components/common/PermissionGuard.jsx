import React from "react";
import { usePermission } from "../../hooks/usePermission";

export default function PermissionGuard({
  permission,
  permissions = [],
  requireAll = false,
  fallback = null,
  children
}) {
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
    return fallback;
  }

  return <>{children}</>;
}
