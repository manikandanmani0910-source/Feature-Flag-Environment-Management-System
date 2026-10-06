import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Unable to load the requested data.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-6 py-10 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
        <AlertCircle className="h-5 w-5" />
      </div>

      <h3 className="text-sm font-bold text-red-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm text-red-700">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  );
}