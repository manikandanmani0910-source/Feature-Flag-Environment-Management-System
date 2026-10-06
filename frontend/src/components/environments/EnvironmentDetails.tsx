import {
  Calendar,
  Hash,
  KeyRound,
  Server,
} from "lucide-react";

import { Badge } from "../common/Badge";

export interface Environment {
  id: number | string;
  name?: string | null;
  key?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface EnvironmentDetailsProps {
  environment: Environment | null;
}

export function EnvironmentDetails({
  environment,
}: EnvironmentDetailsProps) {
  if (!environment) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select an environment to view its details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {environment.name ??
              `Environment #${environment.id}`}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Environment configuration and status.
          </p>
        </div>

        <Badge
          variant={
            environment.is_active === false
              ? "danger"
              : "success"
          }
        >
          {environment.is_active === false
            ? "Inactive"
            : "Active"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <DetailItem
          icon={<Hash className="h-4 w-4" />}
          label="Environment ID"
          value={String(environment.id)}
        />

        <DetailItem
          icon={<Server className="h-4 w-4" />}
          label="Name"
          value={
            environment.name ?? "—"
          }
        />

        <DetailItem
          icon={<KeyRound className="h-4 w-4" />}
          label="Key"
          value={
            environment.key ?? "—"
          }
        />

        <DetailItem
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Created"
          value={
            environment.created_at
              ? new Date(
                  environment.created_at,
                ).toLocaleString()
              : "—"
          }
        />
      </div>

      {environment.description && (
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {environment.description}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}