import {
  Clock3,
  FileText,
} from "lucide-react";

import { formatDate } from "../../utils/formatters";
import type { AuditLog } from "../../types/auditLog";

interface RecentActivityProps {
  activity: AuditLog[];
}

export function RecentActivity({
  activity,
}: RecentActivityProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Recent Activity
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Latest platform events
          </p>
        </div>

        <Clock3 className="h-5 w-5 text-slate-400" />
      </div>

      <div className="divide-y divide-slate-100">
        {activity.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No recent activity.
          </div>
        ) : (
          activity
            .slice(0, 8)
            .map((item) => {
              const timestamp =
                item.created_at ??
                item.timestamp ??
                item.logged_at;

              return (
                <div
                  key={item.id}
                  className="flex gap-3 px-5 py-4"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                    <FileText className="h-4 w-4 text-slate-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">
                      {item.action ??
                        item.event_type ??
                        "Platform activity"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {item.resource_type
                        ? `${item.resource_type}${
                            item.resource_id
                              ? ` #${item.resource_id}`
                              : ""
                          }`
                        : item.user_id
                          ? `User #${item.user_id}`
                          : "System event"}
                    </p>

                    {timestamp && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </section>
  );
}