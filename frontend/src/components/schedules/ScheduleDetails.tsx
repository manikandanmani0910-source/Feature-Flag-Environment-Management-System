import {
  Calendar,
  Clock,
  Hash,
  Server,
} from "lucide-react";

import { ScheduleStatus } from "./ScheduleStatus";

interface Schedule {
  id: number | string;
  name?: string | null;
  description?: string | null;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  start_at?: string | null;
  end_at?: string | null;
  enabled?: boolean | null;
  status?: "active" | "scheduled" | "disabled" | "completed";
}

interface ScheduleDetailsProps {
  schedule: Schedule | null;
}

export function ScheduleDetails({
  schedule,
}: ScheduleDetailsProps) {
  if (!schedule) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select a schedule to view its details.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            {schedule.name ??
              `Schedule #${schedule.id}`}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Feature flag schedule details.
          </p>
        </div>

        <ScheduleStatus
          status={schedule.status}
          enabled={
            schedule.enabled ?? true
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
        <Detail
          icon={
            <Hash className="h-4 w-4" />
          }
          label="Schedule ID"
          value={String(schedule.id)}
        />

        <Detail
          icon={
            <Server className="h-4 w-4" />
          }
          label="Feature Flag"
          value={
            schedule.feature_flag_id !=
            null
              ? `Feature #${schedule.feature_flag_id}`
              : "—"
          }
        />

        <Detail
          icon={
            <Server className="h-4 w-4" />
          }
          label="Environment"
          value={
            schedule.environment_id !=
            null
              ? `Environment #${schedule.environment_id}`
              : "—"
          }
        />

        <Detail
          icon={
            <Clock className="h-4 w-4" />
          }
          label="Start"
          value={formatDateTime(
            schedule.start_at,
          )}
        />

        <Detail
          icon={
            <Clock className="h-4 w-4" />
          }
          label="End"
          value={formatDateTime(
            schedule.end_at,
          )}
        />
      </div>

      {schedule.description && (
        <div className="border-t border-slate-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Description
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {schedule.description}
          </p>
        </div>
      )}

      <div className="border-t border-slate-200 px-6 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Calendar className="h-4 w-4" />
          Schedule timing controls feature activation.
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

function formatDateTime(
  value?: string | null,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}