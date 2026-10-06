import type { AuditLog } from "../../types/auditLog";

import { apiClient } from "../api/client";
import { endpoints } from "../api/endpoints";

export async function getAuditLogs(): Promise<
  AuditLog[]
> {
  const response =
    await apiClient.get<AuditLog[]>(
      endpoints.auditLogs.list,
    );

  return response.data;
}

export async function getAuditLog(
  id: number | string,
): Promise<AuditLog> {
  const response =
    await apiClient.get<AuditLog>(
      endpoints.auditLogs.detail(id),
    );

  return response.data;
}