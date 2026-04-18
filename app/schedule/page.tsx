"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input, Label, Select } from "@/components/Input";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/Badge";
import { useToast } from "@/components/ToastProvider";
import {
  DAYS_OF_WEEK,
  DEFAULT_SCHEDULE,
  FREQUENCY_OPTIONS,
} from "@/lib/constants";
import { addLog, getSchedule, setSchedule } from "@/lib/storage";
import { cx } from "@/lib/utils";
import type { ScheduleConfig } from "@/lib/types";

export default function SchedulePage() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ScheduleConfig>(DEFAULT_SCHEDULE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConfig(getSchedule());
  }, []);

  function updateDay(day: string, patch: Partial<{ enabled: boolean; topic: string }>) {
    setConfig((c) => ({
      ...c,
      days: {
        ...c.days,
        [day]: { ...c.days[day], ...patch },
      },
    }));
  }

  function save() {
    setSchedule(config);
    addLog({
      type: "info",
      message: `Schedule ${config.enabled ? "enabled" : "disabled"} — ${
        config.frequency
      } at ${config.postTime}`,
    });
    toast("Schedule saved", "success");
  }

  return (
    <PageContainer>
      <PageHeader
        title="Publishing Schedule"
        subtitle="Set the cadence. The engine will auto-publish at your chosen times for connected channels."
      />

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
              Auto-schedule
            </div>
            <div className="font-syne text-xl font-semibold">
              {config.enabled ? "Engine is active" : "Engine is paused"}
            </div>
            <div className="font-mono text-[11px] text-muted mt-1">
              {config.enabled
                ? "Posts will publish automatically at the configured time."
                : "Turn this on to let the engine publish without manual intervention."}
            </div>
          </div>
          <Toggle
            checked={config.enabled}
            onChange={(v) => setConfig({ ...config, enabled: v })}
          />
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <Label>Post time (IST)</Label>
          <Input
            type="time"
            value={config.postTime}
            onChange={(e) => setConfig({ ...config, postTime: e.target.value })}
          />
          <div className="font-mono text-[11px] text-muted mt-2">
            Default 9:00 AM IST. Times are stored and applied in the browser's timezone.
          </div>
        </Card>
        <Card>
          <Label>Frequency</Label>
          <Select
            value={config.frequency}
            onChange={(e) =>
              setConfig({
                ...config,
                frequency: e.target.value as ScheduleConfig["frequency"],
              })
            }
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <div className="font-mono text-[11px] text-muted mt-2">
            Choose a default cadence — then fine-tune per day below.
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Weekly calendar
            </div>
            <div className="font-syne text-xl font-semibold">This week</div>
          </div>
          <Badge variant="teal">{Object.values(config.days).filter((d) => d.enabled).length} / 7 days</Badge>
        </div>
        <div className="flex flex-col divide-y divide-card-border">
          {mounted &&
            DAYS_OF_WEEK.map((day) => {
              const d = config.days[day] ?? { enabled: false, topic: "" };
              return (
                <div
                  key={day}
                  className="py-3 grid grid-cols-[90px_1fr_auto] gap-3 items-center"
                >
                  <div className="font-syne font-semibold text-white">
                    {day}
                  </div>
                  <Input
                    value={d.topic}
                    onChange={(e) => updateDay(day, { topic: e.target.value })}
                    placeholder="Auto-topic for this day…"
                    disabled={!d.enabled}
                    className={cx(!d.enabled && "opacity-50")}
                  />
                  <Toggle
                    checked={d.enabled}
                    onChange={(v) => updateDay(day, { enabled: v })}
                  />
                </div>
              );
            })}
        </div>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={save}>
          Save schedule
        </Button>
      </div>
    </PageContainer>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        "w-12 h-7 rounded-full relative transition-colors border",
        checked
          ? "bg-accent-green/30 border-accent-green/60"
          : "bg-white/5 border-card-border"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 w-6 h-6 rounded-full transition-all",
          checked
            ? "left-[calc(100%-1.625rem)] bg-accent-green"
            : "left-0.5 bg-white/60"
        )}
      />
    </button>
  );
}
