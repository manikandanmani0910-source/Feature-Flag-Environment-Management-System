import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-slate-900 text-white hover:bg-slate-800",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger:
      "bg-red-600 text-white hover:bg-red-700",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition",
        sizes[size],
        variants[variant],
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      ].join(" ")}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      )}

      {children}
    </button>
  );
}