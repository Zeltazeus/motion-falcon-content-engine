import React from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted mb-2">
          Motion Falcon // Content Engine
        </div>
        <h1 className="font-syne font-bold text-3xl md:text-4xl tracking-tight text-white">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-white/60 mt-2 max-w-2xl text-sm md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 md:px-10 py-8 md:py-12 max-w-6xl mx-auto animate-fade-in">
      {children}
    </div>
  );
}
