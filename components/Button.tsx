import React from "react";
import { cx } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-input font-syne font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-accent-green/40";
  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };
  const variants: Record<Variant, string> = {
    primary: "bg-accent-green text-black hover:bg-accent-green/90",
    secondary:
      "bg-white/5 text-white border border-card-border hover:bg-white/10",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
    danger:
      "bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20",
  };
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(base, sizes[size], variants[variant], className)}
    >
      {loading ? (
        <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
