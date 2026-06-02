"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ChevronDown, Check, Sparkles } from "lucide-react";
import { MODEL_OPTIONS, type ChatModelId } from "@/types";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  value: ChatModelId;
  onChange: (model: ChatModelId) => void;
  disabled?: boolean;
}

export function ModelSelector({ value, onChange, disabled }: ModelSelectorProps) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = MODEL_OPTIONS.find((m) => m.id === value) ?? MODEL_OPTIONS[0]!;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Model: ${selected.label}`}
        className={cn(
          "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[12px] font-medium transition-colors outline-none",
          "bg-accent-softer text-ink-secondary hover:bg-accent-soft",
          disabled && "pointer-events-none opacity-50",
        )}
      >
        <Sparkles size={13} className="text-accent" aria-hidden />
        <span className="max-w-[100px] truncate">{selected.label}</span>
        <ChevronDown
          size={13}
          className={cn("text-ink-tertiary transition-transform", open && "rotate-180")}
          aria-hidden
        />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Select model"
            initial={{ opacity: 0, y: 4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: reduce ? 0 : 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-52 overflow-hidden rounded-md border border-line bg-surface shadow-raised"
          >
            {MODEL_OPTIONS.map((option) => (
              <li key={option.id} role="option" aria-selected={option.id === value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors outline-none",
                    option.id === value
                      ? "bg-accent-softer font-medium text-ink"
                      : "text-ink-secondary hover:bg-accent-softer hover:text-ink",
                  )}
                >
                  <span className="flex-1">
                    <span className="block">{option.label}</span>
                    <span className="block text-[11px] text-ink-tertiary">
                      {option.hint}
                    </span>
                  </span>
                  {option.id === value && (
                    <Check size={14} className="shrink-0 text-accent" aria-hidden />
                  )}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
