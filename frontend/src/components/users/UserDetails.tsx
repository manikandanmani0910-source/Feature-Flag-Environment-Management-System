import {
  Mail,
  Shield,
  User,
} from "lucide-react";

import type { AuthUser } from "../../types/auth";

interface UserDetailsProps {
  user: AuthUser;
}

export function UserDetails({
  user,
}: UserDetailsProps) {
  const displayName =
    user.full_name ||
    user.email ||
    `User #${user.id}`;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-sm font-bold text-slate-950">
          User Details
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <Detail
          icon={User}
          label="User"
          value={displayName}
        />

        <Detail
          icon={Mail}
          label="Email"
          value={user.email ?? "—"}
        />

        <Detail
          icon={Shield}
          label="Role"
          value={
            user.role_id != null
              ? `Role #${user.role_id}`
              : "—"
          }
        />

        <Detail
          icon={Shield}
          label="Account Status"
          value={
            user.is_active
              ? "Active"
              : "Inactive"
          }
        />

        <Detail
          icon={Shield}
          label="Access"
          value={
            user.is_superuser
              ? "Superuser"
              : "Standard User"
          }
        />
      </div>
    </section>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-100 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-medium text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}