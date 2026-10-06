import { Badge } from "./Badge";

interface StatusBadgeProps {
  status?: string | boolean | null;
}

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  const value =
    status === true
      ? "Active"
      : status === false
        ? "Inactive"
        : String(
            status ?? "Unknown",
          );

  const normalized =
    value.toLowerCase();

  let variant:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info" = "default";

  if (
    [
      "active",
      "enabled",
      "success",
      "completed",
      "healthy",
      "true",
    ].includes(normalized)
  ) {
    variant = "success";
  } else if (
    [
      "pending",
      "draft",
      "warning",
      "partial",
    ].includes(normalized)
  ) {
    variant = "warning";
  } else if (
    [
      "inactive",
      "disabled",
      "failed",
      "error",
      "false",
    ].includes(normalized)
  ) {
    variant = "danger";
  } else if (
    ["info", "running"].includes(
      normalized,
    )
  ) {
    variant = "info";
  }

  return (
    <Badge variant={variant}>
      {value}
    </Badge>
  );
}