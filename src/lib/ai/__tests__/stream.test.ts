import { describe, it, expect } from "vitest";
import { textStream } from "../stream";

describe("textStream", () => {
  async function collectStream(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
    }
    return result;
  }

  it("encodes async iterable chunks into a ReadableStream", async () => {
    async function* source() {
      yield "Hello";
      yield " ";
      yield "world";
    }
    const stream = textStream(source());
    const text = await collectStream(stream);
    expect(text).toBe("Hello world");
  });

  it("handles empty source", async () => {
    async function* source(): AsyncGenerator<string> {}
    const stream = textStream(source());
    const text = await collectStream(stream);
    expect(text).toBe("");
  });

  it("handles single chunk", async () => {
    async function* source() {
      yield "only one";
    }
    const stream = textStream(source());
    const text = await collectStream(stream);
    expect(text).toBe("only one");
  });

  it("preserves unicode characters", async () => {
    async function* source() {
      yield "こんにちは";
      yield " 🌍";
    }
    const stream = textStream(source());
    const text = await collectStream(stream);
    expect(text).toBe("こんにちは 🌍");
  });
});
