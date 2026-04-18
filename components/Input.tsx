import React from "react";
import { cx } from "@/lib/utils";

const baseInput =
  "w-full bg-black/40 border border-card-border rounded-input px-3 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-accent-green/60 focus:ring-2 focus:ring-accent-green/20 transition";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cx(
        "font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5 block",
        className
      )}
    >
      {children}
    </label>
  );
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} {...rest} className={cx(baseInput, className)} />;
});

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={cx(baseInput, "resize-y min-h-[90px]", className)}
    />
  );
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...rest }, ref) {
  return (
    <select ref={ref} {...rest} className={cx(baseInput, className)}>
      {children}
    </select>
  );
});
