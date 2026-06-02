"use client";

import { useCallback, useRef, useState } from "react";
import type { ChatMessage } from "@/types";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface UseStreamOptions {
  model?: string;
  initialMessages?: ChatMessage[];
}

export interface UseStreamResult {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  stop: () => void;
  reset: () => void;
  clearError: () => void;
}

/**
 * Optimistic streaming chat hook.
 * - Appends the user message instantly, then an empty assistant placeholder.
 * - Reads the response body as a text stream, appending deltas live.
 * - `stop()` aborts; on network error the empty assistant bubble is removed.
 */
export function useStream(options: UseStreamOptions = {}): UseStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>(
    options.initialMessages ?? [],
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setError(null);

      const userMessage: ChatMessage = {
        id: uid(),
        role: "user",
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      const assistantId = uid();
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        pending: true,
      };

      // Snapshot the history we send (before the optimistic assistant bubble).
      const history = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, model: options.model }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          let detail = `Request failed (${res.status})`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data?.error) detail = data.error;
          } catch {
            /* non-JSON error body */
          }
          throw new Error(detail);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulated } : m,
            ),
          );
        }

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, pending: false } : m)),
        );
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        if (aborted) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, pending: false, content: m.content || "Stopped." }
                : m,
            ),
          );
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong");
          // Drop the empty assistant placeholder; keep the user message.
          setMessages((prev) =>
            prev.filter((m) => !(m.id === assistantId && m.content === "")),
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, messages, options.model],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { messages, isStreaming, error, send, stop, reset, clearError };
}
