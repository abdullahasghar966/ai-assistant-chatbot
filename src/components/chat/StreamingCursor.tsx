"use client";

import { motion } from "motion/react";

/** Blinking caret shown at the end of a streaming assistant message. */
export function StreamingCursor() {
  return (
    <motion.span
      initial={{ opacity: 0, scaleY: 0.6 }}
      animate={{ opacity: 1, scaleY: 1 }}
      transition={{ duration: 0.15 }}
      className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[2px] rounded-full bg-ink align-baseline animate-blink"
      aria-hidden
    />
  );
}
