import {
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import { Badge } from "../common/Badge";

export type ScheduleStatusType =
  | "active"
  | "scheduled"
  | "disabled"
  | "completed";

interface ScheduleStatusProps {
  status?: ScheduleStatusType;
  enabled?: boolean;
}

export function ScheduleStatus({
  status,
  enabled = true,
}: ScheduleStatusProps) {
  const resolvedStatus =
    status ??
    (enabled
      ? "active"
      : "disabled");

  if (
    resolvedStatus === "active"
  ) {
    return (
      <Badge variant="success">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Active
      </Badge>
    );
  }

  if (
    resolvedStatus === "scheduled"
  ) {
    return (
      <Badge variant="info">
        <Clock3 className="mr-1 h-3.5 w-3.5" />
        Scheduled
      </Badge>
    );
  }

  if (
    resolvedStatus === "completed"
  ) {
    return (
      <Badge variant="default">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Completed
      </Badge>
    );
  }

  return (
    <Badge variant="default">
      <XCircle className="mr-1 h-3.5 w-3.5" />
      Disabled
    </Badge>
  );
}