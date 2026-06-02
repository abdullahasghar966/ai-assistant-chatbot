import { describe, it, expect } from "vitest";
import { deriveInsights } from "../insights";
import type { ChatMessage } from "@/types";

function msg(role: ChatMessage["role"], content: string, i = 0): ChatMessage {
  return { id: `${role}-${i}`, role, content, createdAt: new Date().toISOString() };
}

describe("deriveInsights", () => {
  it("returns an empty-state summary for no messages", () => {
    const r = deriveInsights([]);
    expect(r.totalMessages).toBe(0);
    expect(r.userMessages).toBe(0);
    expect(r.aiMessages).toBe(0);
    expect(r.totalWords).toBe(0);
    expect(r.topics).toEqual([]);
    expect(r.summary).toMatch(/no conversation yet/i);
  });

  it("counts user and assistant messages and words", () => {
    const r = deriveInsights([
      msg("user", "hello there friend", 0),
      msg("assistant", "hi how are you", 1),
      msg("user", "good", 2),
    ]);
    expect(r.totalMessages).toBe(3);
    expect(r.userMessages).toBe(2);
    expect(r.aiMessages).toBe(1);
    expect(r.userWords).toBe(4); // "hello there friend" + "good"
    expect(r.aiWords).toBe(4); // "hi how are you"
    expect(r.totalWords).toBe(8);
  });

  it("ignores system messages", () => {
    const r = deriveInsights([
      msg("system", "you are a bot", 0),
      msg("user", "hello", 1),
    ]);
    expect(r.totalMessages).toBe(1);
    expect(r.userMessages).toBe(1);
  });

  it("computes user/ai message share", () => {
    const r = deriveInsights([
      msg("user", "a", 0),
      msg("assistant", "b", 1),
      msg("user", "c", 2),
      msg("assistant", "d", 3),
    ]);
    expect(r.userShare).toBeCloseTo(0.5);
    expect(r.aiShare).toBeCloseTo(0.5);
  });

  it("extracts top keywords from user messages, skipping stop words", () => {
    const r = deriveInsights([
      msg("user", "I want to learn about typescript and typescript generics", 0),
      msg("assistant", "sure", 1),
      msg("user", "typescript is great for react", 2),
    ]);
    const labels = r.topics.map((t) => t.label);
    expect(labels).toContain("typescript");
    expect(labels).not.toContain("the");
    expect(labels).not.toContain("and");
    // most frequent topic carries the highest weight
    expect(r.topics[0]?.weight).toBe(1);
  });

  it("builds an activity series from the most recent messages (max 8)", () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      msg(i % 2 === 0 ? "user" : "assistant", `message number ${i}`, i),
    );
    const r = deriveInsights(many);
    expect(r.activity.length).toBe(8);
    expect(r.activityRoles.length).toBe(8);
    expect(Math.max(...r.activity)).toBeLessThanOrEqual(1);
  });

  it("summary references the first user message", () => {
    const r = deriveInsights([
      msg("user", "How do I deploy a Next.js app to Vercel", 0),
      msg("assistant", "Here is how", 1),
    ]);
    expect(r.summary).toMatch(/deploy/i);
    expect(r.summary).toMatch(/2 messages/);
  });
});
