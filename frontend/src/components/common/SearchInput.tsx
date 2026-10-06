import {
  Search,
  X,
} from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  disabled = false,
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        disabled={disabled}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 disabled:bg-slate-50"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}