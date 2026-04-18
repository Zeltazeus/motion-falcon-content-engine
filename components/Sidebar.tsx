"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Dashboard", short: "Home" },
  { href: "/generate", label: "Generate", short: "Gen" },
  { href: "/queue", label: "Queue", short: "Queue" },
  { href: "/schedule", label: "Schedule", short: "Sched" },
  { href: "/channels", label: "Channels", short: "Chan" },
  { href: "/settings", label: "Settings", short: "Set" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-card-border bg-black/40 h-screen sticky top-0 p-6">
      <Link href="/" className="flex items-center gap-3 mb-10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-green to-accent-teal flex items-center justify-center">
          <span className="font-syne font-black text-black text-lg">MF</span>
        </div>
        <div>
          <div className="font-syne font-bold tracking-tight text-white leading-tight">
            Motion Falcon
          </div>
          <div className="font-mono text-[10px] text-muted uppercase tracking-widest">
            Content Engine
          </div>
        </div>
      </Link>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "px-3 py-2 rounded-input font-syne text-sm transition-colors",
                active
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/30"
                  : "text-white/70 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <EngineStatusPill />
      </div>
    </aside>
  );
}

export function EngineStatusPill() {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-accent-green/10 border border-accent-green/30 w-fit">
      <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse-dot" />
      <span className="font-mono text-[11px] uppercase tracking-widest text-accent-green">
        Engine active
      </span>
    </div>
  );
}

export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur border-t border-card-border flex items-center justify-around py-2 safe-area-bottom">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cx(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-md",
              active ? "text-accent-green" : "text-white/60"
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-widest">
              {item.short}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
