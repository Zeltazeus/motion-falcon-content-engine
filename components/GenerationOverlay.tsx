"use client";

import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

const STEPS = [
  "Researching trending topics",
  "Generating blog post",
  "Writing LinkedIn post",
  "Preparing for channels",
];

export function GenerationOverlay({
  active,
  finished,
}: {
  active: boolean;
  finished: boolean;
}) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) {
      setStep(0);
      return;
    }
    if (finished) {
      setStep(STEPS.length);
      return;
    }
    // Advance step every ~1.4s, but hold at step 2 until finished
    setStep(0);
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(id);
  }, [active, finished]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-card-border rounded-card p-8 w-full max-w-md">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-green mb-2">
          Engine running
        </div>
        <div className="font-syne text-2xl font-bold mb-6">
          Generating content…
        </div>
        <ul className="flex flex-col gap-3">
          {STEPS.map((label, i) => {
            const done = i < step || finished;
            const active = i === step && !finished;
            return (
              <li
                key={label}
                className={cx(
                  "flex items-center gap-3 transition-opacity",
                  i > step && !finished ? "opacity-40" : "opacity-100"
                )}
              >
                <span
                  className={cx(
                    "w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-mono",
                    done
                      ? "bg-accent-green text-black border-accent-green"
                      : active
                      ? "border-accent-green text-accent-green"
                      : "border-card-border text-muted"
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                <span className="font-syne text-sm">
                  {label}
                  {active ? (
                    <span className="ml-1 inline-block">
                      <span className="animate-pulse">…</span>
                    </span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="progress-fill h-full transition-all duration-500"
            style={{
              width: `${
                finished
                  ? 100
                  : Math.min(90, (step / STEPS.length) * 100 + 10)
              }%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
