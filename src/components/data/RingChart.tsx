"use client";

import { motion, useReducedMotion } from "motion/react";

interface RingChartProps {
  /** 0–1 outer coral arc. */
  primary: number;
  /** 0–1 inner near-black arc. */
  secondary: number;
  size?: number;
  ariaLabel?: string;
}

/** Two concentric SVG arcs that animate their stroke on mount. */
export function RingChart({ primary, secondary, size = 116, ariaLabel }: RingChartProps) {
  const reduce = useReducedMotion();
  const stroke = 11;
  const gap = 6;
  const r1 = (size - stroke) / 2;
  const r2 = r1 - stroke - gap;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const center = size / 2;

  const arc = (delay: number) =>
    reduce ? { duration: 0 } : ({ duration: 1, ease: "easeOut", delay } as const);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
      role="img"
      aria-label={
        ariaLabel ??
        `Primary ${Math.round(primary * 100)} percent, secondary ${Math.round(secondary * 100)} percent`
      }
    >
      <circle cx={center} cy={center} r={r1} fill="none" stroke="var(--color-chart-track)" strokeWidth={stroke} />
      <circle cx={center} cy={center} r={r2} fill="none" stroke="var(--color-chart-track)" strokeWidth={stroke} />
      <motion.circle
        cx={center}
        cy={center}
        r={r1}
        fill="none"
        stroke="var(--color-chart-primary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c1}
        initial={{ strokeDashoffset: c1 }}
        animate={{ strokeDashoffset: c1 * (1 - primary) }}
        transition={arc(0.2)}
      />
      <motion.circle
        cx={center}
        cy={center}
        r={r2}
        fill="none"
        stroke="var(--color-chart-secondary)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c2}
        initial={{ strokeDashoffset: c2 }}
        animate={{ strokeDashoffset: c2 * (1 - secondary) }}
        transition={arc(0.35)}
      />
    </svg>
  );
}
