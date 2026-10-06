import { formatDate } from "../../utils/formatters";

export interface UsageTableItem {
  id: number | string;
  feature_flag_id?: number | string | null;
  environment_id?: number | string | null;
  user_id?: number | string | null;
  event_type?: string | null;
  created_at?: string | null;
  timestamp?: string | null;
}

interface UsageTableProps {
  items: UsageTableItem[];
}

export function UsageTable({
  items,
}: UsageTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Event
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Feature
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Environment
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  No usage events found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <span className="text-sm font-semibold text-slate-900">
                      Event #{item.id}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.feature_flag_id != null
                      ? `Feature #${item.feature_flag_id}`
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.environment_id != null
                      ? `Environment #${item.environment_id}`
                      : "—"}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.user_id != null
                      ? `User #${item.user_id}`
                      : "Anonymous"}
                  </td>

                  <td className="px-5 py-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {item.event_type ??
                        "Evaluation"}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-500">
                    {formatDate(
                      item.created_at ??
                        item.timestamp,
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-3 text-sm text-slate-500">
        Showing{" "}
        <span className="font-semibold text-slate-700">
          {items.length}
        </span>{" "}
        usage events
      </div>
    </div>
  );
}