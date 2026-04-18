export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = then - now;
  const absMin = Math.abs(Math.round(diff / 60000));
  if (Math.abs(diff) < 60000) return "just now";
  if (absMin < 60) return diff > 0 ? `in ${absMin}m` : `${absMin}m ago`;
  const absHr = Math.abs(Math.round(diff / 3600000));
  if (absHr < 24) return diff > 0 ? `in ${absHr}h` : `${absHr}h ago`;
  const absDay = Math.abs(Math.round(diff / 86400000));
  return diff > 0 ? `in ${absDay}d` : `${absDay}d ago`;
}

export function hoursUntil(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.round(diff / 3600000));
}

export function dayProgressPercent(): number {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const elapsed = now.getTime() - start.getTime();
  return Math.min(100, Math.max(0, (elapsed / 86400000) * 100));
}

export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function nextScheduledRun(
  postTime: string,
  days: Record<string, { enabled: boolean }>
): Date | null {
  const [hh, mm] = postTime.split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const now = new Date();
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + i);
    candidate.setHours(hh, mm, 0, 0);
    const name = dayNames[candidate.getDay()];
    if (days[name]?.enabled && candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }
  return null;
}
