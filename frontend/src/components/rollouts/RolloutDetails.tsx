import {
  Calendar,
  Hash,
  Percent,
  Server,
} from "lucide-react";

import { Badge } from "../common/Badge";

interface Rollout {
  id: number | string;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  percentage?: number | null;
  rollout_percentage?: number | null;
  enabled?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface RolloutDetailsProps {
  rollout: Rollout | null;
}

export function RolloutDetails({
  rollout,
}: RolloutDetailsProps) {
  if (!rollout) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select a rollout to view its details.
      </div>
    );
  }

  const percentage =
    rollout.percentage ??
    rollout.rollout_percentage ??
    0;

  const enabled =
    rollout.enabled ?? true;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Rollout #{rollout.id}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature rollout configuration.
          </p>
        </div>

        <Badge
          variant={
            enabled
              ? "success"
              : "default"
          }
        >
          {enabled
            ? "Active"
            : "Disabled"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <Detail
          icon={
            <Hash className="h-4 w-4" />
          }
          label="Rollout ID"
          value={String(rollout.id)}
        />

        <Detail
          icon={
            <Percent className="h-4 w-4" />
          }
          label="Percentage"
          value={`${percentage}%`}
        />

        <Detail
          icon={
            <Server className="h-4 w-4" />
          }
          label="Feature Flag"
          value={
            rollout.feature_flag_id !=
            null
              ? `Feature #${rollout.feature_flag_id}`
              : "—"
          }
        />

        <Detail
          icon={
            <Server className="h-4 w-4" />
          }
          label="Environment"
          value={
            rollout.environment_id !=
            null
              ? `Environment #${rollout.environment_id}`
              : "—"
          }
        />

        <Detail
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Created"
          value={
            rollout.created_at
              ? new Date(
                  rollout.created_at,
                ).toLocaleString()
              : "—"
          }
        />

        <Detail
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Updated"
          value={
            rollout.updated_at
              ? new Date(
                  rollout.updated_at,
                ).toLocaleString()
              : "—"
          }
        />
      </div>

      <div className="border-t border-slate-200 px-6 py-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Rollout progress
          </span>

          <span className="text-sm font-bold text-slate-900">
            {percentage}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800"
            style={{
              width: `${Math.min(
                Math.max(
                  percentage,
                  0,
                ),
                100,
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Detail({
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

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}