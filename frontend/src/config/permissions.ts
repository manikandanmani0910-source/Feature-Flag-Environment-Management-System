export const permissions = {
  dashboard: {
    view: "dashboard:view",
  },

  analytics: {
    view: "analytics:view",
  },

  featureFlags: {
    view: "feature_flags:view",
    create: "feature_flags:create",
    update: "feature_flags:update",
    delete: "feature_flags:delete",
    activate: "feature_flags:activate",
    deactivate:
      "feature_flags:deactivate",
  },

  environments: {
    view: "environments:view",
    create: "environments:create",
    update: "environments:update",
    delete: "environments:delete",
  },

  rollouts: {
    view: "rollouts:view",
    create: "rollouts:create",
    update: "rollouts:update",
    delete: "rollouts:delete",
  },

  evaluations: {
    view: "evaluations:view",
    evaluate: "evaluations:evaluate",
  },

  usage: {
    view: "usage:view",
  },

  auditLogs: {
    view: "audit_logs:view",
  },

  users: {
    view: "users:view",
    create: "users:create",
    update: "users:update",
    delete: "users:delete",
  },

  settings: {
    view: "settings:view",
  },
} as const;

export type Permission =
  string;

export function hasPermission(
  userPermissions:
    | string[]
    | undefined
    | null,
  permission: Permission,
): boolean {
  if (
    !userPermissions ||
    userPermissions.length === 0
  ) {
    return false;
  }

  return userPermissions.includes(
    permission,
  );
}

export function hasAnyPermission(
  userPermissions:
    | string[]
    | undefined
    | null,
  requiredPermissions: Permission[],
): boolean {
  if (
    !userPermissions ||
    userPermissions.length === 0
  ) {
    return false;
  }

  return requiredPermissions.some(
    (permission) =>
      userPermissions.includes(
        permission,
      ),
  );
}

export function hasAllPermissions(
  userPermissions:
    | string[]
    | undefined
    | null,
  requiredPermissions: Permission[],
): boolean {
  if (
    !userPermissions ||
    userPermissions.length === 0
  ) {
    return false;
  }

  return requiredPermissions.every(
    (permission) =>
      userPermissions.includes(
        permission,
      ),
  );
}