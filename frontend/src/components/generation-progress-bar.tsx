"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  active: boolean;
};

/**
 * Simulated progress under the sticky nav while generate is in flight.
 * Asymptotic crawl to ~90%, snap to 100% then fade when inactive.
 */
export function GenerationProgressBar({ active }: Props) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"hidden" | "running" | "done">("hidden");
  const wasActive = useRef(false);

  useEffect(() => {
    if (active) {
      wasActive.current = true;
      setPhase("running");
      setProgress(4);
      const started = performance.now();
      let raf = 0;
      const tick = (now: number) => {
        const t = (now - started) / 1000;
        const next = 90 * (1 - Math.exp(-t / 4.5));
        setProgress(Math.min(90, Math.max(4, next)));
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    if (!wasActive.current) return;
    wasActive.current = false;
    setProgress(100);
    setPhase("done");
  }, [active]);

  useEffect(() => {
    if (phase !== "done") return;
    const hide = window.setTimeout(() => {
      setPhase("hidden");
      setProgress(0);
    }, 420);
    return () => window.clearTimeout(hide);
  }, [phase]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "relative h-[3px] w-full overflow-hidden bg-border/50",
        "transition-opacity duration-300",
        phase === "done" ? "opacity-0" : "opacity-100"
      )}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      aria-label="Üretim ilerlemesi"
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-r-full",
          "bg-gradient-to-r from-primary to-accent",
          "shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_50%,transparent)]",
          "motion-safe:transition-[width] motion-safe:duration-150 motion-safe:ease-out"
        )}
        style={{ width: `${progress}%` }}
      >
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 -translate-x-full",
            "bg-gradient-to-r from-transparent via-primary-foreground/35 to-transparent",
            "motion-safe:animate-[shimmer_1.4s_ease-in-out_infinite]",
            "motion-reduce:hidden"
          )}
        />
      </div>
    </div>
  );
}
