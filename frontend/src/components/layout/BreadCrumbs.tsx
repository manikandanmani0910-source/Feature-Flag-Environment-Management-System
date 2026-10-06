import {
  ChevronRight,
} from "lucide-react";

import {
  Link,
  useLocation,
} from "react-router-dom";

const labels: Record<
  string,
  string
> = {
  dashboard: "Dashboard",
  users: "Users",
  "feature-flags":
    "Feature Flags",
  environments: "Environments",
  rollouts: "Rollouts",
  evaluations: "Evaluations",
  usage: "Usage",
  analytics: "Analytics",
  "audit-logs": "Audit Logs",
  settings: "Settings",
  create: "Create",
  edit: "Edit",
};

export function Breadcrumbs() {
  const location =
    useLocation();

  const segments =
    location.pathname
      .split("/")
      .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 text-sm"
    >
      <Link
        to="/dashboard"
        className="text-slate-400 hover:text-slate-700"
      >
        Home
      </Link>

      {segments.map(
        (segment, index) => {
          const path =
            "/" +
            segments
              .slice(0, index + 1)
              .join("/");

          const label =
            labels[segment] ??
            (Number.isNaN(
              Number(segment),
            )
              ? segment
              : `#${segment}`);

          const isLast =
            index ===
            segments.length - 1;

          return (
            <span
              key={`${path}-${index}`}
              className="flex items-center gap-1"
            >
              <ChevronRight className="h-4 w-4 text-slate-300" />

              {isLast ? (
                <span className="font-medium text-slate-700">
                  {label}
                </span>
              ) : (
                <Link
                  to={path}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {label}
                </Link>
              )}
            </span>
          );
        },
      )}
    </nav>
  );
}