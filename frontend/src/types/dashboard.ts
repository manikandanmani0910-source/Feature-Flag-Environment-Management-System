import type { ISODateString } from "./common";
import type { AuditLog } from "./auditLog";
import type { Environment } from "./environment";
import type { FeatureFlag } from "./featureFlag";
import type { FeatureRollout } from "./rollout";
import type { FeatureSchedule } from "./schedule";

export interface DashboardSummary {
  features: number;
  environments: number;
  rollouts: number;
  schedules: number;
  users: number;
  usage_events: number;
  audit_logs: number;
}

export interface DashboardResponse {
  summary: DashboardSummary;

  features: FeatureFlag[];
  environments: Environment[];
  rollouts: FeatureRollout[];
  schedules: FeatureSchedule[];

  recent_activity: AuditLog[];

  generated_at: ISODateString;
}