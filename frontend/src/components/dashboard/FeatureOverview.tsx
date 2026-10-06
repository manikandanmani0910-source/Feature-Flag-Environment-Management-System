import { Flag } from "lucide-react";

import { Badge } from "../common/Badge";
import type { FeatureFlag } from "../../types/featureFlag";

interface FeatureOverviewProps {
  features: FeatureFlag[];
}

export function FeatureOverview({
  features,
}: FeatureOverviewProps) {
  const visibleFeatures =
    features.slice(0, 6);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-950">
            Feature Flags
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Current feature configuration
          </p>
        </div>

        <Flag className="h-5 w-5 text-slate-400" />
      </div>

      <div className="divide-y divide-slate-100">
        {visibleFeatures.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No feature flags available.
          </div>
        ) : (
          visibleFeatures.map((feature) => {
            const enabled =
              feature.enabled ??
              feature.is_enabled ??
              feature.is_active ??
              false;

            return (
              <div
                key={feature.id}
                className="flex items-center justify-between gap-4 px-5 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {feature.name}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {feature.key}
                  </p>
                </div>

                <Badge
                  variant={
                    enabled
                      ? "success"
                      : "neutral"
                  }
                >
                  {enabled
                    ? "Enabled"
                    : "Disabled"}
                </Badge>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}