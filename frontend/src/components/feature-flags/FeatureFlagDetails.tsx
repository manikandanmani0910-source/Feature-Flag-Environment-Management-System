import {
  Calendar,
  Hash,
  KeyRound,
  ToggleRight,
} from "lucide-react";

import { Badge } from "../common/Badge";

import { FeatureFlagStatus } from "./FeatureFlagStatus";

interface FeatureFlag {
  id: number | string;
  name?: string | null;
  key?: string | null;
  description?: string | null;
  enabled?: boolean | null;
  is_active?: boolean | null;
  default_value?: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

interface FeatureFlagDetailsProps {
  featureFlag: FeatureFlag | null;
}

export function FeatureFlagDetails({
  featureFlag,
}: FeatureFlagDetailsProps) {
  if (!featureFlag) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select a feature flag to view its details.
      </div>
    );
  }

  const enabled =
    featureFlag.enabled ??
    featureFlag.is_active ??
    false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {featureFlag.name ??
              `Feature #${featureFlag.id}`}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature flag configuration and status.
          </p>
        </div>

        <FeatureFlagStatus
          enabled={enabled}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <Detail
          icon={
            <Hash className="h-4 w-4" />
          }
          label="ID"
          value={String(
            featureFlag.id,
          )}
        />

        <Detail
          icon={
            <KeyRound className="h-4 w-4" />
          }
          label="Key"
          value={
            featureFlag.key ?? "—"
          }
        />

        <Detail
          icon={
            <ToggleRight className="h-4 w-4" />
          }
          label="Status"
          value={
            enabled
              ? "Enabled"
              : "Disabled"
          }
        />

        <Detail
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Created"
          value={
            featureFlag.created_at
              ? new Date(
                  featureFlag.created_at,
                ).toLocaleString()
              : "—"
          }
        />
      </div>

      {featureFlag.description && (
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {featureFlag.description}
          </p>
        </div>
      )}

      {featureFlag.default_value !==
        undefined && (
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Default Value
          </p>

          <pre className="mt-2 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-200">
            {typeof featureFlag.default_value ===
            "string"
              ? featureFlag.default_value
              : JSON.stringify(
                  featureFlag.default_value,
                  null,
                  2,
                )}
          </pre>
        </div>
      )}

      <div className="border-t border-slate-200 px-6 py-4">
        <Badge
          variant={
            enabled
              ? "success"
              : "default"
          }
        >
          {enabled
            ? "Feature is active"
            : "Feature is inactive"}
        </Badge>
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

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}