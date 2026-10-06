interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export function LoadingSpinner({
  size = "md",
  label,
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-9 w-9",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <span
        className={[
          "animate-spin rounded-full border-2 border-slate-200 border-t-slate-900",
          sizes[size],
        ].join(" ")}
      />

      {label && (
        <span className="text-sm text-slate-500">
          {label}
        </span>
      )}
    </div>
  );
}