"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, Square } from "lucide-react";
import { VoiceButton } from "@/components/voice/VoiceButton";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onSend: (text: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
}

const MAX_HEIGHT = 140;
const MIN_HEIGHT = 28;

/** Auto-growing composer with send + mic. Enter sends, Shift+Enter newlines. */
export function ChatInput({ value, onValueChange, onSend, onStop, isStreaming }: ChatInputProps) {
  const reduce = useReducedMotion();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, el.scrollHeight))}px`;
  }, [value]);

  const canSend = value.trim().length > 0 && !isStreaming;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    onValueChange("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 rounded-sm border border-line-input bg-surface px-3 py-2 shadow-card transition-colors focus-within:border-accent">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type something.."
        aria-label="Message"
        disabled={isStreaming}
        className="max-h-[140px] flex-1 resize-none self-center bg-transparent py-1 text-[14px] text-ink outline-none placeholder:text-ink-tertiary disabled:opacity-60"
      />

      <VoiceButton
        disabled={isStreaming}
        onTranscript={(text) => onValueChange(value ? `${value} ${text}` : text)}
      />

      {isStreaming ? (
        <motion.button
          type="button"
          onClick={onStop}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          aria-label="Stop generating"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-white outline-none"
        >
          <Square size={15} fill="currentColor" aria-hidden />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={submit}
          disabled={!canSend}
          whileHover={reduce || !canSend ? undefined : { scale: 1.05 }}
          whileTap={reduce || !canSend ? undefined : { scale: 0.95 }}
          aria-label="Send message"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full outline-none transition-colors",
            canSend ? "bg-accent text-white" : "bg-chart-track text-ink-tertiary",
          )}
        >
          <ArrowUp size={18} aria-hidden />
        </motion.button>
      )}
    </div>
  );
}
