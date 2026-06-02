import type { WireMessage } from "@/types";

const CHARS_PER_TOKEN = 4;

/** Cheap, dependency-free token estimate (~chars/4). Good enough for windowing. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export interface BuildContextOptions {
  /** Token budget for history, excluding the system prompt. */
  maxTokens?: number;
  /** Always keep at least this many of the most recent messages. */
  keepRecent?: number;
}

export interface BuiltContext {
  messages: WireMessage[];
  totalTokens: number;
}

/**
 * Sliding-window context builder.
 * - System prompt is always first.
 * - The most recent `keepRecent` messages are always included.
 * - Older messages are added newest-first until the token budget is hit.
 */
export function buildContext(
  history: WireMessage[],
  systemPrompt: string,
  options: BuildContextOptions = {},
): BuiltContext {
  const maxTokens = options.maxTokens ?? 3000;
  const keepRecent = options.keepRecent ?? 4;

  const system: WireMessage = { role: "system", content: systemPrompt };
  const systemTokens = estimateTokens(systemPrompt);

  const selected: WireMessage[] = [];
  let used = 0;

  for (let i = history.length - 1; i >= 0; i--) {
    const message = history[i];
    if (!message) continue;
    const cost = estimateTokens(message.content);
    const mustKeep = history.length - 1 - i < keepRecent;
    if (!mustKeep && used + cost > maxTokens) break;
    selected.push(message);
    used += cost;
  }

  selected.reverse();

  return {
    messages: [system, ...selected],
    totalTokens: systemTokens + used,
  };
}
