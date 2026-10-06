import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  description?: string;
  icon?: ReactNode;
  trend?: ReactNode;
}

export function StatCard({
  label,
  value,
  description,
  icon,
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-950">
            {value}
          </p>
        </div>

        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            {icon}
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {description && (
            <p className="text-xs text-slate-400">
              {description}
            </p>
          )}

          {trend}
        </div>
      )}
    </div>
  );
}