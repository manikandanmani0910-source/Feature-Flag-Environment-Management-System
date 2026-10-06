import { useQuery } from "@tanstack/react-query";

import {
  getAuditLog,
  getAuditLogs,
} from "../services/audit-logs/auditLogService";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: getAuditLogs,
  });
}

export function useAuditLog(
  id: number | string,
) {
  return useQuery({
    queryKey: ["audit-logs", id],
    queryFn: () => getAuditLog(id),
    enabled: Boolean(id),
  });
}