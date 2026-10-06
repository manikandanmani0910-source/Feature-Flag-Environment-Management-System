import {
  CheckCircle2,
  Server,
} from "lucide-react";

import type { Environment } from "../../types/environment";

interface EnvironmentOverviewProps {
  environments: Environment[];
}

export function EnvironmentOverview({
  environments,
}: EnvironmentOverviewProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Environments
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Deployment environments
          </p>
        </div>

        <Server className="h-5 w-5 text-slate-400" />
      </div>

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {environments.length === 0 ? (
          <div className="col-span-full py-8 text-center text-sm text-slate-500">
            No environments available.
          </div>
        ) : (
          environments
            .slice(0, 6)
            .map((environment) => (
              <div
                key={environment.id}
                className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <Server className="h-4 w-4 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {environment.name}
                  </p>

                  <p className="truncate text-xs text-slate-500">
                    {environment.description ||
                      "No description"}
                  </p>
                </div>

                {environment.is_active && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                )}
              </div>
            ))
        )}
      </div>
    </section>
  );
}