"use client";

import { motion } from "motion/react";
import { Bot } from "lucide-react";
import { SUGGESTED_PROMPTS } from "@/lib/demo-data";
import { staggerChild, staggerContainer } from "@/motion/config";

/** Shown when a conversation has no messages yet. */
export function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-1 text-center">
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent"
      >
        <Bot size={26} className="text-white" aria-hidden />
      </motion.span>

      <div>
        <h2 className="text-h2 text-ink">How can I help?</h2>
        <p className="mt-1 text-[13px] text-ink-secondary">
          Ask me anything: writing, code, explanations, planning, and more.
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid w-full max-w-sm grid-cols-1 gap-2"
      >
        {SUGGESTED_PROMPTS.map((prompt) => (
          <motion.button
            key={prompt}
            variants={staggerChild}
            type="button"
            onClick={() => onPick(prompt)}
            className="rounded-sm border border-line bg-surface px-4 py-3 text-left text-[13px] font-medium text-ink-secondary shadow-card outline-none transition-colors hover:border-accent hover:text-ink"
          >
            {prompt}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
