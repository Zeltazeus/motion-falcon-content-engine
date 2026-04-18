import React from "react";
import { cx } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cx(
        "bg-card border border-card-border rounded-card p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "green" | "teal";
}) {
  const accentClass =
    accent === "teal" ? "text-accent-teal" : "text-accent-green";
  return (
    <Card className="flex flex-col gap-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {label}
      </div>
      <div className={cx("font-syne text-4xl font-bold", accentClass)}>
        {value}
      </div>
      {hint ? (
        <div className="font-mono text-[11px] text-muted">{hint}</div>
      ) : null}
    </Card>
  );
}
