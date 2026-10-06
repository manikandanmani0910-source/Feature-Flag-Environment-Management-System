import { CheckCircle2, XCircle } from "lucide-react";

import { Badge } from "../common/Badge";

interface FeatureFlagStatusProps {
  enabled?: boolean | null;
  active?: boolean | null;
}

export function FeatureFlagStatus({
  enabled,
  active,
}: FeatureFlagStatusProps) {
  const isEnabled =
    enabled ?? active ?? false;

  return (
    <Badge
      variant={
        isEnabled
          ? "success"
          : "default"
      }
    >
      {isEnabled ? (
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
      ) : (
        <XCircle className="mr-1 h-3.5 w-3.5" />
      )}

      {isEnabled
        ? "Enabled"
        : "Disabled"}
    </Badge>
  );
}