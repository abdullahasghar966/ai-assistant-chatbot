import { describe, it, expect } from "vitest";
import { estimateTokens, buildContext } from "../memory";
import type { WireMessage } from "@/types";

describe("estimateTokens", () => {
  it("returns ceil(length / 4)", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("hi")).toBe(1);
    expect(estimateTokens("hello")).toBe(2);
    expect(estimateTokens("a".repeat(100))).toBe(25);
  });

  it("rounds up for non-divisible lengths", () => {
    expect(estimateTokens("abc")).toBe(1); // 3/4 = 0.75 → 1
    expect(estimateTokens("abcde")).toBe(2); // 5/4 = 1.25 → 2
  });
});

describe("buildContext", () => {
  const systemPrompt = "You are a helpful assistant.";
  const systemTokens = estimateTokens(systemPrompt);

  function msg(role: WireMessage["role"], content: string): WireMessage {
    return { role, content };
  }

  it("always includes system prompt as first message", () => {
    const history = [msg("user", "hello")];
    const result = buildContext(history, systemPrompt);
    expect(result.messages[0]).toEqual({ role: "system", content: systemPrompt });
  });

  it("includes all messages when within budget", () => {
    const history = [msg("user", "hi"), msg("assistant", "hey")];
    const result = buildContext(history, systemPrompt, { maxTokens: 3000 });
    expect(result.messages).toHaveLength(3); // system + 2
  });

  it("always keeps the most recent keepRecent messages", () => {
    const history = Array.from({ length: 20 }, (_, i) =>
      msg(i % 2 === 0 ? "user" : "assistant", "x".repeat(200)),
    );
    const result = buildContext(history, systemPrompt, {
      maxTokens: 100,
      keepRecent: 4,
    });
    const withoutSystem = result.messages.slice(1);
    expect(withoutSystem.length).toBeGreaterThanOrEqual(4);
    expect(withoutSystem.slice(-4)).toEqual(history.slice(-4));
  });

  it("truncates older messages when budget is exceeded", () => {
    const history = Array.from({ length: 50 }, (_, i) =>
      msg(i % 2 === 0 ? "user" : "assistant", "word ".repeat(40)),
    );
    const result = buildContext(history, systemPrompt, {
      maxTokens: 500,
      keepRecent: 2,
    });
    expect(result.messages.length).toBeLessThan(52);
    expect(result.totalTokens).toBeLessThanOrEqual(systemTokens + 500 + estimateTokens("word ".repeat(40)) * 2);
  });

  it("returns correct totalTokens count", () => {
    const history = [msg("user", "hi"), msg("assistant", "hello there")];
    const result = buildContext(history, systemPrompt, { maxTokens: 3000 });
    const expectedHistoryTokens = estimateTokens("hi") + estimateTokens("hello there");
    expect(result.totalTokens).toBe(systemTokens + expectedHistoryTokens);
  });

  it("handles empty history", () => {
    const result = buildContext([], systemPrompt);
    expect(result.messages).toEqual([{ role: "system", content: systemPrompt }]);
    expect(result.totalTokens).toBe(systemTokens);
  });

  it("uses default maxTokens=3000 and keepRecent=4", () => {
    const history = [msg("user", "test")];
    const result = buildContext(history, systemPrompt);
    expect(result.messages).toHaveLength(2);
  });

  it("preserves message order (oldest to newest)", () => {
    const history = [
      msg("user", "first"),
      msg("assistant", "second"),
      msg("user", "third"),
    ];
    const result = buildContext(history, systemPrompt, { maxTokens: 3000 });
    const contents = result.messages.slice(1).map((m) => m.content);
    expect(contents).toEqual(["first", "second", "third"]);
  });
});
