import { Search } from "lucide-react";
import { useState } from "react";

interface UseFiltersProps {
  onSearch: (value: string) => void;
  onStatusChange?: (value: string) => void;
}

export function UseFilters({
  onSearch,
  onStatusChange,
}: UseFiltersProps) {
  const [search, setSearch] = useState("");

  const handleSearch = (value: string) => {
    setSearch(value);
    onSearch(value);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            value={search}
            onChange={(event) =>
              handleSearch(event.target.value)
            }
            placeholder="Search users..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none focus:border-slate-400"
          />
        </div>

        <select
          defaultValue=""
          onChange={(event) =>
            onStatusChange?.(event.target.value)
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          <option value="">All users</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>
  );
}