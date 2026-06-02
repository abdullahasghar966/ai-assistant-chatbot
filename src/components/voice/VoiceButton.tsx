"use client";

import { motion, useReducedMotion } from "motion/react";
import { Mic, Loader2, Check } from "lucide-react";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { WaveformVisualizer } from "./WaveformVisualizer";
import { voiceRing, voiceRingTransition } from "@/motion/config";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/** Mic button cycling idle → recording → processing → done, with pulse + waveform. */
export function VoiceButton({ onTranscript, disabled }: VoiceButtonProps) {
  const reduce = useReducedMotion();
  const { state, error, stream, toggle } = useVoiceInput(onTranscript);
  const recording = state === "recording";

  return (
    <div className="flex items-center gap-1">
      {recording && <WaveformVisualizer stream={stream} />}
      <motion.button
        type="button"
        onClick={toggle}
        disabled={disabled || state === "processing"}
        aria-label={recording ? "Stop recording" : "Record voice message"}
        aria-pressed={recording}
        title={error ?? undefined}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none disabled:opacity-60"
      >
        {recording && !reduce && (
          <motion.span
            className="absolute inset-0 rounded-full bg-accent/25"
            animate={voiceRing}
            transition={voiceRingTransition}
            aria-hidden
          />
        )}
        <span className="relative z-10 flex items-center justify-center">
          {state === "processing" ? (
            <Loader2 size={18} className="animate-spin text-accent" aria-hidden />
          ) : state === "done" ? (
            <Check size={18} className="text-accent" aria-hidden />
          ) : (
            <Mic
              size={18}
              aria-hidden
              className={cn(recording ? "text-accent" : "text-ink-tertiary")}
            />
          )}
        </span>
      </motion.button>
    </div>
  );
}
