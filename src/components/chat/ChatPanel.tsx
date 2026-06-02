"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, Bot, Plus, X } from "lucide-react";
import { MessageFeed } from "./MessageFeed";
import { EmptyState } from "./EmptyState";
import { ChatInput } from "./ChatInput";
import { ModelSelector } from "./ModelSelector";
import type { ChatMessage, ChatModelId } from "@/types";

interface ChatPanelProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  model: ChatModelId;
  onModelChange: (model: ChatModelId) => void;
  onSend: (text: string) => void;
  onStop: () => void;
  onReset: () => void;
  onClearError: () => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  error,
  model,
  onModelChange,
  onSend,
  onStop,
  onReset,
  onClearError,
}: ChatPanelProps) {
  const reduce = useReducedMotion();
  const [input, setInput] = useState("");
  const hasMessages = messages.length > 0;

  const retry = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    onClearError();
    if (lastUser) onSend(lastUser.content);
  };

  return (
    <section
      aria-label="AI chat"
      className="flex h-full min-h-0 flex-col gap-4 rounded-lg bg-surface p-4 shadow-card sm:p-5"
    >
      <header className="flex shrink-0 items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Bot size={16} className="text-white" aria-hidden />
          </span>
          <span className="text-[15px] font-semibold text-ink">AI Assistant</span>
        </div>
        {hasMessages && (
          <motion.button
            type="button"
            onClick={onReset}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            className="flex items-center gap-1.5 rounded-pill border border-line px-3 py-1.5 text-[12px] font-medium text-ink-secondary outline-none transition-colors hover:border-accent hover:text-ink"
          >
            <Plus size={14} aria-hidden />
            New chat
          </motion.button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {hasMessages ? (
          <MessageFeed messages={messages} />
        ) : (
          <EmptyState onPick={(prompt) => setInput(prompt)} />
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            role="alert"
            className="flex shrink-0 items-center gap-2 rounded-sm border border-line bg-app px-3 py-2 text-[12px] text-ink shadow-card"
          >
            <AlertCircle size={15} className="shrink-0 text-accent" aria-hidden />
            <span className="min-w-0 flex-1">{error}</span>
            <button
              type="button"
              onClick={retry}
              className="shrink-0 font-semibold text-accent outline-none hover:underline"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onClearError}
              aria-label="Dismiss error"
              className="shrink-0 text-ink-tertiary outline-none hover:text-ink"
            >
              <X size={14} aria-hidden />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex shrink-0 flex-col gap-2">
        <div className="flex items-center">
          <ModelSelector value={model} onChange={onModelChange} disabled={isStreaming} />
        </div>
        <ChatInput
          value={input}
          onValueChange={setInput}
          onSend={onSend}
          onStop={onStop}
          isStreaming={isStreaming}
        />
      </div>
    </section>
  );
}
