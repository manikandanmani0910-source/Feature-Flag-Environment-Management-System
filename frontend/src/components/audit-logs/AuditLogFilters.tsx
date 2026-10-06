import { Search, X } from "lucide-react";

interface AuditLogFiltersProps {
  search: string;
  action: string;
  resourceType: string;
  onSearchChange: (
    value: string,
  ) => void;
  onActionChange: (
    value: string,
  ) => void;
  onResourceTypeChange: (
    value: string,
  ) => void;
  onClear?: () => void;
}

export function AuditLogFilters({
  search,
  action,
  resourceType,
  onSearchChange,
  onActionChange,
  onResourceTypeChange,
  onClear,
}: AuditLogFiltersProps) {
  const hasFilters =
    Boolean(
      search ||
        action ||
        resourceType,
    );

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search audit logs..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <input
          value={action}
          onChange={(event) =>
            onActionChange(
              event.target.value,
            )
          }
          placeholder="Filter by action..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
        />

        <input
          value={resourceType}
          onChange={(event) =>
            onResourceTypeChange(
              event.target.value,
            )
          }
          placeholder="Filter by resource..."
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-400"
        />
      </div>

      {hasFilters && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
        </button>
      )}
    </div>
  );
}