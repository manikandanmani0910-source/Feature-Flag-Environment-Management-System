import {
  Edit,
  Eye,
} from "lucide-react";

import { ScheduleStatus } from "./ScheduleStatus";

interface Schedule {
  id: number | string;
  name?: string | null;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  start_at?: string | null;
  end_at?: string | null;
  enabled?: boolean | null;
  status?: "active" | "scheduled" | "disabled" | "completed";
}

interface ScheduleTableProps {
  schedules: Schedule[];
  loading?: boolean;
  onView?: (
    schedule: Schedule,
  ) => void;
  onEdit?: (
    schedule: Schedule,
  ) => void;
}

export function ScheduleTable({
  schedules,
  loading = false,
  onView,
  onEdit,
}: ScheduleTableProps) {
  if (loading) {
    return (
      <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-white">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Schedule
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Environment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Start
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                End
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              {(onView || onEdit) && (
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {schedules.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView || onEdit
                      ? 7
                      : 6
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No schedules found.
                </td>
              </tr>
            ) : (
              schedules.map(
                (schedule) => (
                  <tr
                    key={schedule.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {schedule.name ??
                          `Schedule #${schedule.id}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID:{" "}
                        {schedule.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {schedule.feature_flag_id !=
                      null
                        ? `Feature #${schedule.feature_flag_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {schedule.environment_id !=
                      null
                        ? `Environment #${schedule.environment_id}`
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDateTime(
                        schedule.start_at,
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {formatDateTime(
                        schedule.end_at,
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <ScheduleStatus
                        status={
                          schedule.status
                        }
                        enabled={
                          schedule.enabled ??
                          true
                        }
                      />
                    </td>

                    {(onView ||
                      onEdit) && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {onView && (
                            <button
                              type="button"
                              onClick={() =>
                                onView(
                                  schedule,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          )}

                          {onEdit && (
                            <button
                              type="button"
                              onClick={() =>
                                onEdit(
                                  schedule,
                                )
                              }
                              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {schedules.length}
        </span>{" "}
        schedules
      </div>
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