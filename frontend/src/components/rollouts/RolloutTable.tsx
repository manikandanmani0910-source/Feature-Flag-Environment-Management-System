import {
  Edit,
  Eye,
} from "lucide-react";

import { Badge } from "../common/Badge";

interface Rollout {
  id: number | string;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  percentage?: number | null;
  rollout_percentage?: number | null;
  enabled?: boolean | null;
}

interface RolloutTableProps {
  rollouts: Rollout[];
  loading?: boolean;
  onView?: (
    rollout: Rollout,
  ) => void;
  onEdit?: (
    rollout: Rollout,
  ) => void;
}

export function RolloutTable({
  rollouts,
  loading = false,
  onView,
  onEdit,
}: RolloutTableProps) {
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
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rollout
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Environment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Percentage
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
            {rollouts.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView || onEdit
                      ? 6
                      : 5
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No rollouts found.
                </td>
              </tr>
            ) : (
              rollouts.map(
                (rollout) => {
                  const percentage =
                    rollout.percentage ??
                    rollout.rollout_percentage ??
                    0;

                  const enabled =
                    rollout.enabled ??
                    true;

                  return (
                    <tr
                      key={rollout.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        Rollout #
                        {rollout.id}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {rollout.feature_flag_id !=
                        null
                          ? `Feature #${rollout.feature_flag_id}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {rollout.environment_id !=
                        null
                          ? `Environment #${rollout.environment_id}`
                          : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex min-w-[150px] items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
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

                          <span className="w-12 text-right text-sm font-semibold text-slate-700">
                            {percentage}%
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
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
                                    rollout,
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
                                    rollout,
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
                  );
                },
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}