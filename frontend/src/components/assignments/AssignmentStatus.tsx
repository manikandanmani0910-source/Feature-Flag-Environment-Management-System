import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "../common/Badge";

interface AssignmentStatusProps {
  enabled?: boolean;
}

export function AssignmentStatus({
  enabled = false,
}: AssignmentStatusProps) {
  return enabled ? (
    <Badge variant="success">
      <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      Enabled
    </Badge>
  ) : (
    <Badge variant="default">
      <XCircle className="mr-1 h-3.5 w-3.5" />
      Disabled
    </Badge>
  );
}