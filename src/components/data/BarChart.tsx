"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface BarChartProps {
  /** Heights 0–1. */
  bars: readonly number[];
  /** Index highlighted with the accent colour, or -1 for none. */
  activeIndex?: number;
  /** Optional label under each bar. */
  labels?: readonly string[];
  height?: number;
}

/** Bars that grow from the baseline with a stagger. */
export function BarChart({ bars, activeIndex = -1, labels, height = 60 }: BarChartProps) {
  const reduce = useReducedMotion();
  return (
    <div className="flex items-end gap-1.5">
      {bars.map((value, index) => {
        const active = index === activeIndex;
        return (
          <div key={index} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-end justify-center" style={{ height }}>
              <motion.div
                className={cn(
                  "w-full max-w-[12px] rounded-pill",
                  active ? "bg-chart-bar-active" : "bg-chart-bar-muted",
                )}
                style={{ height: `${Math.round(value * 100)}%`, transformOrigin: "bottom" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={reduce ? { duration: 0 } : { duration: 0.5, ease: "easeOut", delay: 0.05 * index }}
              />
            </div>
            {labels?.[index] && (
              <span className="text-[10px] font-medium text-ink-tertiary">{labels[index]}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
