import { describe, it, expect } from "vitest";
import { mockStream } from "../mock";

describe("mockStream (general assistant)", () => {
  async function collect(gen: AsyncGenerator<string>): Promise<string> {
    let result = "";
    for await (const chunk of gen) {
      result += chunk;
    }
    return result;
  }

  it("greets and introduces itself as a general assistant", async () => {
    const text = await collect(mockStream("hi"));
    expect(text.toLowerCase()).toContain("assistant");
  });

  it("describes general capabilities when asked what it can do", async () => {
    const text = await collect(mockStream("what can you do?"));
    expect(text.toLowerCase()).toContain("general-purpose");
  });

  it("returns a code block for coding questions", async () => {
    const text = await collect(mockStream("help me fix this javascript function"));
    expect(text).toContain("```");
  });

  it("only talks about fitness when explicitly asked", async () => {
    const fitness = await collect(mockStream("give me a workout plan"));
    expect(fitness).toContain("Move");

    const general = await collect(mockStream("what time zone is Tokyo in"));
    expect(general).not.toContain("Move");
  });

  it("falls back to a general reply with a demo-mode note", async () => {
    const text = await collect(mockStream("give me advice on my situation"));
    expect(text).toContain("Demo mode");
  });

  it("streams word by word (multiple yields)", async () => {
    let chunks = 0;
    for await (const _ of mockStream("hello")) {
      chunks++;
    }
    expect(chunks).toBeGreaterThan(1);
  });
});
