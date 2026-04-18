import React from "react";
import { cx } from "@/lib/utils";

type Variant = "green" | "teal" | "red" | "neutral" | "yellow";

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}) {
  const variants: Record<Variant, string> = {
    green: "bg-accent-green/10 text-accent-green border-accent-green/30",
    teal: "bg-accent-teal/10 text-accent-teal border-accent-teal/30",
    red: "bg-red-500/10 text-red-300 border-red-500/30",
    yellow: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    neutral: "bg-white/5 text-white/70 border-card-border",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-[10px] uppercase tracking-widest",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
