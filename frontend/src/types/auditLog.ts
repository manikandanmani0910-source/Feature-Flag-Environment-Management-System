import type {
  ID,
  ISODateString,
  PaginatedResponse,
} from "./common";

export interface AuditLog {
  id: ID;

  action?: string | null;
  event_type?: string | null;

  user_id?: number | null;
  resource_type?: string | null;
  resource_id?: number | string | null;

  details?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  created_at?: ISODateString | null;
  timestamp?: ISODateString | null;
  logged_at?: ISODateString | null;
}

export type AuditLogListResponse =
  PaginatedResponse<AuditLog>;