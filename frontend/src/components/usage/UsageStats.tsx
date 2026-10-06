import {
  Activity,
  CheckCircle2,
  Users,
  XCircle,
} from "lucide-react";

interface UsageStatsProps {
  total: number;
  successful: number;
  uniqueUsers: number;
  successRate: number;
}

export function UsageStats({
  total,
  successful,
  uniqueUsers,
  successRate,
}: UsageStatsProps) {
  const cards = [
    {
      label: "Total Events",
      value: total,
      icon: Activity,
    },
    {
      label: "Successful",
      value: successful,
      icon: CheckCircle2,
    },
    {
      label: "Unique Users",
      value: uniqueUsers,
      icon: Users,
    },
    {
      label: "Success Rate",
      value: `${successRate.toFixed(1)}%`,
      icon: XCircle,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {card.label}
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <p className="mt-3 text-2xl font-bold text-slate-950">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}