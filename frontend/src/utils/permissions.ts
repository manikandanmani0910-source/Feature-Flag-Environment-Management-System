import type { AuthUser } from "../types/auth";

export function isAdmin(
  user?: AuthUser | null,
): boolean {
  return Boolean(
    user?.is_superuser,
  );
}

export function canManageUsers(
  user?: AuthUser | null,
): boolean {
  return isAdmin(user);
}

export function canManageFeatureFlags(
  user?: AuthUser | null,
): boolean {
  return Boolean(
    user?.is_active,
  );
}

export function canManageEnvironments(
  user?: AuthUser | null,
): boolean {
  return Boolean(
    user?.is_active,
  );
}