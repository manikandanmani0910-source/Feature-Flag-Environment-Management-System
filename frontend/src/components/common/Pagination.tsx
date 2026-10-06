import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
      <p className="text-sm text-slate-500">
        Page{" "}
        <span className="font-semibold text-slate-700">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={
            disabled || page <= 1
          }
          onClick={() =>
            onPageChange(page - 1)
          }
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          type="button"
          disabled={
            disabled ||
            page >= totalPages
          }
          onClick={() =>
            onPageChange(page + 1)
          }
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}