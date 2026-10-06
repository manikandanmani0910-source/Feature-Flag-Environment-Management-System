export const APP_NAME = "Feature Flag Management System";

export const QUERY_STALE_TIME = 30_000;

export const DATE_FORMAT = "dd MMM yyyy, HH:mm";

export const PAGE_SIZE = 20;

export const FEATURE_FLAG_STATUS = {
  ENABLED: "enabled",
  DISABLED: "disabled",
} as const;

export const SCHEDULE_STATUS = {
  SCHEDULED: "SCHEDULED",
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;