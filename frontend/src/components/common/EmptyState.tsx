import type { ReactNode } from "react";

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({
  title = "No data found",
  message,
  description,
  action,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-bold text-slate-900">
        {title}
      </h3>

      {(message || description) && (
        <p className="mt-1 max-w-md text-sm text-slate-500">
          {message ?? description}
        </p>
      )}

      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}