import { Eye } from "lucide-react";

import { Badge } from "../common/Badge";

interface AuditLog {
  id: number | string;
  action?: string | null;
  resource_type?: string | null;
  resource_id?: number | string | null;
  user_id?: number | string | null;
  username?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
}

interface AuditLogTableProps {
  logs: AuditLog[];
  loading?: boolean;
  onView?: (
    log: AuditLog,
  ) => void;
}

export function AuditLogTable({
  logs,
  loading = false,
  onView,
}: AuditLogTableProps) {
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
                ID
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Resource
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Timestamp
              </th>

              {onView && (
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    onView ? 6 : 5
                  }
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No audit logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const date =
                  log.created_at ??
                  log.timestamp;

                return (
                  <tr
                    key={log.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      #{log.id}
                    </td>

                    <td className="px-5 py-4">
                      <Badge variant="info">
                        {log.action ??
                          "Activity"}
                      </Badge>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {log.resource_type ??
                        "—"}

                      {log.resource_id !=
                        null &&
                        ` #${log.resource_id}`}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {log.username ??
                        (log.user_id != null
                          ? `User #${log.user_id}`
                          : "System")}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {date
                        ? new Date(
                            date,
                          ).toLocaleString()
                        : "—"}
                    </td>

                    {onView && (
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView(log)
                          }
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {logs.length}
        </span>{" "}
        audit logs
      </div>
    </div>
  );
}