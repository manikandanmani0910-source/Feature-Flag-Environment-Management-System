import type {
  InputHTMLAttributes,
} from "react";

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = "",
  id,
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-semibold text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        {...props}
        id={id}
        className={[
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition",
          error
            ? "border-red-300 focus:border-red-500"
            : "border-slate-200 focus:border-slate-400",
          "placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50",
          className,
        ].join(" ")}
      />

      {error ? (
        <p className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}