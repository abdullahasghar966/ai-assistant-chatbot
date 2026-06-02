"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
}

function format(value: number, decimals: number): string {
  if (decimals > 0) return value.toFixed(decimals);
  return Math.round(value).toLocaleString();
}

/**
 * Counts up to `value` on mount and re-animates from the previous value whenever
 * it changes. Uses a self-contained rAF tween so it always lands exactly on the
 * target, even when the value updates rapidly (e.g. live during streaming).
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  durationMs = 900,
  prefix = "",
  suffix = "",
}: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    if (reduce) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const from = fromRef.current;
    const to = value;
    if (from === to) {
      setDisplay(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      if (t < 1) {
        setDisplay(from + (to - from) * eased);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        setDisplay(to);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      // Resume the next animation from where this one stopped so the number
      // never snaps back to zero between rapid updates.
      fromRef.current = to;
    };
  }, [value, durationMs, reduce]);

  return (
    <span>
      {prefix}
      {format(display, decimals)}
      {suffix}
    </span>
  );
}
