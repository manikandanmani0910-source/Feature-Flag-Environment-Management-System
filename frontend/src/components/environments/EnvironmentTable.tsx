import {
  Edit,
  Eye,
} from "lucide-react";

import { Badge } from "../common/Badge";

import type { Environment } from "./EnvironmentDetails";

interface EnvironmentTableProps {
  environments: Environment[];
  loading?: boolean;
  onView?: (
    environment: Environment,
  ) => void;
  onEdit?: (
    environment: Environment,
  ) => void;
}

export function EnvironmentTable({
  environments,
  loading = false,
  onView,
  onEdit,
}: EnvironmentTableProps) {
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
                Environment
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
            {environments.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView || onEdit
                      ? 5
                      : 4
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No environments found.
                </td>
              </tr>
            ) : (
              environments.map(
                (environment) => (
                  <tr
                    key={environment.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {environment.name ??
                          `Environment #${environment.id}`}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        ID: {environment.id}
                      </p>
                    </td>

                    <td className="px-5 py-4 font-mono text-sm text-slate-600">
                      {environment.key ??
                        "—"}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                      <span className="line-clamp-2">
                        {environment.description ??
                          "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          environment.is_active ===
                          false
                            ? "danger"
                            : "success"
                        }
                      >
                        {environment.is_active ===
                        false
                          ? "Inactive"
                          : "Active"}
                      </Badge>
                    </td>

                    {(onView || onEdit) && (
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {onView && (
                            <button
                              type="button"
                              onClick={() =>
                                onView(
                                  environment,
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
                                  environment,
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
                )
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {environments.length}
        </span>{" "}
        environments
      </div>
    </div>
  );
}