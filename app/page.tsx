"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, StatCard } from "@/components/Card";
import { Button } from "@/components/Button";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import {
  getChannels,
  getLog,
  getQueue,
  getSchedule,
  getStats,
} from "@/lib/storage";
import {
  dayProgressPercent,
  formatRelative,
  hoursUntil,
  nextScheduledRun,
} from "@/lib/utils";
import type { LogEntry, QueuedPost } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [queue, setQueueState] = useState<QueuedPost[]>([]);
  const [log, setLogState] = useState<LogEntry[]>([]);
  const [published, setPublished] = useState(0);
  const [channelsLive, setChannelsLive] = useState(0);
  const [nextHours, setNextHours] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    setQueueState(getQueue());
    setLogState(getLog());
    setPublished(getStats().published);
    const ch = getChannels();
    let live = 0;
    if (ch.linkedinWebhook) live++;
    if (ch.wixApiKey && ch.wixSiteId) live++;
    setChannelsLive(live);

    const sched = getSchedule();
    if (sched.enabled) {
      const next = nextScheduledRun(sched.postTime, sched.days);
      if (next) setNextHours(hoursUntil(next.toISOString()));
    } else {
      // Use nearest scheduled queue item as "next post"
      const upcoming = getQueue()
        .filter((q) => q.status === "scheduled")
        .sort(
          (a, b) =>
            new Date(a.scheduledAt).getTime() -
            new Date(b.scheduledAt).getTime()
        )[0];
      if (upcoming) setNextHours(hoursUntil(upcoming.scheduledAt));
    }

    setProgress(dayProgressPercent());

    const id = setInterval(() => setProgress(dayProgressPercent()), 60_000);
    return () => clearInterval(id);
  }, []);

  const pendingCount = useMemo(
    () => queue.filter((q) => q.status === "scheduled").length,
    [queue]
  );

  return (
    <PageContainer>
      <PageHeader
        title="Mission Control"
        subtitle="Your autonomous content engine — generating, queuing, and publishing stories that bring CGI-scale attention to Motion Falcon."
        action={
          <Button
            onClick={() => router.push("/generate")}
            size="lg"
            className="whitespace-nowrap"
          >
            Generate now →
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Posts Published"
          value={mounted ? published : 0}
          hint="All-time"
          accent="green"
        />
        <StatCard
          label="Queue Pending"
          value={mounted ? pendingCount : 0}
          hint="Waiting for publish"
          accent="teal"
        />
        <StatCard
          label="Next Post In"
          value={mounted && nextHours !== null ? `${nextHours}h` : "—"}
          hint={
            mounted && nextHours !== null
              ? "Until next auto-publish"
              : "Nothing queued"
          }
          accent="green"
        />
        <StatCard
          label="Channels Live"
          value={mounted ? `${channelsLive}/2` : "0/2"}
          hint="LinkedIn + Wix Blog"
          accent="teal"
        />
      </div>

      <Card className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Daily cycle
            </div>
            <div className="font-syne text-xl font-semibold text-white">
              Day progress
            </div>
          </div>
          <span className="font-mono text-sm text-accent-green">
            {progress.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 font-mono text-[11px] text-muted">
          Engine keeps working in the background while you focus on the craft.
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Activity log
            </div>
            <div className="font-syne text-xl font-semibold text-white">
              Recent activity
            </div>
          </div>
          <Badge variant="green">Live</Badge>
        </div>
        {mounted && log.length > 0 ? (
          <ul className="flex flex-col divide-y divide-card-border">
            {log.slice(0, 12).map((entry) => (
              <li
                key={entry.id}
                className="py-3 flex items-start gap-3 text-sm"
              >
                <span
                  className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.type === "success"
                      ? "bg-accent-green"
                      : entry.type === "error"
                      ? "bg-red-400"
                      : entry.type === "warn"
                      ? "bg-yellow-400"
                      : "bg-accent-teal"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-white/85 break-words">
                    {entry.message}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted mt-1">
                    {formatRelative(entry.timestamp)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-10 text-center">
            <div className="font-mono text-xs text-muted mb-4">
              No activity yet. Generate your first post to get the engine running.
            </div>
            <Button onClick={() => router.push("/generate")}>
              Start generating →
            </Button>
          </div>
        )}
      </Card>
    </PageContainer>
  );
}
