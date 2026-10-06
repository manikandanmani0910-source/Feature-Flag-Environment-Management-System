import {
  Calendar,
  Globe,
  Hash,
  User,
} from "lucide-react";

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
  details?: string | null;
  metadata?: unknown;
}

interface AuditLogDetailsProps {
  log: AuditLog | null;
}

export function AuditLogDetails({
  log,
}: AuditLogDetailsProps) {
  if (!log) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Select an audit log to view details.
      </div>
    );
  }

  const date =
    log.created_at ??
    log.timestamp;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-950">
              Audit Log Details
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Information recorded for this activity.
            </p>
          </div>

          <Badge variant="info">
            Log #{log.id}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
        <DetailItem
          icon={<Hash className="h-4 w-4" />}
          label="Log ID"
          value={String(log.id)}
        />

        <DetailItem
          icon={<User className="h-4 w-4" />}
          label="User"
          value={
            log.username ??
            (log.user_id != null
              ? `User #${log.user_id}`
              : "System")
          }
        />

        <DetailItem
          icon={<Globe className="h-4 w-4" />}
          label="Action"
          value={
            log.action ??
            "—"
          }
        />

        <DetailItem
          icon={<Hash className="h-4 w-4" />}
          label="Resource"
          value={
            log.resource_type
              ? `${log.resource_type}${
                  log.resource_id != null
                    ? ` #${log.resource_id}`
                    : ""
                }`
              : "—"
          }
        />

        <DetailItem
          icon={
            <Calendar className="h-4 w-4" />
          }
          label="Timestamp"
          value={
            date
              ? new Date(date).toLocaleString()
              : "—"
          }
        />

        <DetailItem
          icon={<Hash className="h-4 w-4" />}
          label="Resource ID"
          value={
            log.resource_id != null
              ? String(log.resource_id)
              : "—"
          }
        />
      </div>

      {(log.details ||
        log.metadata != null) && (
        <div className="border-t border-slate-200 px-6 py-5">
          <h3 className="text-sm font-bold text-slate-900">
            Details
          </h3>

          {log.details && (
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {log.details}
            </p>
          )}

          {log.metadata != null && (
            <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-5 text-slate-200">
              {typeof log.metadata ===
              "string"
                ? log.metadata
                : JSON.stringify(
                    log.metadata,
                    null,
                    2,
                  )}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({
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