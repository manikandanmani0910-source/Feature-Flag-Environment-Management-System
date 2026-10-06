import {
  Edit,
  Eye,
} from "lucide-react";

import { FeatureFlagStatus } from "./FeatureFlagStatus";

interface FeatureFlag {
  id: number | string;
  name?: string | null;
  key?: string | null;
  description?: string | null;
  enabled?: boolean | null;
  is_active?: boolean | null;
}

interface FeatureFlagTableProps {
  featureFlags: FeatureFlag[];
  loading?: boolean;
  onView?: (
    featureFlag: FeatureFlag,
  ) => void;
  onEdit?: (
    featureFlag: FeatureFlag,
  ) => void;
}

export function FeatureFlagTable({
  featureFlags,
  loading = false,
  onView,
  onEdit,
}: FeatureFlagTableProps) {
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
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Key
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
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
            {featureFlags.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView || onEdit
                      ? 5
                      : 4
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No feature flags found.
                </td>
              </tr>
            ) : (
              featureFlags.map(
                (featureFlag) => {
                  const enabled =
                    featureFlag.enabled ??
                    featureFlag.is_active ??
                    false;

                  return (
                    <tr
                      key={
                        featureFlag.id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {featureFlag.name ??
                            `Feature #${featureFlag.id}`}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          ID:{" "}
                          {featureFlag.id}
                        </p>
                      </td>

                      <td className="px-5 py-4 font-mono text-sm text-slate-600">
                        {featureFlag.key ??
                          "—"}
                      </td>

                      <td className="max-w-sm px-5 py-4 text-sm text-slate-500">
                        <span className="line-clamp-2">
                          {featureFlag.description ??
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <FeatureFlagStatus
                          enabled={
                            enabled
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
                                    featureFlag,
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
                                    featureFlag,
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

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {featureFlags.length}
        </span>{" "}
        feature flags
      </div>
    </div>
  );
}